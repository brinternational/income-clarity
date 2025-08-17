import { Page, Locator, expect } from '@playwright/test';

export class AuthPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly loginButton: Locator;
  readonly signupButton: Locator;
  readonly loginLink: Locator;
  readonly signupLink: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#name, input[name="name"]');
    this.emailInput = page.locator('input[type="email"], input[name="email"]');
    this.passwordInput = page.locator('input[type="password"], input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="confirm-password"]');
    this.loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In")');
    this.signupButton = page.locator('button:has-text("Sign Up"), button:has-text("Register"), button:has-text("Create Account")');
    this.loginLink = page.locator('a[href*="login"]');
    this.signupLink = page.locator('a[href*="signup"]');
    this.errorMessage = page.locator('[role="alert"], .error, .alert-error');
    this.successMessage = page.locator('.success, .alert-success');
  }

  async goToLogin() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle');
  }

  async goToSignup() {
    await this.page.goto('/auth/signup');
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async signup(email: string, password: string, confirmPassword?: string, name?: string) {
    if (name && this.nameInput) {
      await this.nameInput.fill(name);
    }
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (confirmPassword && this.confirmPasswordInput) {
      await this.confirmPasswordInput.fill(confirmPassword);
    }
    await this.signupButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLoginPage() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async verifySignupPage() {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signupButton).toBeVisible();
  }

  async verifyAuthenticationSuccess() {
    // Wait for redirect to dashboard
    await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
    await expect(this.page).toHaveURL(/.*dashboard.*/);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/auth-${name}.png`, fullPage: true });
  }
}