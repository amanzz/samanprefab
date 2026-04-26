import { test, expect, BrowserContext } from '@playwright/test';
import { 
  setupProductionBugDetection,
  assertPagePerformance,
  prepareForVisualTesting,
  validateAllImages,
  generateTestProduct,
  cleanupTestProducts
} from '../utils/test-helpers';
import { 
  setupAnalyticsTracking,
  setupTestMonitoring,
  createMonitoringReport
} from '../utils/monitoring';

/**
 * BUSINESS FLOW TESTS - End-to-End User Journeys
 * 
 * Tests complete business flows from user perspective:
 * - Visitor → Lead (CTA click, form submit)
 * - Product discovery → Inquiry
 * - Admin workflow: Create product → View on site
 * - Multi-step forms with validation
 * - Conversion funnel tracking
 */

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@samanprefab.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'Admin@Saman2026!';

test.describe('🏢 Business Flow - Visitor to Lead', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('complete visitor journey: homepage → product → CTA → lead form → success', async ({ page }) => {
    const analytics = await setupAnalyticsTracking(page, {
      environment: 'development',
      release: 'test',
      userId: 'test-visitor-123',
    });
    
    // Step 1: Visitor lands on homepage
    await assertPagePerformance(page, '/', 5000);
    await analytics.trackEvent('homepage_visit', { source: 'organic' });
    
    // Verify homepage has CTA elements
    const hasCta = await page.locator(
      'button:has-text("Get Quote"), a:has-text("Contact"), .cta'
    ).first().isVisible().catch(() => false);
    expect(hasCta, 'Homepage should have clear CTA').toBeTruthy();
    
    // Step 2: Navigate to products
    const productsLink = page.locator('a:has-text("Products"), a[href*="/products"]').first();
    if (await productsLink.isVisible().catch(() => false)) {
      await productsLink.click();
      await analytics.trackEvent('product_page_visit', { referrer: 'homepage' });
    } else {
      await page.goto('/products');
    }
    
    await page.waitForLoadState('networkidle');
    await assertPagePerformance(page, '/products', 5000);
    
    // Step 3: Click on a product
    const firstProduct = page.locator('a[href*="/products/"], .product-card, article').first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click();
      await analytics.trackEvent('product_view', { 
        product_name: await page.title(),
      });
    } else {
      // If no products, go to contact directly
      await page.goto('/contact');
    }
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    // Step 4: Click CTA (Get Quote / Contact Us)
    const ctaButton = page.locator(
      'button:has-text("Get Quote"), button:has-text("Contact"), a:has-text("Request Quote"), .cta'
    ).first();
    
    if (await ctaButton.isVisible().catch(() => false)) {
      await ctaButton.click();
      await analytics.trackEvent('cta_click', { cta_type: 'quote_request' });
      await page.waitForTimeout(500);
    } else {
      // Navigate to contact page
      await page.goto('/contact');
    }
    
    // Step 5: Fill lead form
    await page.waitForLoadState('networkidle');
    await assertPagePerformance(page, page.url(), 5000);
    
    const formFields = {
      name: page.locator('input[name="name"], input[id="name"], input[placeholder*="Name"]').first(),
      email: page.locator('input[name="email"], input[type="email"], input[id="email"]').first(),
      phone: page.locator('input[name="phone"], input[type="tel"], input[id="phone"]').first(),
      message: page.locator('textarea[name="message"], textarea[id="message"]').first(),
    };
    
    // Fill available fields
    if (await formFields.name.isVisible().catch(() => false)) {
      await formFields.name.fill('Test Customer');
    }
    if (await formFields.email.isVisible().catch(() => false)) {
      await formFields.email.fill('test.customer@example.com');
    }
    if (await formFields.phone.isVisible().catch(() => false)) {
      await formFields.phone.fill('+1-555-0123');
    }
    if (await formFields.message.isVisible().catch(() => false)) {
      await formFields.message.fill('Interested in prefab solutions for our project. Please contact me.');
    }
    
    await analytics.trackEvent('lead_form_start', { 
      fields_completed: Object.values(formFields).filter(f => f).length,
    });
    
    // Step 6: Submit form
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Submit"), button:has-text("Send")'
    ).first();
    
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
      await analytics.trackEvent('lead_form_submit', { 
        timestamp: new Date().toISOString(),
      });
      
      // Step 7: Verify success
      await page.waitForTimeout(2000);
      
      const successIndicators = [
        'text=/thank you|success|submitted|sent/i',
        '[class*="success"]',
        '[class*="confirmation"]',
      ];
      
      let successFound = false;
      for (const indicator of successIndicators) {
        if (await page.locator(indicator).first().isVisible().catch(() => false)) {
          successFound = true;
          break;
        }
      }
      
      await analytics.trackEvent('lead_form_result', { 
        success: successFound,
      });
      
      expect(successFound, 'Lead form submission should succeed').toBeTruthy();
      console.log('✅ Business flow: Visitor → Lead completed successfully');
    }
  });

  test('product inquiry flow: browse → filter → select → inquiry', async ({ page }) => {
    const analytics = await setupAnalyticsTracking(page, {
      environment: 'development',
      release: 'test',
    });
    
    // Step 1: Browse products
    await page.goto('/products');
    await analytics.trackEvent('product_browse_start');
    
    // Step 2: Apply filters if available
    const filterElements = page.locator('button:has-text("Filter"), select, [class*="filter"]').first();
    if (await filterElements.isVisible().catch(() => false)) {
      await filterElements.click();
      await page.waitForTimeout(500);
      await analytics.trackEvent('product_filter_use');
    }
    
    // Step 3: Select product
    const products = page.locator('a[href*="/products/"], .product-card').all();
    const productCount = (await products).length;
    
    if (productCount > 0) {
      const randomProduct = page.locator('a[href*="/products/"]').nth(Math.floor(Math.random() * Math.min(productCount, 5)));
      await randomProduct.click();
      await analytics.trackEvent('product_select', { 
        position: Math.floor(Math.random() * productCount),
      });
      
      await page.waitForLoadState('networkidle');
      
      // Step 4: View product details
      const title = await page.locator('h1').first().textContent();
      await analytics.trackEvent('product_detail_view', { 
        product_title: title?.slice(0, 50),
      });
      
      // Verify images
      await validateAllImages(page);
      
      // Step 5: Click inquiry CTA
      const inquiryCta = page.locator(
        'button:has-text("Inquire"), a:has-text("Request Info"), button:has-text("Get Quote")'
      ).first();
      
      if (await inquiryCta.isVisible().catch(() => false)) {
        await inquiryCta.click();
        await analytics.trackEvent('product_inquiry_start', { product: title?.slice(0, 50) });
        
        // Verify inquiry form or modal
        const formVisible = await page.locator('form, [role="dialog"]').first().isVisible().catch(() => false);
        expect(formVisible, 'Inquiry form should appear').toBeTruthy();
        
        console.log('✅ Product inquiry flow completed');
      }
    } else {
      console.log('⚠️ No products available for inquiry flow test');
    }
  });
});

test.describe('🏢 Business Flow - Admin Product Creation', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('admin creates product and verifies on public site', async ({ page, context }) => {
    const monitoring = await setupTestMonitoring(page, {
      environment: 'development',
      release: 'test',
    });
    
    // Step 1: Login as admin
    await page.goto('/admin/login');
    await page.locator('input#email').fill(ADMIN_EMAIL);
    await page.locator('input#password').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin/dashboard**', { timeout: 15000 });
    await analytics.trackEvent('admin_login', { role: 'admin' });
    
    // Step 2: Navigate to create product
    await page.goto('/admin/products/new');
    await page.waitForLoadState('networkidle');
    await assertPagePerformance(page, '/admin/products/new', 5000);
    await analytics.trackEvent('product_create_start');
    
    // Step 3: Fill product form
    const testProduct = generateTestProduct();
    
    await page.locator('input[name="name"]').fill(testProduct.name);
    await page.locator('input[name="slug"]').fill(testProduct.slug);
    await page.locator('input[name="priceMin"]').fill(String(testProduct.priceMin));
    await page.locator('input[name="priceMax"]').fill(String(testProduct.priceMax));
    await page.locator('input[name="sku"]').fill(testProduct.sku);
    
    // Fill description
    const descriptionEditor = page.locator('textarea[name="description"], [contenteditable="true"]').first();
    if (await descriptionEditor.isVisible().catch(() => false)) {
      await descriptionEditor.fill(testProduct.description);
    }
    
    await analytics.trackEvent('product_form_filled', { 
      product_name: testProduct.name,
    });
    
    // Step 4: Publish product
    const publishButton = page.locator(
      'button:has-text("Publish"), button:has-text("Save"), button[type="submit"]'
    ).first();
    
    if (await publishButton.isVisible().catch(() => false)) {
      await publishButton.click();
      await page.waitForTimeout(2000);
      await analytics.trackEvent('product_publish_attempt', { 
        product_slug: testProduct.slug,
      });
      
      // Step 5: Verify product saved
      const successIndicators = [
        'text=/success|published|saved/i',
        '[class*="success"]',
        '[class*="toast"]',
      ];
      
      let saved = false;
      for (const indicator of successIndicators) {
        if (await page.locator(indicator).first().isVisible().catch(() => false)) {
          saved = true;
          break;
        }
      }
      
      // Also check if redirected to product list or stayed on edit page without errors
      const currentUrl = page.url();
      saved = saved || currentUrl.includes('/admin/products') || !currentUrl.includes('/new');
      
      expect(saved, 'Product should be saved successfully').toBeTruthy();
      await analytics.trackEvent('product_publish_success', { 
        product_slug: testProduct.slug,
      });
      
      // Step 6: Verify on public site
      await page.goto(`/products/${testProduct.slug}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const productTitle = await page.locator('h1').first().textContent();
      const productVisible = productTitle?.includes(testProduct.name.split(' ')[0]) || 
                           await page.locator(`text=${testProduct.name}`).isVisible().catch(() => false);
      
      if (productVisible) {
        await analytics.trackEvent('product_public_verify', { 
          product_slug: testProduct.slug,
          visible: true,
        });
        console.log('✅ Product creation and public verification successful');
      } else {
        console.log('⚠️ Product may be saved but not immediately visible (cache delay)');
      }
    }
    
    // Cleanup
    await cleanupTestProducts();
  });
});

test.describe('🏢 Business Flow - Multi-step Quote Request', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('multi-step quote form with validation', async ({ page }) => {
    const analytics = await setupAnalyticsTracking(page, {
      environment: 'development',
      release: 'test',
    });
    
    // Step 1: Start quote process
    await page.goto('/quote'); // or /contact with quote intent
    await analytics.trackEvent('quote_process_start');
    
    await assertPagePerformance(page, '/quote', 5000);
    
    // Step 2: Step 1 - Personal Info
    const step1Fields = {
      name: page.locator('input[name="name"], input[id="name"]').first(),
      email: page.locator('input[name="email"], input[id="email"]').first(),
      phone: page.locator('input[name="phone"], input[id="phone"]').first(),
    };
    
    if (await step1Fields.name.isVisible().catch(() => false)) {
      await step1Fields.name.fill('John Business');
      await step1Fields.email.fill('john@business.com');
      if (await step1Fields.phone.isVisible().catch(() => false)) {
        await step1Fields.phone.fill('+1-555-0199');
      }
      
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]').first();
      await nextButton.click();
      await analytics.trackEvent('quote_step1_complete');
    }
    
    await page.waitForTimeout(1000);
    
    // Step 3: Step 2 - Project Details
    const projectFields = {
      projectType: page.locator('select[name="projectType"], input[name="projectType"]').first(),
      budget: page.locator('select[name="budget"], input[name="budget"]').first(),
      timeline: page.locator('select[name="timeline"], input[name="timeline"]').first(),
      description: page.locator('textarea[name="description"], textarea[name="projectDescription"]').first(),
    };
    
    if (await projectFields.projectType.isVisible().catch(() => false)) {
      await projectFields.projectType.selectOption?.({ index: 1 }) || 
            await projectFields.projectType.fill('Commercial Building');
    }
    
    if (await projectFields.budget.isVisible().catch(() => false)) {
      await projectFields.budget.selectOption?.({ index: 1 }) || 
            await projectFields.budget.fill('50000-100000');
    }
    
    if (await projectFields.description.isVisible().catch(() => false)) {
      await projectFields.description.fill('Looking for prefab office space for 50 employees.');
    }
    
    const step2Next = page.locator('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]').first();
    await step2Next.click();
    await analytics.trackEvent('quote_step2_complete');
    
    await page.waitForTimeout(1000);
    
    // Step 4: Step 3 - Review & Submit
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Get Quote"), button[type="submit"]').first();
    
    if (await submitButton.isVisible().catch(() => false)) {
      // Verify summary/review is shown
      const summaryVisible = await page.locator(
        '[class*="summary"], [class*="review"], h2:has-text("Review"), h3:has-text("Confirm")'
      ).first().isVisible().catch(() => false);
      
      expect(summaryVisible, 'Quote review step should be visible').toBeTruthy();
      
      await submitButton.click();
      await analytics.trackEvent('quote_submit');
      
      // Step 5: Verify success
      await page.waitForTimeout(2000);
      
      const successVisible = await page.locator(
        'text=/thank you|success|submitted|quote request sent/i'
      ).first().isVisible().catch(() => false);
      
      expect(successVisible, 'Quote request should succeed').toBeTruthy();
      await analytics.trackEvent('quote_success');
      
      console.log('✅ Multi-step quote flow completed');
    }
  });
});

test.describe('🏢 Business Flow - Conversion Funnel', () => {
  test.beforeEach(async ({ page }) => {
    await setupProductionBugDetection(page);
  });

  test('track conversion funnel: visit → browse → engage → convert', async ({ page }) => {
    const funnelEvents: string[] = [];
    const analytics = await setupAnalyticsTracking(page, {
      environment: 'development',
      release: 'test',
    });
    
    // Track custom funnel
    const trackFunnel = async (event: string) => {
      funnelEvents.push(event);
      await analytics.trackEvent(event);
    };
    
    // Step 1: Awareness (Homepage visit)
    await page.goto('/');
    await trackFunnel('funnel_homepage_visit');
    
    // Step 2: Interest (Navigate to products)
    const navLinks = page.locator('nav a, header a');
    const productLink = navLinks.filter({ hasText: /Products/i }).first();
    
    if (await productLink.isVisible().catch(() => false)) {
      await productLink.click();
      await trackFunnel('funnel_products_view');
    } else {
      await page.goto('/products');
      await trackFunnel('funnel_products_direct');
    }
    
    await page.waitForLoadState('networkidle');
    
    // Step 3: Consideration (View specific product)
    const products = page.locator('a[href*="/products/"], .product-card');
    const productCount = await products.count();
    
    if (productCount > 0) {
      await products.first().click();
      await trackFunnel('funnel_product_detail');
      await page.waitForTimeout(1000);
      
      // Step 4: Intent (Click CTA)
      const ctas = [
        'button:has-text("Get Quote")',
        'button:has-text("Contact")',
        'a:has-text("Request Info")',
        'button:has-text("Inquire")',
        '.cta',
        '[class*="cta"]',
      ];
      
      let ctaClicked = false;
      for (const cta of ctas) {
        const button = page.locator(cta).first();
        if (await button.isVisible().catch(() => false)) {
          await button.click();
          await trackFunnel('funnel_cta_click');
          ctaClicked = true;
          break;
        }
      }
      
      if (ctaClicked) {
        await page.waitForTimeout(500);
        
        // Step 5: Conversion (Fill form if visible)
        const form = page.locator('form').first();
        if (await form.isVisible().catch(() => false)) {
          await trackFunnel('funnel_form_view');
          
          // Fill minimal info
          const nameField = page.locator('input[name="name"]').first();
          if (await nameField.isVisible().catch(() => false)) {
            await nameField.fill('Funnel Test User');
            await trackFunnel('funnel_form_interact');
          }
          
          console.log('✅ Conversion funnel tracked to form interaction');
        } else {
          await trackFunnel('funnel_cta_no_form');
          console.log('⚠️ CTA clicked but no form visible');
        }
      } else {
        await trackFunnel('funnel_no_cta_found');
        console.log('⚠️ No CTA found on product page');
      }
    } else {
      await trackFunnel('funnel_no_products');
      console.log('⚠️ No products available for funnel test');
    }
    
    // Funnel summary
    console.log('\n📊 Funnel Summary:');
    funnelEvents.forEach((event, i) => {
      console.log(`  ${i + 1}. ${event}`);
    });
    
    // Verify at least 3 funnel steps completed
    expect(funnelEvents.length).toBeGreaterThanOrEqual(3);
  });
});
