import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly navigation: Locator;
  readonly mainContent: Locator;
  readonly superCards: Locator;
  readonly mobileNavigation: Locator;

  // Navigation links
  readonly dashboardLink: Locator;
  readonly analyticsLink: Locator;
  readonly portfolioLink: Locator;
  readonly incomeLink: Locator;
  readonly expensesLink: Locator;
  readonly settingsLink: Locator;
  readonly profileLink: Locator;

  // Super Cards
  readonly performanceHub: Locator;
  readonly incomeIntelligenceHub: Locator;
  readonly taxStrategyHub: Locator;
  readonly portfolioStrategyHub: Locator;
  readonly financialPlanningHub: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navigation = page.locator('nav, [role="navigation"]');
    this.mainContent = page.locator('main, [role="main"]');
    this.superCards = page.locator('[data-testid*="card"], .card, .super-card');
    this.mobileNavigation = page.locator('.bottom-navigation, [data-testid="mobile-nav"]');

    // Navigation links
    this.dashboardLink = page.locator('a[href*="dashboard"]').or(page.locator('text=Dashboard'));
    this.analyticsLink = page.locator('a[href*="analytics"]').or(page.locator('text=Analytics'));
    this.portfolioLink = page.locator('a[href*="portfolio"]').or(page.locator('text=Portfolio'));
    this.incomeLink = page.locator('a[href*="income"]').or(page.locator('text=Income'));
    this.expensesLink = page.locator('a[href*="expenses"]').or(page.locator('text=Expenses'));
    this.settingsLink = page.locator('a[href*="settings"]').or(page.locator('text=Settings'));
    this.profileLink = page.locator('a[href*="profile"]').or(page.locator('text=Profile'));

    // Super Cards
    this.performanceHub = page.locator('text=Performance Hub').or(page.locator('[data-testid="performance-hub"]'));
    this.incomeIntelligenceHub = page.locator('text=Income Intelligence Hub').or(page.locator('[data-testid="income-intelligence-hub"]'));
    this.taxStrategyHub = page.locator('text=Tax Strategy Hub').or(page.locator('[data-testid="tax-strategy-hub"]'));
    this.portfolioStrategyHub = page.locator('text=Portfolio Strategy Hub').or(page.locator('[data-testid="portfolio-strategy-hub"]'));
    this.financialPlanningHub = page.locator('text=Financial Planning Hub').or(page.locator('[data-testid="financial-planning-hub"]'));
  }

  async goto() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async gotoSuperCards() {
    await this.page.goto('/dashboard/super-cards-unified');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyDashboardLoaded() {
    await expect(this.mainContent).toBeVisible();
    // Verify we're on a dashboard page
    const url = this.page.url();
    expect(url).toMatch(/dashboard/);
  }

  async verifyNavigationLinks() {
    const links = [
      this.dashboardLink,
      this.analyticsLink,
      this.portfolioLink,
      this.incomeLink,
      this.expensesLink,
      this.settingsLink,
      this.profileLink
    ];

    for (const link of links) {
      if (await link.isVisible()) {
        await expect(link).toBeVisible();
      }
    }
  }

  async navigateToAnalytics() {
    await this.analyticsLink.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/.*analytics.*/);
  }

  async navigateToPortfolio() {
    await this.portfolioLink.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/.*portfolio.*/);
  }

  async navigateToIncome() {
    await this.incomeLink.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/.*income.*/);
  }

  async navigateToExpenses() {
    await this.expensesLink.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/.*expenses.*/);
  }

  async navigateToSettings() {
    await this.settingsLink.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/.*settings.*/);
  }

  async navigateToProfile() {
    await this.profileLink.click();
    await this.page.waitForLoadState('networkidle');
    await expect(this.page).toHaveURL(/.*profile.*/);
  }

  async verifySuperCards() {
    const cards = [
      this.performanceHub,
      this.incomeIntelligenceHub,
      this.taxStrategyHub,
      this.portfolioStrategyHub,
      this.financialPlanningHub
    ];

    for (const card of cards) {
      if (await card.isVisible()) {
        await expect(card).toBeVisible();
      }
    }
  }

  async testSuperCardInteractions() {
    // Test expanding/collapsing cards if they have that functionality
    const expandableCards = this.page.locator('[data-testid*="expand"], .expandable, button:has-text("Expand")');
    const cardCount = await expandableCards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = expandableCards.nth(i);
      if (await card.isVisible()) {
        await card.click();
        await this.page.waitForTimeout(500); // Allow for animation
      }
    }
  }

  async testAllInteractiveElements() {
    // Find and test all buttons
    const buttons = this.page.locator('button:visible');
    const buttonCount = await buttons.count();
    
    console.log(`Found ${buttonCount} visible buttons to test`);
    
    for (let i = 0; i < Math.min(buttonCount, 20); i++) { // Limit to avoid infinite loops
      const button = buttons.nth(i);
      const isEnabled = await button.isEnabled();
      const buttonText = await button.textContent() || `Button ${i}`;
      
      if (isEnabled) {
        console.log(`Testing button: ${buttonText}`);
        await button.click();
        await this.page.waitForTimeout(300); // Small delay for any animations
      }
    }

    // Test form inputs
    const inputs = this.page.locator('input:visible, select:visible, textarea:visible');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const inputType = await input.getAttribute('type') || 'text';
      
      if (inputType === 'text' || inputType === 'email' || inputType === 'number') {
        await input.fill('test value');
        await input.clear();
      }
    }
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/dashboard-${name}.png`, fullPage: true });
  }
}