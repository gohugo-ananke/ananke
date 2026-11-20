import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/shortcodes/");
});

test("form-contact renders fields, labels, and the configured action", async ({
  page,
}) => {
  const form = page.locator("main form");
  await expect(form).toHaveAttribute("action", "/contact-submit/");
  await expect(form).toHaveAttribute("method", "POST");
  await expect(form.locator('label[for="name"]')).toHaveText("Your Name");
  await expect(form.locator('label[for="email"]')).toHaveText("Email Address");
  await expect(form.locator('label[for="message"]')).toHaveText("Message");
  await expect(
    form.getByRole("textbox", { name: "Your Name", exact: true }),
  ).toHaveAttribute("required", "");
  await expect(
    form.getByRole("textbox", { name: "Email Address", exact: true }),
  ).toHaveAttribute("type", "email");
  await expect(
    form.getByRole("textbox", { name: "Message", exact: true }),
  ).toBeVisible();
  await expect(
    form.getByRole("textbox", { name: "Email Address", exact: true }),
  ).toHaveAccessibleDescription("An email address is required.");
  await expect(form.getByRole("button", { name: "Send" })).toBeVisible();
});

test("since accepts positional, named, and front matter versions", async ({
  page,
}) => {
  for (const version of ["2.18.0", "2.19.0", "2.17.0"]) {
    await expect(
      page.locator("main span").filter({ hasText: `since ${version}` }),
    ).toBeVisible();
  }
});

test("page-index links to regular pages", async ({ page }) => {
  await page
    .locator("main")
    .getByRole("link", { name: "Hello World", exact: true })
    .click();
  await expect(page).toHaveURL(/\/posts\/hello\/$/);
});

test("edit-page resolves configured, positional, and named branches", async ({
  page,
}) => {
  const links = page
    .locator("main")
    .getByRole("link", { name: "Improve this page on GitHub" });
  await expect(links).toHaveCount(3);
  for (const [index, branch] of [
    "main",
    "development",
    "test-branch",
  ].entries()) {
    await expect(links.nth(index)).toHaveAttribute(
      "href",
      `https://github.com/gohugo-ananke/ananke/edit/${branch}/content/shortcodes.md`,
    );
    await expect(links.nth(index)).toHaveAttribute("rel", "noopener");
  }
});

test("form fields work with keyboard labels and native validation", async ({
  page,
}) => {
  const form = page.locator("main form");
  const name = form.getByRole("textbox", { name: "Your Name", exact: true });
  const email = form.getByRole("textbox", {
    name: "Email Address",
    exact: true,
  });
  const message = form.getByRole("textbox", { name: "Message", exact: true });
  await form.locator('label[for="name"]').click();
  await expect(name).toBeFocused();
  await name.fill("Test visitor");
  await page.keyboard.press("Tab");
  await expect(email).toBeFocused();
  await email.fill("invalid");
  expect(
    await email.evaluate(
      (element: HTMLInputElement) => element.validity.typeMismatch,
    ),
  ).toBe(true);
  await email.fill("visitor@example.com");
  await page.keyboard.press("Tab");
  await expect(message).toBeFocused();
  await message.fill("Fixture message");
  await page.keyboard.press("Tab");
  await expect(form.getByRole("button", { name: "Send" })).toBeFocused();
});
