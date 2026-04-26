import { Page, BrowserContext } from '@playwright/test';

/**
 * PRODUCTION MONITORING INTEGRATION
 * 
 * Utilities for integrating with production monitoring systems:
 * - Sentry error tracking
 * - Performance monitoring
 * - Custom metrics collection
 * - Alert triggers
 */

export interface MonitoringConfig {
  // Sentry error tracking
  sentryDsn?: string;
  sentryAuthToken?: string;
  sentryOrganization?: string;
  sentryProject?: string;
  
  // Analytics tracking
  analyticsId?: string; // GA4, Mixpanel, Amplitude, etc.
  analyticsEndpoint?: string;
  
  // Performance monitoring
  performanceEndpoint?: string;
  metricsEndpoint?: string;
  
  // Environment
  environment: 'development' | 'staging' | 'production';
  release: string;
  
  // User info for analytics
  userId?: string;
  userProperties?: Record<string, any>;
}

export interface ErrorEvent {
  type: 'console' | 'network' | 'javascript' | 'application';
  message: string;
  stack?: string;
  url: string;
  timestamp: string;
  severity: 'fatal' | 'error' | 'warning' | 'info';
  metadata: Record<string, any>;
  // Sentry-specific fields
  eventId?: string;
  tags?: Record<string, string>;
  breadcrumbs?: Array<{
    type: string;
    message: string;
    timestamp: string;
    data?: Record<string, any>;
  }>;
}

export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  url: string;
  referrer?: string;
}

export interface PerformanceEvent {
  metric: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP' | 'INP';
  value: number;
  url: string;
  timestamp: string;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Setup Sentry-like error capture for E2E tests
 * Captures all errors during test execution for analysis
 */
export function setupErrorCapture(
  page: Page,
  config: MonitoringConfig
): { getErrors: () => ErrorEvent[]; flush: () => Promise<void> } {
  const errors: ErrorEvent[] = [];
  
  // Capture console errors
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push({
        type: 'console',
        message: msg.text(),
        url: page.url(),
        timestamp: new Date().toISOString(),
        severity: 'error',
        metadata: { location: msg.location() },
      });
    }
  });
  
  // Capture page errors
  page.on('pageerror', (error) => {
    errors.push({
      type: 'javascript',
      message: error.message,
      stack: error.stack,
      url: page.url(),
      timestamp: new Date().toISOString(),
      severity: 'fatal',
      metadata: {},
    });
  });
  
  // Capture request failures
  page.on('requestfailed', (request) => {
    errors.push({
      type: 'network',
      message: `Request failed: ${request.method()} ${request.url()}`,
      url: page.url(),
      timestamp: new Date().toISOString(),
      severity: 'error',
      metadata: {
        method: request.method(),
        failure: request.failure()?.errorText,
      },
    });
  });
  
  // Capture response errors
  page.on('response', (response) => {
    if (response.status() >= 500) {
      errors.push({
        type: 'network',
        message: `Server error: ${response.status()} ${response.url()}`,
        url: page.url(),
        timestamp: new Date().toISOString(),
        severity: response.status() >= 500 ? 'fatal' : 'error',
        metadata: {
          status: response.status(),
          statusText: response.statusText(),
        },
      });
    }
  });
  
  return {
    getErrors: () => errors,
    flush: async () => {
      if (errors.length === 0) return;
      
      // Send to Sentry if configured
      if (config.sentryDsn) {
        await sendToSentry(errors, config);
      }
      
      // Send to generic endpoint if configured
      if (config.performanceEndpoint) {
        try {
          await fetch(config.performanceEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'errors',
              events: errors,
              environment: config.environment,
              release: config.release,
              test: true,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (e) {
          console.warn('Failed to send errors to monitoring:', e);
        }
      }
      
      errors.length = 0;
    },
  };
}

/**
 * Capture Core Web Vitals and other performance metrics
 * Similar to real user monitoring (RUM) tools
 */
export async function capturePerformanceMetrics(
  page: Page
): Promise<PerformanceEvent[]> {
  const metrics = await page.evaluate(() => {
    const events: PerformanceEvent[] = [];
    const now = new Date().toISOString();
    
    // Get Navigation Timing
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (nav) {
      const ttfb = nav.responseStart - nav.startTime;
      events.push({
        metric: 'TTFB',
        value: ttfb,
        url: window.location.href,
        timestamp: now,
        rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor',
      });
    }
    
    // Get Paint Timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(p => p.name === 'first-contentful-paint');
    if (fcp) {
      events.push({
        metric: 'FCP',
        value: fcp.startTime,
        url: window.location.href,
        timestamp: now,
        rating: fcp.startTime < 1800 ? 'good' : fcp.startTime < 3000 ? 'needs-improvement' : 'poor',
      });
    }
    
    // Get LCP if available
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const lcp = lcpEntries[lcpEntries.length - 1] as LargestContentfulPaint;
    if (lcp) {
      events.push({
        metric: 'LCP',
        value: lcp.startTime,
        url: window.location.href,
        timestamp: now,
        rating: lcp.startTime < 2500 ? 'good' : lcp.startTime < 4000 ? 'needs-improvement' : 'poor',
      });
    }
    
    // Calculate CLS (simplified - real implementation needs more logic)
    const layoutEntries = performance.getEntriesByType('layout-shift');
    let cls = 0;
    layoutEntries.forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    });
    events.push({
      metric: 'CLS',
      value: cls,
      url: window.location.href,
      timestamp: now,
      rating: cls < 0.1 ? 'good' : cls < 0.25 ? 'needs-improvement' : 'poor',
    });
    
    return events;
  });
  
  return metrics;
}

/**
 * Send performance metrics to monitoring endpoint
 */
export async function sendPerformanceMetrics(
  metrics: PerformanceEvent[],
  config: MonitoringConfig
): Promise<void> {
  if (!config.performanceEndpoint) return;
  
  try {
    await fetch(config.performanceEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metrics,
        environment: config.environment,
        release: config.release,
        timestamp: new Date().toISOString(),
        test: true,
      }),
    });
  } catch (e) {
    console.warn('Failed to send performance metrics:', e);
  }
}

/**
 * Alert if performance metrics exceed thresholds
 */
export function checkPerformanceAlerts(
  metrics: PerformanceEvent[],
  thresholds: Record<string, number> = {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    TTFB: 800,
    FCP: 1800,
  }
): string[] {
  const alerts: string[] = [];
  
  for (const metric of metrics) {
    const threshold = thresholds[metric.metric];
    if (threshold && metric.value > threshold) {
      alerts.push(
        `⚠️ PERFORMANCE ALERT: ${metric.metric} = ${metric.value.toFixed(0)}ms ` +
        `(threshold: ${threshold}ms) on ${metric.url}`
      );
    }
  }
  
  return alerts;
}

/**
 * Setup comprehensive monitoring for a test
 */
export async function setupTestMonitoring(
  page: Page,
  config: MonitoringConfig
): Promise<{
  capturePerformance: () => Promise<PerformanceEvent[]>;
  getErrors: () => ErrorEvent[];
  checkAlerts: () => string[];
  flush: () => Promise<void>;
}> {
  const errorCapture = setupErrorCapture(page, config);
  let lastPerformanceMetrics: PerformanceEvent[] = [];
  
  return {
    capturePerformance: async () => {
      const metrics = await capturePerformanceMetrics(page);
      lastPerformanceMetrics = metrics;
      
      // Send to monitoring endpoint
      await sendPerformanceMetrics(metrics, config);
      
      // Log alerts
      const alerts = checkPerformanceAlerts(metrics);
      alerts.forEach(alert => console.warn(alert));
      
      return metrics;
    },
    getErrors: errorCapture.getErrors,
    checkAlerts: () => checkPerformanceAlerts(lastPerformanceMetrics),
    flush: errorCapture.flush,
  };
}

/**
 * Create monitoring report for test run
 */
export function createMonitoringReport(
  testName: string,
  errors: ErrorEvent[],
  metrics: PerformanceEvent[],
  duration: number
): Record<string, any> {
  const alerts = checkPerformanceAlerts(metrics);
  
  return {
    test: testName,
    timestamp: new Date().toISOString(),
    duration,
    summary: {
      totalErrors: errors.length,
      fatalErrors: errors.filter(e => e.severity === 'fatal').length,
      warnings: errors.filter(e => e.severity === 'warning').length,
      performanceAlerts: alerts.length,
      coreWebVitals: {
        lcp: metrics.find(m => m.metric === 'LCP')?.value,
        fid: metrics.find(m => m.metric === 'FID')?.value,
        cls: metrics.find(m => m.metric === 'CLS')?.value,
      },
    },
    errors: errors.map(e => ({
      type: e.type,
      message: e.message,
      severity: e.severity,
      url: e.url,
      timestamp: e.timestamp,
    })),
    performance: metrics.map(m => ({
      metric: m.metric,
      value: m.value,
      rating: m.rating,
      url: m.url,
    })),
    alerts,
    passed: errors.filter(e => e.severity === 'fatal').length === 0 && alerts.length === 0,
  };
}

/**
 * Default monitoring config for different environments
 */
export function getMonitoringConfig(
  environment: 'development' | 'staging' | 'production'
): MonitoringConfig {
  const configs: Record<string, MonitoringConfig> = {
    development: {
      environment: 'development',
      release: process.env.npm_package_version || 'dev',
      // Development uses console logging only
    },
    staging: {
      environment: 'staging',
      release: process.env.npm_package_version || 'staging',
      sentryDsn: process.env.SENTRY_DSN_STAGING,
      analyticsId: process.env.ANALYTICS_ID_STAGING,
      performanceEndpoint: process.env.PERFORMANCE_ENDPOINT_STAGING,
    },
    production: {
      environment: 'production',
      release: process.env.npm_package_version || 'prod',
      sentryDsn: process.env.SENTRY_DSN,
      analyticsId: process.env.ANALYTICS_ID,
      performanceEndpoint: process.env.PERFORMANCE_ENDPOINT,
    },
  };
  
  return configs[environment];
}

/**
 * Send errors to Sentry
 * Real integration with Sentry API
 */
async function sendToSentry(
  errors: ErrorEvent[],
  config: MonitoringConfig
): Promise<void> {
  if (!config.sentryDsn) return;
  
  for (const error of errors) {
    try {
      // Prepare Sentry event payload
      const event = {
        event_id: generateSentryEventId(),
        timestamp: error.timestamp,
        platform: 'javascript',
        level: error.severity,
        environment: config.environment,
        release: config.release,
        tags: {
          ...error.tags,
          type: error.type,
          test: 'true',
        },
        extra: error.metadata,
        breadcrumbs: error.breadcrumbs || [],
        exception: {
          values: [{
            type: error.type,
            value: error.message,
            stacktrace: error.stack ? { frames: parseStackTrace(error.stack) } : undefined,
          }],
        },
        request: {
          url: error.url,
        },
      };
      
      // Send to Sentry
      const sentryUrl = config.sentryDsn.replace(/\/[^/]+$/, '/store/') + '?sentry_key=' + 
        config.sentryDsn.match(/\/\/([^@]+)@/)?.[1];
      
      const response = await fetch(sentryUrl || config.sentryDsn, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${config.sentryDsn.match(/\/\/([^@]+)@/)?.[1]}`,
        },
        body: JSON.stringify(event),
      });
      
      if (response.ok) {
        console.log(`📤 Sent error to Sentry: ${error.message.slice(0, 50)}...`);
      } else {
        console.warn(`⚠️ Failed to send to Sentry: ${response.status}`);
      }
    } catch (e) {
      console.warn('Failed to send error to Sentry:', e);
    }
  }
}

/**
 * Track analytics event
 * Supports GA4, Mixpanel, Amplitude, or custom endpoint
 */
export async function trackAnalyticsEvent(
  event: AnalyticsEvent,
  config: MonitoringConfig
): Promise<void> {
  if (!config.analyticsId && !config.analyticsEndpoint) return;
  
  try {
    // GA4 tracking
    if (config.analyticsId?.startsWith('G-')) {
      await trackGA4Event(event, config.analyticsId);
    }
    // Mixpanel tracking
    else if (config.analyticsId?.startsWith('mp_')) {
      await trackMixpanelEvent(event, config.analyticsId);
    }
    // Custom endpoint
    else if (config.analyticsEndpoint) {
      await fetch(config.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          test: true,
          source: 'playwright-e2e',
        }),
      });
    }
  } catch (e) {
    console.warn('Failed to track analytics event:', e);
  }
}

/**
 * Setup analytics tracking for user flows
 */
export async function setupAnalyticsTracking(
  page: Page,
  config: MonitoringConfig
): Promise<{ trackEvent: (eventName: string, properties?: Record<string, any>) => Promise<void> }> {
  const sessionId = generateSessionId();
  const trackedEvents: string[] = [];
  
  // Track page views automatically
  page.on('framenavigated', async (frame) => {
    if (frame === page.mainFrame()) {
      await trackAnalyticsEvent({
        eventName: 'page_view',
        properties: {
          page_url: frame.url(),
          page_title: await page.title().catch(() => ''),
        },
        timestamp: new Date().toISOString(),
        userId: config.userId,
        sessionId,
        url: frame.url(),
      }, config);
    }
  });
  
  return {
    trackEvent: async (eventName: string, properties: Record<string, any> = {}) => {
      const url = page.url();
      await trackAnalyticsEvent({
        eventName,
        properties: {
          ...properties,
          test_scenario: true,
        },
        timestamp: new Date().toISOString(),
        userId: config.userId,
        sessionId,
        url,
        referrer: trackedEvents.length > 0 ? trackedEvents[trackedEvents.length - 1] : undefined,
      }, config);
      trackedEvents.push(eventName);
    },
  };
}

// Helper functions
function generateSentryEventId(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function parseStackTrace(stack: string): Array<Record<string, any>> {
  return stack.split('\n').map((line, index) => ({
    filename: line.match(/at (.+) \((.+):(\d+):(\d+)\)/)?.[2] || 'unknown',
    lineno: parseInt(line.match(/:(\d+):(\d+)/)?.[1] || '0'),
    colno: parseInt(line.match(/:(\d+):(\d+)/)?.[2] || '0'),
    function: line.match(/at (.+) \(/)?.[1] || 'anonymous',
    in_app: true,
  }));
}

async function trackGA4Event(event: AnalyticsEvent, measurementId: string): Promise<void> {
  // GA4 Measurement Protocol
  const payload = {
    client_id: event.sessionId || 'e2e-test',
    events: [{
      name: event.eventName,
      params: {
        ...event.properties,
        page_location: event.url,
        page_title: event.eventName,
        engagement_time_msec: '100',
      },
    }],
  };
  
  await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function trackMixpanelEvent(event: AnalyticsEvent, token: string): Promise<void> {
  await fetch('https://api.mixpanel.com/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: event.eventName,
      properties: {
        token,
        distinct_id: event.userId || event.sessionId,
        ...event.properties,
        $current_url: event.url,
        time: Math.floor(Date.now() / 1000),
      },
    }),
  });
}
