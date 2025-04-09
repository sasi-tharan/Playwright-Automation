import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from `.env` file based on the environment
dotenv.config({ path: `.env.${process.env.NODE_ENV || 'dev'}` });

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  // reporter: "allure-playwright",
  // reporter: [["line"], ["allure-playwright"]],
  // workers: 4,
  // retries: 1,
  timeout: 30 * 1000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    headless : false,
    screenshot : 'on-first-failure',
    video : 'retain-on-failure',
    // trace: 'on',
    // headless : false,
    // screenshot : 'on',
    // video : 'on',
    // viewport : {width:720, height:720},
    // ignoreHTTPSErrors : true,
    // permissions : ['geolocation'], // brower will allow permission for geoloaction
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'APITests',
      testDir: './tests/api',  // Directory for API tests
      use: {
        baseURL: process.env.API_BASE_URL || 'https://dummyjson.com',  // API Base URL from environment variable
      },
    },
    {
      name: 'UITests',
      testDir: './tests/ui',  // Directory for UI tests
      use: {
        baseURL: process.env.UI_BASE_URL || 'https://thinking-tester-contact-list.herokuapp.com/',  // UI Base URL from environment variable
      },
    },
    {
      name: 'UITestsChrome',
      testDir: './tests/ui',  // Directory for UI tests
      use: {
        baseURL: process.env.UI_BASE_URL || 'https://thinking-tester-contact-list.herokuapp.com/',
        browserName : 'chromium'
      },
    },
    {
      name: 'UITestsFirefox',
      testDir: './tests/ui',  // Directory for UI tests
      use: {
        baseURL: process.env.UI_BASE_URL || 'https://thinking-tester-contact-list.herokuapp.com/',
        browserName : 'firefox'
      },
    },
    {
      name: 'UITestsSafari',
      testDir: './tests/ui',
      use: {
        baseURL: process.env.UI_BASE_URL || 'https://thinking-tester-contact-list.herokuapp.com/',
        browserName: 'webkit', // Safari browser
      },
    },
    {
      name: 'UITestsMobileChrome',
      testDir: './tests/ui',
      use: {
        baseURL: process.env.UI_BASE_URL || 'https://thinking-tester-contact-list.herokuapp.com/',
        browserName: 'chromium', // Mobile Chrome
        ...devices['Pixel 5'], // Mobile Chrome with Pixel 5 emulation
      },
    },
    {
      name: 'UITestsMobileSafari',
      testDir: './tests/ui',
      use: {
        baseURL: process.env.UI_BASE_URL || 'https://thinking-tester-contact-list.herokuapp.com/',
        browserName: 'webkit', // Mobile Safari
        ...devices['iPhone 12'], // Mobile Safari with iPhone 12 emulation
      },
    },
    {
      name: 'UITestsIphone14',
      testDir: './tests/ui',
      use: {
        baseURL: process.env.UI_BASE_URL || 'https://thinking-tester-contact-list.herokuapp.com/',
        browserName: 'webkit', // Safari browser
        ...devices['iPhone 14'], // iPhone 14 emulation
      },
    },
    {
      name: 'UITestsPixel7',
      testDir: './tests/ui',
      use: {
        baseURL: process.env.UI_BASE_URL || 'https://thinking-tester-contact-list.herokuapp.com/',
        browserName: 'chromium', // Chrome browser
        ...devices['Pixel 7'], // Pixel 7 emulation
      },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
