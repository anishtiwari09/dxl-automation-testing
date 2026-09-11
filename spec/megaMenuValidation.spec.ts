import { test, expect } from '../fixtures/testFixtures';
import testData from '../data/testData.json';

test.describe('Mega Menu and Header Modal Validations @megamenu', () => {

  test('Validate NEW PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "NEW" in <nav> Mega Menu
    await megaMenuPage.clickNewMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.newPLP);

    // 3. Validate breadcrumb displays Home/New
    await megaMenuPage.validateBreadcrumb('New');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC1_NEW_PLP');
  });

  test('Validate SHIRTS PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "SHIRTS" in <nav> Mega Menu
    await megaMenuPage.clickShirtsMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.shirtsPLP);

    // 3. Validate breadcrumb displays Home/Shirts
    await megaMenuPage.validateBreadcrumb('Shirts');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC2_SHIRTS_PLP');
  });

  test('Validate Graphic Tees PLP navigation', async ({ megaMenuPage }) => {
    // 1. Hover on "SHIRTS" and click "Graphic Tees"
    await megaMenuPage.hoverShirtsAndClickGraphicTees();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.graphicTeesPLP);

    // 3. Validate breadcrumb displays Home/Graphic Tees
    await megaMenuPage.validateBreadcrumb('Graphic Tees');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC3_Graphic_Tees_PLP');
  });

  test('Validate BRANDS PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "BRANDS" in <nav> Mega Menu
    await megaMenuPage.clickBrandsMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.brandsPLP);

    // 3. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC4_BRANDS_PLP');
  });

  test('Validate TRENDING PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "TRENDING" in <nav> Mega Menu
    await megaMenuPage.clickTrendingMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.trendingPLP);

    // 3. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC5_TRENDING_PLP');
  });

  test('Validate PANTS + SHORTS PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "PANTS + SHORTS" in <nav> Mega Menu
    await megaMenuPage.clickPantsShortsMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.pantsShortsPLP);

    // 3. Validate breadcrumb displays Home/Pants & Shorts
    await megaMenuPage.validateBreadcrumb('Pants & Shorts');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC6_PANTS_SHORTS_PLP');
  });

  test('Validate OUTERWEAR PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "OUTERWEAR" in <nav> Mega Menu
    await megaMenuPage.clickOuterwearMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.outerwearPLP);

    // 3. Validate breadcrumb displays Home/Outerwear
    await megaMenuPage.validateBreadcrumb('Outerwear');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC7_OUTERWEAR_PLP');
  });

  test('Validate ACTIVEWEAR PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "ACTIVEWEAR" in <nav> Mega Menu
    await megaMenuPage.clickActivewearMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.activewearPLP);

    // 3. Validate breadcrumb displays Home/Activewear
    await megaMenuPage.validateBreadcrumb('Activewear');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC8_ACTIVEWEAR_PLP');
  });

  test('Validate TEAMS PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "TEAMS" in <nav> Mega Menu
    await megaMenuPage.clickTeamsMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.teamsPLP);

    // 3. Validate breadcrumb displays Home/Team
    await megaMenuPage.validateBreadcrumb('Team');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC9_TEAMS_PLP');
  });

  test('Validate SUIT SHOP PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "SUIT SHOP" in <nav> Mega Menu
    await megaMenuPage.clickSuitShopMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.suitShopPLP);

    // 3. Validate breadcrumb displays Home/Suiting
    await megaMenuPage.validateBreadcrumb('Suiting');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC10_SUIT_SHOP_PLP');
  });

  test('Validate UNDERWEAR + LOUNGE PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "UNDERWEAR + LOUNGE" in <nav> Mega Menu
    await megaMenuPage.clickUnderwearLoungeMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.underwearLoungePLP);

    // 3. Validate breadcrumb displays Home/Underwear & Lounge
    await megaMenuPage.validateBreadcrumb('Underwear & Lounge');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC11_UNDERWEAR_LOUNGE_PLP');
  });

  test('Validate SHOES PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "SHOES" in <nav> Mega Menu
    await megaMenuPage.clickShoesMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.shoesPLP);

    // 3. Validate breadcrumb displays Home/Shoes
    await megaMenuPage.validateBreadcrumb('Shoes');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC12_SHOES_PLP');
  });

  test('Validate ACCESSORIES PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "ACCESSORIES" in <nav> Mega Menu
    await megaMenuPage.clickAccessoriesMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.accessoriesPLP);

    // 3. Validate breadcrumb displays Home/Accessories
    await megaMenuPage.validateBreadcrumb('Accessories');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC13_ACCESSORIES_PLP');
  });

  test('Validate SALE PLP navigation from Mega Menu', async ({ megaMenuPage }) => {
    // 1. Click on "SALE" in <nav> Mega Menu
    await megaMenuPage.clickSaleMenuItem();

    // 2. Validate respective PLP page opens
    await megaMenuPage.validatePLPOpened(testData.expectedUrls.salePLP);

    // 3. Validate breadcrumb displays Home/Sale
    await megaMenuPage.validateBreadcrumb('Sale');

    // 4. Capture screenshot of the loaded page
    await megaMenuPage.captureScreenshot('MegaMenu_TC14_SALE_PLP');
  });

  test('Validate My Store popup', async ({ megaMenuPage }) => {
    // 1. Click on Find a Store button
    await megaMenuPage.clickFindAStoreButton();

    // 2. Validate "My Store" popup opens
    await megaMenuPage.validateModalOpened(testData.modalTitles.myStore);

    // 3. Capture screenshot of the opened modal
    await megaMenuPage.captureScreenshot('Header_TC4_My_Store_Modal');
  });

  test('Validate Order Status modal', async ({ megaMenuPage }) => {
    // 1. Click on Order Status button
    await megaMenuPage.clickOrderStatusButton();

    // 2. Validate "Track Order Status" modal opens
    await megaMenuPage.validateModalOpened(testData.modalTitles.trackOrderStatus);

    // 3. Capture screenshot of the opened modal
    await megaMenuPage.captureScreenshot('Header_TC5_Track_Order_Status_Modal');
  });

  test('Validate My Account modal', async ({ megaMenuPage }) => {
    // 1. Click on button where title="Account"
    await megaMenuPage.clickAccountButton();

    // 2. Validate "My Account" modal opens
    await megaMenuPage.validateModalOpened(testData.modalTitles.myAccount);

    // 3. Capture screenshot of the opened modal
    await megaMenuPage.captureScreenshot('Header_TC6_My_Account_Modal');
  });

  test('Validate Wishlist opens My Account modal for guest user', async ({ megaMenuPage }) => {
    // 1. Click on button Wishlist
    await megaMenuPage.clickWishlistButton();

    // 2. Validate "My Account" modal opens for guest user
    await megaMenuPage.validateModalOpened(testData.modalTitles.myAccount);

    // 3. Capture screenshot of the opened modal
    await megaMenuPage.captureScreenshot('Header_TC7_Wishlist_Guest_Modal');
  });

  test('Validate Bag Summary modal', async ({ megaMenuPage }) => {
    // 1. Click on #my-shopping-bag
    await megaMenuPage.clickShoppingBagButton();

    // 2. Validate "Bag Summary" modal opens
    await megaMenuPage.validateModalOpened(testData.modalTitles.bagSummary);

    // 3. Capture screenshot of the opened modal
    await megaMenuPage.captureScreenshot('Header_TC8_Bag_Summary_Modal');
  });

});
