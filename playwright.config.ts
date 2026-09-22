import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

/**
 * Playwright Test Configuration for DXL.com
 * Designed for POM, Auto-Healing Locators, and resilient browser automation.
 */
export default defineConfig({
  testDir: './spec',
  timeout: 180 * 1000,  // 3 minutes test timeout
  expect: {
    timeout: 25 * 1000,
  },
  // In live production e-commerce environments with third-party tracking, Akamai bot-detection,
  // and shared session state, controlling concurrency prevents DDoS tripping and CPU/network starvation.
  fullyParallel: process.env.CI ? false : true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // Optimal live environment concurrency: 2 workers (or 1 in CI) prevents socket exhaustion
  workers: process.env.CI ? 2 : 2,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  use: {
    baseURL: 'https://www.dxl.com',
    headless: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 20 * 1000,
    navigationTimeout: 35 * 1000,
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: [
            '--disable-blink-features=AutomationControlled',
          ],
        },
      },
    },


  ],
});
