import { expect, type Page, test } from "@playwright/test";

/**
 * Two-level main menu (disclosure pattern) in the site header.
 *
 * Fixture menu (tests/fixtures/site/hugo.toml):
 *   Posts  - parent with its own page; children "Hello World" (front matter)
 *            and "Second Post" (config)
 *   Topics - parent without a URL; children "Categories" and "Tags", and
 *            "Alpha" one level below "Tags"
 *   About  - flat entry
 */

const nav = (page: Page) => page.getByRole("navigation");
const postsToggle = (page: Page) =>
  nav(page).getByRole("button", { name: "Posts submenu" });
const topicsToggle = (page: Page) =>
  nav(page).getByRole("button", { name: "Topics" });
const postsSubmenu = (page: Page) => page.locator("#ananke-submenu-0");
const topicsSubmenu = (page: Page) => page.locator("#ananke-submenu-1");
const menuButton = (page: Page) =>
  nav(page).getByRole("button", { name: "Menu", exact: true });
const panel = (page: Page) => page.locator("#ananke-nav-panel");

test.describe("header submenus", () => {
  test("toggle buttons are revealed and submenus start closed", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(postsToggle(page)).toBeVisible();
    await expect(postsToggle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(postsToggle(page)).toHaveAttribute(
      "aria-controls",
      "ananke-submenu-0",
    );
    await expect(postsSubmenu(page)).toBeHidden();
    // The parent with its own page keeps its link next to the button.
    await expect(
      nav(page).getByRole("link", { name: "Posts", exact: true }),
    ).toHaveAttribute("href", "/posts/");
    // The parent without a URL is only a button; its no-JS label is hidden.
    await expect(topicsToggle(page)).toBeVisible();
    await expect(page.locator(".ananke-submenu-label")).toBeHidden();
  });

  test("opens and closes with the mouse", async ({ page }) => {
    await page.goto("/");
    await postsToggle(page).click();
    await expect(postsToggle(page)).toHaveAttribute("aria-expanded", "true");
    await expect(postsSubmenu(page)).toBeVisible();
    await expect(
      postsSubmenu(page).getByRole("link", { name: "Hello World" }),
    ).toBeVisible();

    await postsToggle(page).click();
    await expect(postsToggle(page)).toHaveAttribute("aria-expanded", "false");
    await expect(postsSubmenu(page)).toBeHidden();
  });

  test("keeps only one submenu open", async ({ page }) => {
    await page.goto("/");
    await postsToggle(page).click();
    await topicsToggle(page).click();
    await expect(topicsSubmenu(page)).toBeVisible();
    await expect(postsSubmenu(page)).toBeHidden();
    await expect(postsToggle(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("closes on a click outside", async ({ page }) => {
    await page.goto("/");
    await topicsToggle(page).click();
    await expect(topicsSubmenu(page)).toBeVisible();
    await page.locator("main").click({ position: { x: 5, y: 5 } });
    await expect(topicsSubmenu(page)).toBeHidden();
    await expect(topicsToggle(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("works with the keyboard in reading order", async ({ page }) => {
    await page.goto("/");
    await nav(page).getByRole("link", { name: "Posts", exact: true }).focus();

    await page.keyboard.press("Tab");
    await expect(postsToggle(page)).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(postsToggle(page)).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Tab");
    await expect(
      postsSubmenu(page).getByRole("link", { name: "Hello World" }),
    ).toBeFocused();

    // Escape closes the submenu and returns focus to its button.
    await page.keyboard.press("Escape");
    await expect(postsSubmenu(page)).toBeHidden();
    await expect(postsToggle(page)).toBeFocused();

    // Space toggles as well.
    await page.keyboard.press("Space");
    await expect(postsToggle(page)).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Space");
    await expect(postsToggle(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("closes when focus leaves the submenu", async ({ page }) => {
    await page.goto("/");
    await postsToggle(page).focus();
    await page.keyboard.press("Enter");
    // Button -> Hello World -> Second Post -> next top-level item.
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await expect(
      postsSubmenu(page).getByRole("link", { name: "Second Post" }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(topicsToggle(page)).toBeFocused();
    await expect(postsSubmenu(page)).toBeHidden();
  });

  test("shows deeper levels as a nested list inside the submenu", async ({
    page,
  }) => {
    await page.goto("/");
    await topicsToggle(page).click();
    const alpha = topicsSubmenu(page).getByRole("link", { name: "Alpha" });
    await expect(alpha).toBeVisible();
    await expect(alpha).toHaveAttribute("href", "/tags/alpha/");
    // No toggle button below the second level.
    await expect(topicsSubmenu(page).getByRole("button")).toHaveCount(0);
  });

  test("shows a visible focus indicator on the toggle", async ({ page }) => {
    await page.goto("/");
    await postsToggle(page).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    const outline = await postsToggle(page).evaluate(
      (el) => getComputedStyle(el).outlineStyle,
    );
    expect(outline).toBe("solid");
  });
});

// The submenus are closed here, so the lookups include hidden elements.
test.describe("current page markers", () => {
  test("marks the child page and its parent", async ({ page }) => {
    await page.goto("/posts/hello/");
    await expect(
      nav(page).getByRole("link", { name: "Posts", exact: true }),
    ).toHaveAttribute("aria-current", "true");
    await expect(
      postsSubmenu(page).getByRole("link", {
        name: "Hello World",
        includeHidden: true,
      }),
    ).toHaveAttribute("aria-current", "page");
    await expect(
      postsSubmenu(page).getByRole("link", {
        name: "Second Post",
        includeHidden: true,
      }),
    ).not.toHaveAttribute("aria-current", /.*/);
  });

  test("marks a parent page itself as the current page", async ({ page }) => {
    await page.goto("/posts/");
    await expect(
      nav(page).getByRole("link", { name: "Posts", exact: true }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("marks a parent without a URL on its button", async ({ page }) => {
    await page.goto("/tags/alpha/");
    await expect(topicsToggle(page)).toHaveAttribute("aria-current", "true");
    await expect(
      topicsSubmenu(page).getByRole("link", {
        name: "Alpha",
        includeHidden: true,
      }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("marks a flat entry", async ({ page }) => {
    await page.goto("/about/");
    await expect(
      nav(page).getByRole("link", { name: "About" }),
    ).toHaveAttribute("aria-current", "page");
  });
});

for (const width of [320, 375, 768, 1024, 1280]) {
  for (const path of ["/", "/featured/"]) {
    test(`submenus stay in the viewport and above the header at ${width}px on ${path}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path);
      // Below 60em (960px) the menu is behind the menu button.
      if (width < 960) await menuButton(page).click();
      for (const [toggle, submenu] of [
        [postsToggle(page), postsSubmenu(page)],
        [topicsToggle(page), topicsSubmenu(page)],
      ] as const) {
        await toggle.click();
        await expect(submenu).toBeVisible();
        const box = await submenu.boundingBox();
        expect(box).not.toBeNull();
        if (!box) continue;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        // The submenu is painted above the header text below it.
        const onTop = await submenu.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const hit = document.elementFromPoint(
            r.left + r.width / 2,
            r.bottom - 4,
          );
          return el.contains(hit);
        });
        expect(onTop).toBe(true);
      }
    });
  }
}

test.describe("menu button below the large breakpoint", () => {
  test.use({ viewport: { width: 375, height: 800 } });

  test("collapses the menu behind the button", async ({ page }) => {
    await page.goto("/");
    await expect(menuButton(page)).toBeVisible();
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton(page)).toHaveAttribute(
      "aria-controls",
      "ananke-nav-panel",
    );
    await expect(panel(page)).toBeHidden();
    // The brand link and the search slot stay visible.
    await expect(
      nav(page).getByRole("link", { name: "Ananke Test Fixture" }),
    ).toBeVisible();
    await expect(page.getByRole("searchbox", { name: "Search" })).toBeVisible();
  });

  test("opens and closes the menu", async ({ page }) => {
    await page.goto("/");
    await menuButton(page).click();
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "true");
    await expect(panel(page)).toBeVisible();
    await expect(nav(page).getByRole("link", { name: "About" })).toBeVisible();
    // Submenus open inline inside the panel.
    await topicsToggle(page).click();
    await expect(
      topicsSubmenu(page).getByRole("link", { name: "Categories" }),
    ).toBeVisible();
    await menuButton(page).click();
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
    await expect(panel(page)).toBeHidden();
  });

  test("closes on Escape and returns focus to the button", async ({ page }) => {
    await page.goto("/");
    await menuButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(panel(page)).toBeVisible();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Escape");
    await expect(panel(page)).toBeHidden();
    await expect(menuButton(page)).toBeFocused();
  });

  test("gives touch targets of at least 44px to submenu buttons", async ({
    page,
  }) => {
    await page.goto("/");
    await menuButton(page).click();
    for (const toggle of [postsToggle(page), topicsToggle(page)]) {
      const box = await toggle.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe("menu button on large screens", () => {
  test("is hidden and the menu is visible", async ({ page }) => {
    await page.goto("/");
    await expect(menuButton(page)).toBeHidden();
    await expect(panel(page)).toBeVisible();
  });
});

test.describe("customisation", () => {
  test("uses classes from [params.ananke.navigation.classes]", async ({
    page,
  }) => {
    await page.goto("/");
    // The fixture replaces the classes of the menu button.
    await expect(page.locator(".ananke-nav-toggle")).toHaveClass(
      /\bfixture-menu-button\b/,
    );
    // Other elements keep their default Tachyons classes.
    await expect(page.locator(".ananke-nav-brand")).toHaveClass(/\bf3\b/);
  });

  test("renders the navigation-start hook in the slot", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator(".ananke-nav-slot").getByRole("search"),
    ).toBeVisible();
  });
});

test.describe("without JavaScript (progressive enhancement)", () => {
  test.use({ javaScriptEnabled: false });

  test("shows all child links and no toggle buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".ananke-submenu-toggle")).toHaveCount(2);
    for (const toggle of await page.locator(".ananke-submenu-toggle").all()) {
      await expect(toggle).toBeHidden();
    }
    for (const name of [
      "Hello World",
      "Second Post",
      "Categories",
      "Tags",
      "Alpha",
    ]) {
      await expect(nav(page).getByRole("link", { name })).toBeVisible();
    }
    // The parent without a URL shows its name as text.
    await expect(page.locator(".ananke-submenu-label")).toHaveText("Topics");
    await expect(page.locator(".ananke-submenu-label")).toBeVisible();
  });

  test("keeps the menu and child links reachable at a narrow width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/");
    await expect(page.locator(".ananke-nav-toggle")).toBeHidden();
    await expect(panel(page)).toBeVisible();
    const alpha = nav(page).getByRole("link", { name: "Alpha" });
    await expect(alpha).toBeVisible();
    const box = await alpha.boundingBox();
    expect(box).not.toBeNull();
    if (box) expect(box.x + box.width).toBeLessThanOrEqual(320);
  });
});
