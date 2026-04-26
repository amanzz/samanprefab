# Visual Regression Testing Guide

## Overview

Playwright now includes production-level visual regression testing using `expect(page).toHaveScreenshot()`.

## How It Works

1. **First Run**: Creates baseline screenshots in `e2e/snapshots/`
2. **Subsequent Runs**: Compares current screenshots against baselines
3. **Failure**: If differences exceed threshold, test fails and generates diff images

## Running Visual Tests

### Initial Setup (Create Baselines)
```bash
# Run tests to create initial snapshots
npx playwright test --update-snapshots

# Or update specific test snapshots
npx playwright test auth-flow --update-snapshots
```

### Regular Test Run (Compare Against Baselines)
```bash
npm run e2e
```

### Review Failures
When visual tests fail, Playwright generates:
- `test-results/` - Actual screenshots
- `test-results/` - Expected (baseline) screenshots  
- `test-results/` - Diff highlighting changes

```bash
# Open HTML report to review failures
npm run e2e:report
```

## Updating Snapshots

When UI intentionally changes:

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Update specific project
npx playwright test --project=chromium --update-snapshots

# Update specific test file
npx playwright test pdp-product-page --update-snapshots
```

## Configuration

### In `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixelRatio: 0.002,  // 0.2% pixel difference allowed
    threshold: 0.2,             // Color threshold
    scale: 'css',               // Use CSS pixels
    animations: 'disabled',     // Disable animations
  },
}
```

### In Test Files:

```typescript
// Full page screenshot
await expect(page).toHaveScreenshot('page-name.png');

// Element screenshot
await expect(page.locator('.component')).toHaveScreenshot('component.png');

// With masking (hide dynamic content)
await expect(page).toHaveScreenshot('page.png', {
  mask: [
    page.locator('[data-testid="timestamp"]'),
    page.locator('canvas'),  // Charts
  ],
  maxDiffPixels: 100,  // Allow 100 pixel differences
});
```

## Best Practices

### 1. Mask Dynamic Content
```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  mask: [
    page.locator('.timestamp'),
    page.locator('.random-id'),
    page.locator('[data-testid="time"]'),
  ],
});
```

### 2. Disable Animations
Tests automatically disable CSS animations, but you can also:
```typescript
await page.addStyleTag({
  content: `* { animation: none !important; transition: none !important; }`
});
```

### 3. Wait for Stable State
```typescript
await page.waitForLoadState('networkidle');
await page.waitForFunction(() => document.fonts.ready);
await expect(page).toHaveScreenshot('stable.png');
```

### 4. Cross-Browser Snapshots
Each browser/project has its own snapshots:
```
e2e/snapshots/
  auth-flow.spec.ts/
    login-page-chromium.png
    login-page-chromium-mobile.png
```

## Current Snapshots

The following screenshots are captured in tests:

| Test File | Screenshot | Description |
|-----------|------------|-------------|
| `auth-flow.spec.ts` | `login-page.png` | Login form layout |
| `auth-flow.spec.ts` | `dashboard-after-login.png` | Post-login dashboard |
| `auth-flow.spec.ts` | `login-page-after-logout.png` | Return to login |
| `pdp-product-page.spec.ts` | `product-hero.png` | Product header section |
| `pdp-product-page.spec.ts` | `product-gallery.png` | Image gallery |

## Troubleshooting

### "Snapshot comparison failed"
1. Check if change is intentional
2. If intentional: `npx playwright test --update-snapshots`
3. If not: Investigate UI regression

### "No snapshot found"
First run - create baseline:
```bash
npx playwright test --update-snapshots
```

### Flaky Screenshots
- Increase `maxDiffPixels`
- Add more masking for dynamic content
- Ensure fonts are loaded: `await page.waitForFunction(() => document.fonts.ready)`

## CI/CD Integration

In CI, snapshots should be committed to git:

```bash
# In your CI config
e2e/snapshots/**/*.png filter=lfs diff=lfs merge=lfs -text
```

Or use Git LFS for large snapshot files.
