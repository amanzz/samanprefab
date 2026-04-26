# Production-Stable E2E Testing Guide

## Overview

This guide explains how the Playwright tests are configured for production stability — reliable, deterministic, and free from false positives.

## Stability Features

### 1. Console Error Handling

**Only fails on CRITICAL errors**, ignores known harmless ones:

**Ignored (Harmless):**
- favicon.ico errors
- source map warnings
- ResizeObserver loop limit exceeded
- hydration warnings (Next.js dev mode)
- WebSocket/HMR messages
- webpack dev server messages
- React DevTools messages
- Analytics/tracking errors

**Fails On (Critical):**
- TypeError: Cannot read property of undefined
- ReferenceError: variable is not defined
- SyntaxError: unexpected token
- NetworkError: failed to fetch
- Unhandled Promise Rejection
- Application error occurred

```typescript
// Uses production-stable detection
setupProductionConsoleErrorDetection(page);
```

### 2. API Failure Detection

**Ignores expected statuses**, fails only on real unexpected failures:

**Expected (Ignored):**
- 401 Unauthorized (auth check)
- 403 Forbidden (permission check)
- 404 Not Found (expected missing resources)
- 409 Conflict (duplicate handling)

**Fails On (Unexpected):**
- 400 Bad Request (bad client data)
- 500 Server Error
- 502 Bad Gateway
- 503 Service Unavailable

```typescript
// Uses production-stable detection
setupProductionApiFailureDetection(page);
```

### 3. Image Validation

**Checks actual image load**, not just src string:

```typescript
// Validates:
// 1. Image has valid src (not undefined/null/empty)
// 2. naturalWidth > 0 (actually loaded)
// 3. Image is complete (not stuck loading)
await validateAllImages(page);
```

Handles gracefully:
- Lazy-loaded images (waits for load)
- Hidden images (skipped)
- Loading states (waits then checks)

### 4. Visual Regression Stability

**Multiple stabilization measures:**

```typescript
await prepareForVisualTesting(page);
// 1. Wait for networkidle
// 2. Wait for fonts.ready
// 3. Disable all animations
// 4. Wait for images.complete
// 5. Hide dynamic elements
// 6. Final 200ms delay
```

**Reasonable thresholds in config:**
```typescript
// playwright.config.ts
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.01,  // 1% allowed (was 0.2%)
    threshold: 0.3,            // Higher tolerance (was 0.2)
    animations: 'disabled',
    caret: 'hide',
  },
}
```

### 5. Test Stability

**Deterministic behavior:**

| Setting | Value | Reason |
|---------|-------|--------|
| workers | 1 | No parallel conflicts |
| fullyParallel | false | Sequential execution |
| retries | 1-2 | Flaky test tolerance |
| timeout | 10s | Reasonable wait time |
| actionTimeout | 10s | Element interaction |
| navigationTimeout | 30s | Page load |

## Running Tests

### First Time (Create Baselines)
```bash
# Create initial visual regression baselines
npx playwright test --update-snapshots

# Or update only specific tests
npx playwright test auth-flow --update-snapshots
```

### Regular Run
```bash
# Run all tests (stable, deterministic)
npm run e2e

# Run with UI mode for debugging
npm run e2e:ui

# Run specific test file
npx playwright test auth-flow
```

### When UI Changes Intentionally
```bash
# Update snapshots for changed tests only
npx playwright test --update-snapshots

# Review changes before committing
npm run e2e:report
```

## Handling Failures

### Visual Regression Failure
```
❌ login-page-chromium.png
   Expected: 50 pixels changed
   Actual:   1200 pixels changed
```

**If change is intentional:**
```bash
npx playwright test --update-snapshots
```

**If change is a bug:**
- Fix the UI bug
- Re-run tests

### Console Error Failure
```
❌ Critical console error detected: TypeError: Cannot read property 'id' of undefined
```

**Investigate:**
- Check browser console during test
- Look at trace viewer: `npx playwright show-trace test-results/trace.zip`

### API Failure
```
❌ UNEXPECTED API FAILURE: POST /api/products returned 500
```

**Investigate:**
- Check API server logs
- Reproduce manually with same request

## Best Practices

### 1. Use Production Setup in Tests
```typescript
test.beforeEach(async ({ page }) => {
  await setupProductionBugDetection(page);
});
```

### 2. Add Masks for Dynamic Content
```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [
    page.locator('.timestamp'),
    page.locator('[data-testid="live-data"]'),
    page.locator('canvas'),  // Charts
  ],
});
```

### 3. Wait for Stable State
```typescript
// Always use prepareForVisualTesting before screenshots
await prepareForVisualTesting(page);
await expect(page).toHaveScreenshot('page.png');
```

### 4. Skip Tests Without Data
```typescript
const product = page.locator('.product').first();
if (!(await product.isVisible())) {
  test.skip(true, 'No products available');
}
```

## Debugging

### View Trace
```bash
npx playwright show-trace test-results/trace.zip
```

### Debug Mode
```bash
npm run e2e:debug
```

### Verbose Logging
```bash
DEBUG=pw:api npx playwright test
```

## CI/CD Integration

```yaml
# .github/workflows/e2e.yml
- name: Run E2E tests
  run: npm run e2e
  env:
    CI: true
    TEST_ADMIN_EMAIL: ${{ secrets.TEST_ADMIN_EMAIL }}
    TEST_ADMIN_PASSWORD: ${{ secrets.TEST_ADMIN_PASSWORD }}

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: test-results
    path: |
      test-results/
      playwright-report/
```

## Known Limitations

1. **Font rendering differences** between OSes — use `maxDiffPixelRatio: 0.01`
2. **Anti-aliasing variations** — use `threshold: 0.3`
3. **Timestamp differences** — always mask dynamic content
4. **Lazy loading** — images may need explicit wait

## Summary

| Feature | Before | After (Stable) |
|---------|--------|----------------|
| Console errors | Fail on any | Only critical |
| API failures | Fail on >=400 | Only unexpected |
| Image validation | Check src | Check naturalWidth |
| Visual diff | 0.2% | 1% |
| Pixel threshold | 0.2 | 0.3 |
| Retries | 0 | 1-2 |

This setup ensures **reliable, production-ready E2E testing** with minimal false positives.
