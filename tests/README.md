# E2E Tests with Playwright

This directory contains end-to-end (E2E) tests for the Eonlife e-commerce application using Playwright.

## Test Structure

```
tests/
├── e2e/
│   ├── homepage.spec.ts          # Homepage and navigation tests
│   ├── product-listing.spec.ts   # Product listing page tests
│   ├── product-detail.spec.ts    # Product detail page tests
│   ├── shopping-cart.spec.ts     # Shopping cart functionality tests
│   └── helpers.ts                # Test helper functions
└── README.md                     # This file
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A running development server (or the tests will start one automatically)

## Installation

Playwright is already installed as a dev dependency. If you need to install it again:

```bash
npm install -D @playwright/test
```

Install Playwright browsers:

```bash
npx playwright install
```

## Running Tests

### Run all tests (headless)
```bash
npm test
```

### Run tests with browser visible
```bash
npm run test:headed
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in debug mode
```bash
npm run test:debug
```

### View test report
```bash
npm run test:report
```

### Run specific test file
```bash
npx playwright test homepage.spec.ts
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=mobile-chrome
npx playwright test --project=tablet
```

## Test Coverage

### Homepage Tests (`homepage.spec.ts`)
- ✅ Page loads successfully
- ✅ Header and navigation display
- ✅ Hero section with CTA
- ✅ Footer visibility
- ✅ Responsive design (mobile/desktop)
- ✅ Navigation to products page
- ✅ Social media links
- ✅ Product images loading
- ✅ Features/benefits sections
- ✅ Testimonials section
- ✅ Mobile menu functionality

### Product Listing Tests (`product-listing.spec.ts`)
- ✅ Products page loads
- ✅ Product cards display
- ✅ Product images and titles
- ✅ Price display
- ✅ Filters functionality
- ✅ Search functionality
- ✅ Sorting products
- ✅ Navigation to product details
- ✅ Add to cart buttons
- ✅ Responsive layout
- ✅ Category filters
- ✅ Price range filter
- ✅ Product count/results info
- ✅ Grid layout consistency

### Product Detail Tests (`product-detail.spec.ts`)
- ✅ Product page loads
- ✅ Product title, image, price display
- ✅ Product description
- ✅ Add to cart functionality
- ✅ Quantity selector
- ✅ Image gallery
- ✅ Product variants/options
- ✅ Product specifications
- ✅ Reviews section
- ✅ Star ratings
- ✅ Related products
- ✅ Breadcrumb navigation
- ✅ Responsive design
- ✅ Share buttons
- ✅ Stock availability
- ✅ Quantity increment/decrement
- ✅ Out of stock handling

### Shopping Cart Tests (`shopping-cart.spec.ts`)
- ✅ Cart page loads
- ✅ Cart items display
- ✅ Product details in cart
- ✅ Quantity updates
- ✅ Remove items
- ✅ Cart subtotal and total
- ✅ Checkout button
- ✅ Navigation to checkout
- ✅ Continue shopping
- ✅ Multiple items handling
- ✅ Empty cart message
- ✅ Total updates on quantity change
- ✅ Responsive design
- ✅ Cart persistence on refresh
- ✅ Shipping information
- ✅ Tax information
- ✅ Discount code input
- ✅ Cart icon/badge
- ✅ Cart count updates

## Configuration

The Playwright configuration is in `playwright.config.ts` at the root of the project.

### Key Settings:
- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_TEST_BASE_URL`)
- **Test Directory**: `./tests/e2e`
- **Browsers**: Chromium (desktop), Pixel 5 (mobile), iPad Pro (tablet)
- **Reporter**: HTML (generates report in `playwright-report/`)
- **Screenshot**: On failure
- **Trace**: On first retry
- **Web Server**: Automatically starts dev server if not running

## Writing New Tests

1. Create a new `.spec.ts` file in `tests/e2e/`
2. Import test utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```
3. Use helper functions from `helpers.ts`:
   ```typescript
   import { addProductToCart, clearCart } from './helpers';
   ```
4. Write your tests:
   ```typescript
   test.describe('Feature Name', () => {
     test.beforeEach(async ({ page }) => {
       await page.goto('/your-page');
     });

     test('should do something', async ({ page }) => {
       // Your test code
       await expect(page.locator('selector')).toBeVisible();
     });
   });
   ```

## Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Wait for network idle** before assertions
3. **Use helper functions** to avoid code duplication
4. **Test mobile responsiveness** using viewport settings
5. **Handle dynamic content** with proper waits
6. **Clean up after tests** (e.g., clear cart)
7. **Use descriptive test names** that explain what's being tested
8. **Group related tests** with `test.describe()`

## Debugging Tests

### Visual Debugging
```bash
npx playwright test --debug
```

### Trace Viewer
```bash
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Screenshots and Videos
Screenshots are automatically taken on test failures and saved in `test-results/`.

## CI/CD Integration

For continuous integration, set the `CI` environment variable:

```bash
CI=true npm test
```

This will:
- Disable parallel execution
- Enable retries (2 attempts)
- Fail on `test.only` calls

## Troubleshooting

### Tests failing with timeout
- Increase timeout in test or config
- Check if dev server is running
- Verify network connectivity

### Element not found errors
- Use `await page.waitForSelector()`
- Check if element has correct selector
- Verify page has loaded completely

### Flaky tests
- Add explicit waits
- Use `waitForLoadState('networkidle')`
- Check for race conditions

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
