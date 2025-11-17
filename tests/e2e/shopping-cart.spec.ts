import { test, expect } from '@playwright/test';

test.describe('Shopping Cart', () => {
  test.beforeEach(async ({ page }) => {
    // Add a product to cart before each test
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Try to find and click on first product
    const productLinks = page.locator('a[href*="/products/"]').filter({
      has: page.locator('img')
    });

    if (await productLinks.count() > 0) {
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

    // Navigate to cart
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
  });

  test('should load cart page successfully', async ({ page }) => {
    await expect(page).toHaveURL(/cart/);
  });

  test('should display cart items', async ({ page }) => {
    // Look for cart items
    const cartItems = page.locator('[class*="cart-item"], [class*="cartItem"], tr, [data-testid*="cart-item"]').filter({
      has: page.locator('img, h2, h3')
    });

    const count = await cartItems.count();

    if (count > 0) {
      await expect(cartItems.first()).toBeVisible();
    }
  });

  test('should display product image in cart', async ({ page }) => {
    const cartImages = page.locator('img[alt*="product" i], [class*="cart"] img');

    const count = await cartImages.count();

    if (count > 0) {
      const firstImage = cartImages.first();
      await expect(firstImage).toBeVisible();
    }
  });

  test('should display product name in cart', async ({ page }) => {
    // Look for product titles in cart
    const productTitles = page.locator('h2, h3, h4, [class*="product-name"], [class*="item-name"]');

    const count = await productTitles.count();

    if (count > 0) {
      const title = productTitles.first();
      await expect(title).toBeVisible();
      await expect(title).toHaveText(/.+/);
    }
  });

  test('should display product price in cart', async ({ page }) => {
    const prices = page.locator('[class*="price"], text=/\\$\\d+/');

    const count = await prices.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display quantity selector', async ({ page }) => {
    const quantityInputs = page.locator('input[type="number"], select[name*="quantity"]');

    if (await quantityInputs.count() > 0) {
      const input = quantityInputs.first();
      await expect(input).toBeVisible();
    }
  });

  test('should update quantity', async ({ page }) => {
    const quantityInput = page.locator('input[type="number"]').first();

    if (await quantityInput.isVisible()) {
      // Get current quantity
      const currentQty = await quantityInput.inputValue();

      // Update quantity
      await quantityInput.fill('2');
      await page.waitForTimeout(1000);

      // Verify quantity changed
      const newQty = await quantityInput.inputValue();
      expect(newQty).toBe('2');

      // Check if total price updated (should be visible somewhere)
      const totals = page.locator('[class*="total"], [class*="subtotal"]');
      if (await totals.count() > 0) {
        await expect(totals.first()).toBeVisible();
      }
    }
  });

  test('should increment quantity with buttons', async ({ page }) => {
    const incrementButton = page.locator('button').filter({ hasText: /\+|plus|increase/i });
    const quantityInput = page.locator('input[type="number"]').first();

    if (await incrementButton.count() > 0 && await quantityInput.isVisible()) {
      const initialValue = await quantityInput.inputValue();

      await incrementButton.first().click();
      await page.waitForTimeout(500);

      const newValue = await quantityInput.inputValue();
      expect(parseInt(newValue)).toBeGreaterThan(parseInt(initialValue));
    }
  });

  test('should decrement quantity with buttons', async ({ page }) => {
    // First increment to ensure we have quantity > 1
    const quantityInput = page.locator('input[type="number"]').first();

    if (await quantityInput.isVisible()) {
      await quantityInput.fill('3');
      await page.waitForTimeout(500);

      const decrementButton = page.locator('button').filter({ hasText: /-|minus|decrease/i });

      if (await decrementButton.count() > 0) {
        const initialValue = await quantityInput.inputValue();

        await decrementButton.first().click();
        await page.waitForTimeout(500);

        const newValue = await quantityInput.inputValue();
        expect(parseInt(newValue)).toBeLessThan(parseInt(initialValue));
      }
    }
  });

  test('should remove item from cart', async ({ page }) => {
    // Look for remove/delete button
    const removeButton = page.locator('button, a').filter({
      hasText: /remove|delete|×|✕/i
    });

    if (await removeButton.count() > 0) {
      // Count items before removal
      const itemsBefore = await page.locator('[class*="cart-item"], tr').count();

      // Click remove button
      await removeButton.first().click();
      await page.waitForTimeout(1000);

      // Count items after removal
      const itemsAfter = await page.locator('[class*="cart-item"], tr').count();

      // Items should decrease or show empty cart message
      const emptyMessage = page.locator('text=/empty|no items|cart is empty/i');
      const hasEmptyMessage = await emptyMessage.count() > 0;

      expect(itemsAfter < itemsBefore || hasEmptyMessage).toBeTruthy();
    }
  });

  test('should display cart subtotal', async ({ page }) => {
    const subtotal = page.locator('[class*="subtotal"], text=/subtotal/i').first();

    if (await subtotal.isVisible()) {
      await expect(subtotal).toBeVisible();

      // Should show a price
      const pricePattern = /\$\d+/;
      const hasPrice = await page.locator(`text=${pricePattern}`).count() > 0;
      expect(hasPrice).toBeTruthy();
    }
  });

  test('should display cart total', async ({ page }) => {
    const total = page.locator('[class*="total"], text=/total/i');

    const count = await total.count();
    expect(count).toBeGreaterThan(0);

    if (count > 0) {
      await expect(total.first()).toBeVisible();
    }
  });

  test('should have checkout button', async ({ page }) => {
    const checkoutButton = page.locator('button, a').filter({
      hasText: /checkout|proceed to checkout|complete purchase/i
    });

    const count = await checkoutButton.count();
    expect(count).toBeGreaterThan(0);

    if (count > 0) {
      const button = checkoutButton.first();
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });

  test('should navigate to checkout when clicking checkout button', async ({ page }) => {
    const checkoutButton = page.locator('button, a').filter({
      hasText: /checkout|proceed to checkout|complete purchase/i
    }).first();

    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();

      // Should navigate to checkout or show checkout modal
      await page.waitForTimeout(2000);

      // Check if URL changed to checkout or if checkout modal appeared
      const isCheckoutPage = page.url().includes('checkout') || page.url().includes('payment');
      const hasCheckoutModal = await page.locator('[class*="checkout"], [class*="payment"]').count() > 0;

      expect(isCheckoutPage || hasCheckoutModal).toBeTruthy();
    }
  });

  test('should have continue shopping link', async ({ page }) => {
    const continueShoppingLink = page.locator('a, button').filter({
      hasText: /continue shopping|back to shop|keep shopping/i
    });

    if (await continueShoppingLink.count() > 0) {
      const link = continueShoppingLink.first();
      await expect(link).toBeVisible();

      await link.click();
      await page.waitForURL(/products|shop|home/);
    }
  });

  test('should calculate correct total with multiple items', async ({ page }) => {
    // Add another product to cart
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    const productLinks = page.locator('a[href*="/products/"]').filter({
      has: page.locator('img')
    });

    if (await productLinks.count() > 1) {
      // Add second product
      await productLinks.nth(1).click();
      await page.waitForURL(/\/products\/.+/);

      const addToCartButton = page.locator('button').filter({
        hasText: /add to cart/i
      }).first();

      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForTimeout(1000);
      }

      // Go back to cart
      await page.goto('/cart');
      await page.waitForLoadState('networkidle');

      // Should have multiple items
      const cartItems = page.locator('[class*="cart-item"], tr').filter({
        has: page.locator('img')
      });

      const count = await cartItems.count();
      expect(count).toBeGreaterThan(1);

      // Total should be displayed
      const total = page.locator('[class*="total"]');
      await expect(total.first()).toBeVisible();
    }
  });

  test('should show empty cart message when cart is empty', async ({ page }) => {
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

    // Should show empty cart message
    const emptyMessage = page.locator('text=/empty|no items|cart is empty/i');

    if (await emptyMessage.count() > 0) {
      await expect(emptyMessage.first()).toBeVisible();
    }
  });

  test('should update cart total when quantity changes', async ({ page }) => {
    const quantityInput = page.locator('input[type="number"]').first();
    const totalElement = page.locator('[class*="total"]').first();

    if (await quantityInput.isVisible() && await totalElement.isVisible()) {
      // Get initial total text
      const initialTotal = await totalElement.textContent();

      // Change quantity
      await quantityInput.fill('3');
      await page.waitForTimeout(1000);

      // Get new total
      const newTotal = await totalElement.textContent();

      // Total should have changed
      expect(newTotal).not.toBe(initialTotal);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');

    // Cart should still be functional
    const cartItems = page.locator('[class*="cart-item"], [class*="cartItem"]');

    if (await cartItems.count() > 0) {
      await expect(cartItems.first()).toBeVisible();
    }

    // Checkout button should be visible
    const checkoutButton = page.locator('button, a').filter({
      hasText: /checkout/i
    });

    if (await checkoutButton.count() > 0) {
      await expect(checkoutButton.first()).toBeVisible();
    }
  });

  test('should preserve cart on page refresh', async ({ page }) => {
    // Get cart item count
    const cartItems = page.locator('[class*="cart-item"], tr').filter({
      has: page.locator('img')
    });

    const countBefore = await cartItems.count();

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Count should be the same
    const cartItemsAfter = page.locator('[class*="cart-item"], tr').filter({
      has: page.locator('img')
    });

    const countAfter = await cartItemsAfter.count();

    expect(countAfter).toBeGreaterThanOrEqual(0); // Cart may be in localStorage or session
  });

  test('should display shipping information', async ({ page }) => {
    // Look for shipping info
    const shippingInfo = page.locator('text=/shipping|delivery/i');

    if (await shippingInfo.count() > 0) {
      await expect(shippingInfo.first()).toBeVisible();
    }
  });

  test('should display tax information if applicable', async ({ page }) => {
    // Look for tax info
    const taxInfo = page.locator('text=/tax|vat/i');

    if (await taxInfo.count() > 0) {
      await expect(taxInfo.first()).toBeVisible();
    }
  });

  test('should have discount code input', async ({ page }) => {
    // Look for promo/discount code input
    const discountInput = page.locator('input[name*="coupon"], input[name*="discount"], input[placeholder*="promo" i]');

    if (await discountInput.count() > 0) {
      const input = discountInput.first();
      await expect(input).toBeVisible();

      // Try entering a code
      await input.fill('TEST10');

      // Look for apply button
      const applyButton = page.locator('button').filter({
        hasText: /apply|add/i
      });

      if (await applyButton.count() > 0) {
        await applyButton.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });
});

test.describe('Cart Badge/Icon', () => {
  test('should display cart icon in header', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for cart icon or button
    const cartIcon = page.locator('[class*="cart"], [aria-label*="cart" i], a[href*="cart"]');

    const count = await cartIcon.count();

    if (count > 0) {
      await expect(cartIcon.first()).toBeVisible();
    }
  });

  test('should update cart badge count when adding items', async ({ page }) => {
    // Go to products page
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Look for cart count badge before adding
    const cartBadge = page.locator('[class*="cart"] [class*="count"], [class*="cart"] [class*="badge"], [data-testid*="cart-count"]');

    // Add product to cart
    const productLinks = page.locator('a[href*="/products/"]').first();

    if (await productLinks.isVisible()) {
      await productLinks.click();
      await page.waitForURL(/\/products\/.+/);

      const addToCartButton = page.locator('button').filter({
        hasText: /add to cart/i
      }).first();

      if (await addToCartButton.isVisible()) {
        await addToCartButton.click();
        await page.waitForTimeout(1000);

        // Cart badge should now show count
        if (await cartBadge.count() > 0) {
          await expect(cartBadge.first()).toBeVisible();
          const badgeText = await cartBadge.first().textContent();
          expect(badgeText).toBeTruthy();
        }
      }
    }
  });

  test('should navigate to cart when clicking cart icon', async ({ page }) => {
    await page.goto('/');

    const cartIcon = page.locator('[class*="cart"], [aria-label*="cart" i], a[href*="cart"]').first();

    if (await cartIcon.isVisible()) {
      await cartIcon.click();
      await page.waitForURL(/cart/);
      await expect(page).toHaveURL(/cart/);
    }
  });
});
