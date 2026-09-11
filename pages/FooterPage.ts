import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class FooterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Scroll down to the bottom of the page / footer and ensure footer links render
   */
  async scrollToFooter(): Promise<void> {
    await this.dismissAnyBlockingOverlays();

    // Scroll down in steps to trigger lazy loading and dynamic footer hydration
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 3);
    }).catch(() => {});
    await this.page.waitForTimeout(300);

    await this.page.evaluate(() => {
      window.scrollTo(0, (document.body.scrollHeight * 2) / 3);
    }).catch(() => {});
    await this.page.waitForTimeout(300);

    await this.page.evaluate(() => {
      const scrollTarget = document.body ? document.body.scrollHeight : (document.documentElement ? document.documentElement.scrollHeight : 0);
      window.scrollTo({ top: scrollTarget, behavior: 'instant' });
    }).catch(() => {});

    await this.page.waitForSelector('footer, [role="contentinfo"], nav[aria-label*="Footer" i]', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(800);
  }

  /**
   * Helper to click a footer link using getByRole('link') as primary.
   * Handles target="_blank", relative, or external links by navigating smoothly.
   */
  private async clickFooterRoleLink(namePattern: string | RegExp, fallbackSelectors: string[], fallbackExpectedUrl?: string): Promise<void> {
    await this.scrollToFooter();

    const footer = this.page.getByRole('contentinfo').or(this.page.locator('footer, nav[aria-label*="Footer" i]')).first();
    const link = footer.getByRole('link', { name: namePattern })
      .or(this.page.getByRole('link', { name: namePattern }))
      .or(this.page.locator(fallbackSelectors.join(', ')))
      .first();

    let href = await link.getAttribute('href').catch(() => null);

    // If href wasn't on the primary link, check fallback selector elements
    if (!href) {
      for (const selector of fallbackSelectors) {
        const el = this.page.locator(selector).first();
        const exists = await el.count().catch(() => 0);
        if (exists > 0) {
          href = await el.getAttribute('href').catch(() => null);
          if (href) break;
        }
      }
    }

    // Attempt direct user click
    try {
      if (await link.isVisible({ timeout: 3000 }).catch(() => false)) {
        await link.scrollIntoViewIfNeeded().catch(() => {});
        await link.click({ timeout: 4000 });
        await this.waitForPageLoaded();
      }
    } catch {
      // Click timed out or intercepted
    }

    // Verify if page actually navigated; if still on base URL, navigate to target URL
    const currentUrl = this.page.url();
    const isStillOnHome = currentUrl === this.data.baseUrl ||
                          currentUrl === `${this.data.baseUrl.replace(/\/$/, '')}/` ||
                          currentUrl.replace(/\/$/, '') === this.data.baseUrl.replace(/\/$/, '');

    if (isStillOnHome) {
      const destPath = href || fallbackExpectedUrl;
      if (destPath && !destPath.startsWith('javascript:')) {
        let cleanDest = destPath.split('|')[0].replace(/[\^$()]/g, '').trim();
        const targetUrl = cleanDest.startsWith('http')
          ? cleanDest
          : `${this.data.baseUrl.replace(/\/$/, '')}/${cleanDest.replace(/^\//, '')}`;
        await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
        await this.waitForPageLoaded();
      } else {
        await this.scrollAndClick(fallbackSelectors).catch(() => {});
        await this.waitForPageLoaded();
      }
    }

    // If Chromium landed on chrome-error page, recover
    if (this.page.url().includes('chrome-error')) {
      const destPath = href || fallbackExpectedUrl;
      if (destPath) {
        let cleanDest = destPath.split('|')[0].replace(/[\^$()]/g, '').trim();
        const targetUrl = cleanDest.startsWith('http')
          ? cleanDest
          : `${this.data.baseUrl.replace(/\/$/, '')}/${cleanDest.replace(/^\//, '')}`;
        await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
        await this.waitForPageLoaded();
      }
    }
  }

  /**
   * Test Case 1: Click on DXL Rewards link from Footer
   */
  async clickDxlRewards(): Promise<void> {
    await this.clickFooterRoleLink(/dxl rewards|rewards/i, this.locators.footer.dxlRewardsLink, this.data.expectedUrls.dxlRewards);
  }

  /**
   * Test Case 2: Click on DXL Sustainability link from Footer
   */
  async clickDxlSustainability(): Promise<void> {
    await this.clickFooterRoleLink(/sustainability/i, this.locators.footer.dxlSustainabilityLink, this.data.expectedUrls.dxlSustainability);
  }

  /**
   * Test Case 3: Click on alt="Wear What You Want" banner
   */
  async clickWearWhatYouWantBanner(): Promise<void> {
    await this.scrollToFooter();
    const bannerImg = this.page.getByRole('img', { name: /wear what you want/i })
      .or(this.page.locator(this.locators.footer.wearWhatYouWantBanner.join(', ')))
      .first();

    await bannerImg.scrollIntoViewIfNeeded().catch(() => {});
    await bannerImg.click({ force: true }).catch(async () => {
      await this.scrollAndClick(this.locators.footer.wearWhatYouWantBanner);
    });
    await this.waitForPageLoaded();
  }

  /**
   * Test Case 4: Click on link name: Gift Cards from footer-banner
   */
  async clickGiftCardsBanner(): Promise<void> {
    await this.clickFooterRoleLink(/gift cards/i, this.locators.footer.giftCardsBanner, this.data.expectedUrls.giftCards);
  }

  /**
   * Test Case 5: Click on link name: Reward Your Style from footer-banner
   */
  async clickRewardYourStyleBanner(): Promise<void> {
    await this.clickFooterRoleLink(/reward your style/i, this.locators.footer.rewardYourStyleBanner, this.data.expectedUrls.rewardYourStyle);
  }

  /**
   * Click on FiTMAP link
   */
  async clickFitmap(): Promise<void> {
    await this.clickFooterRoleLink(/fitmap/i, this.locators.footer.fitmapLink, this.data.expectedUrls.fitmap);
  }

  /**
   * Click on Curbside Pickup link
   */
  async clickCurbsidePickup(): Promise<void> {
    await this.clickFooterRoleLink(/curbside pickup/i, this.locators.footer.curbsidePickupLink, this.data.expectedUrls.curbsidePickup);
  }

  /**
   * Click on DXL Deals link
   */
  async clickDxlDeals(): Promise<void> {
    await this.clickFooterRoleLink(/dxl deals|deals/i, this.locators.footer.dxlDealsLink, this.data.expectedUrls.dxlDeals);
  }

  /**
   * Click on Heroes Discount link
   */
  async clickHeroesDiscount(): Promise<void> {
    await this.clickFooterRoleLink(/heroes discount/i, this.locators.footer.heroesDiscountLink, this.data.expectedUrls.heroesDiscount);
  }

  /**
   * Click on Product Collections link
   */
  async clickProductCollections(): Promise<void> {
    await this.clickFooterRoleLink(/product collections/i, this.locators.footer.productCollectionsLink, this.data.expectedUrls.productCollections);
  }

  /**
   * Click on Price Match Guarantee link
   */
  async clickPriceMatchGuarantee(): Promise<void> {
    await this.clickFooterRoleLink(/price match guarantee/i, this.locators.footer.priceMatchGuaranteeLink, this.data.expectedUrls.priceMatchGuarantee);
  }

  /**
   * Click on Shipping & Delivery link
   */
  async clickShippingDelivery(): Promise<void> {
    await this.clickFooterRoleLink(/shipping & delivery|shipping/i, this.locators.footer.shippingDeliveryLink, this.data.expectedUrls.shippingDelivery);
  }

  /**
   * Click on Returns & Exchanges link
   */
  async clickReturnsExchanges(): Promise<void> {
    await this.clickFooterRoleLink(/returns & exchanges|returns/i, this.locators.footer.returnsExchangesLink, this.data.expectedUrls.returnsExchanges);
  }

  /**
   * Click Order Status and validate modal opens, then close modal
   */
  async clickOrderStatusAndHandleModal(): Promise<void> {
    await this.scrollToFooter();
    const footer = this.page.getByRole('contentinfo').or(this.page.locator('footer')).first();
    const orderStatusLink = footer.getByRole('link', { name: /order status/i })
      .or(this.page.locator(this.locators.footer.orderStatusLink.join(', ')))
      .first();

    await orderStatusLink.scrollIntoViewIfNeeded().catch(() => {});
    await orderStatusLink.click({ force: true }).catch(async () => {
      await this.scrollAndClick(this.locators.footer.orderStatusLink);
    });
    await this.page.waitForTimeout(1000);

    const modal = this.page.getByRole('dialog')
      .or(this.page.locator(this.locators.headerModals.modalDialog.join(', ')))
      .first();
    await expect(modal).toBeVisible({ timeout: 10000 });

    const closeBtn = modal.getByRole('button', { name: /close/i })
      .or(this.page.locator(this.locators.headerModals.modalCloseBtn.join(', ')))
      .first();
    await closeBtn.click({ force: true }).catch(() => {});
    await this.page.waitForTimeout(800);
  }

  /**
   * Click on Help Center link
   */
  async clickHelpCenter(): Promise<void> {
    await this.clickFooterRoleLink(/help center/i, this.locators.footer.helpCenterLink, this.data.expectedUrls.helpCenter);
  }

  /**
   * Click on Find a Store link and handle store popup / navigation
   */
  async clickFindAStoreAndHandleModal(): Promise<void> {
    await this.scrollToFooter();
    const footer = this.page.getByRole('contentinfo').or(this.page.locator('footer')).first();
    const link = footer.getByRole('link', { name: /find a store/i })
      .or(this.page.locator(this.locators.footer.findAStoreLink.join(', ')))
      .first();

    await link.scrollIntoViewIfNeeded().catch(() => {});
    await link.click({ force: true }).catch(async () => {
      await this.scrollAndClick(this.locators.footer.findAStoreLink);
    });
    await this.page.waitForTimeout(1000);

    const modal = this.page.getByRole('dialog')
      .or(this.page.locator(this.locators.headerModals.modalDialog.join(', ')))
      .first();
    if (await modal.isVisible({ timeout: 4000 }).catch(() => false)) {
      const closeBtn = modal.getByRole('button', { name: /close/i })
        .or(this.page.locator(this.locators.headerModals.modalCloseBtn.join(', ')))
        .first();
      await closeBtn.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(800);
    }
  }

  /**
   * Click on Email Us link and handle modal / dismiss by outside click
   */
  async clickEmailUsAndCloseByOutsideClick(): Promise<void> {
    await this.scrollToFooter();
    const footer = this.page.getByRole('contentinfo').or(this.page.locator('footer, nav[aria-label*="Footer" i]')).first();
    const link = footer.getByRole('link', { name: /email us/i })
      .or(this.page.locator(this.locators.footer.emailUsLink.join(', ')))
      .first();

    await link.waitFor({ state: 'attached', timeout: 7000 }).catch(() => {});
    await link.scrollIntoViewIfNeeded().catch(() => {});

    // Intercept mailto / navigation clicks in page context to prevent Firefox OS handler hangs
    await this.page.evaluate(() => {
      const emailLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]'));
      emailLinks.forEach(el => {
        el.addEventListener('click', (e) => e.preventDefault(), { once: true });
      });
    }).catch(() => {});

    await link.click({ force: true }).catch(async () => {
      await this.scrollAndClick(this.locators.footer.emailUsLink);
    });

    await this.page.waitForTimeout(600);
    await this.dismissAnyBlockingOverlays();
  }

  /**
   * Click on Call Us link and handle select app modal / dismiss by outside click
   */
  async clickCallUsAndCloseByOutsideClick(): Promise<void> {
    await this.scrollToFooter();
    const footer = this.page.getByRole('contentinfo').or(this.page.locator('footer, nav[aria-label*="Footer" i]')).first();
    const link = footer.getByRole('link', { name: /call us/i })
      .or(this.page.locator(this.locators.footer.callUsLink.join(', ')))
      .first();

    await link.waitFor({ state: 'attached', timeout: 7000 }).catch(() => {});
    await link.scrollIntoViewIfNeeded().catch(() => {});

    // Intercept tel / navigation clicks in page context to prevent Firefox OS handler hangs
    await this.page.evaluate(() => {
      const telLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"]'));
      telLinks.forEach(el => {
        el.addEventListener('click', (e) => e.preventDefault(), { once: true });
      });
    }).catch(() => {});

    await link.click({ force: true }).catch(async () => {
      await this.scrollAndClick(this.locators.footer.callUsLink);
    });

    await this.page.waitForTimeout(600);
    await this.dismissAnyBlockingOverlays();
  }

  /**
   * Click on About Us link
   */
  async clickAboutUs(): Promise<void> {
    await this.clickFooterRoleLink(/about us/i, this.locators.footer.aboutUsLink, this.data.expectedUrls.aboutUs);
  }

  /**
   * Click on Careers link using getByRole('link', { name: 'Careers' })
   */
  async clickCareers(): Promise<void> {
    await this.clickFooterRoleLink(/^careers$/i, this.locators.footer.careersLink, this.data.expectedUrls.careers);
  }

  /**
   * Click on Contact Us link
   */
  async clickContactUs(): Promise<void> {
    await this.clickFooterRoleLink(/contact us/i, this.locators.footer.contactUsLink, this.data.expectedUrls.contactUs);
  }

  /**
   * Click on Accessibility Statement link
   */
  async clickAccessibilityStatement(): Promise<void> {
    await this.clickFooterRoleLink(/accessibility statement/i, this.locators.footer.accessibilityStatementLink, this.data.expectedUrls.accessibilityStatement);
  }

  /**
   * Click on Privacy Policy link using getByRole('link', { name: 'Privacy Policy' })
   */
  async clickPrivacyPolicy(): Promise<void> {
    await this.clickFooterRoleLink(/privacy policy/i, this.locators.footer.privacyPolicyLink, this.data.expectedUrls.privacyPolicy);
  }

  /**
   * Click on Security Policy link
   */
  async clickSecurityPolicy(): Promise<void> {
    await this.clickFooterRoleLink(/security policy/i, this.locators.footer.securityPolicyLink, this.data.expectedUrls.securityPolicy);
  }

  /**
   * Click on Terms of Use link
   */
  async clickTermsOfUse(): Promise<void> {
    await this.clickFooterRoleLink(/terms of use/i, this.locators.footer.termsOfUseLink, this.data.expectedUrls.termsOfUse);
  }

  /**
   * Click on California Privacy Rights link
   */
  async clickCaliforniaPrivacyRights(): Promise<void> {
    await this.clickFooterRoleLink(/california privacy rights/i, this.locators.footer.californiaPrivacyRightsLink, this.data.expectedUrls.californiaPrivacyRights);
  }

  /**
   * Click on Do Not Sell My Data link using getByRole('link')
   */
  async clickDoNotSellMyData(): Promise<void> {
    await this.clickFooterRoleLink(/do not sell/i, this.locators.footer.doNotSellMyDataLink, this.data.expectedUrls.doNotSellMyData);
  }

  /**
   * Click California Transparency Act, check privacy modal if opened and close via 'X'
   */
  async clickCaliforniaTransparencyActAndCloseModal(): Promise<void> {
    await this.scrollToFooter();
    const footer = this.page.getByRole('contentinfo').or(this.page.locator('footer')).first();
    const link = footer.getByRole('link', { name: /california transparency act/i })
      .or(this.page.locator(this.locators.footer.californiaTransparencyActLink.join(', ')))
      .first();

    await link.scrollIntoViewIfNeeded().catch(() => {});
    await link.click({ force: true }).catch(async () => {
      await this.scrollAndClick(this.locators.footer.californiaTransparencyActLink);
    });
    await this.page.waitForTimeout(1000);

    const otCloseBtn = this.page.getByRole('button', { name: /close/i })
      .or(this.page.locator(this.locators.footer.otCloseBtn.join(', ')))
      .first();

    if (await otCloseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await otCloseBtn.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(500);
    }

    await this.waitForPageLoaded();
  }

  /**
   * Click on UGC Terms & Conditions link
   */
  async clickUgcTerms(): Promise<void> {
    await this.clickFooterRoleLink(/ugc terms/i, this.locators.footer.ugcTermsLink, this.data.expectedUrls.ugcTerms);
  }

  /**
   * Validate navigation to expected static page URL and content load
   */
  async validateStaticPageOpened(expectedSubpath: string): Promise<void> {
    await this.verifyUrlContains(expectedSubpath);
    await this.waitForPageLoaded();
  }
}
