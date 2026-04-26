import { Page, BrowserContext } from '@playwright/test';

/**
 * CHAOS TESTING UTILITIES
 * 
 * Simulate real-world failures and edge cases:
 * - API failures (500, 502, 503, 504)
 * - Timeouts (slow responses)
 * - Database issues (connection errors)
 * - Network interruptions
 * - Partial failures
 */

export interface ChaosScenario {
  name: string;
  description: string;
  apply: (page: Page) => Promise<() => Promise<void>>;
}

export interface ChaosConfig {
  failureRate: number; // 0-1 probability of failure
  delayMs: number;     // Response delay
  errorCode: number;   // HTTP error code to return
}

/**
 * Simulate API failures with specific error codes
 */
export async function simulateApiFailures(
  page: Page,
  config: {
    routes: string[];           // API routes to intercept
    failureRate: number;        // 0-1 probability
    errorCodes: number[];       // [500, 502, 503, 504]
    errorResponse?: object;
  }
): Promise<() => Promise<void>> {
  let requestCount = 0;
  let failureCount = 0;
  
  await page.route(`**/*(${config.routes.join('|')})*`, async (route) => {
    requestCount++;
    
    if (Math.random() < config.failureRate) {
      failureCount++;
      const errorCode = config.errorCodes[Math.floor(Math.random() * config.errorCodes.length)];
      
      console.log(`💥 Chaos: Failing ${route.request().url()} with ${errorCode}`);
      
      await route.fulfill({
        status: errorCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config.errorResponse || {
          error: `Simulated ${errorCode} error`,
          message: 'Chaos testing failure',
          chaos_test: true,
        }),
      });
    } else {
      await route.continue();
    }
  });
  
  return async () => {
    await page.unroute(`**/*(${config.routes.join('|')})*`);
    console.log(`📊 Chaos Results: ${failureCount}/${requestCount} requests failed (${(failureCount/requestCount*100).toFixed(1)}%)`);
  };
}

/**
 * Simulate slow API responses (timeout testing)
 */
export async function simulateSlowResponses(
  page: Page,
  config: {
    routes: string[];
    delayMs: number;      // Fixed delay
    jitterMs?: number;    // Random additional delay (0-jitterMs)
  }
): Promise<() => Promise<void>> {
  let totalDelay = 0;
  let requestCount = 0;
  
  await page.route(`**/*(${config.routes.join('|')})*`, async (route) => {
    requestCount++;
    const jitter = config.jitterMs ? Math.random() * config.jitterMs : 0;
    const delay = config.delayMs + jitter;
    totalDelay += delay;
    
    console.log(`🐌 Chaos: Delaying ${route.request().url()} by ${delay.toFixed(0)}ms`);
    
    await route.fulfill({
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'X-Chaos-Delay': `${delay}`,
      },
      body: JSON.stringify({
        delayed: true,
        delayMs: delay,
        chaos_test: true,
      }),
    });
  });
  
  return async () => {
    await page.unroute(`**/*(${config.routes.join('|')})*`);
    const avgDelay = requestCount > 0 ? totalDelay / requestCount : 0;
    console.log(`📊 Slow Response Results: Avg delay ${avgDelay.toFixed(0)}ms across ${requestCount} requests`);
  };
}

/**
 * Simulate partial API failures (some routes work, some don't)
 */
export async function simulatePartialOutage(
  page: Page,
  config: {
    workingRoutes: string[];      // Routes that should succeed
    failingRoutes: string[];    // Routes that should fail
    errorCode: number;
  }
): Promise<() => Promise<void>> {
  let workingCount = 0;
  let failingCount = 0;
  
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const isFailing = config.failingRoutes.some(r => url.includes(r));
    
    if (isFailing) {
      failingCount++;
      console.log(`💥 Chaos: Route ${url} in partial outage`);
      
      await route.fulfill({
        status: config.errorCode,
        body: JSON.stringify({
          error: 'Service temporarily unavailable',
          chaos_test: true,
        }),
      });
    } else {
      workingCount++;
      await route.continue();
    }
  });
  
  return async () => {
    await page.unroute('**/api/**');
    console.log(`📊 Partial Outage: ${workingCount} working, ${failingCount} failing`);
  };
}

/**
 * Simulate database connection issues (intermittent failures)
 */
export async function simulateDatabaseIssues(
  page: Page,
  config: {
    failureRate: number;
    errorTypes: ('timeout' | 'connection' | 'deadlock' | 'constraint')[];
  }
): Promise<() => Promise<void>> {
  const errorResponses: Record<string, { status: number; body: object }> = {
    timeout: {
      status: 504,
      body: { error: 'Database query timeout', code: 'DB_TIMEOUT' },
    },
    connection: {
      status: 503,
      body: { error: 'Database connection failed', code: 'DB_CONN_ERROR' },
    },
    deadlock: {
      status: 500,
      body: { error: 'Database deadlock detected', code: 'DB_DEADLOCK' },
    },
    constraint: {
      status: 400,
      body: { error: 'Database constraint violation', code: 'DB_CONSTRAINT' },
    },
  };
  
  await page.route('**/api/**', async (route) => {
    if (Math.random() < config.failureRate) {
      const errorType = config.errorTypes[Math.floor(Math.random() * config.errorTypes.length)];
      const error = errorResponses[errorType];
      
      console.log(`💥 Chaos: Database ${errorType} on ${route.request().url()}`);
      
      await route.fulfill({
        status: error.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...error.body, chaos_test: true }),
      });
    } else {
      await route.continue();
    }
  });
  
  return async () => {
    await page.unroute('**/api/**');
  };
}

/**
 * Simulate cascading failures (one service down affects others)
 */
export async function simulateCascadingFailure(
  page: Page,
  config: {
    primaryService: string;     // Service that fails
    dependentServices: string[]; // Services that should also fail
    errorCode: number;
  }
): Promise<() => Promise<void>> {
  let primaryFailures = 0;
  let dependentFailures = 0;
  
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const isPrimary = url.includes(config.primaryService);
    const isDependent = config.dependentServices.some(s => url.includes(s));
    
    if (isPrimary || isDependent) {
      if (isPrimary) primaryFailures++;
      if (isDependent) dependentFailures++;
      
      console.log(`💥 Chaos: Cascading failure affecting ${isPrimary ? 'primary' : 'dependent'}: ${url}`);
      
      await route.fulfill({
        status: config.errorCode,
        body: JSON.stringify({
          error: isPrimary ? 'Primary service failure' : 'Dependent service failure',
          service: isPrimary ? config.primaryService : 'dependent',
          chaos_test: true,
        }),
      });
    } else {
      await route.continue();
    }
  });
  
  return async () => {
    await page.unroute('**/api/**');
    console.log(`📊 Cascading Failure: ${primaryFailures} primary, ${dependentFailures} dependent`);
  };
}

/**
 * Simulate API rate limiting
 */
export async function simulateRateLimiting(
  page: Page,
  config: {
    maxRequests: number;    // Requests allowed
    windowMs: number;     // Time window
    retryAfter?: number;  // Seconds to wait
  }
): Promise<() => Promise<void>> {
  let requestCount = 0;
  const startTime = Date.now();
  
  await page.route('**/api/**', async (route) => {
    const elapsed = Date.now() - startTime;
    requestCount++;
    
    // Reset counter after window
    if (elapsed > config.windowMs) {
      requestCount = 1;
    }
    
    if (requestCount > config.maxRequests) {
      console.log(`⏱️ Chaos: Rate limit hit (${requestCount}/${config.maxRequests})`);
      
      await route.fulfill({
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': `${config.retryAfter || 60}`,
        },
        body: JSON.stringify({
          error: 'Too many requests',
          retry_after: config.retryAfter || 60,
          chaos_test: true,
        }),
      });
    } else {
      await route.continue();
    }
  });
  
  return async () => {
    await page.unroute('**/api/**');
    console.log(`📊 Rate Limit: ${requestCount} requests (limit: ${config.maxRequests})`);
  };
}

/**
 * Chaos test wrapper - runs test with chaos scenario
 */
export async function withChaos<T>(
  page: Page,
  chaosScenario: () => Promise<() => Promise<void>>,
  testFn: () => Promise<T>
): Promise<{ result: T; cleanup: () => Promise<void> }> {
  const cleanup = await chaosScenario();
  
  try {
    const result = await testFn();
    return { result, cleanup };
  } finally {
    await cleanup();
  }
}

/**
 * Predefined chaos scenarios
 */
export const ChaosScenarios = {
  apiDown: (routes: string[] = ['/api/products', '/api/quotes']) => 
    simulateApiFailures.bind(null, { routes, failureRate: 1.0, errorCodes: [503] }),
  
  apiIntermittent: (routes: string[] = ['/api/products']) => 
    simulateApiFailures.bind(null, { routes, failureRate: 0.5, errorCodes: [500, 502, 503] }),
  
  slowApi: (routes: string[] = ['/api/products'], delayMs: number = 5000) => 
    simulateSlowResponses.bind(null, { routes, delayMs }),
  
  databaseIssues: (failureRate: number = 0.3) => 
    simulateDatabaseIssues.bind(null, { failureRate, errorTypes: ['timeout', 'connection'] }),
  
  partialOutage: (working: string[], failing: string[]) => 
    simulatePartialOutage.bind(null, { workingRoutes: working, failingRoutes: failing, errorCode: 503 }),
  
  rateLimited: (maxRequests: number = 5) => 
    simulateRateLimiting.bind(null, { maxRequests, windowMs: 60000, retryAfter: 30 }),
};

/**
 * Measure resilience score
 */
export function calculateResilienceScore(
  totalAttempts: number,
  successfulAttempts: number,
  gracefulFailures: number
): number {
  // Score 0-100 based on success rate and graceful handling
  const successRate = successfulAttempts / totalAttempts;
  const gracefulRate = gracefulFailures / (totalAttempts - successfulAttempts);
  
  return Math.round((successRate * 60 + gracefulRate * 40) * 100);
}
