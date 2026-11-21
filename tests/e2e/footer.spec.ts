import { expect, test } from "@playwright/test";

for (const width of [375, 1280]) {
  test(`footer shows the copyright at ${width}px (#449)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const copyright = footer.getByRole("link", { name: /©/ });
    await expect(copyright).toBeVisible();
    const footerBox = await footer.boundingBox();
    const linkBox = await copyright.boundingBox();
    expect(linkBox).not.toBeNull();
    expect(footerBox).not.toBeNull();
    if (linkBox && footerBox) {
      expect(linkBox.x + linkBox.width).toBeLessThanOrEqual(
        footerBox.x + footerBox.width,
      );
    }
  });
}
