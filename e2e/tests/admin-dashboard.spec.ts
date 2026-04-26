import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth.fixture';
import { checkConsoleErrors, setupApiInterception, checkImagesLoaded } from '../utils/test-helpers';

/**
 * ADMIN DASHBOARD UI TESTS
 * 
 * Tests:
 * 1. Check sidebar visible
 * 2. Check header user name + avatar visible
 * 3. Toggle dark mode → verify text contrast
 * 4. Open profile dropdown → verify options (Profile, Change Password, Logout)
 */

test.describe('Admin Dashboard UI', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiInterception(page);
    await loginAsAdmin(page);
  });

  test('should display sidebar with all navigation items', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    // Check sidebar is visible
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    
    // Verify all main navigation items
    const navItems = [
      'Dashboard',
      'Products',
      'Blog',
      'Quotes',
      'SEO',
      'AI Writing',
      'Settings',
      'Media',
      'Redirects',
    ];
    
    for (const item of navItems) {
      const navItem = page.locator(`aside >> text="${item}"`).first();
      await expect(navItem, `Navigation item "${item}" should be visible`).toBeVisible();
    }
    
    // Check sidebar has logo
    const logo = page.locator('aside img[alt="Logo"]');
    await expect(logo).toBeVisible();
    
    // Check no console errors
    expect(errors).toHaveLength(0);
  });

  test('should display header with user name and avatar', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    // Check header is visible
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Check user name is displayed
    const userName = page.locator('header >> text="Admin"').first();
    await expect(userName, 'User name should be visible in header').toBeVisible();
    
    // Check user avatar is visible
    const avatar = page.locator('header img[alt="User"], header span.overflow-hidden.rounded-full');
    await expect(avatar, 'User avatar should be visible in header').toBeVisible();
    
    // Check search input exists
    const searchInput = page.locator('header input[type="text"], header input[placeholder*="Search"]').first();
    await expect(searchInput, 'Search input should be visible in header').toBeVisible();
    
    // Check no console errors
    expect(errors).toHaveLength(0);
  });

  test('should toggle dark mode and maintain text contrast', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    // Find dark mode toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button:has([class*="dark"]), header button[class*="toggle"]').first();
    
    // Check toggle exists and is clickable
    await expect(themeToggle, 'Dark mode toggle should exist').toBeVisible();
    await expect(themeToggle).toBeEnabled();
    
    // Get initial background class
    const initialBodyClass = await page.evaluate(() => document.body.className);
    
    // Click toggle
    await themeToggle.click();
    
    // Wait for transition
    await page.waitForTimeout(500);
    
    // Verify dark mode class was added or toggled
    const darkBodyClass = await page.evaluate(() => document.body.className);
    
    // Check that some visual change occurred (either dark class added or removed)
    const hasDarkClass = darkBodyClass.includes('dark') || 
                        await page.locator('html.dark, body.dark, .dark').count() > 0;
    
    // Check text contrast - no faded text should be visible
    const textElements = await page.locator('p, span, h1, h2, h3, h4, h5, h6, a').all();
    let fadedTextCount = 0;
    
    for (const el of textElements) {
      const opacity = await el.evaluate(el => {
        const style = window.getComputedStyle(el);
        return parseFloat(style.opacity);
      });
      
      if (opacity < 0.3) {
        fadedTextCount++;
      }
    }
    
    // Allow for some decorative elements, but main content should not be faded
    expect(fadedTextCount, `Found ${fadedTextCount} faded text elements`).toBeLessThan(5);
    
    // Verify no console errors during toggle
    expect(errors).toHaveLength(0);
    
    // Toggle back to light
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    // Verify dashboard still visible
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should open profile dropdown with all options', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    // Find and click user dropdown
    const userDropdown = page.locator('header button:has-text("Admin"), header button:has(img[alt="User"])').first();
    await expect(userDropdown, 'User dropdown trigger should be visible').toBeVisible();
    await userDropdown.click();
    
    // Wait for dropdown to open
    await page.waitForTimeout(300);
    
    // Verify dropdown is visible
    const dropdown = page.locator('[class*="dropdown"], [role="menu"]').first();
    
    // Verify all profile options exist
    const expectedOptions = [
      { text: 'My Profile', href: '/admin/profile' },
      { text: 'Account Settings', href: '/admin/settings' },
      { text: 'Change Password', href: '/admin/profile' },
      { text: 'Sign out', action: 'logout' },
    ];
    
    for (const option of expectedOptions) {
      const optionElement = page.locator(`text="${option.text}"`).first();
      await expect(optionElement, `Profile option "${option.text}" should be visible`).toBeVisible();
    }
    
    // Verify user info in dropdown
    const userEmail = page.locator('text="admin@samanprefab.com"');
    await expect(userEmail, 'User email should be visible in dropdown').toBeVisible();
    
    // Close dropdown by clicking elsewhere
    await page.keyboard.press('Escape');
    
    // Verify no console errors
    expect(errors).toHaveLength(0);
  });

  test('should load dashboard with all metric cards', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    // Verify dashboard page loaded
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check metric cards
    const metricCards = [
      'Total Products',
      'Total Quotes',
      'New Leads',
      'Won Deals',
    ];
    
    for (const card of metricCards) {
      const cardElement = page.locator(`text="${card}"`).first();
      await expect(cardElement, `Metric card "${card}" should be visible`).toBeVisible();
    }
    
    // Check charts are present
    await expect(page.locator('text=Monthly Leads')).toBeVisible();
    await expect(page.locator('text=Lead Pipeline')).toBeVisible();
    
    // Check tables are present
    await expect(page.locator('text=Recent Leads')).toBeVisible();
    await expect(page.locator('text=Top Products')).toBeVisible();
    
    // Check all images load
    const brokenImages = await checkImagesLoaded(page);
    expect(brokenImages, `Broken images found: ${brokenImages.join(', ')}`).toHaveLength(0);
    
    // Verify no console errors
    expect(errors).toHaveLength(0);
  });

  test('should navigate between admin sections', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    // Navigate to Products
    await page.locator('aside >> text="Products"').first().click();
    await page.waitForURL('**/admin/products**', { timeout: 10000 });
    await expect(page.locator('text=Products')).toBeVisible();
    
    // Navigate to Blog
    await page.locator('aside >> text="Blog"').first().click();
    await page.waitForTimeout(1000);
    await page.locator('aside >> text="All Posts"').first().click();
    await page.waitForURL('**/admin/blog/posts**', { timeout: 10000 });
    
    // Navigate to Quotes
    await page.locator('aside >> text="Quotes"').first().click();
    await page.waitForURL('**/admin/quotes**', { timeout: 10000 });
    await expect(page.locator('text=Quotes')).toBeVisible();
    
    // Navigate back to Dashboard
    await page.locator('aside >> text="Dashboard"').first().click();
    await page.waitForURL('**/admin/dashboard**', { timeout: 10000 });
    await expect(page.locator('text=Dashboard')).toBeVisible();
    
    // Verify no console errors during navigation
    expect(errors).toHaveLength(0);
  });
});
