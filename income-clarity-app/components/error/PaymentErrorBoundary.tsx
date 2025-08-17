'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logging/logger.service';
import { auditLogger, AuditEventType } from '@/lib/logging/audit-logger.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Shield, AlertTriangle, RefreshCw, Mail } from 'lucide-react';

interface Props {
  children: ReactNode;
  userId?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  onPaymentRetry?: () => Promise<void>;
  onContactSupport?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isRetrying: boolean;
  paymentId: string | null;
  securityFlag: boolean;
}

export class PaymentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      paymentId: null,
      securityFlag: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      paymentId: `payment_error_${Date.now()}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo
    });

    const errorType = this.categorizePaymentError(error);
    const isSecurityRelated = this.isSecurityError(error);

    // Set security flag for sensitive errors
    if (isSecurityRelated) {
      this.setState({ securityFlag: true });
    }

    // Enhanced logging for payment errors with PCI compliance
    const paymentLogger = logger.withContext({
      component: 'PaymentErrorBoundary',
      userId: this.props.userId,
      paymentId: this.state.paymentId,
      errorType,
      securityFlag: isSecurityRelated
    });

    paymentLogger.error('Payment operation failed', error, {
      componentStack: errorInfo.componentStack,
      paymentAmount: this.props.paymentAmount,
      paymentMethod: this.sanitizePaymentMethod(this.props.paymentMethod),
      errorCategory: errorType,
      pciCompliant: true // Ensure no sensitive data is logged
    });

    // Audit logging for payment failures (required for PCI DSS)
    auditLogger.logPayment(
      AuditEventType.PAYMENT_FAILURE,
      this.props.userId || 'anonymous',
      {
        component: 'PaymentErrorBoundary',
        requestId: this.state.paymentId
      },
      'FAILURE',
      {
        paymentId: this.state.paymentId,
        amount: this.props.paymentAmount,
        errorType,
        securityAlert: isSecurityRelated
      }
    );

    // Security incident reporting for suspicious payment errors
    if (isSecurityRelated) {
      this.reportSecurityIncident(error, errorType);
    }
  }

  private categorizePaymentError(error: Error): string {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    // Card validation errors
    if (message.includes('card') && (message.includes('invalid') || message.includes('expired'))) {
      return 'CARD_VALIDATION_ERROR';
    }

    // Insufficient funds
    if (message.includes('insufficient') || message.includes('declined') || message.includes('funds')) {
      return 'INSUFFICIENT_FUNDS';
    }

    // CVV/security code errors
    if (message.includes('cvv') || message.includes('security code') || message.includes('cvc')) {
      return 'SECURITY_CODE_ERROR';
    }

    // Network/gateway errors
    if (message.includes('network') || message.includes('gateway') || message.includes('timeout')) {
      return 'PAYMENT_GATEWAY_ERROR';
    }

    // Fraud detection
    if (message.includes('fraud') || message.includes('suspicious') || message.includes('blocked')) {
      return 'FRAUD_DETECTION';
    }

    // 3D Secure errors
    if (message.includes('3d secure') || message.includes('authentication required')) {
      return 'AUTHENTICATION_REQUIRED';
    }

    // Stripe-specific errors
    if (stack.includes('stripe') || message.includes('stripe')) {
      return 'STRIPE_API_ERROR';
    }

    // Generic payment processor errors
    if (message.includes('payment') && message.includes('failed')) {
      return 'PAYMENT_PROCESSING_ERROR';
    }

    return 'UNKNOWN_PAYMENT_ERROR';
  }

  private isSecurityError(error: Error): boolean {
    const message = error.message.toLowerCase();
    const securityKeywords = [
      'fraud', 'suspicious', 'blocked', 'security', 'unauthorized',
      'invalid card', 'stolen', 'blacklist', 'risk'
    ];
    
    return securityKeywords.some(keyword => message.includes(keyword));
  }

  private sanitizePaymentMethod(method?: string): string {
    if (!method) return 'unknown';
    
    // Only log card type, never full numbers
    if (method.includes('card')) {
      return 'card_payment';
    }
    if (method.includes('bank')) {
      return 'bank_transfer';
    }
    if (method.includes('paypal')) {
      return 'paypal';
    }
    
    return 'other';
  }

  private reportSecurityIncident(error: Error, errorType: string) {
    // Log security incident
    auditLogger.logSecurityEvent(
      AuditEventType.SUSPICIOUS_ACTIVITY,
      {
        component: 'PaymentErrorBoundary',
        userId: this.props.userId,
        requestId: this.state.paymentId
      },
      'ERROR',
      {
        incidentType: 'payment_security_error',
        errorType,
        paymentAmount: this.props.paymentAmount,
        timestamp: new Date().toISOString()
      }
    );

    // In production, this would trigger alerts to security team
    if (process.env.NODE_ENV === 'production') {
      this.notifySecurityTeam(error, errorType);
    }
  }

  private notifySecurityTeam(error: Error, errorType: string) {
    // This would integrate with your alerting system
    logger.error('SECURITY ALERT: Payment security incident detected', error, {
      alert: true,
      severity: 'HIGH',
      incidentType: 'payment_fraud_detection',
      userId: this.props.userId,
      paymentId: this.state.paymentId,
      errorType
    });
  }

  private handleRetry = async () => {
    this.setState({ isRetrying: true });

    try {
      if (this.props.onPaymentRetry) {
        await this.props.onPaymentRetry();
      }

      // Clear error state
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        isRetrying: false,
        securityFlag: false
      });

      logger.info('Payment retry initiated', {
        component: 'PaymentErrorBoundary',
        userId: this.props.userId,
        paymentId: this.state.paymentId
      });

    } catch (retryError) {
      logger.error('Payment retry failed', retryError as Error);
      this.setState({ isRetrying: false });
    }
  };

  private handleContactSupport = () => {
    if (this.props.onContactSupport) {
      this.props.onContactSupport();
    } else {
      // Default support contact
      window.location.href = `mailto:support@incomeClarity.com?subject=Payment Error ${this.state.paymentId}`;
    }
  };

  private getErrorMessage(): string {
    if (!this.state.error) return 'Payment processing error';

    const errorType = this.categorizePaymentError(this.state.error);
    
    switch (errorType) {
      case 'CARD_VALIDATION_ERROR':
        return 'Your card information appears to be invalid or expired. Please check your card details.';
      case 'INSUFFICIENT_FUNDS':
        return 'Your payment was declined due to insufficient funds. Please use a different payment method.';
      case 'SECURITY_CODE_ERROR':
        return 'The security code (CVV) you entered is incorrect. Please check and try again.';
      case 'PAYMENT_GATEWAY_ERROR':
        return 'Our payment processor is temporarily unavailable. Please try again in a few minutes.';
      case 'FRAUD_DETECTION':
        return 'This transaction was flagged for security review. Please contact your bank or use a different payment method.';
      case 'AUTHENTICATION_REQUIRED':
        return 'Your bank requires additional authentication. Please complete the verification process.';
      case 'STRIPE_API_ERROR':
        return 'There was an issue processing your payment. Please try again or contact support.';
      default:
        return 'We were unable to process your payment. Please try again or use a different payment method.';
    }
  }

  private getSecurityMessage(): string {
    return 'For your security, this transaction has been flagged and our team has been notified. ' +
           'If you believe this is an error, please contact support with your payment reference number.';
  }

  private shouldShowRetry(): boolean {
    const errorType = this.state.error ? this.categorizePaymentError(this.state.error) : '';
    const nonRetryableErrors = ['FRAUD_DETECTION', 'CARD_VALIDATION_ERROR', 'INSUFFICIENT_FUNDS'];
    
    return !nonRetryableErrors.includes(errorType) && !this.state.securityFlag;
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.getErrorMessage();
      const securityMessage = this.getSecurityMessage();
      const canRetry = this.shouldShowRetry();

      return (
        <div className="p-4 max-w-md mx-auto">
          {this.state.securityFlag && (
            <Alert variant="destructive" className="mb-4">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {securityMessage}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <CreditCard className="h-8 w-8 text-red-500" />
              </div>
              <CardTitle className="text-lg text-red-600">
                Payment Failed
              </CardTitle>
              <CardDescription>
                {errorMessage}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {this.state.paymentId && (
                <div className="bg-gray-100 p-3 rounded text-sm">
                  <span className="font-medium">Reference:</span> {this.state.paymentId}
                </div>
              )}

              {this.props.paymentAmount && (
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <span className="font-medium">Amount:</span> ${this.props.paymentAmount.toFixed(2)}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    disabled={this.state.isRetrying}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${this.state.isRetrying ? 'animate-spin' : ''}`} />
                    {this.state.isRetrying ? 'Processing...' : 'Try Different Card'}
                  </Button>
                )}

                <Button 
                  onClick={this.handleContactSupport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Button>

                <Button 
                  onClick={() => window.history.back()}
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  Go Back
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Your payment information is secure and encrypted
                </div>
                <div>
                  For assistance, reference ID: {this.state.paymentId}
                </div>
              </div>

              {process.env.NODE_ENV !== 'production' && this.state.error && (
                <details className="bg-gray-50 p-3 rounded text-xs">
                  <summary className="cursor-pointer font-medium">Technical Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PaymentErrorBoundary;