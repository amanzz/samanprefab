import { chromium, FullConfig } from '@playwright/test';

/**
 * Global Setup for Playwright E2E Tests
 * 
 * This runs once before all tests start.
 * Can be used to:
 * - Seed test database
 * - Create test users
 * - Verify dev server is running
 */

async function globalSetup(config: FullConfig) {
  console.log('🎭 Playwright Global Setup');
  
  // Verify dev server is accessible
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000';
  
  let retries = 5;
  let serverReady = false;
  
  while (retries > 0 && !serverReady) {
    try {
      const response = await fetch(baseURL);
      if (response.ok || response.status === 404) { // 404 means server is up, just route not found
        serverReady = true;
        console.log(`✅ Dev server ready at ${baseURL}`);
      }
    } catch (error) {
      console.log(`⏳ Waiting for dev server... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      retries--;
    }
  }
  
  if (!serverReady) {
    console.warn('⚠️ Could not connect to dev server. Tests may fail if server is not running.');
    console.log('💡 Start the dev server with: npm run dev');
  }
  
  // Check API server
  const apiURL = process.env.TEST_API_URL || 'http://localhost:4000';
  try {
    const response = await fetch(`${apiURL}/api/health`).catch(() => fetch(apiURL));
    if (response.ok || response.status === 404) {
      console.log(`✅ API server ready at ${apiURL}`);
    }
  } catch {
    console.warn(`⚠️ Could not connect to API server at ${apiURL}`);
  }
  
  console.log('🚀 Starting tests...\n');
}

export default globalSetup;
