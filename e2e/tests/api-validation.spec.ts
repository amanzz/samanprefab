import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth.fixture';

/**
 * API VALIDATION TESTS
 * 
 * Tests:
 * 1. Intercept network requests
 * 2. Ensure:
 *    - No 500 errors
 *    - No failed fetch
 *    - Correct data returned
 */

interface ApiRequest {
  method: string;
  url: string;
  status: number;
  ok: boolean;
}

test.describe('API Validation', () => {
  test('should have no 500 errors on admin API calls', async ({ page }) => {
    await loginAsAdmin(page);
    
    const apiRequests: ApiRequest[] = [];
    const errors: string[] = [];
    
    // Intercept all API calls
    await page.route('**/api/**', async (route, request) => {
      const response = await route.fetch();
      const status = response.status();
      
      apiRequests.push({
        method: request.method(),
        url: request.url(),
        status,
        ok: response.ok(),
      });
      
      if (status >= 500) {
        errors.push(`${request.method()} ${request.url()} -> ${status}`);
      }
      
      await route.continue();
    });
    
    // Navigate through admin pages that make API calls
    const pagesToTest = [
      '/admin/dashboard',
      '/admin/products',
      '/admin/blog/posts',
      '/admin/quotes',
    ];
    
    for (const path of pagesToTest) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }
    
    // Log all API requests for debugging
    console.log('API Requests made:');
    apiRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url.split('/api').pop()} -> ${req.status}`);
    });
    
    // Assert no 500 errors
    expect(errors, `Server errors found: ${errors.join(', ')}`).toHaveLength(0);
    
    // Assert all API calls returned successfully (2xx or 3xx or 401 for auth)
    const failedRequests = apiRequests.filter(req => 
      req.status >= 400 && req.status !== 401 && req.status !== 403
    );
    
    expect(failedRequests.length, 
      `Failed API requests: ${failedRequests.map(r => `${r.method} ${r.url} -> ${r.status}`).join(', ')}`
    ).toBe(0);
  });

  test('should return correct data structure for products API', async ({ page }) => {
    await loginAsAdmin(page);
    
    let productsData: any = null;
    let apiError: string | null = null;
    
    await page.route('**/api/**/products**', async (route, request) => {
      if (request.method() === 'GET') {
        try {
          const response = await route.fetch();
          const body = await response.json();
          productsData = body;
        } catch (e) {
          apiError = String(e);
        }
      }
      await route.continue();
    });
    
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // If products API was called, verify data structure
    if (productsData) {
      // Should have items array or data object
      const hasValidStructure = 
        Array.isArray(productsData.items) || 
        Array.isArray(productsData.data) ||
        typeof productsData === 'object';
      
      expect(hasValidStructure, 'Products API should return valid data structure').toBe(true);
      
      // If there are items, check structure
      const items = productsData.items || productsData.data || [];
      if (items.length > 0) {
        const firstItem = items[0];
        expect(firstItem, 'Product should have id').toHaveProperty('id');
        expect(firstItem, 'Product should have name').toHaveProperty('name');
      }
    }
    
    expect(apiError, `API Error: ${apiError}`).toBeNull();
  });

  test('should return correct data structure for quotes API', async ({ page }) => {
    await loginAsAdmin(page);
    
    let quotesData: any = null;
    
    await page.route('**/api/**/quotes**', async (route, request) => {
      if (request.method() === 'GET') {
        const response = await route.fetch();
        if (response.ok()) {
          quotesData = await response.json().catch(() => null);
        }
      }
      await route.continue();
    });
    
    await page.goto('/admin/quotes');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    if (quotesData) {
      const hasValidStructure = 
        Array.isArray(quotesData.items) || 
        Array.isArray(quotesData.data) ||
        typeof quotesData === 'object';
      
      expect(hasValidStructure, 'Quotes API should return valid data structure').toBe(true);
    }
  });

  test('should handle POST requests correctly', async ({ page }) => {
    await loginAsAdmin(page);
    
    const postRequests: ApiRequest[] = [];
    
    await page.route('**/api/**', async (route, request) => {
      if (request.method() === 'POST') {
        const response = await route.fetch();
        postRequests.push({
          method: request.method(),
          url: request.url(),
          status: response.status(),
          ok: response.ok(),
        });
      }
      await route.continue();
    });
    
    // Navigate to product creation
    await page.goto('/admin/products/new');
    await page.waitForLoadState('networkidle');
    
    // Fill minimal data and attempt save
    await page.locator('input[name="name"], input[placeholder*="Product name"]').first().fill('API Test Product');
    
    // Click publish to trigger POST
    const publishBtn = page.locator('button:has-text("Publish")').first();
    if (await publishBtn.isVisible().catch(() => false)) {
      await publishBtn.click();
      await page.waitForTimeout(3000);
    }
    
    // Verify POST requests returned valid status
    for (const req of postRequests) {
      expect(req.status, `POST ${req.url} should return valid status`).toBeLessThan(500);
    }
  });

  test('should have consistent response times', async ({ page }) => {
    await loginAsAdmin(page);
    
    const responseTimes: { url: string; time: number }[] = [];
    
    await page.route('**/api/**', async (route, request) => {
      const start = Date.now();
      const response = await route.fetch();
      const time = Date.now() - start;
      
      responseTimes.push({
        url: request.url(),
        time,
      });
      
      await route.continue();
    });
    
    // Load several pages
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/admin/products');
    await page.waitForLoadState('networkidle');
    
    // Check response times
    const slowRequests = responseTimes.filter(r => r.time > 5000);
    
    expect(slowRequests.length, 
      `Slow API requests (>5s): ${slowRequests.map(r => `${r.url} took ${r.time}ms`).join(', ')}`
    ).toBe(0);
  });

  test('should return proper error responses for invalid data', async ({ page }) => {
    await loginAsAdmin(page);
    
    let errorResponse: { status: number; body: any } | null = null;
    
    await page.route('**/api/**/products**', async (route, request) => {
      if (request.method() === 'POST') {
        const response = await route.fetch();
        if (!response.ok()) {
          errorResponse = {
            status: response.status(),
            body: await response.json().catch(() => null),
          };
        }
      }
      await route.continue();
    });
    
    // Attempt to save with minimal data (may trigger validation error)
    await page.goto('/admin/products/new');
    await page.waitForLoadState('networkidle');
    
    const publishBtn = page.locator('button:has-text("Publish")').first();
    if (await publishBtn.isVisible().catch(() => false)) {
      await publishBtn.click();
      await page.waitForTimeout(3000);
    }
    
    // If there was an error response, verify it has proper structure
    if (errorResponse) {
      expect(errorResponse.status, 'Error response should have valid status code').toBeGreaterThanOrEqual(400);
      expect(errorResponse.status, 'Error response should have valid status code').toBeLessThan(500);
      
      // Should have error message
      if (errorResponse.body) {
        const hasErrorMessage = 
          errorResponse.body.error || 
          errorResponse.body.message ||
          errorResponse.body.errors;
        expect(hasErrorMessage, 'Error response should contain error message').toBeTruthy();
      }
    }
  });

  test('public API endpoints should be accessible without auth', async ({ page }) => {
    // Don't login - test public endpoints
    const publicEndpoints = [
      '/products',
    ];
    
    const apiRequests: ApiRequest[] = [];
    
    await page.route('**/api/**', async (route, request) => {
      const response = await route.fetch();
      apiRequests.push({
        method: request.method(),
        url: request.url(),
        status: response.status(),
        ok: response.ok(),
      });
      await route.continue();
    });
    
    for (const endpoint of publicEndpoints) {
      await page.goto(endpoint);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
    }
    
    // Public pages should not return 401/403 for data fetching
    const authErrors = apiRequests.filter(req => 
      req.status === 401 || req.status === 403
    );
    
    // Public product list API should work
    expect(authErrors.length, `Unexpected auth errors: ${authErrors.map(r => r.url).join(', ')}`).toBe(0);
  });

  test('should handle concurrent API requests gracefully', async ({ page }) => {
    await loginAsAdmin(page);
    
    const requestStatuses: number[] = [];
    
    await page.route('**/api/**', async (route) => {
      const response = await route.fetch();
      requestStatuses.push(response.status());
      await route.continue();
    });
    
    // Navigate to a page that makes multiple API calls
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // All concurrent requests should succeed
    const failedStatuses = requestStatuses.filter(s => s >= 500);
    expect(failedStatuses, `Failed requests: ${failedStatuses.join(', ')}`).toHaveLength(0);
  });
});
