import { expect, test } from "@playwright/test";

test.use({ javaScriptEnabled: false });

for (const width of [375, 1280]) {
  test(`navigation and code selection work without JavaScript at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await page
      .locator("header nav")
      .getByRole("link", { name: "Hello World", exact: true })
      .click();
    await expect(page).toHaveURL(/\/posts\/hello\/$/);
    await expect(page.locator(".code-copy")).toBeHidden();
    await page.locator("pre code").selectText();
    expect(
      await page.evaluate(() => window.getSelection()?.toString()),
    ).toContain("copy_code = true");
    await page
      .locator("header nav")
      .getByRole("link", { name: "Tags", exact: true })
      .click();
    await expect(page).toHaveURL(/\/tags\/$/);
    await page.locator("main").getByRole("link", { name: /alpha/i }).click();
    await expect(page).toHaveURL(/\/tags\/alpha\/$/);
  });
}

test("contact form keeps its accessible fields without JavaScript", async ({
  page,
}) => {
  await page.goto("/shortcodes/");
  const form = page.locator("main form");
  await form
    .getByRole("textbox", { name: "Your Name", exact: true })
    .fill("Test visitor");
  const email = form.getByRole("textbox", {
    name: "Email Address",
    exact: true,
  });
  await email.fill("visitor@example.com");
  await expect(email).toHaveAccessibleDescription(
    "An email address is required.",
  );
  await form
    .getByRole("textbox", { name: "Message", exact: true })
    .fill("Fixture message");
  await expect(form.getByRole("button", { name: "Send" })).toBeVisible();
});
