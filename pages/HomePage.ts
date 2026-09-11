import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Initial Setup required for all test cases:
   * 1. Go to website link
   * 2. Ensure third-party noise/overlays are dismissed
   * 3. Ensure page stability
   */
  async performInitialSetup(): Promise<void> {
    await this.navigateTo();
    await this.dismissAnyBlockingOverlays();
    await this.waitForPageLoaded();
  }
}
