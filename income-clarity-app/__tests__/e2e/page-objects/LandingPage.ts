import { Page, Locator, expect } from '@playwright/test';

export class LandingPage {
  readonly page: Page;
  readonly header: Locator;
  readonly logo: Locator;
  readonly mobileMenuButton: Locator;
  readonly loginButton: Locator;
  readonly signupButton: Locator;
  readonly getStartedButton: Locator;
  readonly viewDemoButton: Locator;
  readonly heroTitle: Locator;
  readonly heroDescription: Locator;
  readonly featuresSection: Locator;
  readonly benefitsSection: Locator;
  readonly ctaSection: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('nav');
    this.logo = page.locator('text=Income Clarity');
    this.mobileMenuButton = page.locator('button:has(svg)').first();
    this.loginButton = page.locator('a:has-text("Login")');
    this.signupButton = page.locator('a:has-text("Get Started"), a:has-text("Sign Up")');
    this.getStartedButton = page.locator('a:has-text("Start Free Trial")');
    this.viewDemoButton = page.locator('a:has-text("View Demo")');
    this.heroTitle = page.locator('h1');
    this.heroDescription = page.locator('p:has-text("dividend tracker")');
    this.featuresSection = page.locator('section:has-text("Everything You Need")');
    this.benefitsSection = page.locator('section:has-text("Why Choose Income Clarity")');
    this.ctaSection = page.locator('section:has-text("Ready to Take Control")');
    this.footer = page.locator('footer');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyLandingPageElements() {
    await expect(this.header).toBeVisible();
    await expect(this.logo).toBeVisible();
    await expect(this.heroTitle).toBeVisible();
    await expect(this.heroDescription).toBeVisible();
    await expect(this.getStartedButton).toBeVisible();
    await expect(this.viewDemoButton).toBeVisible();
    await expect(this.featuresSection).toBeVisible();
    await expect(this.benefitsSection).toBeVisible();
    await expect(this.ctaSection).toBeVisible();
    await expect(this.footer).toBeVisible();
  }

  async clickGetStarted() {
    await this.getStartedButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickLogin() {
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickViewDemo() {
    await this.viewDemoButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async testMobileMenu() {
    // Only test mobile menu on mobile viewports
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < 768) {
      await this.mobileMenuButton.click();
      await expect(this.page.locator('.md\\:hidden')).toBeVisible();
      await this.mobileMenuButton.click(); // Close menu
    }
  }

  async verifyFeatureCards() {
    const featureCards = this.page.locator('[data-testid="feature-card"], .relative.group');
    const expectedFeatures = ['Beat the Market', 'Income Clarity', 'Tax Intelligence', 'Milestone Tracking'];
    
    for (const feature of expectedFeatures) {
      await expect(this.page.locator(`text=${feature}`)).toBeVisible();
    }
  }

  async verifyBenefitsList() {
    const expectedBenefits = [
      'Real-time portfolio tracking',
      'Tax-optimized strategies', 
      'Dividend income projections',
      'FIRE progress monitoring',
      'Mobile-first design',
      'Bank-level security'
    ];

    for (const benefit of expectedBenefits) {
      await expect(this.page.locator(`text=${benefit}`)).toBeVisible();
    }
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/landing-${name}.png`, fullPage: true });
  }
}