# Saman Prefab E2E Tests - Enterprise Grade

This directory contains **enterprise-grade** end-to-end tests using [Playwright](https://playwright.dev/).

## Enterprise Features

- ✅ **Snapshot Approval Flow** - Updates require explicit approval (`SNAPSHOT_UPDATE=approved`)
- ✅ **Safe Test Data Cleanup** - Uses `testId` field (not pattern matching)
- ✅ **Real Performance Testing** - Web Performance Timing API for browser metrics
- ✅ **Categorized Failures** - UI, API, PERFORMANCE, VISUAL, CONSOLE, NETWORK
- ✅ **CI/CD Integration** - GitHub Actions with merge blocking

## Documentation

| Guide | Purpose |
|-------|---------|
| `ENTERPRISE_SYSTEM_GUIDE.md` | Complete enterprise system documentation |
| `PRODUCTION_STABILITY_GUIDE.md` | Stability features and configuration |
| `VISUAL_REGRESSION_GUIDE.md` | Screenshot testing workflow |

## Quick Start

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install chromium

# Run tests (snapshots won't update automatically)
npm run e2e

# Create/update snapshots (requires approval)
SNAPSHOT_UPDATE=approved npx playwright test --update-snapshots

# View report
npm run e2e:report
```

## Test Coverage

### 1. Auth Flow (`auth-flow.spec.ts`)
- ✅ Login with valid credentials
- ✅ Assert redirect to /admin
- ✅ Assert cookies exist after login
- ✅ Logout → redirect to /admin/login
- ✅ Invalid credentials show error
- ✅ Protected routes require authentication

### 2. Admin Dashboard UI (`admin-dashboard.spec.ts`)
- ✅ Sidebar visible with all navigation items
- ✅ Header with user name + avatar visible
- ✅ Toggle dark mode → verify text contrast
- ✅ Profile dropdown with options (Profile, Change Password, Logout)
- ✅ Dashboard metric cards load
- ✅ Navigation between sections works

### 3. Product Create Flow (`product-create.spec.ts`)
- ✅ Navigate to /admin/products/new
- ✅ Fill all fields (title, description, features, applications, buttons)
- ✅ Upload images in media tab
- ✅ Save product and verify success
- ✅ Validation errors for required fields

### 4. PDP (Product Detail Page) (`pdp-product-page.spec.ts`)
- ✅ Title visible and prominent
- ✅ Short description formatted (not raw HTML)
- ✅ Gallery shows all images (not only featured)
- ✅ Custom buttons render with correct styles
- ✅ Features render with correct icons
- ✅ Trust & logistics visible
- ✅ Tabs working (Description, Specs, Applications)
- ✅ No empty sections rendered
- ✅ SEO meta tags present

### 5. Design Validation (`design-validation.spec.ts`)
- ✅ No overlapping UI elements
- ✅ No hidden/overflow issues
- ✅ No broken images
- ✅ No console errors
- ✅ All buttons clickable
- ✅ Responsive on desktop (1280px)
- ✅ Responsive on tablet (768px)
- ✅ Responsive on mobile (375px)
- ✅ Visual hierarchy maintained

### 6. API Validation (`api-validation.spec.ts`)
- ✅ Intercept network requests
- ✅ No 500 errors
- ✅ No failed fetch requests
- ✅ Correct data structure returned
- ✅ Proper error responses for invalid data
- ✅ Consistent response times
- ✅ Public API endpoints accessible

## Running Tests

### Run all tests
```bash
npm run e2e
```

### Run with UI mode (for debugging)
```bash
npm run e2e:ui
```

### Run in headed mode (see browser)
```bash
npm run e2e:headed
```

### Run specific test file
```bash
npx playwright test auth-flow
```

### Run with debug mode
```bash
npm run e2e:debug
```

### Generate tests with Codegen
```bash
npm run e2e:codegen
```

### View HTML report
```bash
npm run e2e:report
```

## Configuration

### Environment Variables

Create `.env.test` in the root directory:

```bash
# Copy example file
cp .env.test.example .env.test

# Edit with your credentials
TEST_ADMIN_EMAIL=admin@samanprefab.com
TEST_ADMIN_PASSWORD=your_password
```

### Test Artifacts

- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/`
- **HTML Report**: `playwright-report/`
- **Trace Files**: `test-results/`

Artifacts are generated automatically on test failures.

## Project Structure

```
e2e/
├── fixtures/
│   └── auth.fixture.ts          # Authenticated page fixtures
├── utils/
│   └── test-helpers.ts          # Test utilities and helpers
├── tests/
│   ├── auth-flow.spec.ts        # Authentication tests
│   ├── admin-dashboard.spec.ts  # Dashboard UI tests
│   ├── product-create.spec.ts   # Product creation tests
│   ├── pdp-product-page.spec.ts # Product page tests
│   ├── design-validation.spec.ts # Design/layout tests
│   └── api-validation.spec.ts   # API tests
└── README.md                    # This file
```

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth.fixture';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should do something', async ({ page }) => {
    await page.goto('/admin/some-page');
    await expect(page.locator('text=Expected Text')).toBeVisible();
  });
});
```

### Strict Assertions

Always use strict assertions:

```typescript
// Visibility
await expect(locator).toBeVisible();

// Text content
await expect(locator).toHaveText('Exact Text');
await expect(locator).toContainText('Partial Text');

// URL
await expect(page).toHaveURL(/admin/);

// Count
await expect(page.locator('button')).toHaveCount(5);

// API response
await expect(response.status()).toBe(200);
```

### Screenshots & Videos

Screenshots and videos are enabled by default in `playwright.config.ts`:

```typescript
use: {
  screenshot: 'on',
  video: 'on',
}
```

## CI/CD Integration

For CI environments, set:

```bash
export CI=true
export TEST_ADMIN_EMAIL=ci@test.com
export TEST_ADMIN_PASSWORD=ci_password
```

Playwright will automatically:
- Run in headless mode
- Retry failed tests (2 retries)
- Generate HTML reports
- Exit with error code on failures

## Troubleshooting

### Tests failing locally?

1. Ensure dev server is running: `npm run dev`
2. Check `.env.test` credentials are correct
3. Clear browser cache: `npx playwright clear-cache`
4. Reinstall browsers: `npx playwright install`

### Debugging test failures

1. Run with UI mode: `npm run e2e:ui`
2. Check screenshots in `test-results/`
3. View trace viewer: `npx playwright show-trace test-results/trace.zip`

### Slow tests?

- Check API response times in logs
- Reduce `workers` in `playwright.config.ts`
- Use `test.only` to run single test

## Best Practices

1. **Use data-testid attributes** for stable selectors:
   ```tsx
   <button data-testid="submit-button">Submit</button>
   ```
   ```typescript
   await page.locator('[data-testid="submit-button"]').click();
   ```

2. **Prefer user-facing selectors** when possible:
   ```typescript
   await page.locator('button:has-text("Submit")').click();
   ```

3. **Wait for network idle** after actions:
   ```typescript
   await page.waitForLoadState('networkidle');
   ```

4. **Check console errors** in every test:
   ```typescript
   const errors = await checkConsoleErrors(page);
   expect(errors).toHaveLength(0);
   ```

5. **Use fixtures** for common setup:
   ```typescript
   test('test name', async ({ adminPage }) => {
     // adminPage is already logged in
   });
   ```
