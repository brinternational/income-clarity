/**
 * Backup Codes Service
 * Secure handling of MFA backup codes with encryption
 */

import * as crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { LocalModeUtils, LOCAL_MODE_CONFIG } from '../config/local-mode'
import { createOfflineMockClient } from '../supabase-client'

export interface BackupCode {
  id: string
  code: string
  used: boolean
  usedAt?: string
  createdAt: string
}

export interface StoredBackupCodes {
  userId: string
  factorId: string
  codes: string // Encrypted JSON string
  salt: string
  iv: string
  createdAt: string
  updatedAt: string
}

export class BackupCodesService {
  private static ALGORITHM = 'aes-256-gcm'
  private static KEY_LENGTH = 32
  private static SALT_LENGTH = 32
  private static IV_LENGTH = 16
  private static TAG_LENGTH = 16
  private static ITERATIONS = 100000

  /**
   * Generate secure backup codes
   */
  static generateCodes(count: number = 8): BackupCode[] {
    const codes: BackupCode[] = []
    
    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code with dashes for readability
      const part1 = crypto.randomBytes(2).toString('hex').toUpperCase()
      const part2 = crypto.randomBytes(2).toString('hex').toUpperCase()
      const code = `${part1}-${part2}`
      
      codes.push({
        id: crypto.randomUUID(),
        code,
        used: false,
        createdAt: new Date().toISOString()
      })
    }
    
    return codes
  }

  /**
   * Encrypt backup codes for storage
   */
  static encryptCodes(codes: BackupCode[], userSecret: string): {
    encrypted: string
    salt: string
    iv: string
    tag: string
  } {
    // Generate salt and IV
    const salt = crypto.randomBytes(this.SALT_LENGTH)
    const iv = crypto.randomBytes(this.IV_LENGTH)
    
    // Derive key from user secret and salt
    const key = crypto.pbkdf2Sync(
      userSecret,
      salt,
      this.ITERATIONS,
      this.KEY_LENGTH,
      'sha256'
    )
    
    // Create cipher
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv)
    
    // Encrypt the codes
    const codesJson = JSON.stringify(codes)
    let encrypted = cipher.update(codesJson, 'utf8')
    encrypted = Buffer.concat([encrypted, cipher.final()])
    
    // Get the authentication tag (must be called after final())
    const tag = (cipher as any).getAuthTag()
    
    // Combine encrypted data with tag
    const combined = Buffer.concat([encrypted, tag])
    
    return {
      encrypted: combined.toString('base64'),
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64')
    }
  }

  /**
   * Decrypt backup codes from storage
   */
  static decryptCodes(
    encryptedData: string,
    salt: string,
    iv: string,
    userSecret: string
  ): BackupCode[] {
    // Convert from base64
    const encryptedBuffer = Buffer.from(encryptedData, 'base64')
    const saltBuffer = Buffer.from(salt, 'base64')
    const ivBuffer = Buffer.from(iv, 'base64')
    
    // Extract tag from the end of encrypted data
    const tag = encryptedBuffer.slice(-this.TAG_LENGTH)
    const encrypted = encryptedBuffer.slice(0, -this.TAG_LENGTH)
    
    // Derive key from user secret and salt
    const key = crypto.pbkdf2Sync(
      userSecret,
      saltBuffer,
      this.ITERATIONS,
      this.KEY_LENGTH,
      'sha256'
    )
    
    // Create decipher
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, ivBuffer)
    ;(decipher as any).setAuthTag(tag)
    
    // Decrypt the codes
    let decrypted = decipher.update(encrypted)
    decrypted = Buffer.concat([decrypted, decipher.final()])
    
    return JSON.parse(decrypted.toString('utf8'))
  }

  /**
   * Store encrypted backup codes in database
   */
  static async storeCodes(
    supabase: any,
    userId: string,
    factorId: string,
    codes: BackupCode[],
    userSecret: string
  ): Promise<boolean> {
    try {
      const encrypted = this.encryptCodes(codes, userSecret)
      
      const { error } = await supabase
        .from('mfa_backup_codes')
        .upsert({
          user_id: userId,
          factor_id: factorId,
          codes: encrypted.encrypted,
          salt: encrypted.salt,
          iv: encrypted.iv,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        // console.error('Error storing backup codes:', error)
        // return false
      }
      
      return true
    } catch (error) {
      // console.error('Error in storeCodes:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })