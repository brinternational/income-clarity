/**
 * Input Sanitization Middleware
 * Provides comprehensive input validation and sanitization
 * to prevent injection attacks and data corruption
 */

import validator from 'validator'
import DOMPurify from 'isomorphic-dompurify'

export interface SanitizationOptions {
  allowHTML?: boolean
  maxLength?: number
  allowedTags?: string[]
  allowedAttributes?: Record<string, string[]>
  stripEmpty?: boolean
  normalizeWhitespace?: boolean
}

export interface ValidationRule {
  type: 'email' | 'url' | 'numeric' | 'alphanumeric' | 'custom'
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  customValidator?: (value: any) => boolean
  errorMessage?: string
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule
}

export class InputSanitizer {
  private static readonly SQL_INJECTION_PATTERNS = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(\b(script|javascript|vbscript|onload|onerror|onclick|onmouseover)\b)/gi,
    /('|(\-\-)|(;)|(\|)|(\*)|(%)|(\+)|(=))/g,
    /(\b(or|and)\b\s*\d+\s*(=|>|<)\s*\d+)/gi,
    /(\b(true|false|null)\b\s*(=|>|<)\s*(true|false|null)\b)/gi
  ]
  
  private static readonly XSS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gis,
    /<iframe[^>]*>.*?<\/iframe>/gis,
    /<object[^>]*>.*?<\/object>/gis,
    /<embed[^>]*>/gi,
    /<link[^>]*>/gi,
    /<meta[^>]*>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi
  ]
  
  private static readonly LDAP_INJECTION_PATTERNS = [
    /(\(|\)|\*|\\|\||&)/g,
    /(\b(objectclass|cn|uid|mail)\b)/gi
  ]
  
  private static readonly COMMAND_INJECTION_PATTERNS = [
    /(;|\||&|\$|`|\(|\)|<|>)/g,
    /(\b(cat|ls|ps|kill|rm|mv|cp|chmod|chown|sudo|su)\b)/gi
  ]
  
  /**
   * Sanitize string input with comprehensive cleaning
   */
  static sanitizeString(
    input: any, 
    options: SanitizationOptions = {}
  ): string {
    if (typeof input !== 'string') {
      input = String(input || '')
    }
    
    let sanitized = input
    
    // 1. Basic cleaning
    if (options.normalizeWhitespace !== false) {
      sanitized = sanitized.replace(/\s+/g, ' ').trim()
    }
    
    // 2. Length limiting
    if (options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength)
    }
    
    // 3. HTML sanitization
    if (options.allowHTML) {
      const config: any = {
        ALLOWED_TAGS: options.allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: options.allowedAttributes || {},
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false
      }
      
      sanitized = DOMPurify.sanitize(sanitized, config)
    } else {
      // Remove all HTML tags
      sanitized = sanitized.replace(/<[^>]*>/g, '')
    }
    
    // 4. Remove dangerous patterns
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }
    
    for (const pattern of this.XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }
    
    for (const pattern of this.COMMAND_INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }
    
    // 5. Decode HTML entities
    sanitized = validator.unescape(sanitized)
    
    // 6. Strip empty values if requested
    if (options.stripEmpty && !sanitized.trim()) {
      return ''
    }
    
    return sanitized
  }
  
  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input: any, options: { min?: number, max?: number } = {}): number {
    let num: number
    
    if (typeof input === 'number') {
      num = input
    } else if (typeof input === 'string') {
      // Remove non-numeric characters except decimal point and minus
      const cleaned = input.replace(/[^0-9.-]/g, '')
      num = parseFloat(cleaned)
    } else {
      num = 0
    }
    
    // Handle NaN
    if (isNaN(num)) {
      num = 0
    }
    
    // Apply bounds
    if (typeof options.min === 'number') {
      num = Math.max(num, options.min)
    }
    
    if (typeof options.max === 'number') {
      num = Math.min(num, options.max)
    }
    
    return num
  }
  
  /**
   * Sanitize email input
   */
  static sanitizeEmail(input: any): string {
    const email = this.sanitizeString(input, { maxLength: 254, normalizeWhitespace: true })
    return validator.normalizeEmail(email) || ''
  }
  
  /**
   * Sanitize URL input
   */
  static sanitizeURL(input: any, options: { allowedProtocols?: string[] } = {}): string {
    const url = this.sanitizeString(input, { maxLength: 2048 })
    
    if (!url) return ''
    
    // Validate URL format
    if (!validator.isURL(url, {
      protocols: options.allowedProtocols || ['http', 'https'],
      require_protocol: true
    })) {
      return ''
    }
    
    return url
  }
  
  /**
   * Sanitize JSON input
   */
  static sanitizeJSON(input: any, maxDepth: number = 10): any {
    if (input === null || input === undefined) {
      return input
    }
    
    if (typeof input === 'string') {
      try {
        input = JSON.parse(input)
      } catch {
        return null
      }
    }
    
    return this.sanitizeObject(input, maxDepth)
  }
  
  /**
   * Recursively sanitize object
   */
  private static sanitizeObject(obj: any, maxDepth: number, currentDepth: number = 0): any {
    if (currentDepth >= maxDepth) {
      return null
    }
    
    if (obj === null || obj === undefined) {
      return obj
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, maxDepth, currentDepth + 1))
        .slice(0, 1000) // Limit array size
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {}
      const keys = Object.keys(obj).slice(0, 100) // Limit object keys
      
      for (const key of keys) {
        const sanitizedKey = this.sanitizeString(key, { maxLength: 100 })
        if (sanitizedKey) {
          sanitized[sanitizedKey] = this.sanitizeObject(obj[key], maxDepth, currentDepth + 1)
        }
      }
      
      return sanitized
    }
    
    if (typeof obj === 'string') {
      return this.sanitizeString(obj, { maxLength: 10000 })
    }
    
    if (typeof obj === 'number') {
      return this.sanitizeNumber(obj, { min: -1e10, max: 1e10 })
    }
    
    if (typeof obj === 'boolean') {
      return obj
    }
    
    return null
  }
  
  /**
   * Validate input against rules
   */
  static validate(value: any, rule: ValidationRule): { valid: boolean; error?: string } {
    // Check if required
    if (rule.required && (value === null || value === undefined || value === '')) {
      return { valid: false, error: rule.errorMessage || 'This field is required' }
    }
    
    // Skip validation if value is empty and not required
    if (!rule.required && (value === null || value === undefined || value === '')) {
      return { valid: true }
    }
    
    // Type-specific validation
    switch (rule.type) {
      case 'email':
        if (!validator.isEmail(String(value))) {
          return { valid: false, error: rule.errorMessage || 'Invalid email format' }
        }
        break
        
      case 'url':
        if (!validator.isURL(String(value), { require_protocol: true })) {
          return { valid: false, error: rule.errorMessage || 'Invalid URL format' }
        }
        break
        
      case 'numeric':
        const num = Number(value)
        if (isNaN(num)) {
          return { valid: false, error: rule.errorMessage || 'Must be a valid number' }
        }
        
        if (rule.min !== undefined && num < rule.min) {
          return { valid: false, error: rule.errorMessage || `Must be at least ${rule.min}` }
        }
        
        if (rule.max !== undefined && num > rule.max) {
          return { valid: false, error: rule.errorMessage || `Must be at most ${rule.max}` }
        }
        break
        
      case 'alphanumeric':
        if (!validator.isAlphanumeric(String(value))) {
          return { valid: false, error: rule.errorMessage || 'Must contain only letters and numbers' }
        }
        break
        
      case 'custom':
        if (rule.customValidator && !rule.customValidator(value)) {
          return { valid: false, error: rule.errorMessage || 'Invalid value' }
        }
        break
    }
    
    // Length validation for strings
    if (typeof value === 'string') {
      if (rule.min !== undefined && value.length < rule.min) {
        return { valid: false, error: rule.errorMessage || `Must be at least ${rule.min} characters` }
      }
      
      if (rule.max !== undefined && value.length > rule.max) {
        return { valid: false, error: rule.errorMessage || `Must be at most ${rule.max} characters` }
      }
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(String(value))) {
      return { valid: false, error: rule.errorMessage || 'Invalid format' }
    }
    
    return { valid: true }
  }
  
  /**
   * Validate and sanitize form data
   */
  static validateAndSanitizeForm(
    data: Record<string, any>, 
    validationRules: FieldValidation
  ): {
    valid: boolean
    sanitizedData: Record<string, any>
    errors: Record<string, string>
  } {
    const sanitizedData: Record<string, any> = {}
    const errors: Record<string, string> = {}
    
    // Process each field
    for (const [fieldName, value] of Object.entries(data)) {
      const rule = validationRules[fieldName]
      
      if (!rule) {
        // No validation rule - just sanitize as string
        sanitizedData[fieldName] = this.sanitizeString(value)
        continue
      }
      
      // Validate first
      const validation = this.validate(value, rule)
      
      if (!validation.valid) {
        errors[fieldName] = validation.error!
        continue
      }
      
      // Sanitize based on type
      switch (rule.type) {
        case 'email':
          sanitizedData[fieldName] = this.sanitizeEmail(value)
          break
          
        case 'url':
          sanitizedData[fieldName] = this.sanitizeURL(value)
          break
          
        case 'numeric':
          sanitizedData[fieldName] = this.sanitizeNumber(value, { min: rule.min, max: rule.max })
          break
          
        default:
          sanitizedData[fieldName] = this.sanitizeString(value, {
            maxLength: rule.max,
            stripEmpty: true
          })
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      sanitizedData,
      errors
    }
  }
  
  /**
   * Detect potential security threats in input
   */
  static detectThreats(input: any): {
    threats: string[]
    severity: 'low' | 'medium' | 'high' | 'critical'
    blocked: boolean
  } {
    const threats: string[] = []
    const inputStr = String(input || '')
    
    // SQL Injection detection
    for (const pattern of this.SQL_INJECTION_PATTERNS) {
      if (pattern.test(inputStr)) {
        threats.push('SQL injection attempt')
        break
      }
    }
    
    // XSS detection
    for (const pattern of this.XSS_PATTERNS) {
      if (pattern.test(inputStr)) {
        threats.push('Cross-site scripting attempt')
        break
      }
    }
    
    // Command injection detection
    for (const pattern of this.COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(inputStr)) {
        threats.push('Command injection attempt')
        break
      }
    }
    
    // LDAP injection detection
    for (const pattern of this.LDAP_INJECTION_PATTERNS) {
      if (pattern.test(inputStr)) {
        threats.push('LDAP injection attempt')
        break
      }
    }
    
    // Path traversal detection
    if (inputStr.includes('../') || inputStr.includes('..\\')) {
      threats.push('Path traversal attempt')
    }
    
    // File inclusion detection
    if (inputStr.match(/\.(php|asp|jsp|cgi)$/i)) {
      threats.push('File inclusion attempt')
    }
    
    // Determine severity
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
    let blocked = false
    
    if (threats.length > 0) {
      if (threats.some(t => t.includes('SQL injection') || t.includes('Command injection'))) {
        severity = 'critical'
        blocked = true
      } else if (threats.some(t => t.includes('XSS') || t.includes('Path traversal'))) {
        severity = 'high'
        blocked = true
      } else {
        severity = 'medium'
        blocked = false
      }
    }
    
    return { threats, severity, blocked }
  }
  
  /**
   * Common validation rules for Income Clarity app
   */
  static readonly COMMON_RULES: Record<string, ValidationRule> = {
    email: {
      type: 'email',
      required: true,
      max: 254,
      errorMessage: 'Please enter a valid email address'
    },
    
    password: {
      type: 'custom',
      required: true,
      min: 8,
      max: 128,
      customValidator: (value: string) => {
        // Strong password: at least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)
      },
      errorMessage: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
    },
    
    name: {
      type: 'custom',
      required: true,
      min: 2,
      max: 100,
      customValidator: (value: string) => {
        return /^[a-zA-Z\s'-]+$/.test(value)
      },
      errorMessage: 'Name must contain only letters, spaces, hyphens, and apostrophes'
    },
    
    ticker: {
      type: 'custom',
      required: true,
      min: 1,
      max: 10,
      customValidator: (value: string) => {
        return /^[A-Z]{1,10}$/.test(value.toUpperCase())
      },
      errorMessage: 'Ticker must be 1-10 uppercase letters'
    },
    
    amount: {
      type: 'numeric',
      required: true,
      min: 0,
      max: 1000000000,
      errorMessage: 'Amount must be a positive number'
    },
    
    percentage: {
      type: 'numeric',
      required: false,
      min: 0,
      max: 100,
      errorMessage: 'Percentage must be between 0 and 100'
    },
    
    description: {
      type: 'custom',
      required: false,
      max: 500,
      customValidator: (value: string) => {
        return !/<script|javascript:|vbscript:|data:/i.test(value)
      },
      errorMessage: 'Description contains invalid content'
    }
  }
}

// Export for use in forms and API endpoints
export default InputSanitizer
