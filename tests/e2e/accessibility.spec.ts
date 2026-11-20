import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Automated WCAG 2.2 AA accessibility audits across the theme's page types.
 *
 * Note: automated tools catch roughly 30-40% of WCAG issues, so this suite is a
 * floor, not a guarantee — it is paired with a manual checklist (see the
 * accessibility sub-issue under the testing epic).
 */
const PAGES: Record<string, string> = {
  homepage: "/",
  "section list": "/posts/",
  "single page": "/posts/hello/",
  "standalone page": "/about/",
  "shortcode page with contact form": "/shortcodes/",
  "custom header layout": "/header-layout/",
  "taxonomy terms": "/tags/",
  "taxonomy term": "/tags/alpha/",
  "404": "/404.html",
};

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

for (const [name, path] of Object.entries(PAGES)) {
  test(`${name} has no automatically detectable a11y violations`, async ({
    page,
  }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}

/**
 * Header submenus (tests/e2e/navigation.spec.ts): audit the header with every
 * submenu closed and with one submenu open, on a plain header and on a header
 * with a featured image.
 */
for (const path of ["/", "/featured/"]) {
  test(`header with closed submenus on ${path} has no automatically detectable a11y violations`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator(".ananke-submenu-toggle").first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include("header")
      .withTags(TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });

  for (const toggle of ["Posts submenu", "Topics"]) {
    test(`header with the open "${toggle}" button on ${path} has no automatically detectable a11y violations`, async ({
      page,
    }) => {
      await page.goto(path);
      const button = page.getByRole("button", { name: toggle });
      await button.click();
      await expect(button).toHaveAttribute("aria-expanded", "true");
      const results = await new AxeBuilder({ page })
        .include("header")
        .withTags(TAGS)
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("header with the expanded mobile menu at 375px has no automatically detectable a11y violations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.locator(".ananke-submenu-toggle:visible")).toHaveCount(0);
  const results = await new AxeBuilder({ page })
    .include("header")
    .withTags(TAGS)
    .analyze();
  expect(results.violations).toEqual([]);
});

for (const state of ["focus", "hover"] as const) {
  test(`content links retain AA contrast on ${state}`, async ({ page }) => {
    await page.goto("/posts/hello/");
    const link = page.locator('main a[href="/tags/alpha/"]').first();
    await link[state]();
    const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}
