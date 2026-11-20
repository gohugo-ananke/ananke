import { expect, type Locator, test } from "@playwright/test";

for (const path of ["/", "/posts/", "/asset-header/", "/bundled-header/"]) {
  test(`responsive header selects a larger resource on ${path}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(path);
    const header = page.locator("header").first();
    const small = await header.evaluate(
      (node) => getComputedStyle(node).backgroundImage,
    );
    expect(await backgroundWidth(header)).toBe(480);
    await page.setViewportSize({ width: 900, height: 800 });
    await expect.poll(() => backgroundWidth(header)).toBe(960);
    expect(
      await header.evaluate((node) => getComputedStyle(node).backgroundImage),
    ).not.toBe(small);
  });
}

test("responsive header works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 900, height: 800 },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:4321/asset-header/");
  expect(await backgroundWidth(page.locator("header").first())).toBe(960);
  await context.close();
});

async function backgroundWidth(header: Locator) {
  return header.evaluate(async (node) => {
    const url = getComputedStyle(node).backgroundImage.slice(5, -2);
    const image = new Image();
    image.src = url;
    await image.decode();
    return image.naturalWidth;
  });
}

test("static image URLs remain unchanged", async ({ page }) => {
  await page.goto("/static-header/");
  const header = page.locator("header").first();
  expect(
    await header.evaluate((node) => getComputedStyle(node).backgroundImage),
  ).toContain("/images/static-header.png");
});

test("small bundle sources are not enlarged", async ({ page }) => {
  await page.setViewportSize({ width: 2200, height: 800 });
  await page.goto("/bundled-header/");
  expect(await backgroundWidth(page.locator("header").first())).toBe(1000);
});
