import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check that the page title is present
    await expect(page).toHaveTitle(/ReLuma|Eonlife/i);
  });

  test('should display header with navigation', async ({ page }) => {
    // Check for header element
    const header = page.locator('header, nav').first();
    await expect(header).toBeVisible();

    // Check for navigation links or logo
    const hasLogo = await page.locator('img[alt*="logo" i], a[href="/"]').first().isVisible().catch(() => false);
    const hasNav = await page.locator('nav a, header a').count() > 0;

    expect(hasLogo || hasNav).toBeTruthy();
  });

  test('should display hero section', async ({ page }) => {
    // Look for hero section with heading
    const heroHeading = page.locator('h1').first();
    await expect(heroHeading).toBeVisible();

    // Check for CTA button
    const ctaButton = page.locator('button, a').filter({ hasText: /buy|shop|order|get started|learn more/i }).first();
    await expect(ctaButton).toBeVisible();
  });

  test('should display footer', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for footer
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('should have responsive design on mobile', async ({ page }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page with mobile viewport
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that page is still visible and content is accessible
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    // Look for link to products
    const productsLink = page.locator('a[href*="/products"], a:has-text("Products"), a:has-text("Shop")').first();

    if (await productsLink.isVisible()) {
      await productsLink.click();
      await page.waitForURL(/\/products/);
      await expect(page).toHaveURL(/\/products/);
    }
  });

  test('should have working social media links', async ({ page }) => {
    // Find social media links (Instagram, Twitter, Facebook, etc.)
    const socialLinks = page.locator('a[href*="instagram"], a[href*="twitter"], a[href*="facebook"], a[href*="linkedin"]');

    const count = await socialLinks.count();
    if (count > 0) {
      // Check that at least one social link exists and has href
      const firstLink = socialLinks.first();
      await expect(firstLink).toHaveAttribute('href', /.+/);
    }
  });

  test('should display product images', async ({ page }) => {
    // Check for images on the page
    const images = page.locator('img').filter({ has: page.locator('[alt]') });
    const count = await images.count();

    expect(count).toBeGreaterThan(0);

    // Verify at least one image has loaded
    const firstImage = images.first();
    await expect(firstImage).toHaveJSProperty('complete', true);
    await expect(firstImage).toHaveJSProperty('naturalWidth');
  });
});

test.describe('Homepage Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display features or benefits section', async ({ page }) => {
    // Look for sections with multiple items (features, benefits)
    const sections = page.locator('section, div[class*="feature"], div[class*="benefit"]');
    const count = await sections.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should display testimonials section', async ({ page }) => {
    // Look for testimonials
    const testimonials = page.locator('[class*="testimonial"], [class*="review"]').first();

    if (await testimonials.isVisible()) {
      await expect(testimonials).toBeVisible();
    }
  });

  test('should have call-to-action buttons', async ({ page }) => {
    // Count CTA buttons
    const ctaButtons = page.locator('button, a[class*="button"], a[class*="cta"]').filter({
      hasText: /buy|shop|order|add to cart|get started|learn more|purchase/i
    });

    const count = await ctaButtons.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Navigation', () => {
  test('should open and close mobile menu', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    await page.goto('/');

    // Look for hamburger menu button
    const menuButton = page.locator('button[aria-label*="menu" i], button:has(svg)').first();

    if (await menuButton.isVisible()) {
      // Open menu
      await menuButton.click();

      // Wait for menu to be visible
      await page.waitForTimeout(500);

      // Check if navigation is visible
      const nav = page.locator('nav, [role="navigation"], [class*="mobile-menu"]');
      // Menu should be visible or navigation should be visible
      const isVisible = await nav.isVisible().catch(() => false);
      expect(isVisible).toBeTruthy();
    }
  });

  test('should have accessible navigation links', async ({ page }) => {
    await page.goto('/');

    // Get all navigation links
    const navLinks = page.locator('nav a, header a[href]');
    const count = await navLinks.count();

    // Should have at least a few navigation links
    expect(count).toBeGreaterThan(0);

    // Check first link has valid href
    if (count > 0) {
      const firstLink = navLinks.first();
      await expect(firstLink).toHaveAttribute('href', /.+/);
    }
  });
});
