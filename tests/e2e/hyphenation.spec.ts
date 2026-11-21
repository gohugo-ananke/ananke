import { expect, test } from "@playwright/test";

const POST = "/posts/hello/";

const hyphens = (selector: string) => (page: import("@playwright/test").Page) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => getComputedStyle(element).hyphens);

test.describe("hyphenation utility", () => {
  test("hyphenates post paragraphs in the page language", async ({ page }) => {
    await page.goto(POST);
    await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
    await expect(page.locator("article .hyphenate")).toHaveCount(1);
    expect(await hyphens("article .hyphenate p")(page)).toBe("auto");
  });

  test("keeps code words whole", async ({ page }) => {
    await page.goto(POST);
    expect(await hyphens("article .hyphenate p code")(page)).toBe("manual");
    expect(await hyphens("article .hyphenate pre")(page)).toBe("none");
  });

  test("site CSS can redefine the class", async ({ page }) => {
    await page.goto(POST);
    await page.addStyleTag({ content: ".hyphenate { hyphens: manual; }" });
    expect(await hyphens("article .hyphenate p")(page)).toBe("manual");
  });
});
