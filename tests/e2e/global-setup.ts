import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Starting E2E test setup...');
  console.log('E2E test setup complete');
}

export default globalSetup;
