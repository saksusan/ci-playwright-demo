import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  // where your tests live
  testDir: './ui/tests',

  // runs global-setup.js ONCE before any test starts
  globalSetup: './global-setup.js',

  // run test files in parallel
  fullyParallel: true,

  // if you accidentally write test.only — CI will fail the build
  forbidOnly: !!process.env.CI,

  // retry failed tests on CI only — not locally
  retries: process.env.CI ? 2 : 0,

  // CI runs 1 worker (no parallel) — locally uses all your CPU cores
  workers: process.env.CI ? 1 : undefined,

  // HTML report — open with: npx playwright show-report
  reporter: 'html',

  // reads TAGS=@smoke from yml and filters tests
  // if no tag given — runs everything
  grep: process.env.TAGS ? new RegExp(process.env.TAGS) : undefined,

  // shared settings for ALL tests
  use: {
    // launch options to slow down test execution (delay in milliseconds)
    // launchOptions: {
    //   slowMo: 1000,
    // },

    // base url — so you can write page.goto('/') instead of full url
    baseURL: 'http://localhost:3000',

    // every test starts already logged in — token from global-setup.js
    storageState: 'auth.json',

    // saves a trace when a test fails on first retry — helps debug
    trace: 'on-first-retry',

    // takes screenshot when test fails
    screenshot: 'only-on-failure',
  },

  // browsers to run tests on
  projects: [
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

});