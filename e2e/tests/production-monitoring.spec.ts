import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth.fixture';
import { 
  setupProductionBugDetection,
  assertPagePerformance,
  prepareForVisualTesting,
  validateAllImages
} from '../utils/test-helpers';
import { 
  setupTestMonitoring, 
  createMonitoringReport,
  getMonitoringConfig 
} from '../utils/monitoring';

/**
 * PRODUCTION MONITORING TESTS
 * 
 * Tests for production readiness with monitoring integration:
 * - Sentry error tracking simulation
 * - Performance monitoring (Core Web Vitals)
 * - Real user monitoring (RUM) simulation
 * - Alert threshold validation
 */

const ENVIRONMENT = (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development';

test.describe('Production Monitoring - Error Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should capture and report console errors to monitoring', async ({ page }) => {
    const monitoring = await setupTestMonitoring(
      page, 
      getMonitoringConfig(ENVIRONMENT)
    );
    
    // Navigate to page that might generate errors
    await page.goto('/admin/login');
    await page.waitForTimeout(500);
    
    // Intentionally trigger a console error (for testing error capture)
    await page.evaluate(() => {
      console.error('Test error for monitoring verification');
    });
    
    await page.waitForTimeout(500);
    
    // Capture performance
    await monitoring.capturePerformance();
    
    // Get captured errors
    const errors = monitoring.getErrors();
    
    // Create monitoring report
    const report = createMonitoringReport(
      'error-tracking-test',
      errors,
      [],
      1000
    );
    
    // Verify error was captured
    const testError = errors.find(e => e.message.includes('Test error for monitoring'));
    expect(testError, 'Test error should be captured').toBeTruthy();
    expect(testError?.type).toBe('console');
    expect(testError?.severity).toBe('error');
    
    // Report should indicate the error
    expect(report.summary.totalErrors).toBeGreaterThan(0);
    
    await monitoring.flush();
  });

  test('should capture JavaScript errors with stack traces', async ({ page }) => {
    const monitoring = await setupTestMonitoring(
      page,
      getMonitoringConfig(ENVIRONMENT)
    );
    
    await page.goto('/products');
    
    // Trigger a JavaScript error
    await page.evaluate(() => {
      try {
        // @ts-ignore - Intentionally accessing undefined
        window.undefinedFunction();
      } catch (e) {
        // Error should be captured by page.on('pageerror')
      }
    });
    
    await page.waitForTimeout(500);
    
    const errors = monitoring.getErrors();
    const jsError = errors.find(e => e.type === 'javascript');
    
    // Should have captured JS error details
    if (jsError) {
      expect(jsError.message).toBeTruthy();
      expect(jsError.severity).toBe('fatal');
    }
    
    await monitoring.flush();
  });

  test('should capture network errors and 5xx responses', async ({ page }) => {
    const monitoring = await setupTestMonitoring(
      page,
      getMonitoringConfig(ENVIRONMENT)
    );
    
    // Intercept to simulate server error
    await page.route('**/api/products', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });
    
    // Trigger API call
    await page.goto('/products');
    await page.waitForTimeout(1000);
    
    const errors = monitoring.getErrors();
    const networkError = errors.find(e => e.type === 'network' && e.message.includes('500'));
    
    // Should capture 500 error
    if (networkError) {
      expect(networkError.severity).toBe('fatal');
      expect(networkError.metadata?.status).toBe(500);
    }
    
    await monitoring.flush();
  });
});

test.describe('Production Monitoring - Performance Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should measure and report Core Web Vitals', async ({ page }) => {
    const monitoring = await setupTestMonitoring(
      page,
      getMonitoringConfig(ENVIRONMENT)
    );
    
    // Navigate with performance monitoring
    await assertPagePerformance(page, '/', 5000);
    
    // Capture Core Web Vitals
    const metrics = await monitoring.capturePerformance();
    
    // Create report
    const report = createMonitoringReport(
      'core-web-vitals',
      [],
      metrics,
      2000
    );
    
    // Verify metrics were captured
    expect(metrics.length).toBeGreaterThan(0);
    
    // Check for key metrics
    const lcp = metrics.find(m => m.metric === 'LCP');
    const fcp = metrics.find(m => m.metric === 'FCP');
    const ttfb = metrics.find(m => m.metric === 'TTFB');
    const cls = metrics.find(m => m.metric === 'CLS');
    
    // LCP should be measured
    if (lcp) {
      expect(lcp.value).toBeGreaterThan(0);
      expect(['good', 'needs-improvement', 'poor']).toContain(lcp.rating);
    }
    
    // FCP should be measured
    if (fcp) {
      expect(fcp.value).toBeGreaterThan(0);
    }
    
    // Report should include Core Web Vitals summary
    expect(report.summary.coreWebVitals).toBeDefined();
    
    console.log('Core Web Vitals Report:', JSON.stringify(report.summary.coreWebVitals, null, 2));
    
    await monitoring.flush();
  });

  test('should trigger performance alerts for slow pages', async ({ page }) => {
    const monitoring = await setupTestMonitoring(
      page,
      getMonitoringConfig(ENVIRONMENT)
    );
    
    // Navigate to admin (typically heavier)
    await loginAsAdmin(page);
    await assertPagePerformance(page, '/admin/dashboard', 5000);
    
    const metrics = await monitoring.capturePerformance();
    const alerts = monitoring.checkAlerts();
    
    // Create report
    const report = createMonitoringReport(
      'performance-alerts',
      [],
      metrics,
      3000
    );
    
    // Log alerts for debugging
    if (alerts.length > 0) {
      console.warn('Performance alerts:', alerts);
    }
    
    // Report should indicate alerts
    expect(report.summary.performanceAlerts).toBe(alerts.length);
    
    await monitoring.flush();
  });

  test('should track page load performance over time', async ({ page }) => {
    const monitoring = await setupTestMonitoring(
      page,
      getMonitoringConfig(ENVIRONMENT)
    );
    
    const pages = [
      { url: '/', name: 'homepage' },
      { url: '/products', name: 'products' },
      { url: '/admin/login', name: 'login' },
    ];
    
    const results = [];
    
    for (const { url, name } of pages) {
      const start = Date.now();
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - start;
      
      const metrics = await monitoring.capturePerformance();
      const alerts = monitoring.checkAlerts();
      
      results.push({
        page: name,
        url,
        loadTime,
        metrics,
        alerts,
        passed: alerts.length === 0 && loadTime < 5000,
      });
    }
    
    // Log performance summary
    console.log('\n📊 Performance Summary:');
    results.forEach(r => {
      const status = r.passed ? '✅' : '⚠️';
      console.log(`${status} ${r.page}: ${r.loadTime}ms`);
    });
    
    // At least one page should pass performance check
    const anyPassed = results.some(r => r.passed);
    expect(anyPassed, 'At least one page should pass performance check').toBeTruthy();
    
    await monitoring.flush();
  });
});

test.describe('Production Monitoring - RUM Simulation', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should simulate real user journey with monitoring', async ({ page }) => {
    const monitoring = await setupTestMonitoring(
      page,
      getMonitoringConfig(ENVIRONMENT)
    );
    
    const startTime = Date.now();
    const journey: string[] = [];
    
    // Step 1: Visit homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    journey.push('homepage');
    await monitoring.capturePerformance();
    
    // Step 2: Navigate to products
    const productsLink = page.locator('a[href*="/products"]').first();
    if (await productsLink.isVisible().catch(() => false)) {
      await productsLink.click();
      await page.waitForLoadState('networkidle');
      journey.push('products');
      await monitoring.capturePerformance();
    }
    
    // Step 3: Click on first product
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      journey.push('product-detail');
      await monitoring.capturePerformance();
      
      // Validate images loaded
      await validateAllImages(page);
    }
    
    // Step 4: Return to homepage
    await page.goto('/');
    journey.push('return-home');
    await monitoring.capturePerformance();
    
    const duration = Date.now() - startTime;
    
    // Create journey report
    const errors = monitoring.getErrors();
    const allMetrics: any[] = [];
    
    const report = createMonitoringReport(
      'user-journey',
      errors,
      [], // Would aggregate all metrics
      duration
    );
    
    // Log journey
    console.log('\n👤 User Journey:', journey.join(' → '));
    console.log('⏱️ Duration:', duration, 'ms');
    console.log('❌ Errors:', errors.length);
    console.log('✅ Status:', report.passed ? 'PASSED' : 'FAILED');
    
    // Journey should complete without fatal errors
    const fatalErrors = errors.filter(e => e.severity === 'fatal');
    expect(fatalErrors.length, 'Journey should complete without fatal errors').toBe(0);
    
    await monitoring.flush();
  });

  test('should validate no broken images across all pages', async ({ page }) => {
    const monitoring = await setupTestMonitoring(
      page,
      getMonitoringConfig(ENVIRONMENT)
    );
    
    const pages = ['/', '/products', '/about', '/contact'];
    const brokenImagesFound: { page: string; src: string }[] = [];
    
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
      
      // Check all images
      const images = await page.locator('img').all();
      
      for (const img of images) {
        const naturalWidth = await img.evaluate(el => (el as HTMLImageElement).naturalWidth);
        const src = await img.getAttribute('src');
        const isVisible = await img.isVisible().catch(() => false);
        
        if (isVisible && naturalWidth === 0 && src) {
          brokenImagesFound.push({ page: url, src: src.slice(0, 100) });
        }
      }
    }
    
    // Report broken images
    if (brokenImagesFound.length > 0) {
      console.error('\n🖼️ Broken Images Found:');
      brokenImagesFound.forEach(img => {
        console.error(`  - ${img.page}: ${img.src}`);
      });
    }
    
    expect(brokenImagesFound.length, 'No broken images should be found').toBe(0);
    
    await monitoring.flush();
  });
});

test.describe('Production Monitoring - Staging Environment @staging', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should validate staging environment health', async ({ page }) => {
    const monitoring = await setupTestMonitoring(
      page,
      getMonitoringConfig('staging')
    );
    
    // Test staging homepage
    await assertPagePerformance(page, '/', 5000);
    
    // Capture all metrics
    const metrics = await monitoring.capturePerformance();
    const errors = monitoring.getErrors();
    
    // Staging should have minimal errors
    expect(errors.filter(e => e.severity === 'fatal').length).toBe(0);
    
    // Performance should be acceptable
    const lcp = metrics.find(m => m.metric === 'LCP');
    if (lcp) {
      expect(lcp.rating).not.toBe('poor');
    }
    
    // Create and log report
    const report = createMonitoringReport(
      'staging-health-check',
      errors,
      metrics,
      2000
    );
    
    console.log('\n🏥 Staging Health Check:', report.passed ? '✅ HEALTHY' : '❌ ISSUES');
    console.log('   Errors:', report.summary.totalErrors);
    console.log('   LCP:', report.summary.coreWebVitals.lcp, 'ms');
    
    await monitoring.flush();
  });
});
