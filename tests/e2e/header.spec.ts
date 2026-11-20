import { expect, type Page, test } from "@playwright/test";

/**
 * Header layout and header hooks.
 *
 * The fixture site sets `params.ananke.header.navigation` to
 * [["logo"], ["search"], ["languages", "menu", "social"]], with a custom
 * `search` component (tests/fixtures/site/layouts/_partials/hooks/header/search.html).
 * The `/header-layout/` section changes the layout in its front matter to
 * [["menu", "search"], "logo"] and puts `search` between the description and
 * the title.
 */
const DEFAULT_PAGE = "/";
const CUSTOM_PAGE = "/header-layout/";

const groups = (page: Page) =>
  page.locator(".ananke-nav-inner > .ananke-nav-group");
const menuButton = (page: Page) => page.locator(".ananke-nav-toggle");

/** Tag names of the direct children of the navigation row. */
const rowChildren = (page: Page) =>
  page
    .locator(".ananke-nav-inner")
    .evaluate((el) =>
      Array.from(el.children).map(
        (child) => `${child.tagName.toLowerCase()}.${child.classList[0]}`,
      ),
    );

test.describe("configured header layout", () => {
  test("renders the groups in the configured order with their roles", async ({
    page,
  }) => {
    await page.goto(DEFAULT_PAGE);
    expect(await rowChildren(page)).toEqual([
      "div.ananke-nav-group",
      "div.ananke-nav-group",
      "button.ananke-nav-toggle",
      "div.ananke-nav-group",
    ]);
    await expect(groups(page).nth(0)).toHaveClass(/\bananke-nav-lead\b/);
    await expect(groups(page).nth(0).locator(".ananke-nav-brand")).toHaveCount(
      1,
    );
    await expect(groups(page).nth(1)).toHaveClass(/\bananke-nav-slot\b/);
    await expect(groups(page).nth(1).getByRole("search")).toHaveCount(1);
    await expect(groups(page).nth(2)).toHaveId("ananke-nav-panel");
    await expect(
      groups(page).nth(2).locator(".ananke-nav-menu > li"),
    ).toHaveCount(3);
    await expect(groups(page).nth(2).locator(".ananke-socials")).toHaveCount(1);
  });

  test("renders the title in the header content", async ({ page }) => {
    await page.goto("/posts/");
    await expect(page.locator("header h1")).toHaveText("Posts");
  });
});

test.describe("header layout from front matter", () => {
  test("renders the groups and components in the configured order", async ({
    page,
  }) => {
    await page.goto(CUSTOM_PAGE);
    // The menu button stays directly before the panel it controls.
    expect(await rowChildren(page)).toEqual([
      "button.ananke-nav-toggle",
      "div.ananke-nav-group",
      "div.ananke-nav-group",
    ]);
    const panel = groups(page).nth(0);
    await expect(panel).toHaveId("ananke-nav-panel");
    const order = await panel.evaluate((el) =>
      Array.from(el.children).map((child) => child.tagName.toLowerCase()),
    );
    expect(order).toEqual(["ul", "form"]);
    await expect(groups(page).nth(1)).toHaveClass(/\bananke-nav-lead\b/);
    await expect(groups(page).nth(1).locator(".ananke-nav-brand")).toHaveCount(
      1,
    );
  });

  test("renders the content components in the configured order", async ({
    page,
  }) => {
    await page.goto(CUSTOM_PAGE);
    const tags = await page
      .locator("header :is(h1, h2, form.fixture-search)")
      .evaluateAll((elements) =>
        elements
          .filter((el) => !el.closest("nav"))
          .map((el) => el.tagName.toLowerCase()),
      );
    expect(tags).toEqual(["h2", "form", "h1"]);
  });
});

test.describe("responsive header", () => {
  test("puts the groups in one row on large screens", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(DEFAULT_PAGE);
    await expect(menuButton(page)).toBeHidden();
    const boxes = await Promise.all(
      [0, 1, 2].map((index) => groups(page).nth(index).boundingBox()),
    );
    for (let index = 1; index < boxes.length; index++) {
      const previous = boxes[index - 1];
      const current = boxes[index];
      expect(previous && current).toBeTruthy();
      expect(current?.x ?? 0).toBeGreaterThanOrEqual(
        (previous?.x ?? 0) + (previous?.width ?? 0),
      );
    }
  });

  for (const path of [DEFAULT_PAGE, CUSTOM_PAGE]) {
    test(`shows the lead group next to the menu button on small screens (${path})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 360, height: 740 });
      await page.goto(path);
      const lead = page.locator(".ananke-nav-lead");
      await expect(lead).toBeVisible();
      await expect(menuButton(page)).toBeVisible();
      await expect(page.locator("#ananke-nav-panel")).toBeHidden();
      const leadBox = await lead.boundingBox();
      const buttonBox = await menuButton(page).boundingBox();
      // Same row: the vertical ranges overlap.
      expect(buttonBox?.y ?? 0).toBeLessThan(
        (leadBox?.y ?? 0) + (leadBox?.height ?? 0),
      );
      expect(leadBox?.x ?? 0).toBeLessThan(buttonBox?.x ?? 0);
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      expect(overflow).toBe(false);
    });
  }

  test("gives a slot group its own row on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(DEFAULT_PAGE);
    const lead = await page.locator(".ananke-nav-lead").boundingBox();
    const slot = await page.locator(".ananke-nav-slot").boundingBox();
    expect(slot?.y ?? 0).toBeGreaterThanOrEqual(
      (lead?.y ?? 0) + (lead?.height ?? 0),
    );
  });
});
