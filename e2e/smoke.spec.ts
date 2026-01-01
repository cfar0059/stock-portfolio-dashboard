import { expect, type Page, test } from "@playwright/test";

/**
 * E2E Smoke Tests for Stock Portfolio Dashboard
 *
 * These tests verify core user flows without hitting external APIs:
 * 1. Add position persistence via localStorage
 * 2. DCA highlighting logic with mocked stock prices
 */

const STORAGE_KEY = "portfolio-positions";

/**
 * Mock the /api/stocks endpoint with deterministic price data
 * @param page Playwright page instance
 * @param priceMap Map of symbol to price (e.g., { AAPL: 150, MSFT: 300 })
 */
async function mockStockPrices(page: Page, priceMap: Record<string, number>) {
  await page.route("**/api/stocks**", async (route) => {
    const url = new URL(route.request().url());
    const symbolsParam = url.searchParams.get("symbols");

    if (!symbolsParam) {
      await route.fulfill({ status: 400, json: { error: "Missing symbols" } });
      return;
    }

    const symbols = symbolsParam.split(",");
    const stocks = symbols.map((symbol) => ({
      symbol: symbol.toUpperCase(),
      price: priceMap[symbol.toUpperCase()] || 100,
      change: 0,
      currency: "USD",
      source: "live",
    }));

    await route.fulfill({
      status: 200,
      json: { stocks },
    });
  });
}

/**
 * Clear localStorage before each test to ensure clean state
 */
test.beforeEach(async ({ page }) => {
  await page.goto("/overview");
  await page.evaluate(() => localStorage.clear());
});

test("Persistence (localStorage): Add position, verify, reload, and verify persistence", async ({
  page,
}) => {
  // Mock stock prices for AAPL
  await mockStockPrices(page, { AAPL: 150 });

  await page.goto("/overview");

  // Wait for page to hydrate - look for the Positions heading
  await page.waitForSelector("text=Positions", { timeout: 10000 });

  // Open Add Position form
  const addButton = page.getByTestId("add-position-toggle");
  await expect(addButton).toBeVisible({ timeout: 10000 });
  await addButton.click();

  // Wait for CSS animation to complete
  await page.waitForTimeout(1000);

  // Fill in position details
  await page.getByTestId("input-symbol").fill("AAPL");
  await page.getByTestId("input-shares").fill("10");
  await page.getByTestId("input-buy-price").fill("120");
  await page.getByTestId("input-dca").fill("140");

  // Submit the form
  await page.getByTestId("save-position-button").click();

  // Wait for the position to appear in the table
  const positionRow = page.getByTestId("position-row-AAPL");
  await expect(positionRow).toBeVisible({ timeout: 10000 });

  // Verify position data is displayed
  await expect(positionRow).toContainText("AAPL");
  await expect(positionRow).toContainText("150.00"); // price
  await expect(positionRow).toContainText("10"); // shares
  await expect(positionRow).toContainText("120.00"); // buy price
  await expect(positionRow).toContainText("140.00"); // DCA

  // Verify localStorage contains the position
  const storedData = await page.evaluate((key) => {
    return localStorage.getItem(key);
  }, STORAGE_KEY);

  expect(storedData).toBeTruthy();
  const positions = JSON.parse(storedData!);
  expect(positions).toHaveLength(1);
  expect(positions[0].symbol).toBe("AAPL");
  expect(positions[0].shares).toBe(10);
  expect(positions[0].buyPrice).toBe(120);
  expect(positions[0].dca).toBe(140);

  // Reload the page to verify persistence
  await page.reload();

  // Re-mock stock prices after reload
  await mockStockPrices(page, { AAPL: 150 });

  // Wait for the position to be loaded from localStorage
  const positionRowAfterReload = page.getByTestId("position-row-AAPL");
  await expect(positionRowAfterReload).toBeVisible({ timeout: 10000 });

  // Verify position still exists after reload
  await expect(positionRowAfterReload).toContainText("AAPL");
  await expect(positionRowAfterReload).toContainText("150.00");
  await expect(positionRowAfterReload).toContainText("10");
  await expect(positionRowAfterReload).toContainText("120.00");
  await expect(positionRowAfterReload).toContainText("140.00");
});

test("DCA Highlighting: Verify highlight toggles based on price vs DCA target", async ({
  page,
}) => {
  // Pre-seed localStorage with a position that has DCA target
  await page.goto("/overview");
  await page.evaluate(
    ({ key, data }) => {
      localStorage.setItem(key, JSON.stringify(data));
    },
    {
      key: STORAGE_KEY,
      data: [
        {
          id: "test-1",
          symbol: "MSFT",
          shares: 5,
          buyPrice: 300,
          dca: 280, // DCA target is 280
        },
      ],
    },
  );

  // Test Case 1: Price below DCA target → should be highlighted
  await mockStockPrices(page, { MSFT: 270 }); // 270 < 280
  await page.reload();

  let positionRow = page.getByTestId("position-row-MSFT");
  await expect(positionRow).toBeVisible({ timeout: 10000 });
  await expect(positionRow).toHaveAttribute("data-dca-highlighted", "true");

  // Test Case 2: Price equals DCA target → should be highlighted
  await mockStockPrices(page, { MSFT: 280 }); // 280 === 280
  await page.reload();

  positionRow = page.getByTestId("position-row-MSFT");
  await expect(positionRow).toBeVisible({ timeout: 10000 });
  await expect(positionRow).toHaveAttribute("data-dca-highlighted", "true");

  // Test Case 3: Price within +5% of DCA (283) → should be highlighted
  await mockStockPrices(page, { MSFT: 283 }); // 283 <= 280 * 1.05 (294)
  await page.reload();

  positionRow = page.getByTestId("position-row-MSFT");
  await expect(positionRow).toBeVisible({ timeout: 10000 });
  await expect(positionRow).toHaveAttribute("data-dca-highlighted", "true");

  // Test Case 4: Price at upper bound +5% (294) → should be highlighted
  await mockStockPrices(page, { MSFT: 294 }); // 294 === 280 * 1.05
  await page.reload();

  positionRow = page.getByTestId("position-row-MSFT");
  await expect(positionRow).toBeVisible({ timeout: 10000 });
  await expect(positionRow).toHaveAttribute("data-dca-highlighted", "true");

  // Test Case 5: Price above +5% threshold → should NOT be highlighted
  await mockStockPrices(page, { MSFT: 295 }); // 295 > 280 * 1.05 (294)
  await page.reload();

  positionRow = page.getByTestId("position-row-MSFT");
  await expect(positionRow).toBeVisible({ timeout: 10000 });
  await expect(positionRow).toHaveAttribute("data-dca-highlighted", "false");

  // Test Case 6: Price significantly above DCA → should NOT be highlighted
  await mockStockPrices(page, { MSFT: 350 }); // 350 >> 280
  await page.reload();

  positionRow = page.getByTestId("position-row-MSFT");
  await expect(positionRow).toBeVisible({ timeout: 10000 });
  await expect(positionRow).toHaveAttribute("data-dca-highlighted", "false");
});
