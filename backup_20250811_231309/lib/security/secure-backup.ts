/**
 * Secure Backup System
 * Provides encrypted backup and restore functionality for SQLite database
 * with integrity verification and secure storage
 */

import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { DatabaseEncryption, ENCRYPTION_CONTEXTS } from './encryption'
import { PrismaClient } from '../generated/prisma'
import archiver from 'archiver'
import { createReadStream, createWriteStream } from 'fs'

export interface BackupMetadata {
  id: string
  timestamp: Date
  version: string
  checksum: string
  size: number
  encrypted: boolean
  compressionLevel: number
  tables: string[]
  userCount: number
  recordCount: number
}

export interface BackupOptions {
  encrypt?: boolean
  compress?: boolean
  compressionLevel?: number
  includeBlobs?: boolean
  includeSensitiveData?: boolean
  password?: string
  outputPath?: string
}

export interface RestoreOptions {
  password?: string
  overwrite?: boolean
  skipIntegrityCheck?: boolean
  restoreToPath?: string
}

const DEFAULT_BACKUP_OPTIONS: Required<BackupOptions> = {
  encrypt: true,
  compress: true,
  compressionLevel: 6,
  includeBlobs: false,
  includeSensitiveData: true,
  password: '',
  outputPath: './data/backups'
}

export class SecureBackupService {
  private static readonly BACKUP_VERSION = '1.0.0'
  private static readonly BACKUP_EXTENSION = '.backup'
  private static readonly METADATA_FILE = 'backup.json'
  private static prisma: PrismaClient
  
  /**
   * Initialize backup service
   */
  static async initialize(prismaClient: PrismaClient): Promise<void> {
    this.prisma = prismaClient
    
    // Ensure backup directory exists
    const backupDir = path.resolve(DEFAULT_BACKUP_OPTIONS.outputPath)
    await fs.mkdir(backupDir, { recursive: true })
    
    // console.log('Secure backup service initialized')
  }
  
  /**
   * Create encrypted backup
   */
  static async createBackup(
    userId?: string,
    options: Partial<BackupOptions> = {}
  ): Promise<{
    success: boolean
    backupId: string
    filePath: string
    metadata: BackupMetadata
    error?: string
  }> {
    const opts = { ...DEFAULT_BACKUP_OPTIONS, ...options }
    const backupId = crypto.randomUUID()
    const timestamp = new Date()
    
    try {
      // Create backup directory
      const backupDir = path.resolve(opts.outputPath)
      await fs.mkdir(backupDir, { recursive: true })
      
      // Generate backup filename
      const filename = `backup_${timestamp.toISOString().replace(/[:.]/g, '-')}${this.BACKUP_EXTENSION}`
      const backupPath = path.join(backupDir, filename)
      
      // Export data from database
      const exportedData = await this.exportDatabaseData(userId, opts)
      
      // Create metadata
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        version: this.BACKUP_VERSION,
        checksum: '',
        size: 0,
        encrypted: opts.encrypt,
        compressionLevel: opts.compressionLevel,
        tables: exportedData.tables,
        userCount: exportedData.userCount,
        recordCount: exportedData.recordCount
      }
      
      // Prepare backup data
      const backupData = {
        metadata,
        data: exportedData.data,
        schema: exportedData.schema
      }
      
      let finalData = JSON.stringify(backupData, null, 2)
      
      // Compress if requested
      if (opts.compress) {
        finalData = await this.compressData(finalData, opts.compressionLevel)
      }
      
      // Encrypt if requested
      if (opts.encrypt) {
        const password = opts.password || process.env.BACKUP_PASSWORD || 'default-backup-password'
        finalData = await this.encryptBackup(finalData, password, backupId)
      }
      
      // Calculate checksum
      const checksum = crypto.createHash('sha256').update(finalData).digest('hex')
      metadata.checksum = checksum
      metadata.size = Buffer.byteLength(finalData)
      
      // Write backup file
      await fs.writeFile(backupPath, finalData)
      
      // Write metadata file
      const metadataPath = path.join(backupDir, `${filename}.meta.json`)
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
      
      // console.log(`Backup created: ${filename} (${metadata.size} bytes)`)

      return {
        success: true,
        backupId,
        filePath: backupPath,
        metadata
      }
    } catch (error) {
      // console.error('Backup creation failed:', error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })