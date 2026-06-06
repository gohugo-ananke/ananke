import AxeBuilder from "@axe-core/playwright";
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
	"taxonomy terms": "/tags/",
	"taxonomy term": "/tags/alpha/",
	"404": "/404.html",
};

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Page types with a known, tracked WCAG AA contrast failure (Tachyons `gray`
 * #777 on summary cards and single-page bylines). Marked as expected failures
 * so the suite is green while the bug is open; when #1015 is fixed these will
 * start passing and Playwright will flag the stale annotation for removal.
 */
const KNOWN_FAILURES = new Set([
	"section list",
	"single page",
	"taxonomy terms",
	"taxonomy term",
]);

for (const [name, path] of Object.entries(PAGES)) {
	test(`${name} has no automatically detectable a11y violations`, async ({
		page,
	}) => {
		if (KNOWN_FAILURES.has(name)) {
			test.fail(true, "Known WCAG AA contrast issue, tracked in #1015");
		}
		await page.goto(path);
		const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
		expect(results.violations).toEqual([]);
	});
}
