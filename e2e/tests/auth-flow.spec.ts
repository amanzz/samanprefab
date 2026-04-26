import { test, expect } from '@playwright/test';
import { 
  setupProductionBugDetection,
  validateFormField,
  prepareForVisualTesting,
  assertPagePerformance,
  TestFailureCategory,
  TestFailureError
} from '../utils/test-helpers';

/**
 * AUTH FLOW TESTS - PRODUCTION LEVEL
 * 
 * Tests with:
 * - Visual regression testing (toHaveScreenshot)
 * - Strict console error detection (fails on any console.error)
 * - API failure detection (fails on any >= 400)
 * - Real data validation (not generic checks)
 */

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@samanprefab.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin@Saman2026!';

test.describe('Auth Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup strict production-level bug detection
    await setupProductionBugDetection(page);
  });

  test('should login with valid credentials and redirect to admin', async ({ page }) => {
    // Step 1: Navigate to login page with enterprise performance check
    await assertPagePerformance(page, '/admin/login', 3000);
    await prepareForVisualTesting(page);
    
    // Visual regression: login form component (not full page)
    const loginForm = page.locator('form, [class*="login-form"]').first();
    await expect(loginForm).toHaveScreenshot('login-form.png', {
      maxDiffPixels: 100,
      mask: [page.locator('input[type="password"]')],
    });
    
    // STRICT: Verify exact text content, not just visibility
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Saman Prefab Admin');
    
    const subtitle = page.locator('p');
    await expect(subtitle).toContainText('Sign in to access the admin panel');
    
    // Step 2: Fill login form with STRICT validation
    const emailInput = page.locator('input#email');
    const passwordInput = page.locator('input#password');
    const submitButton = page.locator('button[type="submit"]');
    
    // Validate fields are interactive
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEnabled();
    await expect(emailInput).toBeEditable();
    
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toBeEnabled();
    await expect(passwordInput).toBeEditable();
    
    // Validate button is clickable
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    
    // Fill with exact value validation
    await emailInput.fill(ADMIN_EMAIL);
    await validateFormField(emailInput, ADMIN_EMAIL);
    
    await passwordInput.fill(ADMIN_PASSWORD);
    const pwdValue = await passwordInput.inputValue();
    expect(pwdValue.length).toBeGreaterThan(0); // Password masked, just check not empty
    
    // Step 3: Submit form
    await submitButton.click();
    
    // Step 4: Assert redirect to /admin with performance check
    await page.waitForURL('**/admin/dashboard**', { timeout: 15000 });
    await assertPagePerformance(page, '/admin/dashboard', 3000);
    await prepareForVisualTesting(page);
    
    // Visual regression: sidebar component (stable, deterministic)
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveScreenshot('dashboard-sidebar.png', {
      maxDiffPixels: 200,
    });
    
    // Visual regression: header component
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('dashboard-header.png', {
      maxDiffPixels: 100,
      mask: [page.locator('[class*="user"], [class*="avatar"]')], // Mask user info
    });
    
    // STRICT: Verify exact text on dashboard
    const dashboardTitle = page.locator('h1, h2').first();
    await expect(dashboardTitle).toContainText(/Dashboard|Products|Overview/i);
    
    // Verify sidebar with exact text
    await expect(page.locator('aside')).toBeVisible({ timeout: 10000 });
    const dashboardLink = page.locator('aside >> text=Dashboard');
    await expect(dashboardLink).toHaveText('Dashboard');
    
    // Step 5: Assert cookies exist with strict validation
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => 
      c.name.toLowerCase().includes('token') || 
      c.name.toLowerCase().includes('auth') ||
      c.name.toLowerCase().includes('session')
    );
    
    expect(authCookie, 'Auth cookie should exist after login').toBeTruthy();
    expect(authCookie?.value, 'Auth cookie should have non-empty value').toBeTruthy();
    expect(authCookie?.value.length, 'Auth cookie should have substantial value').toBeGreaterThan(10);
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await prepareForVisualTesting(page);
    
    // Fill invalid credentials with validation
    const emailInput = page.locator('input#email');
    await emailInput.fill('invalid@email.com');
    await validateFormField(emailInput, 'invalid@email.com');
    
    const passwordInput = page.locator('input#password');
    await passwordInput.fill('wrongpassword');
    const pwdValue = await passwordInput.inputValue();
    expect(pwdValue.length).toBeGreaterThan(0);
    
    await page.locator('button[type="submit"]').click();
    
    // STRICT: Wait for specific error message
    const errorMessage = page.locator('[class*="error"], [role="alert"], .text-error');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Validate error text content
    const errorText = await errorMessage.textContent();
    expect(errorText?.toLowerCase()).toMatch(/login failed|invalid|error/);
    
    // Verify still on login page with exact heading
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Saman Prefab Admin');
    
    // URL should still be login
    expect(page.url()).toContain('/admin/login');
  });

  test('should logout and redirect to login page', async ({ page, context }) => {
    // First, login
    await page.goto('/admin/login');
    await page.locator('input#email').fill(ADMIN_EMAIL);
    await page.locator('input#password').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    
    // Wait for admin page
    await page.waitForURL('**/admin/dashboard**', { timeout: 15000 });
    await expect(page.locator('aside')).toBeVisible();
    await prepareForVisualTesting(page);
    
    // Step 1: Click user dropdown with strict validation
    const userDropdown = page.locator('button:has-text("Admin")');
    await expect(userDropdown).toBeVisible();
    await expect(userDropdown).toBeEnabled();
    await userDropdown.click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(300);
    
    // STRICT: Verify exact dropdown options
    const profileOption = page.locator('text=My Profile');
    await expect(profileOption).toBeVisible();
    await expect(profileOption).toHaveText('My Profile');
    
    const settingsOption = page.locator('text=Account Settings');
    await expect(settingsOption).toBeVisible();
    await expect(settingsOption).toHaveText('Account Settings');
    
    const passwordOption = page.locator('text=Change Password');
    await expect(passwordOption).toBeVisible();
    await expect(passwordOption).toHaveText('Change Password');
    
    // Step 2: Click logout
    const logoutButton = page.locator('text=Sign out');
    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toBeEnabled();
    await logoutButton.click();
    
    // Step 3: Assert redirect to login page
    await page.waitForURL('**/admin/login**', { timeout: 10000 });
    await prepareForVisualTesting(page);
    
    // Visual regression: login form after logout (component level)
    const loginForm = page.locator('form, [class*="login-form"]').first();
    await expect(loginForm).toHaveScreenshot('login-form-logout.png', {
      maxDiffPixels: 100,
      mask: [page.locator('input[type="password"]')],
    });
    
    // STRICT: Verify exact login page content
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Saman Prefab Admin');
    
    const subtitle = page.locator('p');
    await expect(subtitle).toContainText('Sign in to access');
    
    // Verify auth cookie is removed or cleared
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c => 
      c.name.toLowerCase().includes('token') || 
      c.name.toLowerCase().includes('auth')
    );
    
    // Auth cookies should be cleared or have empty value
    for (const cookie of authCookies) {
      expect(cookie.value === '' || cookie.expires < Date.now() / 1000, 
        'Auth cookie should be cleared after logout').toBeTruthy();
    }
  });

  test('should access protected admin route only when authenticated', async ({ page }) => {
    // Try to access admin directly without login
    await page.goto('/admin/products');
    
    // Should be redirected to login
    await page.waitForURL('**/admin/login**', { timeout: 10000 });
    
    // STRICT: Verify exact login page content
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Saman Prefab Admin');
    
    // Verify we're NOT on the products page
    expect(page.url()).not.toContain('/admin/products');
    
    // Verify login form elements exist
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
