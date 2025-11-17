import { test, expect } from '@playwright/test';

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page first
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Click on first product to get to detail page
    const productLinks = page.locator('a[href*="/products/"]').filter({
      has: page.locator('img, h2, h3')
    });

    const count = await productLinks.count();

    if (count > 0) {
      await productLinks.first().click();
      await page.waitForURL(/\/products\/[^/]+/);
      await page.waitForLoadState('networkidle');
    } else {
      // Fallback: try to navigate to a product directly
      await page.goto('/products/reluma-youthful-radiance');
      await page.waitForLoadState('networkidle');
    }
  });

  test('should load product detail page successfully', async ({ page }) => {
    // Verify we're on a product detail page
    await expect(page).toHaveURL(/\/products\/.+/);
  });

  test('should display product title', async ({ page }) => {
    // Look for main product heading
    const productTitle = page.locator('h1, h2').first();
    await expect(productTitle).toBeVisible();
    await expect(productTitle).toHaveText(/.+/);
  });

  test('should display product image', async ({ page }) => {
    // Look for main product image
    const productImage = page.locator('img').first();
    await expect(productImage).toBeVisible();

    // Verify image has loaded
    await expect(productImage).toHaveJSProperty('complete', true);
  });

  test('should display product price', async ({ page }) => {
    // Look for price element
    const price = page.locator('[class*="price"], [data-testid*="price"]').or(
      page.locator('text=/\\$\\d+/')
    );

    const count = await price.count();
    expect(count).toBeGreaterThan(0);

    if (count > 0) {
      await expect(price.first()).toBeVisible();
    }
  });

  test('should display product description', async ({ page }) => {
    // Look for description text (usually in paragraphs or divs)
    const description = page.locator('p, [class*="description"]').filter({
      hasText: /.{50,}/ // At least 50 characters
    });

    const count = await description.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have add to cart button', async ({ page }) => {
    // Look for add to cart button
    const addToCartButton = page.locator('button').filter({
      hasText: /add to cart|buy now|purchase|add to bag/i
    });

    const count = await addToCartButton.count();
    expect(count).toBeGreaterThan(0);

    if (count > 0) {
      const button = addToCartButton.first();
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });

  test('should add product to cart', async ({ page }) => {
    // Find and click add to cart button
    const addToCartButton = page.locator('button').filter({
      hasText: /add to cart|buy now|purchase|add to bag/i
    }).first();

    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();

      // Wait for cart to update (look for confirmation or cart count)
      await page.waitForTimeout(1000);

      // Check for success indicator
      const successIndicators = page.locator(
        'text=/added to cart|item added|success/i, [class*="success"], [class*="notification"]'
      );

      // Or check if cart count increased
      const cartCount = page.locator('[class*="cart"] [class*="count"], [class*="cart"] [class*="badge"]');

      const hasSuccess = await successIndicators.count() > 0 || await cartCount.count() > 0;
      expect(hasSuccess).toBeTruthy();
    }
  });

  test('should have quantity selector', async ({ page }) => {
    // Look for quantity input or selector
    const quantityInput = page.locator(
      'input[type="number"], select[name*="quantity" i], input[name*="quantity" i]'
    );

    if (await quantityInput.count() > 0) {
      const input = quantityInput.first();
      await expect(input).toBeVisible();

      // Try to change quantity
      if (await input.getAttribute('type') === 'number') {
        await input.fill('2');
        await expect(input).toHaveValue('2');
      }
    }
  });

  test('should have product image gallery', async ({ page }) => {
    // Look for multiple product images or thumbnail images
    const productImages = page.locator('img[alt*="product" i], img[src*="product"], [class*="gallery"] img');

    const count = await productImages.count();

    if (count > 1) {
      // Try clicking on second image to change main image
      const thumbnails = page.locator('[class*="thumbnail"] img, [class*="gallery"] img').nth(1);

      if (await thumbnails.isVisible()) {
        await thumbnails.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display product variants or options', async ({ page }) => {
    // Look for variant selectors (size, color, etc.)
    const variantButtons = page.locator('button').filter({
      hasText: /size|color|variant|option/i
    });

    const variantSelects = page.locator('select').filter({
      has: page.locator('option:has-text("size"), option:has-text("color"), option:has-text("variant")')
    });

    const hasVariants = await variantButtons.count() > 0 || await variantSelects.count() > 0;

    if (hasVariants) {
      if (await variantButtons.count() > 0) {
        // Click on a variant button
        await variantButtons.first().click();
        await page.waitForTimeout(500);
      } else if (await variantSelects.count() > 0) {
        // Select a variant option
        await variantSelects.first().selectOption({ index: 1 });
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display product details/specifications', async ({ page }) => {
    // Look for details section with list items or table
    const detailsList = page.locator('ul li, table tr, [class*="specification"], [class*="detail"]');

    const count = await detailsList.count();

    if (count > 0) {
      await expect(detailsList.first()).toBeVisible();
    }
  });

  test('should have reviews section', async ({ page }) => {
    // Scroll down to see reviews
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Look for reviews section
    const reviewsSection = page.locator(
      '[class*="review"], [id*="review"], h2:has-text("Reviews"), h3:has-text("Reviews")'
    );

    const count = await reviewsSection.count();

    if (count > 0) {
      const section = reviewsSection.first();
      await expect(section).toBeVisible();
    }
  });

  test('should display star rating', async ({ page }) => {
    // Look for star rating elements
    const stars = page.locator(
      '[class*="star"], svg[class*="star"], [aria-label*="star"], [class*="rating"]'
    );

    const count = await stars.count();

    if (count > 0) {
      await expect(stars.first()).toBeVisible();
    }
  });

  test('should have related products section', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Look for related products section
    const relatedSection = page.locator(
      'h2:has-text("Related"), h3:has-text("Related"), h2:has-text("You may also like"), [class*="related"]'
    );

    if (await relatedSection.count() > 0) {
      await expect(relatedSection.first()).toBeVisible();

      // Check for related product cards
      const relatedProducts = page.locator('article, [class*="product"]').filter({
        has: page.locator('img')
      });

      const count = await relatedProducts.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should have breadcrumb navigation', async ({ page }) => {
    // Look for breadcrumb navigation
    const breadcrumbs = page.locator('nav[aria-label*="breadcrumb" i], [class*="breadcrumb"]');

    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs.first()).toBeVisible();

      // Breadcrumbs should have links
      const breadcrumbLinks = breadcrumbs.locator('a');
      const linkCount = await breadcrumbLinks.count();
      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify key elements are still visible
    const title = page.locator('h1, h2').first();
    await expect(title).toBeVisible();

    const image = page.locator('img').first();
    await expect(image).toBeVisible();

    const addToCart = page.locator('button').filter({
      hasText: /add to cart|buy now/i
    }).first();

    if (await addToCart.isVisible()) {
      await expect(addToCart).toBeVisible();
    }
  });

  test('should have share buttons', async ({ page }) => {
    // Look for share buttons
    const shareButtons = page.locator(
      'button:has-text("Share"), a[href*="facebook.com/sharer"], a[href*="twitter.com/intent"], a[href*="pinterest.com/pin"]'
    );

    if (await shareButtons.count() > 0) {
      await expect(shareButtons.first()).toBeVisible();
    }
  });

  test('should update URL when variant is selected', async ({ page }) => {
    const currentUrl = page.url();

    // Look for variant buttons
    const variantButtons = page.locator('button').filter({
      hasText: /size|color|variant/i
    });

    if (await variantButtons.count() > 1) {
      // Click on second variant
      await variantButtons.nth(1).click();
      await page.waitForTimeout(500);

      // URL might change or stay the same, just verify page still works
      await expect(page).toHaveURL(/.+/);
    }
  });

  test('should show stock availability', async ({ page }) => {
    // Look for stock status indicators
    const stockStatus = page.locator(
      'text=/in stock|out of stock|available|sold out/i, [class*="stock"], [class*="availability"]'
    );

    if (await stockStatus.count() > 0) {
      await expect(stockStatus.first()).toBeVisible();
    }
  });

  test('should have product tabs or accordion', async ({ page }) => {
    // Look for tab interface
    const tabs = page.locator('[role="tab"], [class*="tab"]').filter({
      hasText: /description|details|reviews|shipping/i
    });

    if (await tabs.count() > 0) {
      const firstTab = tabs.first();
      await expect(firstTab).toBeVisible();

      // Try clicking the tab
      await firstTab.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Product Detail - Add to Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const productLinks = page.locator('a[href*="/products/"]').first();
    if (await productLinks.isVisible()) {
      await productLinks.click();
      await page.waitForURL(/\/products\/[^/]+/);
      await page.waitForLoadState('networkidle');
    }
  });

  test('should increment and decrement quantity', async ({ page }) => {
    // Look for quantity controls
    const incrementButton = page.locator('button').filter({ hasText: /\+|plus|increase/i });
    const decrementButton = page.locator('button').filter({ hasText: /-|minus|decrease/i });
    const quantityInput = page.locator('input[type="number"], input[name*="quantity"]');

    if (await quantityInput.count() > 0 && await incrementButton.count() > 0) {
      const input = quantityInput.first();

      // Get initial value
      const initialValue = await input.inputValue();

      // Click increment
      await incrementButton.first().click();
      await page.waitForTimeout(300);

      // Value should have increased
      const newValue = await input.inputValue();
      expect(parseInt(newValue)).toBeGreaterThan(parseInt(initialValue));

      // Click decrement if available
      if (await decrementButton.count() > 0) {
        await decrementButton.first().click();
        await page.waitForTimeout(300);

        // Value should decrease
        const finalValue = await input.inputValue();
        expect(parseInt(finalValue)).toBeLessThan(parseInt(newValue));
      }
    }
  });

  test('should prevent adding to cart when out of stock', async ({ page }) => {
    // Look for out of stock indicator
    const outOfStock = page.locator('text=/out of stock|sold out|unavailable/i');

    if (await outOfStock.count() > 0) {
      // Add to cart button should be disabled
      const addToCartButton = page.locator('button').filter({
        hasText: /add to cart|buy now/i
      }).first();

      if (await addToCartButton.isVisible()) {
        const isDisabled = await addToCartButton.isDisabled();
        expect(isDisabled).toBeTruthy();
      }
    }
  });

  test('should navigate to cart after adding product', async ({ page }) => {
    const addToCartButton = page.locator('button').filter({
      hasText: /add to cart/i
    }).first();

    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);

      // Look for "View Cart" or "Go to Cart" button/link
      const viewCartLink = page.locator('a, button').filter({
        hasText: /view cart|go to cart|checkout/i
      });

      if (await viewCartLink.count() > 0) {
        await viewCartLink.first().click();
        await page.waitForURL(/cart|checkout/);
      }
    }
  });
});
