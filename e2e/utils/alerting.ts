import { Page, BrowserContext } from '@playwright/test';

/**
 * ALERTING & NOTIFICATION SYSTEM
 * 
 * Send alerts when tests fail or performance degrades:
 * - Slack notifications
 * - Email alerts (via SendGrid, SES, etc.)
 * - Webhook integrations
 * - PagerDuty integration for critical failures
 */

export interface AlertConfig {
  // Slack
  slackWebhookUrl?: string;
  slackChannel?: string;
  slackUsername?: string;
  
  // Email
  emailProvider?: 'sendgrid' | 'ses' | 'smtp' | 'webhook';
  emailApiKey?: string;
  emailFrom?: string;
  emailTo?: string[];
  emailEndpoint?: string;
  
  // PagerDuty (for critical failures)
  pagerdutyKey?: string;
  pagerdutySeverity?: 'critical' | 'error' | 'warning' | 'info';
  
  // Generic webhook
  webhookUrl?: string;
  webhookHeaders?: Record<string, string>;
  
  // Conditions
  alertOnFailure: boolean;
  alertOnPerformance: boolean;
  performanceThreshold: number; // Alert if load time exceeds (ms)
  
  // Rate limiting
  maxAlertsPerHour: number;
}

export interface TestFailureAlert {
  testName: string;
  testFile: string;
  error: string;
  stack?: string;
  timestamp: string;
  duration: number;
  screenshot?: string; // Base64 encoded screenshot
  url?: string;
  browser: string;
  environment: string;
}

export interface PerformanceAlert {
  url: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
  browser: string;
  environment: string;
}

/**
 * Alert manager with rate limiting
 */
class AlertManager {
  private alertHistory: Map<string, number[]> = new Map();
  
  canAlert(alertKey: string, maxPerHour: number): boolean {
    const now = Date.now();
    const oneHourAgo = now - 3600000;
    
    const history = this.alertHistory.get(alertKey) || [];
    const recentAlerts = history.filter(t => t > oneHourAgo);
    
    if (recentAlerts.length >= maxPerHour) {
      return false;
    }
    
    recentAlerts.push(now);
    this.alertHistory.set(alertKey, recentAlerts);
    return true;
  }
}

const alertManager = new AlertManager();

/**
 * Send Slack notification
 */
export async function sendSlackAlert(
  message: string,
  config: AlertConfig,
  payload?: Record<string, any>
): Promise<void> {
  if (!config.slackWebhookUrl) return;
  
  const alertKey = `slack:${config.slackChannel || 'default'}`;
  if (!alertManager.canAlert(alertKey, config.maxAlertsPerHour)) {
    console.log('⏸️ Slack alert rate limited');
    return;
  }
  
  try {
    const slackPayload = {
      username: config.slackUsername || 'E2E Test Bot',
      channel: config.slackChannel,
      icon_emoji: payload?.success ? ':white_check_mark:' : ':x:',
      attachments: [{
        color: payload?.success ? 'good' : 'danger',
        title: payload?.title || 'E2E Test Alert',
        text: message,
        fields: payload?.fields || [],
        footer: `Environment: ${payload?.environment || 'unknown'}`,
        ts: Math.floor(Date.now() / 1000),
      }],
    };
    
    const response = await fetch(config.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload),
    });
    
    if (response.ok) {
      console.log('📤 Slack alert sent');
    } else {
      console.warn('⚠️ Failed to send Slack alert:', response.status);
    }
  } catch (e) {
    console.warn('Failed to send Slack alert:', e);
  }
}

/**
 * Send email alert
 */
export async function sendEmailAlert(
  subject: string,
  body: string,
  config: AlertConfig,
  htmlBody?: string
): Promise<void> {
  if (!config.emailTo || config.emailTo.length === 0) return;
  
  const alertKey = `email:${config.emailTo.join(',')}`;
  if (!alertManager.canAlert(alertKey, config.maxAlertsPerHour)) {
    console.log('⏸️ Email alert rate limited');
    return;
  }
  
  try {
    if (config.emailProvider === 'sendgrid' && config.emailApiKey) {
      await sendSendGridEmail(subject, body, htmlBody, config);
    } else if (config.emailProvider === 'ses' && config.emailApiKey) {
      await sendSESEmail(subject, body, htmlBody, config);
    } else if (config.emailEndpoint) {
      // Generic email webhook
      await fetch(config.emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: config.emailTo,
          from: config.emailFrom,
          subject,
          text: body,
          html: htmlBody,
        }),
      });
    }
    
    console.log('📧 Email alert sent to', config.emailTo.join(', '));
  } catch (e) {
    console.warn('Failed to send email alert:', e);
  }
}

/**
 * Send PagerDuty alert for critical failures
 */
export async function sendPagerDutyAlert(
  summary: string,
  config: AlertConfig,
  details?: Record<string, any>
): Promise<void> {
  if (!config.pagerdutyKey) return;
  
  const alertKey = `pagerduty:${config.pagerdutyKey.slice(0, 10)}`;
  if (!alertManager.canAlert(alertKey, config.maxAlertsPerHour)) {
    console.log('⏸️ PagerDuty alert rate limited');
    return;
  }
  
  try {
    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routing_key: config.pagerdutyKey,
        event_action: 'trigger',
        dedup_key: `e2e-${details?.testName || 'unknown'}-${new Date().toDateString()}`,
        payload: {
          summary,
          severity: config.pagerdutySeverity || 'error',
          source: 'Playwright E2E Tests',
          component: 'e2e-testing',
          group: 'saman-prefab',
          class: 'test-failure',
          custom_details: details,
        },
      }),
    });
    
    if (response.ok) {
      console.log('🚨 PagerDuty alert sent');
    } else {
      console.warn('⚠️ Failed to send PagerDuty alert:', response.status);
    }
  } catch (e) {
    console.warn('Failed to send PagerDuty alert:', e);
  }
}

/**
 * Send generic webhook alert
 */
export async function sendWebhookAlert(
  payload: Record<string, any>,
  config: AlertConfig
): Promise<void> {
  if (!config.webhookUrl) return;
  
  const alertKey = `webhook:${config.webhookUrl}`;
  if (!alertManager.canAlert(alertKey, config.maxAlertsPerHour)) {
    console.log('⏸️ Webhook alert rate limited');
    return;
  }
  
  try {
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...config.webhookHeaders,
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'playwright-e2e',
      }),
    });
    
    console.log('📤 Webhook alert sent');
  } catch (e) {
    console.warn('Failed to send webhook alert:', e);
  }
}

/**
 * Send test failure alert through all configured channels
 */
export async function sendTestFailureAlert(
  failure: TestFailureAlert,
  config: AlertConfig
): Promise<void> {
  const shortError = failure.error.length > 100 
    ? failure.error.slice(0, 100) + '...' 
    : failure.error;
  
  const message = `❌ E2E Test Failed: ${failure.testName}\n` +
    `File: ${failure.testFile}\n` +
    `Error: ${shortError}\n` +
    `Duration: ${failure.duration}ms\n` +
    `URL: ${failure.url || 'N/A'}\n` +
    `Browser: ${failure.browser}\n` +
    `Environment: ${failure.environment}`;
  
  const slackFields = [
    { title: 'Test', value: failure.testName, short: true },
    { title: 'File', value: failure.testFile, short: true },
    { title: 'Error', value: shortError, short: false },
    { title: 'Duration', value: `${failure.duration}ms`, short: true },
    { title: 'Environment', value: failure.environment, short: true },
  ];
  
  // Slack alert
  await sendSlackAlert(message, config, {
    title: 'E2E Test Failure',
    fields: slackFields,
    environment: failure.environment,
    success: false,
  });
  
  // Email alert
  await sendEmailAlert(
    `E2E Test Failed: ${failure.testName}`,
    message,
    config,
    `<h3>E2E Test Failure</h3>
     <p><strong>Test:</strong> ${failure.testName}</p>
     <p><strong>File:</strong> ${failure.testFile}</p>
     <p><strong>Error:</strong> ${shortError}</p>
     <p><strong>Duration:</strong> ${failure.duration}ms</p>
     <p><strong>URL:</strong> ${failure.url || 'N/A'}</p>
     <p><strong>Browser:</strong> ${failure.browser}</p>
     <p><strong>Environment:</strong> ${failure.environment}</p>
     <p><strong>Time:</strong> ${failure.timestamp}</p>`
  );
  
  // PagerDuty for critical failures (long duration or specific tests)
  if (failure.duration > 30000 || failure.testName.includes('critical')) {
    await sendPagerDutyAlert(
      `Critical E2E Test Failure: ${failure.testName}`,
      config,
      failure
    );
  }
}

/**
 * Send performance degradation alert
 */
export async function sendPerformanceAlert(
  alert: PerformanceAlert,
  config: AlertConfig
): Promise<void> {
  const message = `⚠️ Performance Alert: ${alert.metric}\n` +
    `URL: ${alert.url}\n` +
    `Value: ${alert.value}ms\n` +
    `Threshold: ${alert.threshold}ms\n` +
    `Browser: ${alert.browser}\n` +
    `Environment: ${alert.environment}`;
  
  await sendSlackAlert(message, config, {
    title: 'Performance Degradation',
    fields: [
      { title: 'Metric', value: alert.metric, short: true },
      { title: 'URL', value: alert.url, short: false },
      { title: 'Current', value: `${alert.value}ms`, short: true },
      { title: 'Threshold', value: `${alert.threshold}ms`, short: true },
    ],
    environment: alert.environment,
    success: false,
  });
  
  // Only email if significantly over threshold (2x)
  if (alert.value > alert.threshold * 2) {
    await sendEmailAlert(
      `Performance Alert: ${alert.metric} exceeded threshold`,
      message,
      config
    );
  }
}

/**
 * Send success notification (for CI completion)
 */
export async function sendSuccessNotification(
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    duration: number;
    environment: string;
  },
  config: AlertConfig
): Promise<void> {
  const success = summary.failedTests === 0;
  const message = success
    ? `✅ All ${summary.totalTests} E2E tests passed in ${(summary.duration / 1000).toFixed(1)}s`
    : `⚠️ ${summary.failedTests}/${summary.totalTests} E2E tests failed`;
  
  await sendSlackAlert(message, config, {
    title: success ? 'E2E Tests Passed' : 'E2E Tests Completed with Failures',
    fields: [
      { title: 'Total', value: String(summary.totalTests), short: true },
      { title: 'Passed', value: String(summary.passedTests), short: true },
      { title: 'Failed', value: String(summary.failedTests), short: true },
      { title: 'Duration', value: `${(summary.duration / 1000).toFixed(1)}s`, short: true },
    ],
    environment: summary.environment,
    success,
  });
}

// Helper functions for email providers
async function sendSendGridEmail(
  subject: string,
  text: string,
  html: string | undefined,
  config: AlertConfig
): Promise<void> {
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.emailApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: config.emailTo?.map(to => ({ to: [{ email: to }] })),
      from: { email: config.emailFrom || 'alerts@example.com' },
      subject,
      content: [
        { type: 'text/plain', value: text },
        ...(html ? [{ type: 'text/html', value: html }] : []),
      ],
    }),
  });
}

async function sendSESEmail(
  subject: string,
  text: string,
  html: string | undefined,
  config: AlertConfig
): Promise<void> {
  // AWS SES implementation would go here
  // Requires AWS SDK or direct API call
  console.log('AWS SES email would be sent:', { subject, to: config.emailTo });
}

/**
 * Setup automatic alerts for test suite
 */
export function setupAlerting(
  config: AlertConfig
): {
  onTestFailure: (failure: TestFailureAlert) => Promise<void>;
  onPerformanceIssue: (alert: PerformanceAlert) => Promise<void>;
  onTestSuiteComplete: (summary: any) => Promise<void>;
} {
  return {
    onTestFailure: async (failure) => {
      if (config.alertOnFailure) {
        await sendTestFailureAlert(failure, config);
      }
    },
    onPerformanceIssue: async (alert) => {
      if (config.alertOnPerformance && alert.value > config.performanceThreshold) {
        await sendPerformanceAlert(alert, config);
      }
    },
    onTestSuiteComplete: async (summary) => {
      await sendSuccessNotification(summary, config);
    },
  };
}
