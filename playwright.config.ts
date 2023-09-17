import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Read environment variables from file.
// See https://github.com/motdotla/dotenv.
require('dotenv').config();

export const STORAGE_STATE_PATH = path.join(__dirname, '.auth.json');

// See https://playwright.dev/docs/test-configuration.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // Retry on CI only.
  retries: process.env.CI ? 2 : 0,
  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,
  // Reporter to use.
  // See https://playwright.dev/docs/test-reporters.
  reporter: 'html',
  // Shared settings for all the projects below.
  // See https://playwright.dev/docs/api/class-testoptions.
  use: {
    // Collect trace when retrying the failed test.
    // See https://playwright.dev/docs/trace-viewer.
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: 'global.setup.ts',
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE_PATH,
      },
    },
  ],
});