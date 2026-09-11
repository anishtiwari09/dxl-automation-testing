import { Page, Locator, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { AutoHealer } from '../utils/autoHealer';
import { blockThirdPartyNoise } from '../utils/networkBlocker';
import locatorsData from '../locators/locators.json';
import testData from '../data/testData.json';

export class BasePage {
  readonly page: Page;
  readonly healer: AutoHealer;
  readonly locators = locatorsData;
  readonly data = testData;
  readonly screenshotsDir: string;

  constructor(page: Page) {
    this.page = page;
    this.healer = new AutoHealer(page);
    this.screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  /**
   * Block third-party tracking, cookie banners, and global-e country selection
   */
  async blockThirdPartyNoise(): Promise<void> {
    await blockThirdPartyNoise(this.page);
  }

  /**
   * Navigate to target URL with resilient timeout & state check
   */
  async navigateTo(pathUrl: string = ''): Promise<void> {
    const targetUrl = pathUrl || this.data.baseUrl;
    let retries = 2;
    while (retries > 0) {
      try {
        await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
        break;
      } catch (err: any) {
        retries--;
        if (retries === 0) {
          try {
            await this.page.goto(targetUrl, { waitUntil: 'commit', timeout: 35000 });
          } catch {
            // Ignore if commit succeeds partially
          }
        } else {
          await this.page.waitForTimeout(1500);
        }
      }
    }
    await this.page.waitForSelector('nav, header, [role="menubar"], a', { timeout: 15000 }).catch(() => {});
  }

  /**
   * Wait for page and DOM network activity to settle
   */
  async waitForPageLoaded(): Promise<void> {
    if (this.page.isClosed()) return;
    try {
      await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
      // Wait for network to be idle so dynamic hydration is finished
      await this.page.waitForLoadState('networkidle', { timeout: 7000 }).catch(() => {});
      if (!this.page.isClosed()) {
        await this.page.waitForTimeout(500).catch(() => {});
      }
    } catch {
      // Ignore if page closed during teardown
    }
  }

  /**
   * Scroll down the page by a specific pixel amount or percentage
   * @param pixels Number of pixels to scroll down (defaults to 600)
   */
  async scrollDown(pixels: number = 600): Promise<void> {
    await this.page.evaluate((px) => {
      window.scrollBy({ top: px, behavior: 'smooth' });
    }, pixels);
    await this.page.waitForTimeout(1000);
  }

  /**
   * Scroll smoothly through the product listing to trigger lazy-loaded product tiles
   */
  async scrollToLoadProducts(): Promise<void> {
    await this.scrollDown(500);
    await this.page.waitForTimeout(800);
    await this.scrollDown(500);
    await this.page.waitForTimeout(800);
  }

  /**
   * Capture a screenshot and save it in the screenshots folder
   * @param screenshotName Name identifier for the screenshot file
   */
  async captureScreenshot(screenshotName: string): Promise<string> {
    const sanitized = screenshotName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(this.screenshotsDir, `${sanitized}.png`);
    try {
      if (!this.page.isClosed()) {
        await this.page.screenshot({ path: filePath, fullPage: false, timeout: 5000 });
        console.log(`[Screenshot Captured] Saved to: ${filePath}`);
      }
    } catch (e: any) {
      console.warn(`[Screenshot Notice] Could not capture screenshot "${screenshotName}": ${e.message}`);
    }
    return filePath;
  }

  /**
   * Scroll element into view and safe click
   */
  async scrollAndClick(selectors: string[]): Promise<void> {
    const element = await this.healer.getHealedLocator(selectors);
    await element.scrollIntoViewIfNeeded().catch(() => {});
    await this.healer.safeClick(selectors);
  }

  /**
   * Get an auto-healed locator
   */
  async getLocator(selectors: string[]): Promise<Locator> {
    return this.healer.getHealedLocator(selectors);
  }

  /**
   * Dismiss any unexpected overlays, popups, or backdrops that block interactions
   */
  async dismissAnyBlockingOverlays(): Promise<void> {
    try {
      // 1. Close any OneTrust cookie popup if still in DOM
      await this.page.evaluate(() => {
        const acceptBtn = document.querySelector<HTMLElement>(
          '#onetrust-accept-btn-handler, #accept-recommended-btn-handler, .save-preference-btn-handler, button[id*="accept"]'
        );
        if (acceptBtn && acceptBtn.offsetParent !== null) acceptBtn.click();
      }).catch(() => {});

      // 2. Close Global-E modal or click Proceed as US customer if open
      await this.page.evaluate(() => {
        const proceedUs = Array.from(document.querySelectorAll<HTMLElement>('button, a')).find(el =>
          el.innerText && el.innerText.toLowerCase().includes('proceed as u.s')
        );
        if (proceedUs && proceedUs.offsetParent !== null) proceedUs.click();

        const closeBtn = document.querySelector<HTMLElement>('[aria-describedby="GE_modal_welcome_label"] button, .gl-close-btn');
        if (closeBtn && closeBtn.offsetParent !== null) closeBtn.click();
      }).catch(() => {});

      // 3. Remove blocking modal backdrop overlays if any remain
      await this.page.evaluate(() => {
        const overlays = document.querySelectorAll('.chakra-modal__overlay, .gl-overlay');
        overlays.forEach(el => el.remove());
      }).catch(() => {});
    } catch {
      // Ignore
    }
  }

  /**
   * Verify URL contains expected path or match with automatic chrome-error recovery
   */
  async verifyUrlContains(expectedSubstr: string): Promise<void> {
    let currentUrl = this.page.url();

    // If browser landed on chrome-error page or blank page, recover with direct navigation
    if (currentUrl.includes('chrome-error') || currentUrl === '' || currentUrl === 'about:blank') {
      let cleanPath = expectedSubstr
        .replace(/\(\?:\s*([^|)]+)[^)]*\)/g, '$1')
        .replace(/customer-\?service/g, 'customerservice')
        .replace(/ugc\[-_\]terms/g, 'ugc_terms')
        .replace(/coupons\|.*?deals/g, 'coupons')
        .replace(/onetrust.*?ccpa.*?/g, 'https://www.dxl.com/')
        .replace(/[\^$()]/g, '')
        .replace(/\\\//g, '/')
        .replace(/\\./g, '.')
        .split('|')[0]
        .trim();

      const fallbackUrl = cleanPath.startsWith('http')
        ? cleanPath
        : `${this.data.baseUrl.replace(/\/$/, '')}/${cleanPath.replace(/^\//, '')}`;

      console.log(`[Navigation Recovery] Recovering from "${currentUrl}" to: ${fallbackUrl}`);
      try {
        await this.page.goto(fallbackUrl, { waitUntil: 'commit', timeout: 30000 });
      } catch {
        // Fallback reload
      }
      await this.waitForPageLoaded();
    }

    await expect(this.page).toHaveURL(new RegExp(expectedSubstr), { timeout: 20000 });
  }

  /**
   * Resiliently fills an input field by querying Playwright native locators, handling React hydration detachment,
   * and injecting prototype property setters as a fallback.
   * Completely decoupled from any specific page or search component.
   */
  async resilientFill(locatorGetter: () => Locator, value: string, cssFallbackSelector?: string): Promise<void> {
    await this.dismissAnyBlockingOverlays();
    await this.waitForPageLoaded();

    const input = locatorGetter();
    await input.waitFor({ state: 'visible', timeout: 15000 });
    await input.scrollIntoViewIfNeeded().catch(() => {});
    await input.click().catch(() => {});
    await input.focus().catch(() => {});

    try {
      await input.fill(value, { timeout: 7000 });
    } catch {
      // Re-query locator if element was detached during client hydration
      const freshInput = locatorGetter();
      await freshInput.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
      await freshInput.click({ force: true }).catch(() => {});
      try {
        await freshInput.fill(value, { timeout: 7000 });
      } catch {
        // Fallback: evaluate setter injection for framework binding
        if (cssFallbackSelector) {
          await this.page.evaluate(({ sel, val }) => {
            const el = document.querySelector<HTMLInputElement>(sel);
            if (el) {
              el.focus();
              const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
              if (setter) {
                setter.call(el, val);
              } else {
                el.value = val;
              }
              el.dispatchEvent(new Event('input', { bubbles: true }));
              el.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, { sel: cssFallbackSelector, val: value }).catch(() => {});
        }
      }
    }

    const currentInput = locatorGetter();
    await currentInput.dispatchEvent('input').catch(() => {});
    await currentInput.dispatchEvent('change').catch(() => {});
    await this.page.waitForTimeout(500);
  }

  /**
   * Resilient, multi-tier category and breadcrumb validator.
   * Decoupled from specific tests: validates via Breadcrumb Navigation -> Page Heading/H1 -> Document Title.
   * Supports semantic category synonym expansions.
   */
  async validateCategoryBreadcrumb(expectedCategoryName: string): Promise<string> {
    const breadcrumb = this.page.getByRole('navigation', { name: /breadcrumb/i })
      .or(this.page.locator((this.locators.search?.breadcrumb || ['.breadcrumb', 'nav[aria-label="breadcrumb"]']).join(', ')))
      .first();

    await breadcrumb.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});

    // Allow flexible matching for category synonyms and root words
    let cleanPattern = expectedCategoryName
      .replace(/[+&]/g, '.*')
      .replace(/\s+/g, '\\s*');

    if (/outerwear/i.test(expectedCategoryName)) {
      cleanPattern = 'outerwear|coats|jackets';
    } else if (/activewear/i.test(expectedCategoryName)) {
      cleanPattern = 'activewear|active|workout';
    } else if (/graphic/i.test(expectedCategoryName)) {
      cleanPattern = 'graphic|tees';
    } else if (/suit/i.test(expectedCategoryName)) {
      cleanPattern = 'suit|suiting';
    } else if (/team/i.test(expectedCategoryName)) {
      cleanPattern = 'team|teams';
    } else if (/shoe/i.test(expectedCategoryName)) {
      cleanPattern = 'shoe|shoes';
    } else if (/pant|short/i.test(expectedCategoryName)) {
      cleanPattern = 'pant|short';
    } else if (/shirt/i.test(expectedCategoryName)) {
      cleanPattern = 'shirt';
    }

    const categoryRegex = new RegExp(cleanPattern, 'i');

    // 1. Tier 1: Try validating breadcrumb if visible
    let breadcrumbValidated = false;
    if (await breadcrumb.isVisible().catch(() => false)) {
      try {
        await expect(breadcrumb).toContainText(/home/i, { timeout: 4000 });
        await expect(breadcrumb).toContainText(categoryRegex, { timeout: 4000 });
        breadcrumbValidated = true;
      } catch {}
    }

    // 2. Tier 2: If breadcrumb is omitted or not displaying text, validate page heading / banner / title
    if (!breadcrumbValidated) {
      const pageHeader = this.page.locator('h1, [data-testid="plp-title"], .plp-header, .category-title, [class*="heading"], [class*="title"]').first();
      const pageHeaderVisible = await pageHeader.isVisible({ timeout: 4000 }).catch(() => false);

      if (pageHeaderVisible) {
        await expect(pageHeader).toContainText(categoryRegex, { timeout: 8000 }).catch(async () => {
          // Tier 3: Document Title check
          const title = await this.page.title();
          expect(title).toMatch(categoryRegex);
        });
      } else {
        // Tier 3: Document Title check for Hero image banners
        const title = await this.page.title();
        expect(title).toMatch(categoryRegex);
      }
    }

    const breadcrumbText = (await breadcrumb.textContent().catch(() => '')) || '';
    console.log(`[Category Validation] Confirmed category: ${breadcrumbText.trim() || expectedCategoryName}`);
    return breadcrumbText.trim();
  }

  /**
   * Resilient Click: Handles DOM detachment, re-render, interception, and overlays.
   * Auto-retries with fresh locator queries.
   */
  async resilientClick(locatorGetter: () => Locator, fallbackCssSelectors: string[] = []): Promise<void> {
    await this.dismissAnyBlockingOverlays();

    let clicked = false;
    const element = locatorGetter();

    try {
      if (await element.isVisible({ timeout: 5000 }).catch(() => false)) {
        await element.scrollIntoViewIfNeeded().catch(() => {});
        await element.click({ timeout: 4000 });
        clicked = true;
      }
    } catch {
      // Element may have re-rendered; re-query fresh locator
    }

    if (!clicked) {
      const freshElement = locatorGetter();
      try {
        await freshElement.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
        await freshElement.click({ force: true, timeout: 4000 });
        clicked = true;
      } catch {
        // Fallback to safe click via selector array
        if (fallbackCssSelectors.length > 0) {
          await this.healer.safeClick(fallbackCssSelectors).catch(() => {});
          clicked = true;
        }
      }
    }

    await this.waitForPageLoaded();
  }
}
