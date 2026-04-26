import { Page, BrowserContext } from '@playwright/test';

/**
 * NETWORK THROTTLING UTILITIES
 * 
 * Simulate real-world network conditions for production hardening:
 * - Slow 3G: 400 Kbps down, 400 Kbps up, 2000ms RTT
 * - Fast 3G: 1.6 Mbps down, 768 Kbps up, 562ms RTT
 * - 4G/LTE: 8 Mbps down, 4 Mbps up, 85ms RTT
 * - Offline: No connectivity
 */

export interface NetworkProfile {
  name: string;
  downloadKbps: number;
  uploadKbps: number;
  latencyMs: number;
  offline: boolean;
}

export const NetworkProfiles = {
  // Real-world slow conditions
  SLOW_3G: {
    name: 'Slow 3G',
    downloadKbps: 400,
    uploadKbps: 400,
    latencyMs: 2000,
    offline: false,
  },
  
  // Emerging market conditions
  FAST_3G: {
    name: 'Fast 3G',
    downloadKbps: 1600,
    uploadKbps: 768,
    latencyMs: 562,
    offline: false,
  },
  
  // Typical mobile conditions
  REGULAR_4G: {
    name: '4G',
    downloadKbps: 8000,
    uploadKbps: 4000,
    latencyMs: 85,
    offline: false,
  },
  
  // Good WiFi
  WIFI: {
    name: 'WiFi',
    downloadKbps: 30000,
    uploadKbps: 15000,
    latencyMs: 20,
    offline: false,
  },
  
  // Offline mode
  OFFLINE: {
    name: 'Offline',
    downloadKbps: 0,
    uploadKbps: 0,
    latencyMs: 0,
    offline: true,
  },
} as const;

/**
 * Apply network throttling to a page using CDP
 */
export async function applyNetworkThrottling(
  page: Page,
  profile: NetworkProfile
): Promise<void> {
  const client = await page.context().newCDPSession(page);
  
  if (profile.offline) {
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    });
  } else {
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: profile.downloadKbps * 1024 / 8, // Convert to bytes/s
      uploadThroughput: profile.uploadKbps * 1024 / 8,
      latency: profile.latencyMs,
      connectionType: 'cellular3g',
    });
  }
  
  console.log(`🌐 Network throttled: ${profile.name} (${profile.downloadKbps} Kbps down, ${profile.latencyMs}ms latency)`);
}

/**
 * Reset network to normal conditions
 */
export async function resetNetworkThrottling(page: Page): Promise<void> {
  const client = await page.context().newCDPSession(page);
  
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: -1, // Unrestricted
    uploadThroughput: -1,
    latency: 0,
  });
  
  console.log('🌐 Network restored to normal');
}

/**
 * Test helper that applies throttling before test and resets after
 */
export async function withNetworkThrottling<T>(
  page: Page,
  profile: NetworkProfile,
  testFn: () => Promise<T>
): Promise<T> {
  await applyNetworkThrottling(page, profile);
  
  try {
    const result = await testFn();
    return result;
  } finally {
    await resetNetworkThrottling(page);
  }
}

/**
 * Measure performance under specific network conditions
 */
export async function measureNetworkPerformance(
  page: Page,
  url: string,
  profile: NetworkProfile
): Promise<{
  profile: string;
  loadTime: number;
  timeToFirstByte: number;
  timeToInteractive: number;
  resourcesLoaded: number;
  totalTransferSize: number;
}> {
  await applyNetworkThrottling(page, profile);
  
  const startTime = Date.now();
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  // Get detailed metrics
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource');
    
    const ttfb = nav.responseStart - nav.requestStart;
    const tti = nav.domInteractive - nav.startTime;
    
    let totalSize = 0;
    resources.forEach((r: any) => {
      if (r.transferSize) {
        totalSize += r.transferSize;
      }
    });
    
    return {
      ttfb,
      tti,
      resourcesLoaded: resources.length,
      totalTransferSize: totalSize,
    };
  });
  
  await resetNetworkThrottling(page);
  
  return {
    profile: profile.name,
    loadTime,
    timeToFirstByte: metrics.ttfb,
    timeToInteractive: metrics.tti,
    resourcesLoaded: metrics.resourcesLoaded,
    totalTransferSize: metrics.totalTransferSize,
  };
}

/**
 * Simulate intermittent connectivity (connection drops and recovers)
 */
export async function simulateIntermittentConnection(
  page: Page,
  options: {
    onlineDuration: number;
    offlineDuration: number;
    cycles: number;
  } = { onlineDuration: 5000, offlineDuration: 3000, cycles: 3 }
): Promise<void> {
  const client = await page.context().newCDPSession(page);
  
  for (let i = 0; i < options.cycles; i++) {
    console.log(`🔄 Connection cycle ${i + 1}/${options.cycles}`);
    
    // Online
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
    await page.waitForTimeout(options.onlineDuration);
    
    // Offline
    await client.send('Network.emulateNetworkConditions', {
      offline: true,
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    });
    console.log('📡 Connection dropped');
    await page.waitForTimeout(options.offlineDuration);
    
    // Back online
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: -1,
      uploadThroughput: -1,
      latency: 0,
    });
    console.log('📡 Connection restored');
  }
}

/**
 * Compare performance across multiple network profiles
 */
export async function compareNetworkPerformance(
  page: Page,
  url: string,
  profiles: NetworkProfile[] = [
    NetworkProfiles.SLOW_3G,
    NetworkProfiles.FAST_3G,
    NetworkProfiles.REGULAR_4G,
  ]
): Promise<Array<{
  profile: string;
  loadTime: number;
  timeToFirstByte: number;
}>> {
  const results = [];
  
  for (const profile of profiles) {
    const metrics = await measureNetworkPerformance(page, url, profile);
    results.push({
      profile: metrics.profile,
      loadTime: metrics.loadTime,
      timeToFirstByte: metrics.timeToFirstByte,
    });
  }
  
  return results;
}

/**
 * Check if app handles offline state gracefully (PWA-style)
 */
export async function testOfflineHandling(
  page: Page,
  url: string
): Promise<{
  hasOfflineSupport: boolean;
  hasServiceWorker: boolean;
  canNavigateOffline: boolean;
}> {
  // First load the page normally
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  
  // Check for service worker
  const hasServiceWorker = await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      return !!registration.active;
    }
    return false;
  });
  
  // Check for offline indicator/support
  const hasOfflineSupport = await page.evaluate(() => {
    return (
      document.querySelector('[data-offline]') !== null ||
      document.querySelector('.offline-indicator') !== null ||
      // @ts-ignore
      window.offlineSupport === true
    );
  });
  
  // Go offline and try to navigate
  await applyNetworkThrottling(page, NetworkProfiles.OFFLINE);
  
  // Try navigating to same page
  await page.reload();
  await page.waitForTimeout(2000);
  
  // Check if we're still showing content (cached) or error page
  const currentUrl = page.url();
  const hasContent = await page.locator('body').textContent().then(t => t.length > 100);
  const showingError = await page.locator('text=/offline|error|connection/i').isVisible().catch(() => false);
  
  const canNavigateOffline = hasServiceWorker && (currentUrl === url || hasContent || !showingError);
  
  await resetNetworkThrottling(page);
  
  return {
    hasOfflineSupport,
    hasServiceWorker,
    canNavigateOffline,
  };
}
