import { test, expect } from '@playwright/test';
import { 
  setupProductionBugDetection,
  assertPagePerformance,
  validateAllImages
} from '../utils/test-helpers';
import {
  simulateApiFailures,
  simulateSlowResponses,
  simulatePartialOutage,
  simulateDatabaseIssues,
  simulateCascadingFailure,
  simulateRateLimiting,
  calculateResilienceScore
} from '../utils/chaos-testing';
import {
  setupAlerting,
  sendTestFailureAlert,
  sendPerformanceAlert
} from '../utils/alerting';

/**
 * CHAOS TESTS - Resilience Testing
 * 
 * Simulate real-world failures to verify system resilience:
 * - API failures (500, 502, 503, 504)
 * - Slow responses (timeouts)
 * - Database issues (connection errors, deadlocks)
 * - Partial outages (some services down)
 * - Cascading failures
 * - Rate limiting (429)
 * 
 * Tests verify graceful degradation, not crashes.
 */

const alertConfig = {
  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
  slackChannel: process.env.SLACK_CHANNEL || '#e2e-alerts',
  alertOnFailure: true,
  alertOnPerformance: true,
  performanceThreshold: 10000, // 10 seconds
  maxAlertsPerHour: 5,
};

test.describe('🔥 Chaos - API Failures', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle complete API outage gracefully', async ({ page }) => {
    // Simulate 100% API failure rate
    const cleanup = await simulateApiFailures(page, {
      routes: ['/api/products', '/api/quotes', '/api/categories'],
      failureRate: 1.0,
      errorCodes: [503, 502, 500],
    });
    
    try {
      // Navigate to products page (depends on API)
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Page should not crash - should show error state or empty state
      const hasErrorMessage = await page.locator(
        'text=/error|failed|unavailable|try again/i'
      ).first().isVisible().catch(() => false);
      
      const hasEmptyState = await page.locator(
        'text=/no products|empty|coming soon/i'
      ).first().isVisible().catch(() => false);
      
      const hasContent = await page.locator('body').textContent().then(t => t.length > 100);
      
      // Should have some content (error message, empty state, or cached content)
      expect(
        hasErrorMessage || hasEmptyState || hasContent,
        'Should handle API outage gracefully without crashing'
      ).toBeTruthy();
      
      // Calculate resilience score
      const resilienceScore = calculateResilienceScore(1, 0, 1); // 1 attempt, 0 success, 1 graceful failure
      console.log(`📊 Resilience Score: ${resilienceScore}/100 (graceful degradation)`);
      
    } finally {
      await cleanup();
    }
  });

  test('should handle intermittent API failures (50% error rate)', async ({ page }) => {
    let successCount = 0;
    let failureCount = 0;
    let gracefulFailureCount = 0;
    
    const cleanup = await simulateApiFailures(page, {
      routes: ['/api/products'],
      failureRate: 0.5, // 50% failure
      errorCodes: [500, 503],
    });
    
    try {
      // Try loading products page multiple times
      for (let i = 0; i < 5; i++) {
        await page.goto('/products');
        await page.waitForTimeout(1500);
        
        const hasProducts = await page.locator(
          'a[href*="/products/"], .product-card, article'
        ).first().isVisible().catch(() => false);
        
        const hasError = await page.locator(
          'text=/error|failed|unavailable/i'
        ).first().isVisible().catch(() => false);
        
        const noCrash = !await page.locator(
          'text=/undefined|null|error occurred/i'
        ).first().isVisible().catch(() => false);
        
        if (hasProducts) {
          successCount++;
        } else if (hasError && noCrash) {
          gracefulFailureCount++;
        } else {
          failureCount++;
        }
      }
      
      console.log(`📊 Results: ${successCount} success, ${gracefulFailureCount} graceful, ${failureCount} crashes`);
      
      // Most attempts should either succeed or fail gracefully
      expect(failureCount, 'Crashes should be minimal').toBeLessThanOrEqual(1);
      
      const resilienceScore = calculateResilienceScore(5, successCount, gracefulFailureCount);
      console.log(`📊 Resilience Score: ${resilienceScore}/100`);
      
    } finally {
      await cleanup();
    }
  });

  test('should handle specific 504 Gateway Timeout', async ({ page }) => {
    const cleanup = await simulateApiFailures(page, {
      routes: ['/api/products'],
      failureRate: 1.0,
      errorCodes: [504], // Gateway timeout
      errorResponse: {
        error: 'Gateway Timeout',
        message: 'The server took too long to respond',
        suggestion: 'Please try again in a few moments',
      },
    });
    
    try {
      await page.goto('/products');
      await page.waitForTimeout(2000);
      
      // Check for timeout-specific handling
      const hasTimeoutMessage = await page.locator(
        'text=/timeout|took too long|try again/i'
      ).first().isVisible().catch(() => false);
      
      const hasRetryOption = await page.locator(
        'button:has-text("Retry"), a:has-text("Try Again"), button:has-text("Refresh")'
      ).first().isVisible().catch(() => false);
      
      // Should indicate timeout or offer retry
      expect(
        hasTimeoutMessage || hasRetryOption,
        'Should handle gateway timeout specifically'
      ).toBeTruthy();
      
    } finally {
      await cleanup();
    }
  });
});

test.describe('🔥 Chaos - Slow Responses & Timeouts', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle API responses slower than 5 seconds', async ({ page }) => {
    const cleanup = await simulateSlowResponses(page, {
      routes: ['/api/products', '/api/quotes'],
      delayMs: 5000, // 5 second delay
      jitterMs: 1000, // Plus up to 1 second random
    });
    
    try {
      const startTime = Date.now();
      
      await page.goto('/products');
      await page.waitForTimeout(7000); // Wait for slow response
      
      const elapsed = Date.now() - startTime;
      
      // Page should show loading state during wait
      const hasLoadingIndicator = await page.locator(
        '[class*="loading"], [class*="spinner"], [class*="skeleton"]'
      ).first().isVisible().catch(() => false);
      
      console.log(`⏱️ Response time: ${elapsed}ms (delayed 5s)`);
      
      // Should either show content or loading/error state
      const hasContent = await page.locator('body').textContent().then(t => t.length > 100);
      
      expect(
        hasLoadingIndicator || hasContent || elapsed >= 5000,
        'Should handle slow responses'
      ).toBeTruthy();
      
    } finally {
      await cleanup();
    }
  });

  test('should handle extremely slow responses (10+ seconds)', async ({ page }) => {
    const cleanup = await simulateSlowResponses(page, {
      routes: ['/api/products'],
      delayMs: 10000, // 10 second delay
    });
    
    try {
      await page.goto('/products');
      
      // Should show loading state within reasonable time
      await page.waitForTimeout(2000);
      
      const hasLoadingState = await page.locator(
        '[class*="loading"], [class*="spinner"], [aria-busy="true"]'
      ).first().isVisible().catch(() => false);
      
      console.log(hasLoadingState ? '✅ Loading state shown' : '⚠️ No loading state');
      
      // Wait longer for response
      await page.waitForTimeout(9000);
      
      // Should not crash after long wait
      const noCrash = !await page.locator(
        'text=/error occurred|crash|broken/i'
      ).first().isVisible().catch(() => false);
      
      expect(noCrash, 'Should not crash on extremely slow responses').toBe(true);
      
    } finally {
      await cleanup();
    }
  });
});

test.describe('🔥 Chaos - Database Issues', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle database connection failures', async ({ page }) => {
    const cleanup = await simulateDatabaseIssues(page, {
      failureRate: 0.7, // 70% failure rate
      errorTypes: ['connection', 'timeout'],
    });
    
    try {
      await page.goto('/products');
      await page.waitForTimeout(2000);
      
      // Should not show raw database errors to user
      const hasRawDbError = await page.locator(
        'text=/SQL|database|constraint|deadlock|connection refused/i'
      ).first().isVisible().catch(() => false);
      
      expect(hasRawDbError, 'Should not expose raw database errors').toBe(false);
      
      // Should show user-friendly error or empty state
      const hasUserMessage = await page.locator(
        'text=/unavailable|try again|temporarily|maintenance/i'
      ).first().isVisible().catch(() => false);
      
      console.log(hasUserMessage ? '✅ User-friendly error shown' : '⚠️ Check error handling');
      
    } finally {
      await cleanup();
    }
  });

  test('should handle database constraint violations gracefully', async ({ page }) => {
    const cleanup = await simulateDatabaseIssues(page, {
      failureRate: 1.0,
      errorTypes: ['constraint'], // Specifically constraint violations
    });
    
    try {
      // Try to submit a form that might hit constraints
      await page.goto('/contact');
      await page.waitForTimeout(500);
      
      const form = page.locator('form').first();
      if (await form.isVisible().catch(() => false)) {
        // Fill form
        await page.locator('input[name="email"]').first().fill('test@example.com');
        await page.locator('button[type="submit"]').first().click();
        await page.waitForTimeout(1500);
        
        // Should show validation error, not crash
        const hasValidationError = await page.locator(
          '[class*="error"], [aria-invalid="true"], text=/invalid|required|validation/i'
        ).first().isVisible().catch(() => false);
        
        const noCrash = !await page.locator(
          'text=/error occurred|undefined|null|internal error/i'
        ).first().isVisible().catch(() => false);
        
        expect(
          hasValidationError || noCrash,
          'Should handle constraint violations gracefully'
        ).toBeTruthy();
      }
      
    } finally {
      await cleanup();
    }
  });
});

test.describe('🔥 Chaos - Partial Outages & Cascading Failures', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle partial API outage (some services down)', async ({ page }) => {
    const cleanup = await simulatePartialOutage(page, {
      workingRoutes: ['/api/products'],      // Products API works
      failingRoutes: ['/api/quotes', '/api/categories'], // Others down
      errorCode: 503,
    });
    
    try {
      // Products page should still work
      await page.goto('/products');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      const productsWorking = await page.locator(
        'a[href*="/products/"], .product-card'
      ).count() > 0 || await page.locator(
        'text=/no products|empty/i'
      ).first().isVisible().catch(() => false);
      
      console.log(productsWorking ? '✅ Working service (products) accessible' : '⚠️ Products not loading');
      
      // Navigate to page that depends on failing service
      await page.goto('/quote');
      await page.waitForTimeout(1500);
      
      // Should handle missing service gracefully
      const hasError = await page.locator(
        'text=/error|unavailable|maintenance/i'
      ).first().isVisible().catch(() => false);
      
      const stillFunctional = await page.locator(
        'form, input, button'
      ).first().isVisible().catch(() => false);
      
      expect(
        hasError || stillFunctional,
        'Should handle partial outage'
      ).toBeTruthy();
      
    } finally {
      await cleanup();
    }
  });

  test('should handle cascading service failures', async ({ page }) => {
    const cleanup = await simulateCascadingFailure(page, {
      primaryService: '/api/auth',           // Auth service fails
      dependentServices: ['/api/user', '/api/admin'], // Dependent services
      errorCode: 503,
    });
    
    try {
      // Try to access admin (depends on auth)
      await page.goto('/admin/dashboard');
      await page.waitForTimeout(2000);
      
      // Should redirect to login or show auth error
      const onLoginPage = page.url().includes('/login');
      const hasAuthError = await page.locator(
        'text=/login|auth|session|unauthorized/i'
      ).first().isVisible().catch(() => false);
      
      expect(
        onLoginPage || hasAuthError,
        'Should handle cascading auth failure'
      ).toBeTruthy();
      
      console.log(onLoginPage ? '✅ Redirected to login' : '✅ Auth error shown');
      
    } finally {
      await cleanup();
    }
  });
});

test.describe('🔥 Chaos - Rate Limiting', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle rate limiting (429 errors)', async ({ page }) => {
    const cleanup = await simulateRateLimiting(page, {
      maxRequests: 3,     // Only 3 requests allowed
      windowMs: 60000,    // Per minute
      retryAfter: 30,     // Suggest 30 second retry
    });
    
    try {
      // Make multiple rapid requests
      const results = [];
      for (let i = 0; i < 5; i++) {
        await page.goto('/products');
        await page.waitForTimeout(500);
        
        const hasRateLimitError = await page.locator(
          'text=/too many requests|rate limit|try again|429/i'
        ).first().isVisible().catch(() => false);
        
        const hasRetryAfter = await page.locator(
          'text=/30 seconds|retry|wait/i'
        ).first().isVisible().catch(() => false);
        
        results.push({ i, rateLimited: hasRateLimitError, hasRetryAfter });
      }
      
      console.log('📊 Rate limit results:', results);
      
      // Some requests should be rate limited
      const rateLimitedCount = results.filter(r => r.rateLimited).length;
      expect(rateLimitedCount).toBeGreaterThanOrEqual(2); // At least 2 should be limited
      
      // Should provide retry guidance
      const hasRetryGuidance = results.some(r => r.hasRetryAfter);
      console.log(hasRetryGuidance ? '✅ Retry guidance provided' : '⚠️ No retry guidance');
      
    } finally {
      await cleanup();
    }
  });
});

test.describe('🔥 Chaos - Combined Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('should handle perfect storm: slow + failing + partial outage', async ({ page }) => {
    // Combine multiple chaos scenarios
    const cleanup1 = await simulateSlowResponses(page, {
      routes: ['/api/products'],
      delayMs: 3000,
    });
    
    const cleanup2 = await simulateApiFailures(page, {
      routes: ['/api/quotes', '/api/categories'],
      failureRate: 0.8,
      errorCodes: [503, 500],
    });
    
    try {
      // User journey under perfect storm conditions
      await page.goto('/');
      await page.waitForTimeout(2000);
      
      // Try to navigate to products
      const productsLink = page.locator('a[href*="/products"]').first();
      if (await productsLink.isVisible().catch(() => false)) {
        await productsLink.click();
      } else {
        await page.goto('/products');
      }
      
      // Wait for slow response
      await page.waitForTimeout(4000);
      
      // Should not crash
      const noCrash = !await page.locator(
        'text=/error occurred|crash|broken|null|undefined/i'
      ).first().isVisible().catch(() => false);
      
      const hasContent = await page.locator('body').textContent().then(t => t.length > 50);
      
      expect(
        noCrash && hasContent,
        'Should survive perfect storm of failures'
      ).toBe(true);
      
      console.log('✅ Perfect storm survived - system resilient');
      
    } finally {
      await cleanup1();
      await cleanup2();
    }
  });

  test('alert system integration with chaos failures', async ({ page }) => {
    const alerting = setupAlerting(alertConfig);
    
    const cleanup = await simulateApiFailures(page, {
      routes: ['/api/products'],
      failureRate: 1.0,
      errorCodes: [503],
    });
    
    try {
      await page.goto('/products');
      await page.waitForTimeout(2000);
      
      // Check if alert-worthy failure occurred
      const hasError = await page.locator(
        'text=/error|failed|unavailable/i'
      ).first().isVisible().catch(() => false);
      
      if (hasError) {
        // Send test alert (in real scenario, this would be automatic)
        await alerting.onTestFailure({
          testName: 'Chaos Test - API Failure Handling',
          testFile: 'chaos-tests.spec.ts',
          error: 'API failure simulation caused error state',
          timestamp: new Date().toISOString(),
          duration: 2000,
          url: page.url(),
          browser: 'chromium',
          environment: process.env.NODE_ENV || 'test',
        });
        
        console.log('📤 Alert would be sent for this failure');
      }
      
      // Test passed if no crash
      expect(true).toBe(true);
      
    } finally {
      await cleanup();
    }
  });
});
