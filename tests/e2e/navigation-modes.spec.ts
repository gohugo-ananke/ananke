import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const HOVER = "/navigation-modes/hover/";
const CLICK = "/navigation-modes/click/";

test("resolves site, cascade, and page modes, and rejects invalid values", async ({
  page,
}) => {
  for (const [path, mode] of [
    ["/", "split"],
    [CLICK, "click"],
    [HOVER, "hover"],
    ["/navigation-modes/toplevel/", "toplevel"],
    ["/navigation-modes/invalid/", "split"],
  ] as const) {
    await page.goto(path);
    await expect(page.locator("nav")).toHaveAttribute(
      "data-submenu-mode",
      mode,
    );
  }
});

test("resolves each navigation class through page, cascade, and site settings", async ({
  page,
}) => {
  for (const [path, marker] of [
    ["/", "fixture-site-link"],
    [CLICK, "fixture-cascade-link"],
    [HOVER, "fixture-page-link"],
  ] as const) {
    await page.goto(path);
    await expect(page.locator("header .ananke-nav-link").first()).toHaveClass(
      new RegExp(`\\b${marker}\\b`),
    );
    // A page override of one class must retain independently configured site classes.
    await expect(page.locator(".ananke-nav-toggle")).toHaveClass(
      /\bfixture-menu-button\b/,
    );
  }
});

test.describe("hover navigation", () => {
  test("opens on hover, crosses the gap, closes on leaving, and follows the parent link", async ({
    page,
  }) => {
    await page.goto(HOVER);
    const parent = page
      .locator("nav")
      .getByRole("link", { name: "Posts", exact: true });
    const submenu = page.locator("#ananke-submenu-0");
    await parent.hover();
    await expect(submenu).toBeVisible();
    const box = await submenu.boundingBox();
    if (!box) throw new Error("Submenu has no bounds");
    // Pause in the visual gap before entering the dropdown.
    await page.mouse.move(box.x + 10, box.y - 3);
    await page.waitForTimeout(300);
    await expect(submenu).toBeVisible();
    await submenu.getByRole("link").first().hover();
    await expect(submenu).toBeVisible();
    await page.mouse.move(1, 1);
    await expect(submenu).toBeHidden();
    await parent.click();
    await expect(page).toHaveURL(/\/posts\/$/);
  });

  test("keeps only one dropdown open and respects Escape while the pointer stays", async ({
    page,
  }) => {
    await page.goto(HOVER);
    await page
      .locator("nav")
      .getByRole("link", { name: "Posts", exact: true })
      .hover();
    await page
      .locator("nav")
      .getByRole("button", { name: "Topics", exact: true })
      .hover();
    await expect(page.locator("#ananke-submenu-0")).toBeHidden();
    await expect(page.locator("#ananke-submenu-1")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#ananke-submenu-1")).toBeHidden();
    await page.mouse.move(1, 1);
    await page
      .locator("nav")
      .getByRole("button", { name: "Topics", exact: true })
      .hover();
    await expect(page.locator("#ananke-submenu-1")).toBeVisible();
  });

  test("supports keyboard toggling and preserves keyboard focus when the pointer leaves", async ({
    page,
  }) => {
    await page.goto(HOVER);
    const button = page.getByRole("button", { name: "Posts submenu" });
    await button.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await expect(page.locator("#ananke-submenu-0 a").first()).toBeFocused();
    await button.hover();
    await page.mouse.move(1, 1);
    await page.waitForTimeout(300);
    await expect(page.locator("#ananke-submenu-0")).toBeVisible();
    await page.getByRole("button", { name: "Topics", exact: true }).hover();
    await expect(page.locator("#ananke-submenu-0")).toBeVisible();
    await expect(page.locator("#ananke-submenu-1")).toBeHidden();
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
    await expect(page.locator("#ananke-submenu-0")).toBeHidden();
  });
});

test.describe("click navigation", () => {
  test("turns the parent into one button and puts its overview first", async ({
    page,
  }) => {
    await page.goto(CLICK);
    const button = page
      .locator("nav")
      .getByRole("button", { name: "Posts", exact: true });
    await expect(page.locator("[data-submenu-parent]")).toBeHidden();
    await button.hover();
    await expect(page.locator("#ananke-submenu-0")).toBeHidden();
    await button.click();
    await expect(page).toHaveURL(new RegExp(CLICK));
    const first = page.locator("#ananke-submenu-0 a").first();
    await expect(first).toHaveText("Overview");
    await expect(first).toHaveAttribute("href", "/posts/");
    await first.click();
    await expect(page).toHaveURL(/\/posts\/$/);
  });

  test("supports Enter, Space, Escape, and parents without a page", async ({
    page,
  }) => {
    await page.goto(CLICK);
    const button = page
      .locator("nav")
      .getByRole("button", { name: "Posts", exact: true });
    await button.focus();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await expect(page.locator("#ananke-submenu-0 a").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.locator("#ananke-submenu-0")).toBeVisible();
    await page
      .locator("nav")
      .getByRole("button", { name: "Topics", exact: true })
      .click();
    await expect(page.locator("#ananke-submenu-0")).toBeHidden();
    await expect(
      page.locator("#ananke-submenu-1 .ananke-submenu-overview"),
    ).toHaveCount(0);
  });
});

for (const [path, name] of [
  [HOVER, "Posts submenu"],
  [CLICK, "Posts"],
] as const) {
  test(`has no detected accessibility violations with ${name} open`, async ({
    page,
  }) => {
    await page.goto(path);
    await page
      .locator("nav")
      .getByRole("button", { name, exact: true })
      .click();
    const results = await new AxeBuilder({ page })
      .include("nav")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test(`shows expanded child lists after one tap on ${path}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL: baseURL ?? "http://localhost:4321",
      hasTouch: true,
      isMobile: true,
      viewport: { width: 375, height: 800 },
    });
    const page = await context.newPage();
    await page.goto(path);
    await page.locator(".ananke-nav-toggle").tap();
    await expect(page.locator("#ananke-submenu-0")).toBeVisible();
    await expect(page.locator("#ananke-submenu-1")).toBeVisible();
    await expect(page.locator(".ananke-submenu-toggle:visible")).toHaveCount(0);
    await page
      .locator("nav")
      .getByRole("link", { name: "Posts", exact: true })
      .tap();
    await expect(page).toHaveURL(/\/posts\/$/);
    await context.close();
  });

  test(`keeps parents and children reachable without JavaScript on ${path}`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL: baseURL ?? "http://localhost:4321",
    });
    const page = await context.newPage();
    await page.goto(path);
    await expect(
      page.locator("nav").getByRole("link", { name: "Posts", exact: true }),
    ).toBeVisible();
    await expect(page.locator("#ananke-submenu-0 a").last()).toBeVisible();
    await expect(page.locator("nav button:visible")).toHaveCount(0);
    await context.close();
  });
}

test.describe("local menu modes", () => {
  const path = "/navigation-modes/local/";

  test("overrides the page per call and defaults to the page when omitted", async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator("header .ananke-nav-menu")).toHaveAttribute(
      "data-submenu-mode",
      "hover",
    );
    for (const mode of ["split", "hover", "click", "toplevel"]) {
      await expect(page.locator(`#fixture-${mode}`)).toHaveAttribute(
        "data-submenu-mode",
        mode,
      );
    }
    await expect(
      page
        .getByRole("navigation", { name: "Inherited mode", exact: true })
        .locator("ul")
        .first(),
    ).toHaveAttribute("data-submenu-mode", "hover");
    await expect(
      page
        .getByRole("navigation", { name: "Invalid local mode", exact: true })
        .locator("ul")
        .first(),
    ).toHaveAttribute("data-submenu-mode", "split");
  });

  test("uses each instance's mode and unique control targets", async ({
    page,
  }) => {
    await page.goto(path);
    const split = page.locator("#fixture-split");
    const hover = page.locator("#fixture-hover");
    const click = page.locator("#fixture-click");
    await split.getByRole("link", { name: "Posts", exact: true }).hover();
    await expect(split.locator(".ananke-submenu").first()).toBeHidden();
    await hover.getByRole("link", { name: "Posts", exact: true }).hover();
    await expect(hover.locator(".ananke-submenu").first()).toBeVisible();
    await click.getByRole("button", { name: "Posts", exact: true }).hover();
    await expect(click.locator(".ananke-submenu").first()).toBeHidden();
    await click.getByRole("button", { name: "Posts", exact: true }).click();
    await expect(click.locator(".ananke-submenu").first()).toBeVisible();
    await expect(hover.locator(".ananke-submenu").first()).toBeHidden();
    await expect(click.locator(".ananke-submenu a").first()).toHaveText(
      "Overview",
    );
    const ids = await page
      .locator("[id]")
      .evaluateAll((els) => els.map((el) => el.id));
    expect(new Set(ids).size).toBe(ids.length);
    const controls = await page
      .locator(".ananke-submenu-toggle")
      .evaluateAll((els) =>
        els.map((el) => {
          const target = document.getElementById(
            el.getAttribute("aria-controls") || "",
          );
          return !!target && target.parentElement === el.parentElement;
        }),
      );
    expect(controls.every(Boolean)).toBe(true);
  });

  test("renders only the top level, including plain labels without a target", async ({
    page,
  }) => {
    await page.goto(path);
    const menu = page.locator("#fixture-toplevel");
    await expect(menu.locator(":scope > li")).toHaveCount(3);
    await expect(menu.locator("ul, button")).toHaveCount(0);
    await expect(
      menu.getByRole("link", { name: "Posts", exact: true }),
    ).toHaveAttribute("href", "/posts/");
    await expect(menu.getByText("Topics", { exact: true })).toBeVisible();
    await expect(
      menu.getByRole("link", { name: "Topics", exact: true }),
    ).toHaveCount(0);
    await expect(menu.getByText("Hello World", { exact: true })).toHaveCount(0);
  });

  test("retains the same top-level-only output without JavaScript", async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL: baseURL ?? "http://localhost:4321",
    });
    const page = await context.newPage();
    await page.goto(path);
    const menu = page.locator("#fixture-toplevel");
    await expect(menu.locator(":scope > li")).toHaveCount(3);
    await expect(menu.locator("ul, button")).toHaveCount(0);
    await expect(
      menu.getByRole("link", { name: "Posts", exact: true }),
    ).toBeVisible();
    await expect(
      page
        .locator("#fixture-click")
        .getByRole("link", { name: "Posts", exact: true }),
    ).toBeVisible();
    await expect(
      page.locator("#fixture-click .ananke-submenu").first(),
    ).toBeVisible();
    await context.close();
  });

  test("has no detected accessibility violations with mixed modes", async ({
    page,
  }) => {
    await page.goto(path);
    await page
      .locator("#fixture-click")
      .getByRole("button", { name: "Posts", exact: true })
      .click();
    const results = await new AxeBuilder({ page })
      .include("nav")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("mobile navigation uses one hamburger in every mode", () => {
  for (const [mode, path] of [
    ["split", "/"],
    ["hover", HOVER],
    ["click", CLICK],
    ["toplevel", "/navigation-modes/toplevel/"],
  ] as const) {
    for (const width of [375, 959]) {
      test(`${mode} shows an expanded, indented list at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const nav = page.locator("header nav");
        const hamburger = nav.locator(".ananke-nav-toggle");
        const panel = nav.locator(".ananke-nav-panel");
        await expect(hamburger).toBeVisible();
        await expect(panel).toBeHidden();
        await hamburger.click();
        await expect(panel).toBeVisible();
        await expect(panel.getByRole("button")).toHaveCount(0);
        const parent = panel.getByRole("link", { name: "Posts", exact: true });
        await expect(parent).toBeVisible();
        await expect(
          panel.locator("span").getByText("Topics", { exact: true }),
        ).toBeVisible();
        if (mode === "toplevel") {
          await expect(panel.locator("ul ul")).toHaveCount(0);
        } else {
          const child = panel.getByRole("link", {
            name: "Hello World",
            exact: true,
          });
          const tags = panel.getByRole("link", { name: "Tags", exact: true });
          const alpha = panel.getByRole("link", { name: "Alpha", exact: true });
          await expect(child).toBeVisible();
          await expect(alpha).toBeVisible();
          expect((await child.boundingBox())?.x).toBeGreaterThan(
            (await parent.boundingBox())?.x ?? 0,
          );
          expect((await alpha.boundingBox())?.x).toBeGreaterThan(
            (await tags.boundingBox())?.x ?? 0,
          );
          await parent.hover();
          await page.mouse.move(1, 1);
          await expect(child).toBeVisible();
          await expect(alpha).toBeVisible();
          await alpha.focus();
          await page.keyboard.press("Escape");
          await expect(panel).toBeHidden();
          await expect(hamburger).toBeFocused();
          await hamburger.click();
          await expect(child).toBeVisible();
        }
        await parent.click();
        await expect(page).toHaveURL(/\/posts\/$/);
      });
    }
  }

  for (const [path, label] of [
    ["/", "Posts submenu"],
    [HOVER, "Posts submenu"],
    [CLICK, "Posts"],
  ] as const) {
    test(`resets submenu state and keeps focus visible when resizing ${path}`, async ({
      page,
    }) => {
      await page.goto(path);
      const nav = page.locator("header nav");
      const button = nav.getByRole("button", { name: label, exact: true });
      const submenu = nav.locator(".ananke-submenu").first();
      await button.focus();
      await page.keyboard.press("Enter");
      await submenu.getByRole("link").last().focus();
      await page.setViewportSize({ width: 375, height: 900 });
      const hamburger = nav.locator(".ananke-nav-toggle");
      await expect(hamburger).toBeFocused();
      await hamburger.click();
      await expect(submenu).toBeVisible();
      await expect(nav.locator(".ananke-submenu-toggle:visible")).toHaveCount(
        0,
      );
      await submenu.getByRole("link").last().focus();
      await page.setViewportSize({ width: 1280, height: 900 });
      await expect(submenu).toBeHidden();
      await expect(button).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(submenu).toBeVisible();
    });
  }
});
