import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { FooterPage } from '../pages/FooterPage';
import { MegaMenuPage } from '../pages/MegaMenuPage';
import { SearchBrowsePage } from '../pages/SearchBrowsePage';
import { blockThirdPartyNoise } from '../utils/networkBlocker';

// Declare types for fixtures
type DxlFixtures = {
  homePage: HomePage;
  footerPage: FooterPage;
  megaMenuPage: MegaMenuPage;
  searchBrowsePage: SearchBrowsePage;
  autoSetup: void;
};

/**
 * Custom Playwright Test Fixture with automatic Initial Setup:
 * - Locks 3rd party scripts (country selector, cookie consent, trackers)
 * - Navigates to https://www.dxl.com/
 * - Performs initial fallback setup
 * - Runs automatically for every test in every spec
 */
export const test = base.extend<DxlFixtures>({
  // Auto fixture that runs before EVERY test
  autoSetup: [
    async ({ page }, use) => {
      // Reset stale browser state before entering the site so every test begins cleanly.
      await page.context().clearCookies().catch(() => {});
      await page.evaluate(() => {
        try {
          window.localStorage.clear();
        } catch {}
        try {
          window.sessionStorage.clear();
        } catch {}
      }).catch(() => {});

      await blockThirdPartyNoise(page);

      const homePage = new HomePage(page);
      await homePage.performInitialSetup();
      await use();
    },
    { auto: true },
  ],

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  footerPage: async ({ page }, use) => {
    const footerPage = new FooterPage(page);
    await use(footerPage);
  },

  megaMenuPage: async ({ page }, use) => {
    const megaMenuPage = new MegaMenuPage(page);
    await use(megaMenuPage);
  },

  searchBrowsePage: async ({ page }, use) => {
    const searchBrowsePage = new SearchBrowsePage(page);
    await use(searchBrowsePage);
  },
});

export { expect } from '@playwright/test';
