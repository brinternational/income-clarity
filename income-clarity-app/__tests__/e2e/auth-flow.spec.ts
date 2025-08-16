/**
 * Authentication Flow E2E Tests
 * Tests complete authentication user journeys
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
  })

  test('should complete signup flow successfully', async ({ page }) => {
    // Click login button to go to auth page
    await page.click('text=Login')
    
    // Switch to signup
    await page.click('text=Sign up')
    
    // Fill signup form
    await page.fill('input[type="email"]', 'newuser@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.fill('input[name="name"]', 'New User')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Should show welcome message or user name
    await expect(page.locator('text=New User')).toBeVisible()
  })

  test('should login with existing credentials', async ({ page }) => {
    // Click login button
    await page.click('text=Login')
    
    // Fill login form with test account
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Should show user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Login')
    
    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible()
    
    // Should stay on login page
    await expect(page).toHaveURL('/auth/login')
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.click('text=Login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Click user menu
    await page.click('[data-testid="user-menu"]')
    
    // Click logout
    await page.click('text=Logout')
    
    // Should redirect to home
    await expect(page).toHaveURL('/')
    
    // Should show login button again
    await expect(page.locator('text=Login')).toBeVisible()
  })

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Try to access dashboard without login
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL('/auth/login')
  })

  test('should validate form fields', async ({ page }) => {
    await page.click('text=Login')
    await page.click('text=Sign up')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept auth requests and make them fail
    await page.route('**/api/auth/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      })
    })
    
    await page.click('text=Login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('text=Server error')).toBeVisible()
  })

  test('should persist session across page refreshes', async ({ page }) => {
    // Login
    await page.click('text=Login')
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
    
    // Refresh page
    await page.reload()
    
    // Should still be logged in
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible()
  })
})