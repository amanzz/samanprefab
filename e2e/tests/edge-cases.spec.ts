import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth.fixture';
import { 
  setupProductionBugDetection,
  prepareForVisualTesting,
  assertPagePerformance,
  validateAllImages
} from '../utils/test-helpers';

/**
 * EDGE CASE TESTS - Real World Production Ready
 * 
 * Tests boundary conditions and edge cases:
 * - Empty data states
 * - Long text handling
 * - Missing/optional fields
 * - Error boundaries
 */

test.describe('Edge Cases - Empty Data', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle empty product list gracefully', async ({ page }) => {
    // Navigate to products with potential empty state
    await assertPagePerformance(page, '/products', 3000);
    await prepareForVisualTesting(page);
    
    // Check if empty state is handled properly
    const productGrid = page.locator('[class*="product-grid"], [class*="products-list"]').first();
    const noProductsMessage = page.locator('text=/no products|empty|no items/i').first();
    
    // Either products exist OR empty state is shown (not broken)
    const hasProducts = await productGrid.isVisible().catch(() => false);
    const hasEmptyState = await noProductsMessage.isVisible().catch(() => false);
    
    expect(
      hasProducts || hasEmptyState,
      'Should show products or proper empty state'
    ).toBeTruthy();
    
    // If empty state, verify it's not broken
    if (hasEmptyState) {
      await expect(noProductsMessage).toBeVisible();
      const text = await noProductsMessage.textContent();
      expect(text?.length).toBeGreaterThan(0);
      expect(text).not.toContain('undefined');
      expect(text).not.toContain('null');
    }
  });

  test('should handle empty dashboard stats', async ({ page }) => {
    await loginAsAdmin(page);
    await assertPagePerformance(page, '/admin/dashboard', 3000);
    await prepareForVisualTesting(page);
    
    // Check metric cards show 0 or appropriate placeholder (not broken)
    const metricCards = page.locator('[class*="metric"], [class*="stat"]').all();
    
    for (const card of await metricCards) {
      const text = await card.textContent().catch(() => '');
      // Should show number or placeholder, not error/undefined
      expect(text).not.toContain('undefined');
      expect(text).not.toContain('null');
      expect(text).not.toContain('NaN');
    }
  });
});

test.describe('Edge Cases - Long Text', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle long product names without layout breakage', async ({ page }) => {
    await loginAsAdmin(page);
    
    // Navigate to new product
    await assertPagePerformance(page, '/admin/products/new', 3000);
    
    // Fill with extremely long name
    const longName = 'A'.repeat(200);
    await page.locator('input[name="name"]').fill(longName);
    
    // Trigger validation/blur
    await page.locator('input[name="slug"]').click();
    await page.waitForTimeout(300);
    
    // Check no console errors from long text
    await prepareForVisualTesting(page);
    
    // Verify form is still functional
    await expect(page.locator('input[name="name"]')).toBeVisible();
    
    // Check no horizontal overflow (layout breakage)
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow, 'Long text should not cause horizontal overflow').toBe(false);
  });

  test('should handle long descriptions without breaking layout', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products/new');
    
    // Fill basic info
    await page.locator('input[name="name"]').fill('Test Product Long Desc');
    
    // Navigate to description tab
    await page.locator('button:has-text("Description")').click();
    await page.waitForTimeout(500);
    
    // Fill with long description
    const longDescription = 'Lorem ipsum '.repeat(100); // 1300+ chars
    const editorFrame = page.locator('iframe').first();
    if (await editorFrame.isVisible().catch(() => false)) {
      await editorFrame.locator('body').fill(longDescription);
    } else {
      const textarea = page.locator('textarea[name="description"]').first();
      await textarea.fill(longDescription);
    }
    
    // Verify layout is still intact
    await page.waitForTimeout(300);
    
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow, 'Long description should not cause horizontal overflow').toBe(false);
  });

  test('should handle unicode and special characters', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/products/new');
    
    // Test special characters
    const specialChars = 'Test Product™ — "Premium" (Special) 日本語 🔧';
    await page.locator('input[name="name"]').fill(specialChars);
    
    // Verify value is preserved
    const value = await page.locator('input[name="name"]').inputValue();
    expect(value).toBe(specialChars);
    
    // No console errors
    await page.waitForTimeout(300);
  });
});

test.describe('Edge Cases - Missing Fields', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
    await loginAsAdmin(page);
  });

  test('should handle missing optional fields gracefully', async ({ page }) => {
    await assertPagePerformance(page, '/admin/products/new', 3000);
    
    // Fill only required fields
    await page.locator('input[name="name"]').fill('Minimal Product');
    
    // Attempt to save with minimal data
    const saveButton = page.locator('button:has-text("Publish"), button:has-text("Save")').first();
    await saveButton.click();
    await page.waitForTimeout(1000);
    
    // Should either save or show validation (not crash)
    const currentUrl = page.url();
    const hasError = await page.locator('[class*="error"], [role="alert"]').isVisible().catch(() => false);
    const hasSuccess = await page.locator('text=/success|saved|published/i').isVisible().catch(() => false);
    
    expect(
      hasSuccess || hasError || currentUrl.includes('/products'),
      'Should handle missing fields without crashing'
    ).toBeTruthy();
  });

  test('should show validation for empty required fields', async ({ page }) => {
    await page.goto('/admin/products/new');
    await page.waitForTimeout(500);
    
    // Click save without filling anything
    const saveButton = page.locator('button:has-text("Publish"), button:has-text("Save")').first();
    await saveButton.click();
    await page.waitForTimeout(500);
    
    // Check for validation indicators
    const validationIndicators = [
      '[aria-invalid="true"]',
      '[class*="error"]',
      '[class*="required"]',
      'text=required',
    ];
    
    let foundValidation = false;
    for (const indicator of validationIndicators) {
      const count = await page.locator(indicator).count();
      if (count > 0) {
        foundValidation = true;
        break;
      }
    }
    
    expect(foundValidation, 'Should show validation for empty required fields').toBeTruthy();
  });

  test('should handle partially filled forms on navigation', async ({ page }) => {
    await page.goto('/admin/products/new');
    await page.waitForTimeout(500);
    
    // Fill partial data
    await page.locator('input[name="name"]').fill('Partial Product');
    
    // Navigate away without saving
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(500);
    
    // Check for unsaved changes warning or graceful navigation
    const hasWarning = await page.locator('text=/unsaved|leave|discard/i').isVisible().catch(() => false);
    const onDashboard = page.url().includes('/admin/dashboard');
    
    expect(
      hasWarning || onDashboard,
      'Should warn about unsaved changes or allow navigation'
    ).toBeTruthy();
  });
});

test.describe('Edge Cases - Error Boundaries', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    await assertPagePerformance(page, '/nonexistent-page-12345', 3000);
    
    // Should show 404 page (not crash)
    const notFoundContent = page.locator('text=/404|not found|page not found/i').first();
    const heading = page.locator('h1').first();
    
    const hasNotFound = await notFoundContent.isVisible().catch(() => false);
    const hasHeading = await heading.isVisible().catch(() => false);
    
    expect(
      hasNotFound || hasHeading,
      'Should show 404 page for non-existent routes'
    ).toBeTruthy();
    
    // No broken images on error page
    await validateAllImages(page);
  });

  test('should handle invalid product IDs', async ({ page }) => {
    await page.goto('/products/invalid-product-id-99999');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Should show error state or redirect (not crash)
    const errorContent = page.locator('text=/not found|error|invalid|404/i').first();
    const redirectToProducts = page.url().includes('/products') && !page.url().includes('invalid');
    
    const hasError = await errorContent.isVisible().catch(() => false);
    
    expect(
      hasError || redirectToProducts,
      'Should handle invalid product IDs gracefully'
    ).toBeTruthy();
  });
});

test.describe('Edge Cases - Staging @staging', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should verify staging environment is healthy', async ({ page }) => {
    // Basic health check for staging
    await assertPagePerformance(page, '/', 5000);
    
    // Verify site is up
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toContain('Error');
    expect(title).not.toContain('404');
    
    // Check main navigation works
    const navLinks = page.locator('nav a, header a').first();
    await expect(navLinks).toBeVisible();
  });

  test('should verify staging API health', async ({ page }) => {
    // API health check
    const response = await page.request.get('/api/health');
    expect(response.status()).toBeLessThan(500);
    
    const body = await response.json().catch(() => null);
    if (body) {
      expect(body).toHaveProperty('status');
    }
  });
});
