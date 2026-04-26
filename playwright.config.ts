import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Saman Prefab E2E Testing
 * 
 * This configuration covers:
 * - Auth flows (login/logout)
 * - Admin dashboard UI
 * - Product creation and editing
 * - Product detail pages (PDP)
 * - Design validation
 * - API validation
 * 
 * Screenshots and videos are enabled for debugging.
 */

export default defineConfig({
  testDir: './e2e',
  
  /* Global setup and teardown */
  globalSetup: require.resolve('./e2e/global-setup'),
  globalTeardown: require.resolve('./e2e/global-teardown'),
  
  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential to avoid conflicts
  
  /* Fail the build on CI if you accidentally left test.only */
  forbidOnly: !!process.env.CI,
  
  /* Retry flaky tests - helps with timing issues */
  retries: process.env.CI ? 2 : 1,
  
  /* Workers - use 1 for stability */
  workers: 1,
  
  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'e2e-results.json' }]
  ],
  
  /* Shared settings for all projects */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying failed tests */
    trace: 'on-first-retry',
    
    /* Capture screenshots on failure AND on success for verification */
    screenshot: 'on',
    
    /* Record video for all tests */
    video: 'on',
    
    /* Action timeout */
    actionTimeout: 10000,
    
    /* Navigation timeout */
    navigationTimeout: 30000,
    
    /* Viewport size */
    viewport: { width: 1280, height: 720 },
    
    /* Visual regression settings */
    snapshotDir: './e2e/snapshots',
  },
  
  /* Visual regression configuration - ENTERPRISE GRADE */
  expect: {
    /* Maximum time to wait for expectations */
    timeout: 10000,
    /* Visual comparison settings - enterprise defaults */
    toHaveScreenshot: {
      /* Allow up to 1% pixel difference for anti-aliasing/font rendering */
      maxDiffPixelRatio: 0.01,
      /* Per-pixel threshold (higher = more tolerance) */
      threshold: 0.3,
      /* Use CSS pixels for cross-device consistency */
      scale: 'css',
      /* Disable animations for stable screenshots */
      animations: 'disabled',
      /* Stabilize before screenshot */
      caret: 'hide',
    },
    /* Snapshot comparison for non-image data */
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.01,
    },
  },
  
  /* Snapshot approval flow - only update via env flag */
  updateSnapshots: process.env.SNAPSHOT_UPDATE === 'approved' ? 'all' : 'none',

  /* Configure projects for major browsers and environments */
  projects: [
    {
      name: 'chromium-local',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.STAGING_URL || 'http://localhost:3000',
        launchOptions: {
          args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
        },
      },
    },
    
    {
      name: 'chromium-staging',
      use: { 
        ...devices['Desktop Chrome'],
        baseURL: process.env.STAGING_URL || 'https://staging.samanprefab.com',
      },
      // Only run staging tests in CI or when explicitly requested
      grep: process.env.RUN_STAGING_TESTS ? /.*/ : /@staging/,
    },
    
    {
      name: 'chromium-mobile',
      use: { 
        ...devices['iPhone 14'],
      },
    },
    
    // Network throttling profiles for real-world testing
    {
      name: 'chromium-slow-3g',
      use: { 
        ...devices['Desktop Chrome'],
        // Simulate Slow 3G: ~400 Kbps down, ~400 Kbps up, 2000ms RTT
        launchOptions: {
          args: ['--force-fieldtrials=*NetworkQualityEstimator/Enabled/'],
        },
        contextOptions: {
          // Will apply via CDP in test setup
        },
      },
    },
    
    {
      name: 'chromium-fast-3g',
      use: { 
        ...devices['Desktop Chrome'],
        // Simulate Fast 3G: ~1.6 Mbps down, ~768 Kbps up, 562ms RTT
      },
    },
    
    {
      name: 'chromium-offline',
      use: { 
        ...devices['Desktop Chrome'],
        // Offline mode testing
      },
    },
    
    // Firefox and WebKit can be enabled if needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* Run local dev server before starting tests */
  webServer: {
    command: 'cd apps/web && npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
  
  /* Output directory for test artifacts */
  outputDir: 'test-results/',
});
