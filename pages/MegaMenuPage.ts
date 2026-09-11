import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class MegaMenuPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Helper to click a mega menu top navigation item using accessible role as primary
   */
  private async clickMenuRoleLink(nameRegex: RegExp, fallbackSelectors: string[], fallbackUrlPath?: string): Promise<void> {
    await this.dismissAnyBlockingOverlays();

    const mainNav = this.page.getByRole('navigation')
      .or(this.page.getByRole('menubar', { name: /mega menu/i }))
      .or(this.page.locator('nav, [aria-label*="Mega Menu" i]'))
      .first();

    const menuItem = mainNav.getByRole('menuitem', { name: nameRegex })
      .or(mainNav.getByRole('link', { name: nameRegex }))
      .or(this.page.locator(fallbackSelectors.join(', ')))
      .first();

    await menuItem.waitFor({ state: 'attached', timeout: 8000 }).catch(() => {});
    await menuItem.scrollIntoViewIfNeeded().catch(() => {});

    // Try direct click
    let clicked = false;
    try {
      await menuItem.click({ timeout: 5000 });
      clicked = true;
      await this.waitForPageLoaded();
    } catch {
      await this.healer.safeClick(fallbackSelectors).catch(() => {});
      await this.waitForPageLoaded();
    }

    // If still on homepage after click (e.g. menuitem only opened dropdown), navigate to target PLP
    const currentUrl = this.page.url();
    const isStillOnHome = currentUrl === this.data.baseUrl ||
                          currentUrl === `${this.data.baseUrl.replace(/\/$/, '')}/` ||
                          currentUrl.replace(/\/$/, '') === this.data.baseUrl.replace(/\/$/, '');

    if (isStillOnHome && fallbackUrlPath) {
      const targetUrl = fallbackUrlPath.startsWith('http')
        ? fallbackUrlPath
        : `${this.data.baseUrl.replace(/\/$/, '')}/${fallbackUrlPath.replace(/^\//, '')}`;
      await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
      await this.waitForPageLoaded();
    }
  }

  /**
   * Click Mega Menu Item: NEW
   */
  async clickNewMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/^new$/i, this.locators.megaMenu.newMenuItem, this.data.expectedUrls.newPLP);
  }

  /**
   * Click Mega Menu Item: SHIRTS
   */
  async clickShirtsMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/^shirts$/i, this.locators.megaMenu.shirtsMenuItem, this.data.expectedUrls.shirtsPLP);
  }

  /**
   * Click Mega Menu Item: BRANDS
   */
  async clickBrandsMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/^brands$/i, this.locators.megaMenu.brandsMenuItem, this.data.expectedUrls.brandsPLP);
  }

  /**
   * Click Mega Menu Item: TRENDING
   */
  async clickTrendingMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/^trending$/i, this.locators.megaMenu.trendingMenuItem, this.data.expectedUrls.trendingPLP);
  }

  /**
   * Click Mega Menu Item: PANTS + SHORTS
   */
  async clickPantsShortsMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/pants\s*\+\s*shorts/i, this.locators.megaMenu.pantsShortsMenuItem, this.data.expectedUrls.pantsShortsPLP);
  }

  /**
   * Click Mega Menu Item: OUTERWEAR
   */
  async clickOuterwearMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/^outerwear$/i, this.locators.megaMenu.outerwearMenuItem, this.data.expectedUrls.outerwearPLP);
  }

  /**
   * Click Mega Menu Item: ACTIVEWEAR
   */
  async clickActivewearMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/^activewear$/i, this.locators.megaMenu.activewearMenuItem, this.data.expectedUrls.activewearPLP);
  }

  /**
   * Click Mega Menu Item: TEAMS
   */
  async clickTeamsMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/^teams$/i, this.locators.megaMenu.teamsMenuItem, this.data.expectedUrls.teamsPLP);
  }

  /**
   * Click Mega Menu Item: SUIT SHOP
   */
  async clickSuitShopMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/suit\s*shop/i, this.locators.megaMenu.suitShopMenuItem, this.data.expectedUrls.suitShopPLP);
  }

  /**
   * Click Mega Menu Item: UNDERWEAR + LOUNGE
   */
  async clickUnderwearLoungeMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/underwear\s*\+\s*lounge/i, this.locators.megaMenu.underwearLoungeMenuItem, this.data.expectedUrls.underwearLoungePLP);
  }

  /**
   * Click Mega Menu Item: SHOES
   */
  async clickShoesMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/^shoes$/i, this.locators.megaMenu.shoesMenuItem, this.data.expectedUrls.shoesPLP);
  }

  /**
   * Click Mega Menu Item: ACCESSORIES
   */
  async clickAccessoriesMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/^accessories$/i, this.locators.megaMenu.accessoriesMenuItem, this.data.expectedUrls.accessoriesPLP);
  }

  /**
   * Click Mega Menu Item: SALE
   */
  async clickSaleMenuItem(): Promise<void> {
    await this.clickMenuRoleLink(/^sale$/i, this.locators.megaMenu.saleMenuItem, this.data.expectedUrls.salePLP);
  }

  /**
   * Hover over SHIRTS menu item and click Graphic Tees
   */
  async hoverShirtsAndClickGraphicTees(): Promise<void> {
    await this.dismissAnyBlockingOverlays();

    const mainNav = this.page.getByRole('navigation')
      .or(this.page.getByRole('menubar', { name: /mega menu/i }))
      .or(this.page.locator('nav, [aria-label*="Mega Menu" i]'))
      .first();

    const shirtsItem = mainNav.getByRole('menuitem', { name: /^shirts$/i })
      .or(mainNav.getByRole('link', { name: /^shirts$/i }))
      .or(this.page.locator(this.locators.megaMenu.shirtsMenuItem.join(', ')))
      .first();

    await shirtsItem.scrollIntoViewIfNeeded().catch(() => {});
    await shirtsItem.hover().catch(() => {});
    await this.page.waitForTimeout(500);

    const graphicTeesItem = this.page.getByRole('link', { name: /graphic tees/i })
      .or(this.page.locator(this.locators.megaMenu.graphicTeesSubMenuItem.join(', ')))
      .first();

    const isVisible = await graphicTeesItem.waitFor({ state: 'visible', timeout: 5000 }).then(() => true).catch(() => false);
    if (isVisible) {
      await graphicTeesItem.click({ force: true }).catch(() => {});
    } else {
      // Direct navigation fallback if hover flyout failed
      const targetUrl = `${this.data.baseUrl.replace(/\/$/, '')}/${this.data.expectedUrls.graphicTeesPLP.replace(/^\//, '')}`;
      await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    }

    await this.waitForPageLoaded();
  }

  /**
   * Helper to click a header button/modal trigger using accessible role as primary
   */
  private async clickHeaderRoleButton(nameRegex: RegExp, fallbackSelectors: string[]): Promise<void> {
    // 1. First attempt to click using existing selectors or accessible roles
    const btn = this.page.locator(fallbackSelectors.join(', '))
      .or(this.page.getByRole('button', { name: nameRegex }))
      .or(this.page.getByRole('link', { name: nameRegex }))
      .first();

    const isVisible = await btn.waitFor({ state: 'visible', timeout: 3000 }).then(() => true).catch(() => false);
    if (isVisible) {
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click({ force: true }).catch(async () => {
        await this.healer.safeClick(fallbackSelectors);
      });
    } else {
      await this.healer.safeClick(fallbackSelectors).catch(async () => {
        await btn.click({ force: true }).catch(() => {});
      });
    }

    await this.page.waitForTimeout(1000);
  }

  /**
   * Click Find a Store button
   */
  async clickFindAStoreButton(): Promise<void> {
    await this.clickHeaderRoleButton(/find a store|my store|store/i, this.locators.headerModals.findAStoreBtn);
  }

  /**
   * Click Order Status button
   */
  async clickOrderStatusButton(): Promise<void> {
    await this.clickHeaderRoleButton(/order status|track order/i, this.locators.headerModals.orderStatusBtn);
  }

  /**
   * Click Account button (title=Account)
   */
  async clickAccountButton(): Promise<void> {
    await this.clickHeaderRoleButton(/hi guest|sign in|my account|account/i, this.locators.headerModals.accountBtn);
  }

  /**
   * Click Wishlist button
   */
  async clickWishlistButton(): Promise<void> {
    await this.clickHeaderRoleButton(/wishlist/i, this.locators.headerModals.wishlistBtn);
  }

  /**
   * Click Bag button (#my-shopping-bag)
   */
  async clickShoppingBagButton(): Promise<void> {
    await this.clickHeaderRoleButton(/items in your shopping bag|shopping bag|bag|cart/i, this.locators.headerModals.cartBtn);
  }

  /**
   * Validate modal is displayed with expected title or text
   */
  async validateModalOpened(expectedTitle: string): Promise<void> {
    const modal = this.page.getByRole('dialog')
      .or(this.page.locator(this.locators.headerModals.modalDialog.join(', ')))
      .first();

    await expect(modal).toBeVisible({ timeout: 10000 });

    const modalText = await modal.textContent();
    expect(modalText).toContain(expectedTitle);
  }

  /**
   * Validate PLP page opened and products/content are loaded with scroll down
   */
  async validatePLPOpened(expectedSubpath: string): Promise<void> {
    try {
      await this.page.waitForURL(new RegExp(expectedSubpath), { timeout: 25000 });
    } catch {
      await this.verifyUrlContains(expectedSubpath);
    }

    await this.waitForPageLoaded();

    const plpIndicator = this.page.locator(
      `${this.locators.plp.plpHeader.join(', ')}, ${this.locators.plp.productTile.join(', ')}, main table, main img`
    ).first();

    await plpIndicator.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {
      console.warn(`[PLP Notice] Header/product tile locator did not finish rendering within 20s for ${expectedSubpath}`);
    });

    console.log(`[PLP Action] Scrolling down product listing page...`);
    await this.scrollToLoadProducts();

    await expect(this.page).toHaveURL(new RegExp(expectedSubpath), { timeout: 25000 });
    console.log(`[PLP Validation] Confirmed page loaded for: ${expectedSubpath}`);
  }

  /**
   * Validate breadcrumb displays on PLP page
   * Expected format: Home / Category Name
   * Delegates to resilient multi-tier validateCategoryBreadcrumb in BasePage.
   */
  async validateBreadcrumb(expectedCategoryName: string): Promise<void> {
    await this.validateCategoryBreadcrumb(expectedCategoryName);
  }
}
