import { FullConfig } from '@playwright/test';
import { cleanupTestProducts } from './utils/test-helpers';

/**
 * Global Teardown for Playwright E2E Tests
 * 
 * This runs once after all tests complete.
 * Cleans up test products to maintain clean database state.
 */

async function globalTeardown(config: FullConfig) {
  console.log('\n🎭 Playwright Global Teardown');
  
  // Get API URL from config or env
  const apiUrl = process.env.TEST_API_URL || 'http://localhost:4000';
  
  // Cleanup all test products
  console.log('\n🧹 Cleaning up test products...');
  await cleanupTestProducts(apiUrl);
  
  console.log('✅ All tests completed');
  console.log('🧹 Cleanup complete\n');
}

export default globalTeardown;
