import { test, expect } from '@playwright/test';

test.describe('UI Smoke Tests - Catch Obvious Errors', () => {
  
  test('page loads without errors', async ({ page }) => {
    // Listen for any console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Navigate to the main page
    await page.goto('/working');
    
    // Wait a bit for any errors to appear
    await page.waitForTimeout(2000);
    
    // Check no console errors
    expect(errors).toHaveLength(0);
    if (errors.length > 0) {
      // console.log('Console errors found:', errors);
    }
    
    // Check page actually rendered content
    await expect(page.locator('h1:has-text("Income Clarity")')).toBeVisible();
  });

  test('no duplicate export or build errors', async ({ page }) => {
    // This would have caught our "Duplicate export 'default'" error
    // If page doesn't load due to build error, this will fail
    await page.goto('/working');
    
    // Check that main components rendered
    await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 5000 });
  });

  test('CSS is actually working', async ({ page }) => {
    await page.goto('/working');
    
    // Check that at least one element has Tailwind classes applied
    const cardElement = page.locator('.bg-white').first();
    await expect(cardElement).toBeVisible();
    
    // Check computed styles to ensure CSS is applied
    const backgroundColor = await cardElement.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should be white (rgb(255, 255, 255)) not transparent
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('theme switcher exists and works', async ({ page }) => {
    await page.goto('/working');
    
    // Check theme selector exists
    await expect(page.locator('text=Theme')).toBeVisible();
    
    // Click theme selector
    await page.click('text=Theme');
    
    // Check themes dropdown appears
    await expect(page.locator('text=Minimalist')).toBeVisible();
    await expect(page.locator('text=Cyberpunk')).toBeVisible();
    
    // Click a theme and verify no errors
    await page.click('text=Cyberpunk');
    
    // Give it a moment to apply theme
    await page.waitForTimeout(500);
    
    // Page should still be functional
    await expect(page.locator('h1:has-text("Income Clarity")')).toBeVisible();
  });

  test('auth pages load without hydration errors', async ({ page }) => {
    // Listen for React hydration errors and 500 errors
    const errors: string[] = [];
    const hydrationErrors: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (msg.type() === 'error') {
        errors.push(text);
        // Check for React hydration error patterns
        if (text.includes('Hydration') || text.includes('did not match') || text.includes('Text content does not match')) {
          hydrationErrors.push(text);
        }
      }
    });

    // Monitor network for 500 errors
    page.on('response', response => {
      if (response.status() === 500) {
        errors.push(`500 Error on ${response.url()}`);
      }
    });
    
    // Test simple login page specifically (where the error was occurring)
    await page.goto('/auth/simple-login');
    
    // Wait for potential hydration to complete
    await page.waitForTimeout(3000);
    
    // Check no hydration errors occurred
    expect(hydrationErrors).toHaveLength(0);
    if (hydrationErrors.length > 0) {
      // console.log('Hydration errors found:', hydrationErrors);
    }
    
    // Check no 500 errors
    const serverErrors = errors.filter(e => e.includes('500'));
    expect(serverErrors).toHaveLength(0);
    if (serverErrors.length > 0) {
      // console.log('Server errors found:', serverErrors);
    }
    
    // Page should render properly
    await expect(page.locator('text=Welcome to Income Clarity')).toBeVisible();
    await expect(page.locator('button:has-text("Start Demo")')).toBeVisible();
    
    // Test login functionality
    await page.click('button:has-text("Start Demo")');
    
    // Should redirect without errors
    await page.waitForTimeout(1000);
    
    // No additional errors should occur
    const finalHydrationErrors = errors.filter(e => 
      e.includes('Hydration') || e.includes('did not match') || e.includes('Text content does not match')
    );
    expect(finalHydrationErrors).toHaveLength(0);
  });

  test('home page redirect works without hydration errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to home page (which redirects)
    await page.goto('/');
    
    // Wait for redirect to complete
    await page.waitForURL('/working', { timeout: 5000 });
    
    // No errors should occur during redirect
    const hydrationErrors = errors.filter(e => 
      e.includes('Hydration') || e.includes('did not match') || e.includes('window is not defined')
    );
    expect(hydrationErrors).toHaveLength(0);
    
    // Should be on working page
    await expect(page.locator('h1:has-text("Income Clarity")')).toBeVisible();
  });
});