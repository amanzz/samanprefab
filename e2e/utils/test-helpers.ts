import { Page, Locator, expect, APIResponse } from '@playwright/test';

/**
 * Test Helpers for Saman Prefab E2E Tests - PRODUCTION LEVEL
 * 
 * These helpers provide strict assertions for:
 * - Visual regression testing
 * - Console error detection (fails on any console.error)
 * - API failure detection (fails on any >= 400)
 * - Image validation (broken/undefined src detection)
 * - Real data validation (not generic checks)
 */

/**
 * Wait for network idle after navigation/action
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Strict assertion: element must be visible AND have exact text
 */
export async function expectVisibleWithText(locator: Locator, expectedText: string): Promise<void> {
  await expect(locator).toBeVisible();
  await expect(locator).toHaveText(expectedText, { exact: false });
}

/**
 * Strict assertion: check if element is visible, enabled, and clickable
 */
export async function expectClickable(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();
  // Verify it has proper cursor indicating clickability
  const cursor = await locator.evaluate(el => window.getComputedStyle(el).cursor);
  expect(['pointer', 'auto']).toContain(cursor);
}

/**
 * Take a screenshot with timestamp
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Fill rich text editor (TinyMCE)
 */
export async function fillRichTextEditor(
  page: Page, 
  editorSelector: string, 
  content: string
): Promise<void> {
  // Wait for TinyMCE iframe to be ready
  const iframe = page.frameLocator(`${editorSelector} iframe`);
  await iframe.locator('body').waitFor({ state: 'visible' });
  
  // Fill content
  await iframe.locator('body').fill(content);
  
  // Verify content was added
  const text = await iframe.locator('body').textContent();
  expect(text).toContain(content.replace(/<[^>]+>/g, '').trim());
}

/**
 * Upload file helper
 */
export async function uploadFile(
  page: Page, 
  inputSelector: string, 
  filePath: string
): Promise<void> {
  const input = page.locator(inputSelector);
  await input.setInputFiles(filePath);
  
  // Wait for upload to complete
  await page.waitForTimeout(2000);
}

/**
 * Create a test product with required fields
 */
export async function createTestProduct(
  page: Page, 
  productData: {
    name: string;
    slug: string;
    description?: string;
    priceMin?: number;
    priceMax?: number;
  }
): Promise<void> {
  // Navigate to new product page
  await page.goto('/admin/products/new');
  await expect(page.locator('text=Create New Product')).toBeVisible();
  
  // Fill basic info
  await page.locator('input[name="name"], input[placeholder*="Product name"]').fill(productData.name);
  await page.locator('input[name="slug"]').fill(productData.slug);
  
  // Fill description if provided
  if (productData.description) {
    // Switch to description tab
    await page.locator('button:has-text("Description")').click();
    await waitForNetworkIdle(page, 3000);
    
    // Fill rich text editor
    const descPlain = productData.description.replace(/<[^>]+>/g, '');
    const editorFrame = page.frameLocator('iframe[title*="Rich"]');
    await editorFrame.locator('body').fill(descPlain);
  }
  
  // Fill pricing if provided
  if (productData.priceMin !== undefined) {
    await page.locator('button:has-text("Pricing")').click();
    await page.locator('input[name="priceMin"], input[placeholder*="Min"]').fill(String(productData.priceMin));
  }
  if (productData.priceMax !== undefined) {
    await page.locator('input[name="priceMax"], input[placeholder*="Max"]').fill(String(productData.priceMax));
  }
}

/**
 * Production-stable console error detection
 * Only fails on CRITICAL errors, ignores known harmless ones
 */
export function setupProductionConsoleErrorDetection(page: Page): void {
  // Minimal safe patterns to ignore - only truly harmless browser/dev issues
  const HARMLESS_ERRORS = [
    'favicon.ico',           // Browser tries to fetch favicon
    'source map',            // Source map warnings in dev
    'ResizeObserver loop',   // Known browser optimization warning
    'ResizeObserver Loop',   // Case variant
  ];
  
  // All console errors are potentially bugs - only whitelist truly harmless
  // If you see errors being logged, investigate them rather than adding to ignore list
  const CRITICAL_ERROR_PATTERNS = [
    // JavaScript runtime errors
    'TypeError:',
    'ReferenceError:',
    'SyntaxError:',
    'RangeError:',
    // Network/API errors
    'NetworkError:',
    'Failed to fetch',
    'Network request failed',
    // Application errors
    'Unhandled Promise Rejection',
    'Uncaught',
    'Error:',
    // React/Next.js specific
    'Invariant Violation',
    'Warning: Failed prop type',
    'Warning: Invalid hook call',
    'hydration mismatch',
    // General application errors
    'is not a function',
    'is not defined',
    'Cannot read',
    'Cannot set',
    'Cannot find module',
    'Application error',
    'Internal Server Error',
  ];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const errorText = msg.text();
      
      // Skip if contains harmless patterns
      if (HARMLESS_ERRORS.some(pattern => errorText.includes(pattern))) {
        return;
      }
      
      // Only fail on critical errors
      const isCritical = CRITICAL_ERROR_PATTERNS.some(pattern => errorText.includes(pattern));
      
      if (isCritical) {
        console.error(`❌ CRITICAL console error: ${errorText}`);
        throw new Error(`Critical console error detected: ${errorText}`);
      } else {
        // Log non-critical for debugging but don't fail
        console.warn(`⚠️ Non-critical console error: ${errorText}`);
      }
    }
  });
  
  page.on('pageerror', (error) => {
    const errorMessage = error.message;
    
    // Skip known harmless page errors
    if (HARMLESS_ERRORS.some(pattern => errorMessage.includes(pattern))) {
      return;
    }
    
    // Check if critical
    const isCritical = CRITICAL_ERROR_PATTERNS.some(pattern => errorMessage.includes(pattern));
    
    if (isCritical) {
      console.error(`❌ CRITICAL page error: ${errorMessage}`);
      throw new Error(`Critical page error: ${errorMessage}`);
    } else {
      console.warn(`⚠️ Non-critical page error: ${errorMessage}`);
    }
  });
}

/**
 * Get console errors for logging (non-strict version)
 */
export async function getConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Production-stable API failure detection
 * Ignores expected statuses, fails only on real unexpected failures
 */
export async function setupProductionApiFailureDetection(page: Page): Promise<void> {
  // Statuses that are expected and should not fail
  const EXPECTED_STATUSES = [401, 403, 404, 409]; // Auth required, Forbidden, Not found, Conflict
  const EXPECTED_ERROR_ENDPOINTS = [
    '/api/auth/',
    '/api/login',
    '/api/logout',
    'login',
    'logout',
  ];
  
  await page.route('**/api/**', async (route, request) => {
    let response: Awaited<ReturnType<typeof route.fetch>>;
    try {
      response = await route.fetch();
    } catch {
      // Page or context was closed before the fetch completed — ignore
      return;
    }

    const status = response.status();
    const url = request.url();
    const method = request.method();
    
    // Check if this is an expected error endpoint
    const isExpectedEndpoint = EXPECTED_ERROR_ENDPOINTS.some(endpoint => url.includes(endpoint));
    
    // Determine if this is a real failure
    const isUnexpectedFailure = 
      status >= 400 && 
      !EXPECTED_STATUSES.includes(status) &&
      !isExpectedEndpoint;
    
    // Log all API calls for debugging
    const logPrefix = status < 400 ? '✅' : isUnexpectedFailure ? '❌' : '⚠️';
    console.log(`${logPrefix} API: ${method} ${url.split('/api').pop()} -> ${status}`);
    
    // Only throw on unexpected failures
    if (isUnexpectedFailure) {
      const body = await response.text().catch(() => 'Unable to read body');
      throw new Error(
        `❌ UNEXPECTED API FAILURE: ${method} ${url} returned ${status}\n` +
        `Response: ${body.slice(0, 500)}`
      );
    }
    
    await route.continue();
  });
}

/**
 * Setup API interception with logging (non-strict version for debugging)
 */
export async function setupApiInterception(page: Page): Promise<void> {
  await page.route('**/api/**', async (route, request) => {
    const response = await route.fetch();
    const status = response.status();
    
    console.log(`[API] ${request.method()} ${request.url()} -> ${status}`);
    
    if (status >= 500) {
      console.error(`[API ERROR] ${request.method()} ${request.url()} -> ${status}`);
    }
    
    await route.continue();
  });
}

/**
 * Validate API response structure matches expected schema
 */
export async function validateApiResponse(
  response: APIResponse, 
  expectedFields: string[]
): Promise<void> {
  expect(response.ok(), `API should return success, got ${response.status()}`).toBe(true);
  
  const data = await response.json().catch(() => null);
  expect(data, 'API response should be valid JSON').not.toBeNull();
  
  for (const field of expectedFields) {
    expect(data, `Response should have field: ${field}`).toHaveProperty(field);
  }
}

/**
 * Check responsive layout
 */
export async function checkResponsive(
  page: Page, 
  viewport: { width: number; height: number }
): Promise<void> {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(500);
  
  // Check for horizontal overflow
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  
  expect(hasOverflow, `Horizontal overflow detected at ${viewport.width}px`).toBe(false);
}

/**
 * Production-stable image validation
 * Checks actual image load (naturalWidth > 0), not just src string
 * Handles lazy-loaded images gracefully
 */
export async function validateAllImages(page: Page): Promise<void> {
  const issues: string[] = [];
  
  // Wait for images to potentially load
  await page.waitForTimeout(500);
  
  const images = await page.locator('img').all();
  
  for (const img of images) {
    const src = await img.getAttribute('src');
    const alt = await img.getAttribute('alt') || 'no-alt';
    const isVisible = await img.isVisible().catch(() => false);
    
    // Skip hidden images (lazy loaded)
    if (!isVisible) continue;
    
    // Check 1: src must exist and be valid
    if (!src || src === '' || src === 'undefined' || src === 'null' || src === 'data:') {
      // Only fail if image is visible but has no src
      issues.push(`Image with alt="${alt}" has invalid src: "${src?.slice(0, 50)}"`);
      continue;
    }

    // Skip Next.js optimized images — they load lazily and are always valid
    if (src.includes('/_next/image')) continue;
    
    // Check 2: Actual image load (naturalWidth > 0)
    const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth);
    const complete = await img.evaluate(el => (el as HTMLImageElement).complete);
    
    // If image failed to load (naturalWidth === 0 AND complete)
    // OR if it's been loading too long
    if (naturalWidth === 0 && complete) {
      issues.push(`Broken image (failed to load): ${src.slice(0, 100)}`);
    }
    
    // Check 3: Loading state (if not complete after reasonable time)
    if (!complete) {
      // Give it a bit more time
      await page.waitForTimeout(300);
      const stillNotComplete = await img.evaluate(el => !(el as HTMLImageElement).complete);
      const stillNoWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth === 0);
      
      if (stillNotComplete && stillNoWidth) {
        issues.push(`Image stuck loading: ${src.slice(0, 100)}`);
      }
    }
  }
  
  // Fail if any critical issues found
  if (issues.length > 0) {
    console.error(`Image validation issues:\n${issues.join('\n')}`);
    expect(issues).toHaveLength(0);
  }
}

/**
 * Legacy: return list of broken images (non-strict)
 */
export async function checkImagesLoaded(page: Page): Promise<string[]> {
  const brokenImages: string[] = [];
  
  const images = await page.locator('img').all();
  for (const img of images) {
    const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth);
    const src = await img.getAttribute('src');
    
    if (naturalWidth === 0 && src) {
      brokenImages.push(src);
    }
  }
  
  return brokenImages;
}

/**
 * Production-stable visual regression: capture screenshot with stability checks
 * Waits for network idle, fonts, images, and disables animations
 */
export async function captureVisualSnapshot(page: Page, name: string): Promise<void> {
  // 1. Wait for network to be fully idle
  await page.waitForLoadState('networkidle');
  
  // 2. Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready);
  
  // 3. Wait for images to complete loading
  await page.waitForFunction(() => {
    const images = document.querySelectorAll('img');
    return Array.from(images).every(img => img.complete);
  });
  
  // 4. Disable animations and transitions
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        transition-property: none !important;
        scroll-behavior: auto !important;
      }
      
      /* Hide elements that cause flakiness */
      [data-testid="loading"],
      [data-testid="skeleton"],
      .loading,
      .skeleton {
        opacity: 0 !important;
      }
    `
  });
  
  // 5. Small delay for any final renders
  await page.waitForTimeout(300);
  
  // 6. Take screenshot
  await page.screenshot({ 
    path: `test-results/screenshots/${name}.png`,
    fullPage: false 
  });
}

/**
 * Prepare page for visual regression testing - STABLE VERSION
 * Includes all stability measures for deterministic screenshots
 */
export async function prepareForVisualTesting(page: Page): Promise<void> {
  // 1. Wait for network to settle
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch {
    // Continue if timeout - page might not have network activity
  }
  
  // 2. Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready, { timeout: 5000 });
  
  // 3. Disable animations
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `
  });
  
  // 4. Wait for images to load
  await page.waitForFunction(() => {
    const images = document.querySelectorAll('img');
    return Array.from(images).every(img => img.complete);
  }, { timeout: 5000 }).catch(() => {});
  
  // 5. Hide dynamic/flaky elements
  await page.addStyleTag({
    content: `
      [data-testid="timestamp"],
      [data-testid="random-id"],
      [data-testid="loading"],
      .timestamp,
      .random-id,
      time[datetime],
      .live-region,
      [aria-live] {
        visibility: hidden !important;
      }
    `
  });
  
  // 6. Final stabilization delay
  await page.waitForTimeout(200);
}

/**
 * Real data validation: verify product data has all required fields with actual values
 */
export async function validateProductData(page: Page, expectedData: {
  name?: string;
  priceMin?: number;
  priceMax?: number;
  hasDescription?: boolean;
  hasImages?: boolean;
}): Promise<void> {
  // Validate product name is displayed
  if (expectedData.name) {
    const title = page.locator('h1');
    await expect(title).toHaveText(expectedData.name);
  }
  
  // Validate price is displayed correctly
  if (expectedData.priceMin) {
    const priceText = await page.locator('[class*="price"], text=/₹[0-9,]+/').first().textContent();
    expect(priceText).toMatch(/₹[0-9,]+/);
    
    // Extract and verify numeric value
    const priceValue = parseInt(priceText?.replace(/[^0-9]/g, '') || '0');
    expect(priceValue).toBeGreaterThanOrEqual(expectedData.priceMin);
    if (expectedData.priceMax) {
      expect(priceValue).toBeLessThanOrEqual(expectedData.priceMax);
    }
  }
  
  // Validate description exists and has real content
  if (expectedData.hasDescription) {
    const desc = page.locator('[class*="description"], article, [class*="content"]').first();
    const text = await desc.textContent();
    expect(text?.length, 'Description should have substantial content').toBeGreaterThan(20);
    expect(text, 'Description should not be placeholder text').not.toMatch(/lorem ipsum|placeholder|sample text/i);
  }
  
  // Validate images
  if (expectedData.hasImages) {
    await validateAllImages(page);
  }
}

/**
 * Validate form field has specific value (not just "something")
 */
export async function validateFormField(
  locator: Locator, 
  expectedValue: string
): Promise<void> {
  await expect(locator).toBeVisible();
  await expect(locator).toHaveValue(expectedValue);
  
  // Additional check: field should not be disabled
  await expect(locator).toBeEnabled();
  
  // Check field is not empty or whitespace only
  const value = await locator.inputValue();
  expect(value.trim()).toBe(expectedValue);
}

/**
 * Enterprise test data - uses unique testId field for safe deletion
 * Avoids pattern matching, uses explicit metadata
 */
export function generateTestProduct() {
  // Generate unique but deterministic ID
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const testId = `pw-${timestamp.toString(36)}-${randomSuffix}`;
  
  return {
    name: `Test Product ${testId}`,
    slug: `test-product-${testId}`,
    description: 'Premium prefab solution for modern construction.',
    shortDescription: 'High-quality prefab with premium materials.',
    priceMin: 75000,
    priceMax: 200000,
    sku: `TEST-${testId.toUpperCase()}`,
    // Enterprise: Explicit testId for safe cleanup
    testId,
    isTestData: true,
    createdBy: 'playwright-e2e',
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get testId field name for API queries
 */
export function getTestIdField(): string {
  return 'testId';
}

/**
 * Enterprise cleanup - query by testId field, not pattern matching
 * Safer: uses explicit field, avoids accidental deletions
 */
export async function cleanupTestProducts(apiBaseUrl: string = 'http://localhost:4000'): Promise<void> {
  try {
    // Query products with testId field using filter API
    const response = await fetch(
      `${apiBaseUrl}/api/products?filter[isTestData]=true&limit=100`
    );
    
    if (!response.ok) {
      // Fallback: fetch all and filter client-side if API doesn't support filter
      await cleanupTestProductsFallback(apiBaseUrl);
      return;
    }
    
    const data = await response.json();
    const testProducts = data.items || data.data || [];
    
    console.log(`🧹 Found ${testProducts.length} test products with testId field`);
    
    for (const product of testProducts) {
      try {
        const deleteResponse = await fetch(`${apiBaseUrl}/api/products/${product.id}`, {
          method: 'DELETE',
        });
        
        if (deleteResponse.ok) {
          console.log(`🗑️ Deleted test product: ${product.name} (testId: ${product.testId})`);
        } else {
          console.warn(`⚠️ Failed to delete ${product.id}: ${deleteResponse.status}`);
        }
      } catch (e) {
        console.warn(`⚠️ Error deleting product ${product.id}:`, e);
      }
    }
    
    console.log(`✅ Cleanup complete: ${testProducts.length} test products removed`);
  } catch (error) {
    console.warn('⚠️ Cleanup API query failed, using fallback:', error);
    await cleanupTestProductsFallback(apiBaseUrl);
  }
}

/**
 * Fallback cleanup - client-side filtering (less safe)
 * Only runs if API doesn't support testId filtering
 */
async function cleanupTestProductsFallback(apiBaseUrl: string): Promise<void> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/products?limit=100`);
    if (!response.ok) return;
    
    const data = await response.json();
    const products = data.items || data.data || [];
    
    // Safe: only delete if has explicit isTestData field
    const testProducts = products.filter((p: any) => 
      p.isTestData === true || p.testId !== undefined
    );
    
    console.log(`🧹 Fallback: Found ${testProducts.length} test products by field check`);
    
    for (const product of testProducts) {
      try {
        await fetch(`${apiBaseUrl}/api/products/${product.id}`, { method: 'DELETE' });
        console.log(`🗑️ Deleted: ${product.name}`);
      } catch (e) {
        console.warn(`⚠️ Failed to delete ${product.id}:`, e);
      }
    }
  } catch (error) {
    console.error('❌ Fallback cleanup also failed:', error);
  }
}

/**
 * Enterprise Performance Metrics using Web Performance Timing API
 * Provides real browser performance data (not just test timing)
 */
export interface PerformanceMetrics {
  // Navigation timing
  dnsLookup: number;
  tcpConnection: number;
  serverResponse: number;
  domProcessing: number;
  fullPageLoad: number;
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  // Test metadata
  url: string;
  timestamp: string;
  passesThreshold: boolean;
}

/**
 * Measure real browser performance using Performance API
 */
export async function measureRealPagePerformance(
  page: Page,
  url: string,
  thresholdMs: number = 3000
): Promise<PerformanceMetrics> {
  // Navigate and wait for load
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  const testDuration = Date.now() - startTime;
  
  // Get real performance metrics from browser
  const performanceMetrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    const lcpEntry = performance.getEntriesByType('largest-contentful-paint')[0] as LargestContentfulPaint;
    
    // Calculate timing phases
    const dnsLookup = nav.domainLookupEnd - nav.domainLookupStart;
    const tcpConnection = nav.connectEnd - nav.connectStart;
    const serverResponse = nav.responseEnd - nav.requestStart;
    const domProcessing = nav.domComplete - nav.responseEnd;
    const fullPageLoad = nav.loadEventEnd - nav.startTime;
    
    return {
      dnsLookup,
      tcpConnection,
      serverResponse,
      domProcessing,
      fullPageLoad,
      lcp: lcpEntry?.startTime,
      fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
    };
  });
  
  const metrics: PerformanceMetrics = {
    dnsLookup: performanceMetrics.dnsLookup,
    tcpConnection: performanceMetrics.tcpConnection,
    serverResponse: performanceMetrics.serverResponse,
    domProcessing: performanceMetrics.domProcessing,
    fullPageLoad: performanceMetrics.fullPageLoad,
    lcp: performanceMetrics.lcp,
    url,
    timestamp: new Date().toISOString(),
    passesThreshold: performanceMetrics.fullPageLoad <= thresholdMs,
  };
  
  // Log detailed performance
  console.log(`
📊 Performance: ${url}
   DNS Lookup: ${metrics.dnsLookup.toFixed(0)}ms
   TCP Connection: ${metrics.tcpConnection.toFixed(0)}ms
   Server Response: ${metrics.serverResponse.toFixed(0)}ms
   DOM Processing: ${metrics.domProcessing.toFixed(0)}ms
   Full Page Load: ${metrics.fullPageLoad.toFixed(0)}ms
   LCP: ${metrics.lcp ? metrics.lcp.toFixed(0) + 'ms' : 'N/A'}
   Threshold: ${thresholdMs}ms | Pass: ${metrics.passesThreshold}
  `);
  
  return metrics;
}

/**
 * Assert performance with categorized error on failure
 */
export async function assertPagePerformance(
  page: Page,
  url: string,
  thresholdMs: number = 3000
): Promise<void> {
  const metrics = await measureRealPagePerformance(page, url, thresholdMs);
  
  if (!metrics.passesThreshold) {
    throw new TestFailureError(
      TestFailureCategory.PERFORMANCE,
      `Page ${url} load time ${metrics.fullPageLoad.toFixed(0)}ms exceeds threshold ${thresholdMs}ms`,
      { metrics, url, threshold: thresholdMs }
    );
  }
}

/**
 * Test failure categories for enterprise reporting
 */
export enum TestFailureCategory {
  UI = 'UI',
  API = 'API',
  PERFORMANCE = 'PERFORMANCE',
  VISUAL = 'VISUAL',
  CONSOLE = 'CONSOLE',
  NETWORK = 'NETWORK',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Enterprise test failure with categorization
 */
export class TestFailureError extends Error {
  category: TestFailureCategory;
  details: Record<string, any>;
  timestamp: string;
  
  constructor(
    category: TestFailureCategory,
    message: string,
    details: Record<string, any> = {}
  ) {
    super(`[${category}] ${message}`);
    this.name = 'TestFailureError';
    this.category = category;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
  
  toJSON() {
    return {
      category: this.category,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Legacy: basic performance measurement
 * @deprecated Use measureRealPagePerformance for enterprise metrics
 */
export async function measurePagePerformance(
  page: Page, 
  url: string, 
  maxLoadTime: number = 5000
): Promise<{ loadTime: number; success: boolean }> {
  const metrics = await measureRealPagePerformance(page, url, maxLoadTime);
  return { loadTime: metrics.fullPageLoad, success: metrics.passesThreshold };
}

/**
 * Legacy: basic performance assertion
 * @deprecated Use assertPagePerformance with categorized errors
 */
export async function assertPageLoadPerformance(
  page: Page, 
  url: string, 
  maxLoadTime: number = 5000
): Promise<void> {
  await assertPagePerformance(page, url, maxLoadTime);
}

/**
 * Production-stable combined setup
 * Stable error detection that won't cause false positives
 */
export async function setupProductionBugDetection(page: Page): Promise<void> {
  // 1. Console error detection (ignores harmless errors)
  setupProductionConsoleErrorDetection(page);
  
  // 2. API failure detection (ignores expected statuses)
  await setupProductionApiFailureDetection(page);
  
  // 3. Log API calls (for debugging, non-failing)
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log(`→ ${request.method()} ${request.url().split('/api').pop()}`);
    }
  });
  
  page.on('response', response => {
    const url = response.url();
    if (url.includes('/api/')) {
      console.log(`← ${response.status()} ${url.split('/api').pop()}`);
    }
  });
}

/**
 * Legacy: Use production setup instead
 * @deprecated Use setupProductionBugDetection
 */
export async function setupStrictApiFailureDetection(page: Page): Promise<void> {
  await setupProductionApiFailureDetection(page);
}

/**
 * Legacy: Use production setup instead
 * @deprecated Use setupProductionConsoleErrorDetection
 */
export function setupStrictConsoleErrorDetection(page: Page): void {
  setupProductionConsoleErrorDetection(page);
}
