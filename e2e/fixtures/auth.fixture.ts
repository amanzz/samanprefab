import { test as base, expect, Page } from '@playwright/test';
import { setupProductionBugDetection } from '../utils/test-helpers';

/**
 * Auth fixture - provides authenticated page context with strict error detection
 */
export interface AuthFixture {
  adminPage: Page;
  loginAsAdmin: () => Promise<Page>;
}

// Test admin credentials (match your actual admin setup)
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@samanprefab.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin@Saman2026!';

/**
 * Login helper - performs full login flow
 */
export async function loginAsAdmin(page: Page): Promise<Page> {
  // Navigate to login page
  await page.goto('/admin/login');
  
  // Wait for login form
  await expect(page.locator('text=Saman Prefab Admin')).toBeVisible();
  
  // Fill credentials
  await page.locator('input#email').fill(ADMIN_EMAIL);
  await page.locator('input#password').fill(ADMIN_PASSWORD);
  
  // Submit form
  await page.locator('button[type="submit"]').click();
  
  // Wait for redirect to admin dashboard
  await page.waitForURL('**/admin**', { timeout: 10000 });
  
  // Verify we're on admin page by checking sidebar
  await expect(page.locator('aside')).toBeVisible();
  
  return page;
}

/**
 * Logout helper
 */
export async function logout(page: Page): Promise<void> {
  // Open user dropdown
  await page.locator('button:has-text("Admin")').click();
  
  // Click logout
  await page.locator('text=Sign out').click();
  
  // Wait for redirect to login
  await page.waitForURL('**/admin/login**', { timeout: 10000 });
  
  // Verify login page
  await expect(page.locator('text=Sign in to access')).toBeVisible();
}

/**
 * Extended test with auth fixture + strict bug detection
 */
export const test = base.extend<AuthFixture>({
  // Auto-setup production bug detection for every test
  page: async ({ browser }, use) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Setup strict error detection
    await setupProductionBugDetection(page);
    
    await use(page);
    await context.close();
  },
  
  adminPage: async ({ browser }, use) => {
    // Create new context and page
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Setup strict error detection
    await setupProductionBugDetection(page);
    
    // Login
    await loginAsAdmin(page);
    
    // Use the authenticated page
    await use(page);
    
    // Cleanup
    await context.close();
  },
  
  loginAsAdmin: async ({ browser }, use) => {
    await use(async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      
      // Setup strict error detection
      await setupProductionBugDetection(page);
      
      return loginAsAdmin(page);
    });
  },
});

export { expect };
