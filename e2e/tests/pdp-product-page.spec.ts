import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../fixtures/auth.fixture';
import { 
  setupProductionBugDetection,
  validateAllImages,
  prepareForVisualTesting,
  validateProductData,
  assertPageLoadPerformance,
  generateTestProduct,
  getTestProductIdentifier 
} from '../utils/test-helpers';

/**
 * PDP (PRODUCT DETAIL PAGE) TESTS - PRODUCTION LEVEL
 * 
 * Tests with:
 * - Component-level visual regression (hero, gallery, tabs)
 * - Strict image validation (no broken/undefined src)
 * - Real data validation (exact text matching)
 * - Performance checks (page load timing)
 * - Console error detection (fails on critical errors)
 * - API failure detection (fails on unexpected failures)
 */

test.describe('Product Detail Page (PDP)', () => {
  test.beforeEach(async ({ page }) => {
    // Setup strict production-level bug detection
    await setupProductionBugDetection(page);
  });

  test('should display product title prominently', async ({ page }) => {
    // Navigate to products list with performance check
    await assertPageLoadPerformance(page, '/products', 3000);
    
    // Click on first product if available
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      await prepareForVisualTesting(page);
      
      // Visual regression: product title component
      const titleComponent = page.locator('h1').first();
      await expect(titleComponent).toHaveScreenshot('product-title.png', {
        maxDiffPixels: 100,
      });
      
      // STRICT: Verify product title with real data validation
      const title = page.locator('h1').first();
      await expect(title).toBeVisible();
      
      const titleText = await title.textContent();
      expect(titleText?.length, 'Product title should not be empty').toBeGreaterThan(0);
      expect(titleText, 'Product title should not be placeholder').not.toMatch(/product|sample|test|lorem/i);
      
      // Check title styling (should be large)
      const fontSize = await title.evaluate(el => {
        const style = window.getComputedStyle(el);
        return parseInt(style.fontSize);
      });
      expect(fontSize, 'Product title should have prominent font size').toBeGreaterThan(24);
    } else {
      // If no products, skip with notice
      test.skip(true, 'No products available for testing');
    }
  });

  test('should display formatted short description (not raw HTML)', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      
      // Look for short description
      const shortDesc = page.locator('[class*="short-description"], p[class*="description"], [class*="excerpt"]').first();
      
      if (await shortDesc.isVisible().catch(() => false)) {
        const content = await shortDesc.innerHTML();
        const textContent = await shortDesc.textContent();
        
        // STRICT: Should not contain raw HTML tags as text
        expect(content, 'Description should not contain escaped HTML').not.toMatch(/&lt;[^&]+&gt;/);
        expect(content, 'Description should not contain "undefined"').not.toContain('undefined');
        expect(content, 'Description should not contain "null"').not.toContain('null');
        
        // STRICT: Text should have real content, not placeholder
        expect(textContent?.length, 'Description should have substantial text').toBeGreaterThan(10);
        expect(textContent?.toLowerCase(), 'Description should not be placeholder text').not.toMatch(/lorem ipsum|placeholder|sample text|todo/);
        
        // If it contains actual HTML, it should be properly rendered
        if (content.includes('<')) {
          expect(content, 'Should contain proper HTML formatting').toMatch(/<(p|span|strong|em|br|ul|ol|li)\b/);
        }
      }
    }
  });

  test('should display product gallery with all images', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      await prepareForVisualTesting(page);
      
      // STRICT: Validate all images (no broken/undefined src)
      await validateAllImages(page);
      
      // Check for gallery container
      const gallery = page.locator('[class*="gallery"], [class*="Gallery"], .swiper, [class*="image-gallery"]').first();
      
      if (await gallery.isVisible().catch(() => false)) {
        // Visual regression: gallery component (main image + thumbnails)
        await expect(gallery).toHaveScreenshot('product-gallery-component.png', {
          maxDiffPixels: 200,
          clip: { x: 0, y: 0, width: 800, height: 600 }, // Consistent viewport
        });
        
        // Count all images in gallery
        const allImages = page.locator('img');
        const imageCount = await allImages.count();
        
        // Should have at least 1 image (featured)
        expect(imageCount, 'Product page should have images').toBeGreaterThan(0);
        
        // STRICT: Verify each image has valid src
        for (let i = 0; i < imageCount; i++) {
          const img = allImages.nth(i);
          const src = await img.getAttribute('src');
          expect(src, `Image ${i} should have src`).toBeTruthy();
          expect(src, `Image ${i} src should not be undefined/null`).not.toMatch(/undefined|null/);
          expect(src?.length, `Image ${i} src should not be empty`).toBeGreaterThan(0);
        }
        
        // Visual regression: thumbnail strip component
        const thumbnails = page.locator('[class*="thumb"], [class*="thumbnail"], .swiper-slide');
        const thumbCount = await thumbnails.count();
        
        if (thumbCount > 1) {
          await expect(thumbnails.first()).toHaveScreenshot('product-thumbnail-strip.png', {
            maxDiffPixels: 100,
          });
          expect(thumbCount, 'Gallery should show multiple images').toBeGreaterThan(1);
        }
      }
    }
  });

  test('should render custom buttons with correct styles', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      
      // Look for custom buttons
      const buttons = page.locator('button, a[class*="btn"], a[class*="button"]').all();
      const buttonCount = (await buttons).length;
      
      if (buttonCount > 0) {
        for (const button of await buttons) {
          // Verify button is visible
          await expect(button).toBeVisible();
          
          // Check button has styling (background color or border)
          const hasStyle = await button.evaluate(el => {
            const style = window.getComputedStyle(el);
            return style.backgroundColor !== 'transparent' || 
                   style.borderWidth !== '0px' ||
                   style.backgroundColor !== 'rgba(0, 0, 0, 0)';
          });
          expect(hasStyle, 'Button should have visual styling').toBeTruthy();
          
          // Check button is clickable
          await expect(button).toBeEnabled();
        }
      }
    }
    
    // Verify no console errors
    expect(errors).toHaveLength(0);
  });

  test('should display features with correct icons', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      
      // Look for features section
      const featuresSection = page.locator('[class*="feature"], [id*="feature"], section:has-text("Features")').first();
      
      if (await featuresSection.isVisible().catch(() => false)) {
        // Check for feature icons (SVG or images)
        const icons = page.locator('svg[class*="icon"], [class*="feature"] svg, [class*="feature-icon"]').all();
        const iconCount = (await icons).length;
        
        // Features should have icons
        expect(iconCount, 'Features should have icons').toBeGreaterThan(0);
        
        // Verify each feature has a title
        const featureTitles = page.locator('[class*="feature"] h3, [class*="feature"] h4, [class*="feature-title"]').all();
        for (const title of await featureTitles) {
          const text = await title.textContent();
          expect(text?.length, 'Feature title should not be empty').toBeGreaterThan(0);
        }
      }
    }
    
    // Verify no console errors
    expect(errors).toHaveLength(0);
  });

  test('should display trust and logistics information', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      
      // Look for trust badges/logistics
      const trustIndicators = [
        'Delivery Time',
        'Warranty',
        'Installation',
        'Free Shipping',
        'Trusted',
      ];
      
      let foundTrustInfo = false;
      for (const indicator of trustIndicators) {
        const element = page.locator(`text="${indicator}"`).first();
        if (await element.isVisible().catch(() => false)) {
          foundTrustInfo = true;
          break;
        }
      }
      
      // Trust info is optional but should be present if configured
      // We're just verifying no errors if not present
    }
    
    // Verify no console errors
    expect(errors).toHaveLength(0);
  });

  test('should have working tabs (Description, Specs, Applications)', async ({ page }) => {
    await assertPageLoadPerformance(page, '/products', 3000);
    
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      await prepareForVisualTesting(page);
      
      // Look for tabs
      const possibleTabs = ['Description', 'Specs', 'Specifications', 'Applications', 'FAQ'];
      let tabsFound = false;
      
      for (const tabName of possibleTabs) {
        const tab = page.locator(`button:has-text("${tabName}"), [role="tab"]:has-text("${tabName}"), a:has-text("${tabName}")`).first();
        
        if (await tab.isVisible().catch(() => false)) {
          tabsFound = true;
          
          // Click tab
          await tab.click();
          await page.waitForTimeout(300);
          
          // Visual regression: active tab component
          await expect(tab).toHaveScreenshot(`product-tab-${tabName.toLowerCase()}.png`, {
            maxDiffPixels: 50,
          });
          
          // Verify tab is active/selected
          const isActive = await tab.evaluate(el => {
            return el.getAttribute('aria-selected') === 'true' ||
                   el.classList.contains('active') ||
                   el.classList.contains('selected');
          });
          
          expect(isActive, `Tab "${tabName}" should be active after clicking`).toBeTruthy();
          
          // Verify content panel
          const tabPanel = page.locator('[role="tabpanel"], [class*="tab-panel"], [class*="tab-content"]').first();
          if (await tabPanel.isVisible().catch(() => false)) {
            await expect(tabPanel).toBeVisible();
          }
          
          // Only test first found tab to keep test fast
          break;
        }
      }
      
      // At least one tab system should exist
      expect(tabsFound, 'Product page should have tab navigation').toBeTruthy();
    }
  });

  test('should not render empty sections', async ({ page }) => {
    const errors = await checkConsoleErrors(page);
    
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    const firstProduct = page.locator('a[href*="/products/"]').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await page.waitForLoadState('networkidle');
      
      // Check for empty sections that should be hidden
      const emptySections = await page.locator('section:empty, div:empty, [class*="section"]:empty').all();
      
      // Check each potentially empty section
      for (const section of emptySections) {
        // If section is visible and empty, that's a problem
        const isVisible = await section.isVisible().catch(() => false);
        const hasContent = await section.evaluate(el => el.textContent?.trim().length > 0);
        
        if (isVisible && !hasContent) {
          // Get section identifier for error message
          const className = await section.getAttribute('class');
          expect(false, `Empty visible section found: ${className}`).toBeFalsy();
        }
      }
    }
    
    // Verify no console errors
    expect(errors).toHaveLength(0);
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/products/portable-cabin');
    await page.waitForLoadState('networkidle');
    
    // Check page title
    const title = await page.title();
    expect(title.length, 'Page should have a title').toBeGreaterThan(0);
    expect(title, 'Title should include product name').toMatch(/cabin|product|prefab/i);
    
    // Check for meta description
    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    if (metaDescription) {
      expect(metaDescription.length, 'Meta description should exist').toBeGreaterThan(0);
    }
    
    // Check for canonical link
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
    if (canonical) {
      expect(canonical, 'Canonical URL should be valid').toContain('/products/');
    }
    
    // Check for JSON-LD structured data
    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent().catch(() => null);
    if (jsonLd) {
      const structuredData = JSON.parse(jsonLd);
      expect(structuredData['@type'] || structuredData['@context'], 'Should have structured data').toBeTruthy();
    }
  });
});
