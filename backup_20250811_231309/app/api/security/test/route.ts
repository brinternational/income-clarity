/**
 * Security Test API Endpoint
 * Tests all security components and provides comprehensive security validation
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { InputSanitizer } from '../../../../lib/middleware/input-sanitizer'
import { DatabaseEncryption } from '../../../../lib/security/encryption'
import { AuthenticationMiddleware } from '../../../../lib/middleware/auth-middleware'

export async function POST(request: NextRequest) {
  try {
    // Handle empty or invalid JSON gracefully
    let body: any = {}
    try {
      const contentType = request.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        const text = await request.text()
        if (text) {
          body = JSON.parse(text)
        }
      }
    } catch (parseError) {
      // Error handled by emergency recovery script
    
    const { testType = 'comprehensive', data = {} } = body
    
    const results: any = {
      timestamp: new Date().toISOString(),
      testType,
      results: {}
    }
    
    switch (testType) {
      case 'input_sanitization':
        results.results = await testInputSanitization(data)
        break
        
      case 'encryption':
        results.results = await testEncryption(data)
        break
        
      case 'threat_detection':
        results.results = await testThreatDetection(data)
        break
        
      case 'form_validation':
        results.results = await testFormValidation(data)
        break
        
      case 'comprehensive':
        results.results = await runComprehensiveTests(data)
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        )
    }
    
    return NextResponse.json(results)
  } catch (error) {
    console.error('Security test error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )},
    { input: '../../etc/passwd', expected: 'etc/passwd' },
    { input: 'normal text', expected: 'normal text' },
    { input: 'email@test.com', expected: 'email@test.com' },
    { input: '123.45', expected: '123.45' },
    { input: 'SELECT * FROM users WHERE 1=1', expected: '  FROM users WHERE 11' }
  ]
  
  const results = testCases.map(testCase => {
    const sanitized = InputSanitizer.sanitizeString(testCase.input)
    const threats = InputSanitizer.detectThreats(testCase.input)
    
    return {
      input: testCase.input,
      sanitized,
      expected: testCase.expected,
      passed: sanitized !== testCase.input || threats.threats.length > 0,
      threats: threats.threats,
      severity: threats.severity,
      blocked: threats.blocked
    }
  })
  
  return {
    testCases: results,
    totalTests: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length
  }
}

async function testEncryption(data: any): Promise<any> {
  const testData = data?.testData || 'sensitive test data 123'
  const context = 'test:encryption'
  
  try {
    // Test basic encryption/decryption
    const encrypted = await DatabaseEncryption.encrypt(testData, context)
    const decrypted = await DatabaseEncryption.decrypt(encrypted, context)
    
    // Test JSON encryption
    const jsonData = { user: 'test', password: 'secret123', settings: { theme: 'dark' } }
    const encryptedJSON = await DatabaseEncryption.encryptJSON(jsonData, context)
    const decryptedJSON = await DatabaseEncryption.decryptJSON(encryptedJSON, context)
    
    // Test password hashing
    const password = 'testPassword123!'
    const hashed = await DatabaseEncryption.hashPassword(password)
    const verified = await DatabaseEncryption.verifyPassword(password, hashed.hash, hashed.salt)
    const verifiedWrong = await DatabaseEncryption.verifyPassword('wrongPassword', hashed.hash, hashed.salt)
    
    // Test HMAC
    const hmacData = 'test data for hmac'
    const hmacSignature = DatabaseEncryption.generateHMAC(hmacData)
    const hmacValid = DatabaseEncryption.verifyHMAC(hmacData, hmacSignature)
    const hmacInvalid = DatabaseEncryption.verifyHMAC('tampered data', hmacSignature)
    
    return {
      basicEncryption: {
        original: testData,
        encrypted: encrypted,
        decrypted: decrypted,
        success: decrypted === testData
      },
      jsonEncryption: {
        original: jsonData,
        encrypted: encryptedJSON,
        decrypted: decryptedJSON,
        success: JSON.stringify(decryptedJSON) === JSON.stringify(jsonData)
      },
      passwordHashing: {
        password: password,
        hash: hashed.hash,
        salt: hashed.salt,
        verifiedCorrect: verified,
        verifiedWrong: verifiedWrong,
        success: verified && !verifiedWrong
      },
      hmacValidation: {
        data: hmacData,
        signature: hmacSignature,
        validSignature: hmacValid,
        invalidSignature: hmacInvalid,
        success: hmacValid && !hmacInvalid
      },
      overall: {
        allTestsPassed: (
          decrypted === testData &&
          JSON.stringify(decryptedJSON) === JSON.stringify(jsonData) &&
          verified && !verifiedWrong &&
          hmacValid && !hmacInvalid
        )
      }
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown encryption error',
      success: false
    }
  }
}

async function testThreatDetection(data: any): Promise<any> {
  const maliciousInputs = [
    // SQL Injection attempts
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "UNION SELECT * FROM passwords",
    
    // XSS attempts
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    'javascript:alert("xss")',
    
    // Command injection
    '; cat /etc/passwd',
    '| whoami',
    '$(rm -rf /)',
    
    // Path traversal
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    
    // LDAP injection
    '*()|(&(objectClass=*))',
    
    // File inclusion
    'file.php',
    'script.asp',
    
    // Safe inputs
    'normal text',
    'user@example.com',
    '123.45',
    'Product Name'
  ]
  
  const results = maliciousInputs.map(input => {
    const threats = InputSanitizer.detectThreats(input)
    const sanitized = InputSanitizer.sanitizeString(input)
    
    return {
      input,
      threats: threats.threats,
      severity: threats.severity,
      blocked: threats.blocked,
      sanitized,
      protected: threats.blocked || sanitized !== input
    }
  })
  
  return {
    testInputs: results,
    summary: {
      totalInputs: results.length,
      threatsDetected: results.filter(r => r.threats.length > 0).length,
      blocked: results.filter(r => r.blocked).length,
      protected: results.filter(r => r.protected).length,
      protectionRate: Math.round((results.filter(r => r.protected).length / results.length) * 100)
    }
  }
}

async function testFormValidation(data: any): Promise<any> {
  const testForm = data?.formData || {
    email: 'test@example.com',
    password: 'ValidPass123!',
    name: 'John Doe',
    ticker: 'AAPL',
    amount: 1000,
    description: 'Test description'
  }
  
  const validationRules = {
    email: InputSanitizer.COMMON_RULES.email,
    password: InputSanitizer.COMMON_RULES.password,
    name: InputSanitizer.COMMON_RULES.name,
    ticker: InputSanitizer.COMMON_RULES.ticker,
    amount: InputSanitizer.COMMON_RULES.amount,
    description: InputSanitizer.COMMON_RULES.description
  }
  
  const validationResult = InputSanitizer.validateAndSanitizeForm(testForm, validationRules)
  
  // Test individual field validations
  const fieldTests = Object.entries(testForm).map(([field, value]) => {
    const rule = validationRules[field as keyof typeof validationRules]
    if (rule) {
      const validation = InputSanitizer.validate(value, rule)
      return {
        field,
        value,
        valid: validation.valid,
        error: validation.error
      }
    }
    return { field, value, valid: true, error: undefined }
  })
  
  return {
    formValidation: validationResult,
    fieldTests,
    summary: {
      overallValid: validationResult.valid,
      totalFields: fieldTests.length,
      validFields: fieldTests.filter(f => f.valid).length,
      invalidFields: fieldTests.filter(f => !f.valid).length,
      errors: Object.keys(validationResult.errors)
    }
  }
}

async function runComprehensiveTests(data: any): Promise<any> {
  const startTime = Date.now()
  
  // Run all test types
  const inputSanitization = await testInputSanitization(data)
  const encryption = await testEncryption(data)
  const threatDetection = await testThreatDetection(data)
  const formValidation = await testFormValidation(data)
  
  // Get system status
  const encryptionStatus = DatabaseEncryption.getStatus()
  const securityStats = AuthenticationMiddleware.getSecurityStats()
  
  const endTime = Date.now()
  
  return {
    executionTime: endTime - startTime,
    tests: {
      inputSanitization,
      encryption,
      threatDetection,
      formValidation
    },
    systemStatus: {
      encryption: encryptionStatus,
      security: securityStats
    },
    summary: {
      inputSanitizationPassed: inputSanitization.passed === inputSanitization.totalTests,
      encryptionPassed: encryption.overall?.allTestsPassed || false,
      threatDetectionRate: threatDetection.summary.protectionRate,
      formValidationPassed: formValidation.summary.overallValid,
      overallSecurityScore: calculateSecurityScore({
        inputSanitization,
        encryption,
        threatDetection,
        formValidation
      })
    }
  }
}

function calculateSecurityScore(testResults: any): number {
  let score = 0
  let maxScore = 0
  
  // Input sanitization (25% of score)
  if (testResults.inputSanitization) {
    const ratio = testResults.inputSanitization.passed / testResults.inputSanitization.totalTests
    score += ratio * 25
  }
  maxScore += 25
  
  // Encryption (25% of score)
  if (testResults.encryption?.overall?.allTestsPassed) {
    score += 25
  }
  maxScore += 25
  
  // Threat detection (30% of score)
  if (testResults.threatDetection) {
    score += (testResults.threatDetection.summary.protectionRate / 100) * 30
  }
  maxScore += 30
  
  // Form validation (20% of score)
  if (testResults.formValidation?.summary?.overallValid) {
    score += 20
  }
  maxScore += 20
  
  return Math.round((score / maxScore) * 100)
}

export async function GET() {
  return NextResponse.json({
    message: 'Security Test Endpoint',
    availableTests: [
      'input_sanitization',
      'encryption', 
      'threat_detection',
      'form_validation',
      'comprehensive'
    ],
    usage: 'POST with { "testType": "test_name", "data": {...} }'
  })
}
