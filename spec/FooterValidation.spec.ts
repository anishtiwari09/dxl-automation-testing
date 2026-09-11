import { test, expect } from '../fixtures/testFixtures';
import testData from '../data/testData.json';

test.describe('Footer and Footer-Banner Validations @footer', () => {

  test('Validate DXL Rewards static page from footer', async ({ footerPage }) => {
    await footerPage.clickDxlRewards();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.dxlRewards);
    await footerPage.captureScreenshot('Footer_TC1_DXL_Rewards');
  });

  test('Validate DXL Sustainability static page from footer', async ({ footerPage }) => {
    await footerPage.clickDxlSustainability();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.dxlSustainability);
    await footerPage.captureScreenshot('Footer_TC2_DXL_Sustainability');
  });

  test('Validate Wear What You Want banner from footer-banner', async ({ footerPage }) => {
    await footerPage.clickWearWhatYouWantBanner();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.wearWhatYouWant);
    await footerPage.captureScreenshot('Footer_TC3_Wear_What_You_Want');
  });

  test('Validate Gift Cards link from footer-banner', async ({ footerPage }) => {
    await footerPage.clickGiftCardsBanner();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.giftCards);
    await footerPage.captureScreenshot('Footer_TC4_Gift_Cards');
  });

  test('Validate Reward Your Style link from footer-banner', async ({ footerPage }) => {
    await footerPage.clickRewardYourStyleBanner();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.rewardYourStyle);
    await footerPage.captureScreenshot('Footer_TC5_Reward_Your_Style');
  });

  test('Validate FiTMAP® link from footer', async ({ footerPage }) => {
    await footerPage.clickFitmap();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.fitmap);
    await footerPage.captureScreenshot('Footer_TC6_FiTMAP');
  });

  test('Validate Curbside Pickup link from footer', async ({ footerPage }) => {
    await footerPage.clickCurbsidePickup();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.curbsidePickup);
    await footerPage.captureScreenshot('Footer_TC7_Curbside_Pickup');
  });

  test('Validate DXL Deals link from footer', async ({ footerPage }) => {
    await footerPage.clickDxlDeals();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.dxlDeals);
    await footerPage.captureScreenshot('Footer_TC8_DXL_Deals');
  });

  test('Validate Heroes Discount link from footer', async ({ footerPage }) => {
    await footerPage.clickHeroesDiscount();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.heroesDiscount);
    await footerPage.captureScreenshot('Footer_TC9_Heroes_Discount');
  });

  test('Validate Product Collections link from footer', async ({ footerPage }) => {
    await footerPage.clickProductCollections();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.productCollections);
    await footerPage.captureScreenshot('Footer_TC10_Product_Collections');
  });

  test('Validate Price Match Guarantee link from footer', async ({ footerPage }) => {
    await footerPage.clickPriceMatchGuarantee();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.priceMatchGuarantee);
    await footerPage.captureScreenshot('Footer_TC11_Price_Match_Guarantee');
  });

  test('Validate Shipping & Delivery link from footer', async ({ footerPage }) => {
    await footerPage.clickShippingDelivery();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.shippingDelivery);
    await footerPage.captureScreenshot('Footer_TC12_Shipping_Delivery');
  });

  test('Validate Returns & Exchanges link from footer', async ({ footerPage }) => {
    await footerPage.clickReturnsExchanges();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.returnsExchanges);
    await footerPage.captureScreenshot('Footer_TC13_Returns_Exchanges');
  });

  test('Validate Order Status modal open and close from footer', async ({ footerPage }) => {
    await footerPage.clickOrderStatusAndHandleModal();
    await footerPage.captureScreenshot('Footer_TC14_Order_Status_Modal');
  });

  test('Validate Help Center link from footer', async ({ footerPage }) => {
    await footerPage.clickHelpCenter();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.helpCenter);
    await footerPage.captureScreenshot('Footer_TC15_Help_Center');
  });

  test('Validate Find a Store modal/page from footer', async ({ footerPage }) => {
    await footerPage.clickFindAStoreAndHandleModal();
    await footerPage.captureScreenshot('Footer_TC16_Find_A_Store');
  });

  test.skip('Validate Email Us modal open and close via outside click from footer', async ({ footerPage }) => {
    await footerPage.clickEmailUsAndCloseByOutsideClick();
    await footerPage.captureScreenshot('Footer_TC17_Email_Us_Modal');
  });

  test('Validate Call Us modal open and close via outside click from footer', async ({ footerPage }) => {
    await footerPage.clickCallUsAndCloseByOutsideClick();
    await footerPage.captureScreenshot('Footer_TC18_Call_Us_Modal');
  });

  test('Validate About Us link from footer', async ({ footerPage }) => {
    await footerPage.clickAboutUs();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.aboutUs);
    await footerPage.captureScreenshot('Footer_TC19_About_Us');
  });

  test('Validate Careers link from footer', async ({ footerPage }) => {
    await footerPage.clickCareers();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.careers);
    await footerPage.captureScreenshot('Footer_TC20_Careers');
  });

  test('Validate Contact Us link from footer', async ({ footerPage }) => {
    await footerPage.clickContactUs();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.contactUs);
    await footerPage.captureScreenshot('Footer_TC21_Contact_Us');
  });

  test('Validate Accessibility Statement link from footer', async ({ footerPage }) => {
    await footerPage.clickAccessibilityStatement();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.accessibilityStatement);
    await footerPage.captureScreenshot('Footer_TC22_Accessibility_Statement');
  });

  test('Validate Privacy Policy link from footer', async ({ footerPage }) => {
    await footerPage.clickPrivacyPolicy();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.privacyPolicy);
    await footerPage.captureScreenshot('Footer_TC23_Privacy_Policy');
  });

  test('Validate Security Policy link from footer', async ({ footerPage }) => {
    await footerPage.clickSecurityPolicy();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.securityPolicy);
    await footerPage.captureScreenshot('Footer_TC24_Security_Policy');
  });

  test('Validate Terms of Use link from footer', async ({ footerPage }) => {
    await footerPage.clickTermsOfUse();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.termsOfUse);
    await footerPage.captureScreenshot('Footer_TC25_Terms_Of_Use');
  });

  test('Validate California Privacy Rights link from footer', async ({ footerPage }) => {
    await footerPage.clickCaliforniaPrivacyRights();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.californiaPrivacyRights);
    await footerPage.captureScreenshot('Footer_TC26_California_Privacy_Rights');
  });

  test('Validate Do Not Sell My Data link from footer', async ({ footerPage }) => {
    await footerPage.clickDoNotSellMyData();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.doNotSellMyData);
    await footerPage.captureScreenshot('Footer_TC27_Do_Not_Sell_My_Data');
  });

  test('Validate California Transparency Act privacy preference modal open and close via X from footer', async ({ footerPage }) => {
    await footerPage.clickCaliforniaTransparencyActAndCloseModal();
    await footerPage.captureScreenshot('Footer_TC28_California_Transparency_Act');
  });

  test('Validate UGC Terms & Conditions link from footer', async ({ footerPage }) => {
    await footerPage.clickUgcTerms();
    await footerPage.validateStaticPageOpened(testData.expectedUrls.ugcTerms);
    await footerPage.captureScreenshot('Footer_TC29_UGC_Terms');
  });

});
