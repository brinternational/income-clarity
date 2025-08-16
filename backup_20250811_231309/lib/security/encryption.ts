/**
 * Database Encryption Service
 * Provides field-level encryption for sensitive data in SQLite
 * Uses AES-256-GCM for authenticated encryption
 */

import crypto from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(crypto.scrypt)

export interface EncryptedField {
  encrypted: string
  iv: string
  tag: string
  version: string
}

export interface EncryptionOptions {
  keyDerivation?: 'scrypt' | 'pbkdf2'
  iterations?: number
  keyLength?: number
  algorithm?: 'aes-256-gcm' | 'aes-256-cbc'
}

const DEFAULT_OPTIONS: Required<EncryptionOptions> = {
  keyDerivation: 'scrypt',
  iterations: 100000,
  keyLength: 32,
  algorithm: 'aes-256-gcm'
}

export class DatabaseEncryption {
  private static masterKey: Buffer | null = null
  private static saltCache = new Map<string, Buffer>()
  private static keyCache = new Map<string, Buffer>()
  
  /**
   * Initialize encryption with master key
   */
  static async initialize(masterPassword?: string): Promise<void> {
    const password = masterPassword || 
                    process.env.DB_ENCRYPTION_KEY || 
                    process.env.SESSION_SECRET ||
                    'default-key-change-in-production'
    
    // Generate or retrieve application salt
    const appSalt = this.getApplicationSalt()
    
    // Derive master key using scrypt
    this.masterKey = await scrypt(password, appSalt, DEFAULT_OPTIONS.keyLength) as Buffer
    
    // console.log('Database encryption initialized')
  }
  
  /**
   * Get or create application-specific salt
   */
  private static getApplicationSalt(): Buffer {
    const saltString = process.env.DB_SALT || 'income-clarity-app-salt-2024'
    return crypto.createHash('sha256').update(saltString).digest()
  }
  
  /**
   * Derive encryption key for specific context
   */
  private static async deriveKey(
    context: string, 
    userSalt?: Buffer,
    options: EncryptionOptions = {}
  ): Promise<Buffer> {
    if (!this.masterKey) {
      await this.initialize()
    }
    
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const cacheKey = `${context}:${userSalt?.toString('hex') || 'default'}`
    
    // Check cache
    const cached = this.keyCache.get(cacheKey)
    if (cached) return cached
    
    // Create context-specific salt
    const contextSalt = userSalt || this.getSaltForContext(context)
    
    // Derive key
    let derivedKey: Buffer
    
    if (opts.keyDerivation === 'scrypt') {
      derivedKey = await scrypt(this.masterKey!, contextSalt, opts.keyLength) as Buffer
    } else {
      derivedKey = crypto.pbkdf2Sync(this.masterKey!, contextSalt, opts.iterations, opts.keyLength, 'sha256')
    }
    
    // Cache the key
    this.keyCache.set(cacheKey, derivedKey)
    
    return derivedKey
  }
  
  /**
   * Get salt for encryption context
   */
  private static getSaltForContext(context: string): Buffer {
    const cached = this.saltCache.get(context)
    if (cached) return cached
    
    const salt = crypto.createHash('sha256').update(`${context}:salt:v1`).digest()
    this.saltCache.set(context, salt)
    
    return salt
  }
  
  /**
   * Encrypt sensitive data
   */
  static async encrypt(
    plaintext: string | Buffer,
    context: string = 'default',
    userSalt?: Buffer,
    options: EncryptionOptions = {}
  ): Promise<EncryptedField> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    
    // Convert to buffer
    const data = typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf8') : plaintext
    
    // Derive encryption key
    const key = await this.deriveKey(context, userSalt, options)
    
    // Generate IV
    const iv = crypto.randomBytes(12) // 96 bits for GCM
    
    // Encrypt data
    const cipher = crypto.createCipherGCM(opts.algorithm, key, iv)
    cipher.setAAD(Buffer.from(context, 'utf8')) // Additional authenticated data
    
    let encrypted = cipher.update(data)
    encrypted = Buffer.concat([encrypted, cipher.final()])
    
    // Get authentication tag (for GCM)
    let tag: Buffer | undefined
    if (opts.algorithm === 'aes-256-gcm') {
      tag = (cipher as any).getAuthTag()
    }
    
    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag ? tag.toString('base64') : '',
      version: 'v1'
    }
  }
  
  /**
   * Decrypt sensitive data
   */
  static async decrypt(
    encryptedField: EncryptedField,
    context: string = 'default',
    userSalt?: Buffer,
    options: EncryptionOptions = {}
  ): Promise<string> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    
    // Derive decryption key
    const key = await this.deriveKey(context, userSalt, options)
    
    // Parse encrypted data
    const encrypted = Buffer.from(encryptedField.encrypted, 'base64')
    const iv = Buffer.from(encryptedField.iv, 'base64')
    const tag = encryptedField.tag ? Buffer.from(encryptedField.tag, 'base64') : undefined
    
    // Decrypt data
    const decipher = crypto.createDecipherGCM(opts.algorithm, key, iv)
    decipher.setAAD(Buffer.from(context, 'utf8'))
    
    if (tag && opts.algorithm === 'aes-256-gcm') {
      (decipher as any).setAuthTag(tag)
    }
    
    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    
    return decrypted.toString('utf8')
  }
  
  /**
   * Encrypt JSON data
   */
  static async encryptJSON(
    data: any,
    context: string = 'json',
    userSalt?: Buffer
  ): Promise<EncryptedField> {
    const jsonString = JSON.stringify(data)
    return this.encrypt(jsonString, context, userSalt)
  }
  
  /**
   * Decrypt JSON data
   */
  static async decryptJSON(
    encryptedField: EncryptedField,
    context: string = 'json',
    userSalt?: Buffer
  ): Promise<any> {
    const jsonString = await this.decrypt(encryptedField, context, userSalt)
    return JSON.parse(jsonString)
  }
  
  /**
   * Hash password with salt
   */
  static async hashPassword(password: string, userSalt?: Buffer): Promise<{
    hash: string
    salt: string
  }> {
    const salt = userSalt || crypto.randomBytes(32)
    const hash = await scrypt(password, salt, 64) as Buffer
    
    return {
      hash: hash.toString('base64'),
      salt: salt.toString('base64')
    }
  }
  
  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hashedPassword: string, salt: string): Promise<boolean> {
    try {
      const saltBuffer = Buffer.from(salt, 'base64')
      const hash = await scrypt(password, saltBuffer, 64) as Buffer
      const expectedHash = Buffer.from(hashedPassword, 'base64')
      
      return crypto.timingSafeEqual(hash, expectedHash)
    } catch (error) {
      return false
    }
  }
  
  /**
   * Generate secure random token
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url')
  }
  
  /**
   * Generate HMAC signature
   */
  static generateHMAC(data: string, key?: string): string {
    const secret = key || process.env.HMAC_SECRET || 'default-hmac-secret'
    return crypto.createHmac('sha256', secret).update(data).digest('hex')
  }
  
  /**
   * Verify HMAC signature
   */
  static verifyHMAC(data: string, signature: string, key?: string): boolean {
    const expectedSignature = this.generateHMAC(data, key)
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    )
  }
  
  /**
   * Encrypt sensitive user data fields
   */
  static async encryptUserData(userData: {
    email?: string
    personalInfo?: any
    settings?: any
    taxProfile?: any
  }, userId: string): Promise<{
    email?: EncryptedField
    personalInfo?: EncryptedField
    settings?: EncryptedField
    taxProfile?: EncryptedField
  }> {
    const userSalt = crypto.createHash('sha256').update(userId).digest()
    const encrypted: any = {}
    
    if (userData.email) {
      encrypted.email = await this.encrypt(userData.email, 'user:email', userSalt)
    }
    
    if (userData.personalInfo) {
      encrypted.personalInfo = await this.encryptJSON(userData.personalInfo, 'user:personal', userSalt)
    }
    
    if (userData.settings) {
      encrypted.settings = await this.encryptJSON(userData.settings, 'user:settings', userSalt)
    }
    
    if (userData.taxProfile) {
      encrypted.taxProfile = await this.encryptJSON(userData.taxProfile, 'user:tax', userSalt)
    }
    
    return encrypted
  }
  
  /**
   * Decrypt sensitive user data fields
   */
  static async decryptUserData(encryptedData: {
    email?: EncryptedField
    personalInfo?: EncryptedField
    settings?: EncryptedField
    taxProfile?: EncryptedField
  }, userId: string): Promise<{
    email?: string
    personalInfo?: any
    settings?: any
    taxProfile?: any
  }> {
    const userSalt = crypto.createHash('sha256').update(userId).digest()
    const decrypted: any = {}
    
    if (encryptedData.email) {
      decrypted.email = await this.decrypt(encryptedData.email, 'user:email', userSalt)
    }
    
    if (encryptedData.personalInfo) {
      decrypted.personalInfo = await this.decryptJSON(encryptedData.personalInfo, 'user:personal', userSalt)
    }
    
    if (encryptedData.settings) {
      decrypted.settings = await this.decryptJSON(encryptedData.settings, 'user:settings', userSalt)
    }
    
    if (encryptedData.taxProfile) {
      decrypted.taxProfile = await this.decryptJSON(encryptedData.taxProfile, 'user:tax', userSalt)
    }
    
    return decrypted
  }
  
  /**
   * Create encrypted database field helper
   */
  static createEncryptedField(value: any, context: string, userId?: string): Promise<string> {
    const userSalt = userId ? crypto.createHash('sha256').update(userId).digest() : undefined
    return this.encrypt(JSON.stringify(value), context, userSalt)
      .then(encrypted => JSON.stringify(encrypted))
  }
  
  /**
   * Read encrypted database field helper
   */
  static async readEncryptedField(encryptedValue: string, context: string, userId?: string): Promise<any> {
    try {
      const encryptedField: EncryptedField = JSON.parse(encryptedValue)
      const userSalt = userId ? crypto.createHash('sha256').update(userId).digest() : undefined
      const decrypted = await this.decrypt(encryptedField, context, userSalt)
      return JSON.parse(decrypted)
    } catch (error) {
      // console.error('Failed to decrypt field:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })