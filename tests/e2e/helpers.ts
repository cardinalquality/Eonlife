import { Page, expect } from '@playwright/test';

/**
 * Helper function to add a product to cart
 */
export async function addProductToCart(page: Page): Promise<void> {
  // Navigate to products page
  await page.goto('/products');
  await page.waitForLoadState('networkidle');

  // Click on first product
  const productLinks = page.locator('a[href*="/products/"]').filter({
    has: page.locator('img')
  });

  const count = await productLinks.count();

  if (count > 0) {
    await productLinks.first().click();
    await page.waitForURL(/\/products\/.+/);
    await page.waitForLoadState('networkidle');

    // Add to cart
    const addToCartButton = page.locator('button').filter({
      hasText: /add to cart|buy now/i
    }).first();

    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Helper function to clear cart
 */
export async function clearCart(page: Page): Promise<void> {
  await page.goto('/cart');
  await page.waitForLoadState('networkidle');

  // Remove all items
  const removeButtons = page.locator('button, a').filter({
    hasText: /remove|delete|×|✕/i
  });

  const count = await removeButtons.count();

  for (let i = 0; i < count; i++) {
    const button = page.locator('button, a').filter({
      hasText: /remove|delete|×|✕/i
    }).first();

    if (await button.isVisible()) {
      await button.click();
      await page.waitForTimeout(500);
    }
  }
}

/**
 * Helper function to wait for images to load
 */
export async function waitForImagesToLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');

  // Wait for images to be fully loaded
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.every(img => img.complete);
  }, { timeout: 10000 }).catch(() => {
    // Ignore timeout - images might be lazy loaded
  });
}

/**
 * Helper to check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  const element = page.locator(selector).first();

  if (!await element.isVisible()) {
    return false;
  }

  return await element.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });
}

/**
 * Helper to scroll element into view
 */
export async function scrollIntoView(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector).first();
  await element.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
}

/**
 * Helper to get cart item count
 */
export async function getCartCount(page: Page): Promise<number> {
  const cartBadge = page.locator('[class*="cart"] [class*="count"], [class*="cart"] [class*="badge"]');

  if (await cartBadge.count() > 0) {
    const text = await cartBadge.first().textContent();
    return parseInt(text || '0');
  }

  return 0;
}

/**
 * Helper to extract price from text
 */
export function extractPrice(priceText: string): number {
  const match = priceText.match(/\$?([\d,]+\.?\d*)/);
  if (match) {
    return parseFloat(match[1].replace(/,/g, ''));
  }
  return 0;
}

/**
 * Helper to wait for network idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}
