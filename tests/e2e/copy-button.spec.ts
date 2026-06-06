import { expect, test } from "@playwright/test";

const POST = "/posts/hello/";

test.describe("copy-to-clipboard code button (#986)", () => {
	test("wraps fenced code blocks but not inline code", async ({ page }) => {
		await page.goto(POST);
		// Exactly one fenced block on this page → one .code-block wrapper.
		await expect(page.locator(".code-block")).toHaveCount(1);
		// Inline `code` lives outside a .code-block wrapper.
		await expect(page.locator(".code-block code")).toHaveCount(1);
	});

	test("reveals the button when JavaScript runs", async ({ page }) => {
		await page.goto(POST);
		const button = page.locator(".code-block .code-copy");
		await expect(button).toBeVisible();
		await expect(button).toHaveAttribute("aria-label", /copy/i);
	});

	test("copies the code and shows feedback", async ({ page, context }) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await page.goto(POST);

		const button = page.locator(".code-block .code-copy");
		await button.click();

		// Feedback state.
		await expect(button).toHaveClass(/is-copied/);
		await expect(button.locator(".code-copy-label")).toHaveText("Copied");

		// The clipboard actually holds the code (localhost is a secure context).
		const clipboard = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboard).toContain("copy_code = true");
	});
});

test.describe("without JavaScript (progressive enhancement)", () => {
	test.use({ javaScriptEnabled: false });

	test("shows no copy button but keeps the code", async ({ page }) => {
		await page.goto(POST);
		// The button is rendered with the `hidden` attribute and never revealed,
		// so it is not visible to the user.
		await expect(page.locator(".code-block .code-copy")).toBeHidden();
		// The code itself is still present and selectable.
		await expect(page.locator(".code-block pre")).toContainText(
			"copy_code = true",
		);
	});
});
