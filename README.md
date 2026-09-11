# DXL Playwright Automation Test Framework

A TypeScript Playwright test framework designed for [DXL Big + Tall](https://www.dxl.com/) featuring:
- **Page Object Model (POM)** architecture
- **Custom Fixtures** with pre-test initial setup (cookie management, country switching)
- **Auto-Healing Locators** with JSON fallback configuration
- **MCP Server Locator Identifier** support via `@executeautomation/playwright-mcp-server`
- **Externalized Test Data & Locators** in JSON

---

## 📁 Project Structure

```
dxl-playwright-framework/
├── data/
│   └── testData.json           # Test data (URLs, titles, paths)
├── fixtures/
│   └── testFixtures.ts         # Custom Playwright fixture with initial setup
├── locators/
│   └── locators.json           # Multi-selector auto-heal repository
├── pages/
│   ├── BasePage.ts             # Base Page Object with auto-healer & helpers
│   ├── HomePage.ts             # Initial setup & country selector logic
│   ├── FooterPage.ts           # Footer links and banner page object
│   └── MegaMenuPage.ts         # Mega menu, PLP, and header modal page object
├── spec/
│   ├── FooterValidation.spec.ts    # Footer & footer-banner test suite
│   └── megaMenuValidation.spec.ts  # Mega menu & header modal test suite
├── utils/
│   └── autoHealer.ts           # Auto-healing engine with fallback resolution
├── playwright.config.ts        # Playwright runner configuration
├── package.json
└── tsconfig.json
```

---

## 🚀 Key Features

### 1. Automatic Initial Setup (Fixture-Level)
Every test automatically runs the initial site setup:
1. Navigates to `https://www.dxl.com/`.
2. Automatically accepts cookies via OneTrust handlers.
3. Intercepts the Global-E shipping modal (`aria-describedby="GE_modal_welcome_label"`), clicks **"Change your shipping country"**, and selects **"Proceed as U.S Customer"**.

### 2. Auto-Healing Locators (`locators.json` + `autoHealer.ts`)
Locators are stored as priority arrays. If the primary selector changes or breaks due to dynamic class names or DOM updates, the `AutoHealer` tries fallback candidates, logs the healed selector, and ensures tests continue without false negatives.

### 3. MCP Server Locator Identifier
Configured with Playwright MCP Server to inspect accessibility trees, evaluate live DOM properties, and identify resilient locators.

---

## 🧪 Test Coverage

### `spec/FooterValidation.spec.ts`
* **Test Case 1**: Footer -> Click **DXL Rewards** -> Validates static page `/static/rewards`.
* **Test Case 2**: Footer -> Click **DXL Sustainability** -> Validates static page `/static/environmental-social-governance`.
* **Test Case 3**: Footer Banner -> Click `alt="Wear What You Want"` -> Validates static page `/static/wear-what-you-want`.
* **Test Case 4**: Footer Banner -> Click **Gift Cards** -> Validates static page `/static/gift-card-decision`.
* **Test Case 5**: Footer Banner -> Click **Reward Your Style** -> Validates static page `/static/rewards`.

### `spec/megaMenuValidation.spec.ts`
* **Test Case 1**: Mega Menu -> Click **NEW** -> Validates PLP `/c/new`.
* **Test Case 2**: Mega Menu -> Click **SHIRTS** -> Validates PLP `/c/shirts`.
* **Test Case 3**: Mega Menu -> Hover **SHIRTS** -> Click **Graphic Tees** -> Validates PLP `/c/graphic-tees`.
* **Test Case 4**: Header -> Click **Find a Store** -> Validates `My Store` modal.
* **Test Case 5**: Header -> Click **Order Status** -> Validates `Track Order Status` modal.
* **Test Case 6**: Header -> Click `title="Account"` -> Validates `My Account` modal.
* **Test Case 7**: Header -> Click **Wishlist** -> Validates `My Account` modal for guest user.
* **Test Case 8**: Header -> Click `#my-shopping-bag` -> Validates `Bag Summary` modal.

---

## ⚙️ How to Run Tests

### Run all tests:
```bash
npx playwright test
```

### Run in headed mode:
```bash
npx playwright test --headed
```

### Run specific spec:
```bash
npx playwright test spec/FooterValidation.spec.ts --headed
npx playwright test spec/megaMenuValidation.spec.ts --headed
```

### View HTML Test Report:
```bash
npx playwright show-report
```
