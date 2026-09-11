import { test, expect } from '../fixtures/testFixtures';
import testData from '../data/testData.json';

test.describe('Search and Browse Validations @search', () => {

  test('Search with empty value', async ({ searchBrowsePage }) => {
    // 1. Click on search bar to trigger empty flyout
    await searchBrowsePage.clickSearchBar();

    // 2. Validate display of Recommended For You, Suggestions, and Popular Products
    await searchBrowsePage.validateEmptySearchFlyoutContent();

    // 3. Capture screenshot of the empty search flyout
    await searchBrowsePage.captureScreenshot('Search_Empty_Value_Flyout');
  });

  test ('Search with product# and navigate to PDP from Popular Products', async ({ searchBrowsePage }) => {
    // 1. Enter random product# sourced from testData.json (encapsulates focus & input)
    const randomProductNo = searchBrowsePage.getRandomProductNumber();
    const searchedProductNo = await searchBrowsePage.enterSearchQuery(randomProductNo);

    // 2. Click on product from Popular Products (id="search-item-5" or first matching product suggestion)
    await searchBrowsePage.clickPopularProductItem('search-item-5', searchedProductNo);

    // 3. Validate PDP page opens with /p/
    await searchBrowsePage.validatePDPOpened();

    // 4. Capture screenshot of the loaded PDP page
    await searchBrowsePage.captureScreenshot(`Search_PDP_${searchedProductNo}`);
  });

  test('Search with keyword and click search icon to open PLP page', async ({ searchBrowsePage }) => {
    // 1. Perform search with random keyword
    const keyword = searchBrowsePage.getRandomSearchKeyword();
    await searchBrowsePage.searchFor(keyword);

    // 2. Validate search PLP page opens (search?query=...) and scroll down to load products
    await searchBrowsePage.validateSearchPLPOpened(keyword);

    // 3. Capture screenshot of the loaded PLP search results
    await searchBrowsePage.captureScreenshot(`Search_PLP_${keyword}`);
  });

  test('Breadcrumb validation on search PLP page', async ({ searchBrowsePage }) => {
    // 1. Perform search with random keyword
    const keyword = searchBrowsePage.getRandomSearchKeyword();
    await searchBrowsePage.searchFor(keyword);

    // 2. Validate search PLP page opens (search?query=...) and scroll down to load products
    await searchBrowsePage.validateSearchPLPOpened(keyword);

    // 3. Validate breadcrumb displays: Home / Results for 'keyword' (aria-label="breadcrumb")
    const breadcrumbValue = await searchBrowsePage.validateBreadcrumb(keyword);
    console.log(`[Test Output] Breadcrumb Value on Page: "${breadcrumbValue}"\n`);

    // 4. Capture screenshot of the breadcrumb and search PLP
    await searchBrowsePage.captureScreenshot(`Search_Breadcrumb_${keyword}`);
  });

  test('Breadcrumb Home link navigation to HomePage', async ({ searchBrowsePage }) => {
    // 1. Perform search with random keyword
    const keyword = searchBrowsePage.getRandomSearchKeyword();
    await searchBrowsePage.searchFor(keyword);

    // 2. Validate search PLP page opens (search?query=...)
    await searchBrowsePage.validateSearchPLPOpened(keyword);

    // 3. Click on "Home" link from the breadcrumb
    await searchBrowsePage.clickBreadcrumbHome();

    // 4. Validate redirection back to HomePage
    await searchBrowsePage.validateHomePageOpened();

    // 5. Capture screenshot of the Home page
    await searchBrowsePage.captureScreenshot('Search_Breadcrumb_Redirect_Home');
  });

  test('Search with invalid keyword and validate no results page', async ({ searchBrowsePage }) => {
    // 1. Perform search with random invalid keyword
    const invalidKeyword = searchBrowsePage.getRandomInvalidKeyword();
    await searchBrowsePage.searchFor(invalidKeyword);

    // 2. Validate no results page displays "Sorry, no results for '<entered invalid keyword>'"
    const noResultsMessage = await searchBrowsePage.validateNoResultsPage(invalidKeyword);
    console.log(`[Test Output] No Results Message on Page: "${noResultsMessage}"\n`);

    // 3. Capture screenshot of the no results page
    await searchBrowsePage.captureScreenshot(`Search_No_Results_${invalidKeyword}`);
  });

  test('Pagination: Show More, navigate to PDP from Page 2 and browser back', async ({ searchBrowsePage }) => {
    test.setTimeout(180000);
    // 1. Perform search with random keyword
    const keyword = searchBrowsePage.getRandomSearchKeyword();
    await searchBrowsePage.searchFor(keyword);

    // 2. Validate search PLP page opens (search?query=...)
    await searchBrowsePage.validateSearchPLPOpened(keyword);

    // 3. Scroll down and click "Show More" button to load page 2
    await searchBrowsePage.clickShowMoreButton();

    // 4. Scroll down and click on a random product from page 2
    const clickedProduct = await searchBrowsePage.clickRandomProductFromPageTwo();

    // 5. Validate PDP page is opened
    await searchBrowsePage.validatePDPOpened();
    await searchBrowsePage.captureScreenshot(`Search_Page2_PDP_${keyword}`);

    // 6. Click browser back button and verify redirection back to PLP page (same page state)
    await searchBrowsePage.navigateBackToPLP();
    await searchBrowsePage.captureScreenshot(`Search_Browser_Back_PLP_${keyword}`);
  });

});
