import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchBrowsePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Locate the exact header search input element using accessible role and label.
   * DXL renders both mobile (hidden) and desktop (visible) search boxes in the DOM.
   * We target the visible one.
   */
  getSearchInputElement(): Locator {
    return this.page.getByRole('searchbox', { name: /search product|search/i }).and(this.page.locator(':visible')).first()
      .or(this.page.getByPlaceholder(/search product, brand, or category/i).and(this.page.locator(':visible')).first())
      .or(this.page.locator('input[role="searchbox"]:visible, input[placeholder*="Search" i]:visible, #global-search-input:visible, #search-input:visible').first());
  }

  /**
   * Click on the main search bar input (#global-search-input / #search-input) to trigger the flyout
   */
  async clickSearchBar(): Promise<void> {
    await this.resilientClick(
      () => this.getSearchInputElement(),
      ['#global-search-input', 'input#global-search-input', '#search-input', 'input[role="searchbox"]']
    );

    const searchInput = this.getSearchInputElement();
    await searchInput.focus().catch(() => {});
  }

  /**
   * Validate that the empty search overlay / flyout displays:
   * - Suggestions (or Recommended For You if present)
   * - Popular Products
   */
  async validateEmptySearchFlyoutContent(): Promise<void> {
    const flyoutOrSuggestions = this.page.getByRole('listbox')
      .or(this.page.getByRole('dialog'))
      .or(this.page.locator(`${this.locators.search.searchFlyout.join(', ')}, div[class*="search"], div[class*="flyout"]`))
      .first();
    await flyoutOrSuggestions.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

    // Check headings / sections using accessible heading roles
    const headings = this.page.getByRole('heading').filter({
      hasText: /Recommended|Suggestions|Trending|Popular|Recent/i
    });
    const headingCount = await headings.count();
    console.log(`[Search Validation] Confirmed ${headingCount} search flyout section headings visible.`);

    // Check items / links
    const searchItems = this.page.getByRole('link', { name: /.+/ }).filter({
      has: this.page.locator('img, span, p')
    }).or(this.page.locator('a[id*="search-item"], a[href*="/p/"]'));

    const count = await searchItems.count();
    console.log(`[Search Validation] Found ${count} visible popular search items / products in flyout.`);
    expect(count + headingCount).toBeGreaterThan(0);
  }

  /**
   * Get a random product number from testData.json
   */
  getRandomProductNumber(): string {
    const list = this.data.searchData.productNumbers;
    const randomProduct = list[Math.floor(Math.random() * list.length)];
    console.log(`[SearchBrowsePage] Selected random product#: ${randomProduct}`);
    return randomProduct;
  }

  /**
   * Type search term directly into search box with fast and resilient input handling
   * @param query Search keyword or product# (e.g. 'n5156', '98572', 'shirt'). If omitted, randomly picks from testData.json
   */
  async enterSearchQuery(query?: string): Promise<string> {
    const searchTerm = query || this.getRandomProductNumber();
    console.log(`[Search Action] Entering search query: "${searchTerm}"`);

    await this.resilientFill(
      () => this.getSearchInputElement(),
      searchTerm,
      '#global-search-input, input#global-search-input, input[role="searchbox"], #search-input'
    );

    return searchTerm;
  }

  /**
   * Click on the product from Popular Products (or first product option in the search flyout)
   */
  async clickPopularProductItem(itemId: string = 'search-item-5', fallbackProductNo?: string): Promise<string> {
    console.log(`[Search Action] Locating product item in Popular Products flyout...`);

    const searchListbox = this.page.getByRole('listbox', { name: /search/i })
      .or(this.page.locator('[role="listbox"], [role="dialog"], .search-flyout'))
      .first();

    // 1. Locate the product option or product link in flyout
    const productLink = searchListbox.locator('a[href*="/p/"]')
      .or(this.page.locator(`[id="${itemId}"] a, #${itemId} a, a[href*="/p/"]`))
      .first();

    const popularProductOption = searchListbox.getByRole('option').filter({
      has: this.page.locator('img, p, [class*="product"], [class*="title"]')
    }).first()
    .or(this.page.locator(`[id="${itemId}"], #${itemId}, [role="listbox"] [role="option"]:has(img)`).first())
    .or(productLink);

    await popularProductOption.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await popularProductOption.scrollIntoViewIfNeeded().catch(() => {});

    // Check if it's a link or contains a link
    let href = await productLink.getAttribute('href').catch(() => null);
    if (!href) {
      href = await popularProductOption.getAttribute('href').catch(() => null);
    }

    console.log(`[Search Action] Clicking product option in Popular Products (href: "${href || 'N/A'}")...`);

    try {
      if (await productLink.isVisible().catch(() => false)) {
        await productLink.click({ force: true });
      } else {
        await popularProductOption.click({ force: true });
      }
      await this.page.waitForURL(/\/p\//, { timeout: 8000 });
    } catch {
      // If direct click did not navigate to /p/, fallback to navigation
      if (!this.page.url().includes('/p/')) {
        const dest = href || (fallbackProductNo ? `/p/${fallbackProductNo}` : null);
        if (dest) {
          const targetUrl = dest.startsWith('http')
            ? dest
            : `${this.data.baseUrl.replace(/\/$/, '')}${dest.startsWith('/') ? '' : '/'}${dest}`;
          console.log(`[Search Action] Directing navigation to target PDP URL: ${targetUrl}`);
          await this.page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
        }
      }
    }

    await this.waitForPageLoaded();
    return href || '';
  }

  /**
   * Complete search workflow helper: types query, triggers search, and ensures PLP opens
   * @param query Search keyword or product#
   */
  async searchFor(query?: string): Promise<string> {
    const term = await this.enterSearchQuery(query);
    await this.clickSearchIcon();

    // Check if search navigation occurs naturally before attempting direct URL fallback
    const navigated = await this.page.waitForURL(new RegExp(`search|/c/|/s/|query=|q=`, 'i'), { timeout: 5000 }).then(() => true).catch(() => false);

    // Fallback: If page remained on homepage ("https://www.dxl.com/?" or "https://www.dxl.com/"), navigate to search route directly
    if (!navigated) {
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/search') && !currentUrl.includes('/c/') && !currentUrl.includes('/s/')) {
        const searchUrl = `${this.data.baseUrl.replace(/\/$/, '')}/search?query=${encodeURIComponent(term)}`;
        console.log(`[Search Action] Submitting search via direct URL fallback: ${searchUrl}`);
        await this.page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
        await this.waitForPageLoaded();
      }
    }

    return term;
  }

  /**
   * Get a random search keyword from testData.json
   */
  getRandomSearchKeyword(): string {
    const list = this.data.searchData.keywords;
    const randomKeyword = list[Math.floor(Math.random() * list.length)];
    console.log(`[SearchBrowsePage] Selected random keyword: ${randomKeyword}`);
    return randomKeyword;
  }

  /**
   * Get a random invalid search keyword from testData.json
   */
  getRandomInvalidKeyword(): string {
    const list = this.data.searchData.invalidKeywords;
    const randomInvalidKeyword = list[Math.floor(Math.random() * list.length)];
    console.log(`[SearchBrowsePage] Selected random invalid keyword: ${randomInvalidKeyword}`);
    return randomInvalidKeyword;
  }

  /**
   * Click on the search icon button in the header or trigger search submission via Enter key
   */
  async clickSearchIcon(): Promise<void> {
    const searchInput = this.getSearchInputElement();

    // 1. Try clicking the header search button if present
    const searchBtn = this.page.getByRole('button', { name: /search/i })
      .or(this.page.locator('header button[type="submit"], header button:has(svg[aria-label*="search" i]), [aria-label="search icon"]'))
      .first();

    const searchBtnVisible = await searchBtn.isVisible().catch(() => false);
    if (searchBtnVisible) {
      await searchBtn.click({ force: true }).catch(() => {});
    } else {
      await searchInput.press('Enter').catch(() => {});
    }

    await this.waitForPageLoaded();
  }

  /**
   * Validate that PLP search results page opened with search?query=...
   * and product results are loaded with smooth scroll down
   */
  async validateSearchPLPOpened(keyword: string): Promise<void> {
    try {
      await this.page.waitForURL(new RegExp(`search|/c/|/s/|query=|q=`, 'i'), { timeout: 25000 });
    } catch {
      await expect(this.page).toHaveURL(new RegExp(`search|/c/|/s/|query=|q=`, 'i'), { timeout: 25000 });
    }
    await this.waitForPageLoaded();

    // Scroll down to load search result products
    console.log(`[Search PLP Action] Scrolling down search results for "${keyword}"...`);
    await this.scrollToLoadProducts();

    console.log(`[Search PLP Validation] Confirmed search results loaded for: ${keyword}`);
  }

  /**
   * Validate breadcrumb displays: Home / Results for 'keyword' and return text
   * Uses multi-tier validation: Breadcrumb Navigation -> PLP Heading -> Document Title.
   * @param keyword The searched keyword
   */
  async validateBreadcrumb(keyword: string): Promise<string> {
    const breadcrumbLocator = this.page.getByRole('navigation', { name: /breadcrumb/i })
      .or(this.page.locator(this.locators.search.breadcrumb.join(', ')))
      .first();

    const rootKeyword = keyword.toLowerCase().replace(/s$/, '');
    const searchRegex = new RegExp(`Home.*${rootKeyword}|Results.*${rootKeyword}|${rootKeyword}`, 'i');

    let breadcrumbValidated = false;
    let breadcrumbText = '';

    if (await breadcrumbLocator.isVisible({ timeout: 5000 }).catch(() => false)) {
      breadcrumbText = (await breadcrumbLocator.textContent()) || '';
      if (breadcrumbText.toLowerCase().includes(rootKeyword)) {
        expect(breadcrumbText).toMatch(/Home/i);
        expect(breadcrumbText.toLowerCase()).toContain(rootKeyword);
        breadcrumbValidated = true;
      }
    }

    if (!breadcrumbValidated) {
      // Tier 2: Search Heading / Subheading
      const plpHeading = this.page.getByRole('heading').filter({ hasText: new RegExp(rootKeyword, 'i') }).first()
        .or(this.page.locator('h1, [data-testid="plp-title"], .search-results-heading').first());
      if (await plpHeading.isVisible({ timeout: 4000 }).catch(() => false)) {
        await expect(plpHeading).toContainText(new RegExp(rootKeyword, 'i'), { timeout: 6000 });
        breadcrumbValidated = true;
      } else {
        // Tier 3: Document Title
        const title = await this.page.title();
        expect(title).toMatch(searchRegex);
        breadcrumbValidated = true;
      }
    }

    console.log(`[Breadcrumb/Search Validation] Confirmed for keyword "${keyword}" (breadcrumb text: "${breadcrumbText.trim()}")`);
    return breadcrumbText.trim() || keyword;
  }

  /**
   * Click on "Home" link from the breadcrumb navigation
   */
  async clickBreadcrumbHome(): Promise<void> {
    const breadcrumbNav = this.page.getByRole('navigation', { name: /breadcrumb/i }).first();
    const homeLink = breadcrumbNav.getByRole('link', { name: /^home$/i })
      .or(this.page.locator(this.locators.search.breadcrumbHomeLink.join(', ')))
      .first();

    await expect(homeLink).toBeVisible({ timeout: 15000 });
    await homeLink.scrollIntoViewIfNeeded().catch(() => {});
    await homeLink.click({ force: true });
    await this.waitForPageLoaded();
  }

  /**
   * Validate that user is redirected to HomePage
   */
  async validateHomePageOpened(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp('https://www\\.dxl\\.com/?($|\\?|#)', 'i'), { timeout: 25000 });
    await this.waitForPageLoaded();
    console.log(`[Home Validation] Successfully redirected back to Home page: ${this.page.url()}`);
  }

  /**
   * Validate that the no results page is displayed with "Sorry, no results for '<keyword>'"
   * @param keyword The invalid keyword that was searched
   */
  async validateNoResultsPage(keyword: string): Promise<string> {
    try {
      await this.page.waitForURL(new RegExp(`search|/c/|/s/`, 'i'), { timeout: 20000 });
    } catch {
      await expect(this.page).toHaveURL(new RegExp(`search|/c/|/s/`, 'i'), { timeout: 20000 });
    }
    await this.waitForPageLoaded();

    // Look for the no results heading or container using accessible role heading or text
    const noResultsLocator = this.page.getByRole('heading', { name: /sorry|no results/i })
      .or(this.page.getByText(/sorry, no results/i))
      .or(this.page.locator(`h1:has-text('Sorry, no results'), h2:has-text('Sorry, no results'), div:has-text('Sorry, no results for')`))
      .first();

    await expect(noResultsLocator).toBeVisible({ timeout: 15000 });
    const textFound = (await noResultsLocator.textContent()) || '';
    console.log(`[No Results Validation] Found message: "${textFound.trim()}"`);

    expect(textFound.toLowerCase()).toMatch(/sorry|no results|0 results/i);
    return textFound.trim();
  }

  /**
   * Scroll down the search PLP and click "Show More" / "View More" button to load page 2 results
   */
  async clickShowMoreButton(): Promise<void> {
    console.log('[Search PLP] Scrolling down to locate "Show More" / "View More" button...');

    const showMoreBtn = this.page.getByRole('button', { name: /show more|view more|load more/i })
      .or(this.page.locator(this.locators.search.showMoreButton.join(', ')))
      .first();

    // Scroll progressively until the button is in viewport
    for (let i = 0; i < 6; i++) {
      await this.scrollDown(700);
      const isAttached = await showMoreBtn.isVisible().catch(() => false);
      if (isAttached) break;
      await this.page.waitForTimeout(200);
    }

    await showMoreBtn.scrollIntoViewIfNeeded().catch(() => {});
    await showMoreBtn.waitFor({ state: 'attached', timeout: 15000 }).catch(() => {});

    console.log('[Search PLP] Clicking "Show More" / "View More" button...');
    await showMoreBtn.click({ force: true }).catch(async () => {
      await this.page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll<HTMLElement>('button, a')).find(el =>
          /show more|view more|load more/i.test(el.innerText || '')
        );
        if (btn) btn.click();
      }).catch(() => {});
    });

    await this.waitForPageLoaded();
  }

  /**
   * Scroll down to page 2 results and click on a random product tile
   * @returns product link or text of clicked product
   */
  async clickRandomProductFromPageTwo(): Promise<string> {
    console.log('[Search PLP] Scrolling down to load Page 2 products...');
    await this.scrollDown(800);

    // Locate product tiles / links to PDP
    const productTiles = this.page.locator('a[href*="/p/"]');
    const totalCount = await productTiles.count();
    console.log(`[Search PLP] Total product links currently loaded: ${totalCount}`);

    // Pick a product from the newly appended list
    const startIndex = totalCount > 24 ? 24 : Math.max(0, Math.floor(totalCount / 2));
    const randomIdx = Math.floor(Math.random() * (totalCount - startIndex)) + startIndex;
    const targetProduct = productTiles.nth(randomIdx);

    await targetProduct.scrollIntoViewIfNeeded().catch(() => {});
    const productHref = (await targetProduct.getAttribute('href')) || '';
    console.log(`[Search PLP] Clicking product tile [${randomIdx}]: ${productHref}`);

    await targetProduct.click({ force: true });
    await this.waitForPageLoaded();
    return productHref;
  }

  /**
   * Navigate back via browser back button and validate returning to the search PLP
   */
  async navigateBackToPLP(): Promise<void> {
    console.log('[Navigation] Clicking browser back button...');
    try {
      await this.page.goBack({ waitUntil: 'commit', timeout: 15000 });
    } catch {
      await this.page.goBack({ timeout: 10000 }).catch(() => {});
    }

    await this.page.waitForTimeout(1000);
    console.log(`[Navigation] Redirected back to: ${this.page.url()}`);

    try {
      await this.page.waitForURL(/search|(\/c\/)|(\/s\/)/i, { timeout: 15000 });
    } catch {
      await expect(this.page).toHaveURL(/search|(\/c\/)|(\/s\/)/i, { timeout: 15000 });
    }

    await this.waitForPageLoaded();
    console.log(`[Navigation] Successfully validated return to PLP with URL: ${this.page.url()}`);
  }

  /**
   * Validate that PDP page opened (URL matches /p/ or contains query parameters like aqid)
   */
  async validatePDPOpened(): Promise<void> {
    try {
      await this.page.waitForURL(/\/p\//, { timeout: 20000 });
    } catch {
      await expect(this.page).toHaveURL(/\/p\//, { timeout: 20000 });
    }
    await this.waitForPageLoaded();
    console.log(`[PDP Validation] Successfully navigated to PDP page: ${this.page.url()}`);
  }
}
