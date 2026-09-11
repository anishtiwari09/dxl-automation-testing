import { Locator, Page } from '@playwright/test';

/**
 * AutoHealer Utility
 * Locates visible elements using prioritized candidate selectors (from locators.json).
 * Automatically heals broken/flaky selectors and handles responsive variants (desktop vs mobile).
 */
export class AutoHealer {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Tries locators in order until one is visible.
   */
  async getHealedLocator(selectors: string[], timeout: number = 4000): Promise<Locator> {
    if (!selectors || selectors.length === 0) {
      throw new Error('AutoHealer: No selector candidates provided.');
    }

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      try {
        const locator = this.page.locator(selector).first();
        await locator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
        if (await locator.isVisible().catch(() => false)) {
          if (i > 0) {
            console.warn(`[Auto-Heal] Primary selector "${selectors[0]}" healed with candidate [${i}]: "${selector}"`);
          }
          return locator;
        }
      } catch {
        // Try next candidate
      }
    }

    // Default fallback with a short visibility wait so hidden duplicates do not cause the click to land on a stale element.
    const fallback = this.page.locator(selectors[0]).first();
    await fallback.waitFor({ state: 'visible', timeout: timeout }).catch(() => {});
    return fallback;
  }

  /**
   * Safely clicks the visible element among candidate selectors
   */
  async safeClick(selectors: string[], timeout: number = 6000): Promise<void> {
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      try {
        const locator = this.page.locator(selector).first();
        await locator.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
        if (await locator.isVisible().catch(() => false)) {
          await locator.scrollIntoViewIfNeeded().catch(() => {});
          await locator.click({ timeout: 4000 });
          if (i > 0) {
            console.warn(`[Auto-Heal Action] Click succeeded using healed selector [${i}]: "${selector}"`);
          }
          return;
        }
      } catch {
        // Continue to next
      }
    }

    // Fallback: Dispatch DOM click via evaluate if intercepted or partially out of view
    for (const selector of selectors) {
      const clicked = await this.page.evaluate((sel) => {
        const elements = Array.from(document.querySelectorAll(sel));
        const visibleEl = elements.find((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
        }) as HTMLElement | undefined;

        if (visibleEl) {
          visibleEl.scrollIntoView({ behavior: 'instant', block: 'center' });
          visibleEl.click();
          return true;
        }
        return false;
      }, selector).catch(() => false);

      if (clicked) {
        console.warn(`[Auto-Heal JS] Click executed via DOM dispatch for: "${selector}"`);
        return;
      }
    }

    // Final attempt if page is still open
    if (!this.page.isClosed()) {
      const fallback = this.page.locator(selectors[0]).first();
      await fallback.waitFor({ state: 'visible', timeout: timeout }).catch(() => {});
      await fallback.click({ force: true }).catch(() => {});
    }
  }

  /**
   * Safely hovers over the visible element
   */
  async safeHover(selectors: string[], timeout: number = 6000): Promise<void> {
    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      try {
        const matches = await this.page.locator(selector).all();
        for (const match of matches) {
          if (await match.isVisible().catch(() => false)) {
            await match.scrollIntoViewIfNeeded().catch(() => {});
            await match.hover({ timeout: 3000 });
            if (i > 0) {
              console.warn(`[Auto-Heal Action] Hover succeeded using healed selector [${i}]: "${selector}"`);
            }
            return;
          }
        }
      } catch {
        // Continue to fallback
      }
    }

    if (!this.page.isClosed()) {
      await this.page.locator(selectors[0]).first().hover({ force: true }).catch(() => {});
    }
  }
}
