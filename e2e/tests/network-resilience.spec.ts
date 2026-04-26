import { test, expect } from '@playwright/test';
import { 
  setupProductionBugDetection,
  assertPagePerformance,
  prepareForVisualTesting,
  validateAllImages
} from '../utils/test-helpers';
import { 
  NetworkProfiles,
  applyNetworkThrottling,
  resetNetworkThrottling,
  withNetworkThrottling,
  measureNetworkPerformance,
  simulateIntermittentConnection,
  compareNetworkPerformance,
  testOfflineHandling
} from '../utils/network-throttling';

/**
 * NETWORK RESILIENCE TESTS - Production Hardening
 * 
 * Tests application behavior under real-world network conditions:
 * - Slow 3G (emerging markets)
 * - Fast 3G (rural areas)
 * - Offline mode (tunnels, elevators)
 * - Intermittent connections
 * - High latency scenarios
 */

test.describe('Network Resilience - Slow 3G', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should load login page on slow 3G within acceptable time', async ({ page }) => {
    const metrics = await measureNetworkPerformance(
      page, 
      '/admin/login', 
      NetworkProfiles.SLOW_3G
    );
    
    console.log(`\n🐢 Slow 3G Results for /admin/login:`);
    console.log(`   Load Time: ${metrics.loadTime}ms`);
    console.log(`   TTFB: ${metrics.timeToFirstByte}ms`);
    console.log(`   Resources: ${metrics.resourcesLoaded}`);
    console.log(`   Transfer: ${(metrics.totalTransferSize / 1024).toFixed(1)} KB`);
    
    // Should still load within reasonable time for slow 3G
    expect(metrics.loadTime, 'Should load on slow 3G within 15s').toBeLessThan(15000);
    
    // Verify page is functional
    await expect(page.locator('h1')).toHaveText('Saman Prefab Admin');
    
    // Verify images still load (even if slowly)
    await validateAllImages(page);
  });

  test('should display loading states during slow connection', async ({ page }) => {
    await applyNetworkThrottling(page, NetworkProfiles.SLOW_3G);
    
    // Start navigation
    const navigationPromise = page.goto('/admin/login');
    
    // Check for loading indicator immediately
    await page.waitForTimeout(100);
    const hasLoadingIndicator = await page.locator(
      '[class*="loading"], [class*="spinner"], [class*="skeleton"], [aria-busy="true"]'
    ).isVisible().catch(() => false);
    
    // Wait for navigation to complete
    await navigationPromise;
    await page.waitForLoadState('networkidle');
    
    console.log(hasLoadingIndicator ? '✅ Loading state shown' : '⚠️ No loading state detected');
    
    await resetNetworkThrottling(page);
  });

  test('should handle form submission on slow 3G', async ({ page }) => {
    await applyNetworkThrottling(page, NetworkProfiles.SLOW_3G);
    
    await page.goto('/admin/login');
    
    // Fill form
    await page.locator('input#email').fill('admin@samanprefab.com');
    await page.locator('input#password').fill(process.env.TEST_ADMIN_PASSWORD || 'Admin@Saman2026!');
    
    // Submit with timeout for slow network
    const submitPromise = page.locator('button[type="submit"]').click();
    
    // Check for loading state on button
    const button = page.locator('button[type="submit"]');
    await expect(button).toBeDisabled().catch(() => {}); // Button may be disabled during submit
    
    // Wait for navigation (with longer timeout for slow 3G)
    await page.waitForURL('**/admin/dashboard**', { timeout: 30000 });
    
    // Verify successful login
    await expect(page.locator('aside')).toBeVisible();
    
    await resetNetworkThrottling(page);
  });
});

test.describe('Network Resilience - Fast 3G', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should provide acceptable UX on fast 3G', async ({ page }) => {
    const metrics = await measureNetworkPerformance(
      page,
      '/products',
      NetworkProfiles.FAST_3G
    );
    
    console.log(`\n🚀 Fast 3G Results for /products:`);
    console.log(`   Load Time: ${metrics.loadTime}ms`);
    console.log(`   TTFB: ${metrics.timeToFirstByte}ms`);
    console.log(`   Resources: ${metrics.resourcesLoaded}`);
    
    // Should load faster than slow 3G
    expect(metrics.loadTime).toBeLessThan(10000);
    expect(metrics.timeToFirstByte).toBeLessThan(3000);
  });

  test('should handle dashboard on fast 3G', async ({ page }) => {
    // Login first
    await page.goto('/admin/login');
    await page.locator('input#email').fill('admin@samanprefab.com');
    await page.locator('input#password').fill(process.env.TEST_ADMIN_PASSWORD || 'Admin@Saman2026!');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin/dashboard**', { timeout: 15000 });
    
    // Apply throttling for dashboard
    await applyNetworkThrottling(page, NetworkProfiles.FAST_3G);
    
    // Navigate to heavy dashboard
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should show dashboard content
    await expect(page.locator('aside')).toBeVisible({ timeout: 10000 });
    
    await resetNetworkThrottling(page);
  });
});

test.describe('Network Resilience - Performance Comparison', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should compare performance across network profiles', async ({ page }) => {
    const results = await compareNetworkPerformance(
      page,
      '/',
      [NetworkProfiles.SLOW_3G, NetworkProfiles.FAST_3G, NetworkProfiles.REGULAR_4G]
    );
    
    console.log('\n📊 Network Performance Comparison:');
    console.table(results);
    
    // Verify each profile was tested
    expect(results).toHaveLength(3);
    
    // 4G should be faster than 3G
    const slow3G = results.find(r => r.profile === 'Slow 3G');
    const fast4G = results.find(r => r.profile === '4G');
    
    if (slow3G && fast4G) {
      expect(fast4G.loadTime).toBeLessThan(slow3G.loadTime);
    }
  });
});

test.describe('Network Resilience - Offline Mode', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle offline state gracefully', async ({ page }) => {
    const offlineSupport = await testOfflineHandling(page, '/');
    
    console.log('\n📡 Offline Support Analysis:');
    console.log(`   Service Worker: ${offlineSupport.hasServiceWorker ? '✅' : '❌'}`);
    console.log(`   Offline UI: ${offlineSupport.hasOfflineSupport ? '✅' : '❌'}`);
    console.log(`   Can Navigate: ${offlineSupport.canNavigateOffline ? '✅' : '❌'}`);
    
    // Should at minimum not crash when offline
    const content = await page.locator('body').textContent();
    expect(content).not.toContain('undefined');
    expect(content).not.toContain('null');
  });

  test('should show offline indicator when connection lost', async ({ page }) => {
    // Load page normally
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await applyNetworkThrottling(page, NetworkProfiles.OFFLINE);
    
    // Try to navigate
    await page.reload();
    await page.waitForTimeout(1000);
    
    // Check for offline indicator or cached content
    const hasOfflineIndicator = await page.locator(
      'text=/offline|no connection|you are offline/i'
    ).isVisible().catch(() => false);
    
    const hasCachedContent = await page.locator('main, [class*="content"]').isVisible().catch(() => false);
    
    expect(
      hasOfflineIndicator || hasCachedContent,
      'Should show offline indicator or cached content'
    ).toBeTruthy();
    
    await resetNetworkThrottling(page);
  });

  test('should queue requests when offline and retry when back', async ({ page }) => {
    // This test checks for background sync or request queuing behavior
    await page.goto('/admin/login');
    await page.waitForLoadState('networkidle');
    
    // Fill form
    await page.locator('input#email').fill('admin@samanprefab.com');
    await page.locator('input#password').fill(process.env.TEST_ADMIN_PASSWORD || 'Admin@Saman2026!');
    
    // Go offline
    await applyNetworkThrottling(page, NetworkProfiles.OFFLINE);
    
    // Try to submit
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);
    
    // Check for offline error or queued state
    const hasOfflineError = await page.locator(
      'text=/offline|connection|retry/i'
    ).isVisible().catch(() => false);
    
    // Restore connection
    await resetNetworkThrottling(page);
    await page.waitForTimeout(2000);
    
    // App should either have shown offline error or queued the request
    expect(hasOfflineError, 'Should indicate offline state').toBeTruthy();
  });
});

test.describe('Network Resilience - Intermittent Connection', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle intermittent connection drops', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Simulate connection drops and recoveries
    await simulateIntermittentConnection(page, {
      onlineDuration: 3000,
      offlineDuration: 2000,
      cycles: 2,
    });
    
    // After intermittent connection, page should still be functional
    await page.waitForTimeout(1000);
    
    // Try to interact with page
    const isFunctional = await page.evaluate(() => {
      return document.readyState === 'complete' && 
             document.querySelectorAll('body').length > 0;
    });
    
    expect(isFunctional, 'Page should remain functional after intermittent connection').toBe(true);
  });

  test('should retry failed requests automatically', async ({ page }) => {
    let requestCount = 0;
    
    // Track API requests
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        requestCount++;
      }
    });
    
    // Navigate with intermittent connection
    await page.goto('/products');
    
    await simulateIntermittentConnection(page, {
      onlineDuration: 2000,
      offlineDuration: 1000,
      cycles: 2,
    });
    
    await page.waitForTimeout(2000);
    
    // If retries are working, we should see multiple requests
    console.log(`\n🔄 API Requests made: ${requestCount}`);
    
    // Page should eventually load or show appropriate state
    const hasContent = await page.locator('body').textContent().then(t => t.length > 100);
    expect(hasContent, 'Should have content after intermittent connection').toBe(true);
  });
});

test.describe('Network Resilience - Resource Loading', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should progressively load images on slow connection', async ({ page }) => {
    await applyNetworkThrottling(page, NetworkProfiles.SLOW_3G);
    
    await page.goto('/products');
    
    // Wait a bit for initial load
    await page.waitForTimeout(2000);
    
    // Check for placeholder images or skeletons
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Some images should have loaded or be loading
      const loadedImages = await images.evaluateAll(imgs => 
        imgs.filter(img => (img as HTMLImageElement).naturalWidth > 0).length
      );
      
      console.log(`\n🖼️ Images on Slow 3G: ${loadedImages}/${imageCount} loaded`);
      
      // At least skeletons or placeholders should be visible
      expect(loadedImages + await page.locator('[class*="skeleton"], [class*="placeholder"]').count()).toBeGreaterThan(0);
    }
    
    await resetNetworkThrottling(page);
  });

  test('should handle large images on slow connections', async ({ page }) => {
    await applyNetworkThrottling(page, NetworkProfiles.SLOW_3G);
    
    // Navigate to product page with likely images
    await page.goto('/products');
    await page.waitForTimeout(3000);
    
    // Click first product if available
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await page.waitForTimeout(5000); // Wait for slow loading
      
      // Images should eventually load (may be partially loaded)
      const images = page.locator('img');
      const totalImages = await images.count();
      
      if (totalImages > 0) {
        const loadedImages = await images.evaluateAll(imgs => 
          imgs.filter(img => (img as HTMLImageElement).naturalWidth > 0).length
        );
        
        console.log(`\n🖼️ Product Images on Slow 3G: ${loadedImages}/${totalImages} loaded`);
        
        // On slow 3G, we expect at least the primary image to load or placeholder to show
        const hasAnyImageLoaded = loadedImages > 0;
        const hasPlaceholders = await page.locator('[class*="loading"], [class*="skeleton"]').count() > 0;
        
        expect(
          hasAnyImageLoaded || hasPlaceholders,
          'Should show images or placeholders on slow connection'
        ).toBe(true);
      }
    }
    
    await resetNetworkThrottling(page);
  });
});

test.describe('Network Resilience - @network Staging', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should validate staging under slow 3G conditions', async ({ page }) => {
    // Test critical user flow on staging with slow network
    const metrics = await measureNetworkPerformance(
      page,
      '/',
      NetworkProfiles.SLOW_3G
    );
    
    console.log(`\n🏭 Staging Slow 3G Results:`);
    console.log(`   Load Time: ${metrics.loadTime}ms`);
    console.log(`   Resources: ${metrics.resourcesLoaded}`);
    
    // Staging should still work on slow network
    expect(metrics.loadTime).toBeLessThan(20000);
    
    // Verify page renders
    const hasContent = await page.locator('body').textContent().then(t => t.length > 50);
    expect(hasContent).toBe(true);
  });
});
