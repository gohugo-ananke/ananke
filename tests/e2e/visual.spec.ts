import { expect, test } from "@playwright/test";
import { pageTypes } from "../support/pages.ts";

for (const [name, path] of Object.entries(pageTypes)) {
  for (const width of [375, 1280]) {
    test(`${name} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.clock.setFixedTime(new Date("2026-01-10T12:00:00Z"));
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${name}-${width}.png`, {
        fullPage: true,
      });
    });
  }
}
