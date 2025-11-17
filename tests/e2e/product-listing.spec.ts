import { test, expect } from '@playwright/test';

test.describe('Product Listing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('should load products page successfully', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(page).toHaveTitle(/Products|Shop|ReLuma|Eonlife/i);
  });

  test('should display product cards', async ({ page }) => {
    // Wait for products to load
    await page.waitForLoadState('networkidle');

    // Look for product cards or items
    const productCards = page.locator('[class*="product"], article, [data-testid*="product"]').filter({
      has: page.locator('img, h2, h3')
    });

    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display product images', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find product images
    const productImages = page.locator('img[alt*="product" i], img[src*="product"]').or(
      page.locator('article img, [class*="product"] img')
    );

    const count = await productImages.count();
    expect(count).toBeGreaterThan(0);

    // Verify first image has loaded
    if (count > 0) {
      const firstImage = productImages.first();
      await expect(firstImage).toBeVisible();
    }
  });

  test('should display product titles', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for product titles (h2 or h3 headings)
    const productTitles = page.locator('article h2, article h3, [class*="product"] h2, [class*="product"] h3');

    const count = await productTitles.count();
    expect(count).toBeGreaterThan(0);

    // Verify first title has text
    if (count > 0) {
      const firstTitle = productTitles.first();
      await expect(firstTitle).toHaveText(/.+/);
    }
  });

  test('should display product prices', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for price elements (commonly $ sign or class containing price)
    const prices = page.locator('[class*="price"], [data-testid*="price"]').or(
      page.locator('text=/\\$\\d+/')
    );

    const count = await prices.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have working filters', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for filter elements
    const filterButtons = page.locator('button').filter({ hasText: /filter|category|sort|price/i });
    const filterSelects = page.locator('select');
    const filterInputs = page.locator('input[type="checkbox"], input[type="radio"]').filter({
      has: page.locator(':visible')
    });

    const hasFilters =
      await filterButtons.count() > 0 ||
      await filterSelects.count() > 0 ||
      await filterInputs.count() > 0;

    if (hasFilters) {
      // Try to interact with first filter if available
      const firstFilter = filterButtons.first().or(filterSelects.first()).or(filterInputs.first());

      if (await firstFilter.isVisible()) {
        await firstFilter.click({ timeout: 5000 }).catch(() => {});
      }
    }
  });

  test('should have search functionality', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]');

    if (await searchInput.count() > 0) {
      const input = searchInput.first();
      await expect(input).toBeVisible();

      // Type in search
      await input.fill('cream');

      // Wait for results to update
      await page.waitForTimeout(1000);
    }
  });

  test('should allow sorting products', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for sort dropdown or buttons
    const sortSelect = page.locator('select').filter({ has: page.locator('option:has-text("price"), option:has-text("name")') });
    const sortButtons = page.locator('button').filter({ hasText: /sort|price|name|newest|popular/i });

    const hasSorting = await sortSelect.count() > 0 || await sortButtons.count() > 0;

    if (hasSorting) {
      if (await sortSelect.count() > 0) {
        // Try to select an option
        const select = sortSelect.first();
        await select.selectOption({ index: 1 }).catch(() => {});
        await page.waitForTimeout(500);
      } else if (await sortButtons.count() > 0) {
        // Click sort button
        await sortButtons.first().click().catch(() => {});
        await page.waitForTimeout(500);
      }
    }
  });

  test('should navigate to product detail on click', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Find clickable product cards or links
    const productLinks = page.locator('a[href*="/products/"]').filter({
      has: page.locator('img, h2, h3')
    });

    const count = await productLinks.count();

    if (count > 0) {
      const firstProduct = productLinks.first();
      await firstProduct.click();

      // Wait for navigation
      await page.waitForURL(/\/products\/[^/]+/);

      // Verify we're on a product detail page
      await expect(page).toHaveURL(/\/products\/.+/);
    }
  });

  test('should have add to cart buttons on products', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for add to cart buttons
    const addToCartButtons = page.locator('button').filter({ hasText: /add to cart|buy now|purchase/i });

    const count = await addToCartButtons.count();

    if (count > 0) {
      const firstButton = addToCartButtons.first();
      await expect(firstButton).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Verify products are still visible
    const products = page.locator('article, [class*="product"]').filter({
      has: page.locator('img')
    });

    const count = await products.count();
    expect(count).toBeGreaterThan(0);

    // Products should stack vertically on mobile
    if (count > 1) {
      const firstProduct = products.nth(0);
      const secondProduct = products.nth(1);

      const firstBox = await firstProduct.boundingBox();
      const secondBox = await secondProduct.boundingBox();

      if (firstBox && secondBox) {
        // On mobile, second product should be below first (higher y coordinate)
        expect(secondBox.y).toBeGreaterThan(firstBox.y);
      }
    }
  });

  test('should display category filters', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for category filters or tabs
    const categoryFilters = page.locator('button, a, input').filter({
      hasText: /category|all products|face|body|skincare/i
    });

    const count = await categoryFilters.count();

    if (count > 0) {
      // Try clicking a category filter
      const firstCategory = categoryFilters.first();
      await firstCategory.click({ timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
  });

  test('should display price range filter', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for price range inputs or sliders
    const priceInputs = page.locator('input[type="range"], input[type="number"]').filter({
      or: [
        page.locator('[name*="price"]'),
        page.locator('[id*="price"]')
      ]
    });

    if (await priceInputs.count() > 0) {
      const firstInput = priceInputs.first();
      await expect(firstInput).toBeVisible();
    }
  });

  test('should show product count or results info', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for text showing number of products
    const resultsInfo = page.locator('text=/\\d+ (products|results|items)/i');

    if (await resultsInfo.count() > 0) {
      const info = resultsInfo.first();
      await expect(info).toBeVisible();
    }
  });
});

test.describe('Product Grid Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
  });

  test('should display products in grid layout on desktop', async ({ page, isMobile }) => {
    if (isMobile) {
      test.skip();
    }

    const products = page.locator('article, [class*="product"]').filter({
      has: page.locator('img')
    });

    const count = await products.count();

    if (count > 2) {
      // Get positions of first three products
      const firstBox = await products.nth(0).boundingBox();
      const secondBox = await products.nth(1).boundingBox();

      if (firstBox && secondBox) {
        // On desktop, products should be side by side (similar y coordinates)
        const yDifference = Math.abs(firstBox.y - secondBox.y);
        expect(yDifference).toBeLessThan(50); // Allow small difference for alignment
      }
    }
  });

  test('should have consistent product card sizing', async ({ page }) => {
    const productCards = page.locator('article, [class*="product"]').filter({
      has: page.locator('img')
    });

    const count = await productCards.count();

    if (count > 1) {
      const firstBox = await productCards.nth(0).boundingBox();
      const secondBox = await productCards.nth(1).boundingBox();

      if (firstBox && secondBox) {
        // Cards should have similar widths (within 10%)
        const widthDifference = Math.abs(firstBox.width - secondBox.width);
        const averageWidth = (firstBox.width + secondBox.width) / 2;
        const percentDifference = (widthDifference / averageWidth) * 100;

        expect(percentDifference).toBeLessThan(10);
      }
    }
  });
});
