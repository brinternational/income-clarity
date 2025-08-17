'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';

interface PricingTier {
  id: string;
  name: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: string[];
  limitations?: string[];
  cta: string;
  popular?: boolean;
  enterprise?: boolean;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'FREE',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for casual investors getting started',
    features: [
      'Manual portfolio entry',
      'Basic performance tracking',
      'Up to 3 portfolios',
      'Community support',
      'Basic charts and analytics'
    ],
    limitations: [
      'No bank sync',
      'No real-time data',
      'Limited portfolio count'
    ],
    cta: 'Get Started Free'
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    price: { monthly: 9.99, yearly: 99.99 },
    description: 'Everything you need for serious portfolio management',
    features: [
      'Everything in FREE',
      'Bank account sync via Yodlee',
      'Real-time market data',
      'Unlimited portfolios',
      'Advanced analytics & insights',
      'Tax optimization suggestions',
      'Email performance reports',
      'Priority support',
      'Dividend forecasting',
      'Rebalancing recommendations'
    ],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'ENTERPRISE',
    price: { monthly: 0, yearly: 0 },
    description: 'For financial advisors and family offices',
    features: [
      'Everything in PREMIUM',
      'Multi-user access',
      'API access',
      'Custom integrations',
      'White-label options',
      'Dedicated support manager',
      'Custom reporting',
      'Advanced security features',
      'Compliance tools',
      'Team collaboration'
    ],
    cta: 'Contact Sales',
    enterprise: true
  }
];

const FEATURE_COMPARISON = [
  {
    feature: 'Portfolio Count',
    free: '3 portfolios',
    premium: 'Unlimited',
    enterprise: 'Unlimited'
  },
  {
    feature: 'Data Entry',
    free: 'Manual only',
    premium: 'Manual + Bank Sync',
    enterprise: 'Manual + Bank Sync + API'
  },
  {
    feature: 'Market Data',
    free: 'End of day',
    premium: 'Real-time',
    enterprise: 'Real-time'
  },
  {
    feature: 'Analytics',
    free: 'Basic',
    premium: 'Advanced',
    enterprise: 'Advanced + Custom'
  },
  {
    feature: 'Support',
    free: 'Community',
    premium: 'Priority',
    enterprise: 'Dedicated Manager'
  },
  {
    feature: 'Users',
    free: '1 user',
    premium: '1 user',
    enterprise: 'Multiple users'
  }
];

const FAQ_ITEMS = [
  {
    question: 'Can I try Premium features before paying?',
    answer: 'Yes! We offer a 14-day free trial of Premium features with no credit card required. You can explore all Premium functionality before deciding to subscribe.'
  },
  {
    question: 'How does bank sync work?',
    answer: 'We use Yodlee, a trusted financial data provider used by major banks. Your banking credentials are encrypted and never stored on our servers. You can connect checking, savings, and investment accounts.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Absolutely. You can cancel your subscription at any time from your billing settings. You\'ll continue to have Premium access until your current billing period ends.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, debit cards, and PayPal through our secure payment processor Stripe.'
  },
  {
    question: 'Is my financial data secure?',
    answer: 'Security is our top priority. We use bank-level encryption, secure data centers, and never store your banking passwords. All data is encrypted both in transit and at rest.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with Premium features, contact support for a full refund.'
  }
];

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    content: 'Bank sync has saved me hours each month. The real-time tracking helps me stay on top of my FIRE journey.',
    avatar: '👩‍💻'
  },
  {
    name: 'Michael Rodriguez',
    role: 'Financial Advisor',
    content: 'The Enterprise features let me manage all my clients\' portfolios in one place. Game-changer for my practice.',
    avatar: '👨‍💼'
  },
  {
    name: 'Jessica Park',
    role: 'Investor',
    content: 'Love the tax optimization suggestions. Already saved more than the subscription cost this year.',
    avatar: '👩‍🎓'
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { user } = useUser();
  const router = useRouter();

  const handleUpgrade = async (tierId: string) => {
    if (tierId === 'free') {
      if (!user) {
        router.push('/auth/signup');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    if (tierId === 'enterprise') {
      // Open contact form or redirect to sales
      window.location.href = 'mailto:sales@incomeclarity.com?subject=Enterprise Inquiry';
      return;
    }

    // For premium, start trial or redirect to billing
    if (user) {
      // TODO: Integrate with Stripe checkout
      console.log('Starting premium trial for user:', user.id);
      router.push('/dashboard?trial=started');
    } else {
      router.push('/auth/signup?plan=premium');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Unlock Your Full{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Financial Potential
            </span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          >
            Join 10,000+ investors tracking $500M+ in assets with Income Clarity's intelligent portfolio management platform
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              >
                Save 20%
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {PRICING_TIERS.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-600 text-white">
                    Most Popular
                  </span>
                </div>
              )}
              
              <Card className={`h-full transition-all duration-300 hover:shadow-lg ${
                tier.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              } dark:bg-gray-800 dark:border-gray-700`}>
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {tier.name}
                  </CardTitle>
                  
                  <div className="mb-4">
                    {tier.enterprise ? (
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        Custom
                      </div>
                    ) : (
                      <div>
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          ${billingCycle === 'monthly' ? tier.price.monthly : tier.price.yearly}
                        </span>
                        {tier.price.monthly > 0 && (
                          <span className="text-gray-500 dark:text-gray-400">
                            /{billingCycle === 'monthly' ? 'month' : 'year'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {tier.description}
                  </p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <span className="text-green-500 text-sm mt-0.5">✓</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {tier.limitations?.map((limitation, limitIndex) => (
                      <li key={limitIndex} className="flex items-start gap-3 opacity-60">
                        <span className="text-gray-400 text-sm mt-0.5">✗</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleUpgrade(tier.id)}
                    variant={tier.popular ? 'default' : 'outline'}
                    className="w-full"
                    size="lg"
                  >
                    {tier.cta}
                  </Button>
                  
                  {tier.id === 'premium' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      14-day free trial • No credit card required
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Compare Features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-white">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                    FREE
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                    PREMIUM
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-900 dark:text-white">
                    ENTERPRISE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {FEATURE_COMPARISON.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                      {row.free}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                      {row.premium}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-600 dark:text-gray-300">
                      {row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What Our Users Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{testimonial.avatar}</span>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm italic">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="max-w-3xl mx-auto">
            {FAQ_ITEMS.map((faq, index) => (
              <motion.div
                key={index}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left py-6 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                >
                  <span className="text-lg font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  <span className={`transform transition-transform duration-200 ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}>
                    ↓
                  </span>
                </button>
                
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-gray-600 dark:text-gray-300 pb-6">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 border-0 text-white">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                Ready to Transform Your Portfolio Management?
              </h2>
              <p className="text-blue-100 mb-6">
                Start your 14-day free trial today. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => handleUpgrade('premium')}
                  variant="outline"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  Start Free Trial
                </Button>
                <Button
                  onClick={() => handleUpgrade('enterprise')}
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10"
                >
                  Contact Sales
                </Button>
              </div>
              <p className="text-xs text-blue-200 mt-4">
                30-day money-back guarantee • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}