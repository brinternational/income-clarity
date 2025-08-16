/**
 * Authentication API Routes Tests
 * Tests login, signup, logout, and me endpoints
 */

import { POST as loginPOST } from '@/app/api/auth/login/route'
import { POST as signupPOST } from '@/app/api/auth/signup/route'
import { POST as logoutPOST } from '@/app/api/auth/logout/route'
import { GET as meGET } from '@/app/api/auth/me/route'
import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}))

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn().mockReturnValue('mock-uuid-1234'),
  },
})

describe('Authentication API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/signup', () => {
    it('should create a new user successfully', async () => {
      const { prisma } = require('@/lib/db')
      prisma.user.findUnique.mockResolvedValue(null) // User doesn't exist
      prisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
      })
      prisma.session.create.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        token: 'mock-uuid-1234',
      })

      const body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const response = await signupPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('test@example.com')
      expect(prisma.user.create).toHaveBeenCalled()
      expect(prisma.session.create).toHaveBeenCalled()
    })

    it('should reject duplicate email registration', async () => {
      const { prisma } = require('@/lib/db')
      prisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
      })

      const body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const response = await signupPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('User already exists')
    })

    it('should validate required fields', async () => {
      const body = {
        email: 'test@example.com',
        // Missing password and name
      }

      const request = new NextRequest('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const response = await signupPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const { prisma } = require('@/lib/db')
      const bcrypt = require('bcryptjs')
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
      })
      bcrypt.compare.mockResolvedValue(true)
      prisma.session.create.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        token: 'mock-uuid-1234',
      })

      const body = {
        email: 'test@example.com',
        password: 'password123',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.email).toBe('test@example.com')
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword')
    })

    it('should reject invalid credentials', async () => {
      const { prisma } = require('@/lib/db')
      const bcrypt = require('bcryptjs')
      
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        password: 'hashedPassword',
      })
      bcrypt.compare.mockResolvedValue(false)

      const body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })

    it('should reject non-existent user', async () => {
      const { prisma } = require('@/lib/db')
      prisma.user.findUnique.mockResolvedValue(null)

      const body = {
        email: 'nonexistent@example.com',
        password: 'password123',
      }

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Invalid credentials')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user data for valid session', async () => {
      const { prisma } = require('@/lib/db')
      prisma.session.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      })

      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          cookie: 'session-token=valid-token',
        },
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.user.email).toBe('test@example.com')
    })

    it('should return 401 for invalid session', async () => {
      const { prisma } = require('@/lib/db')
      prisma.session.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          cookie: 'session-token=invalid-token',
        },
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid session', async () => {
      const { prisma } = require('@/lib/db')
      prisma.session.findUnique.mockResolvedValue({
        id: 'session-1',
        userId: 'user-1',
      })
      prisma.session.delete.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          cookie: 'session-token=valid-token',
        },
      })

      const response = await logoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(prisma.session.delete).toHaveBeenCalled()
    })

    it('should handle logout without session gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST',
      })

      const response = await logoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})