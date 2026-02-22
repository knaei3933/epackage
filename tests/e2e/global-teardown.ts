import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('Starting E2E test cleanup...');
  console.log('E2E test cleanup complete');
}

export default globalTeardown;
