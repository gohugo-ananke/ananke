import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env["ANANKE_TEST_PORT"] || 4321);
const baseURL = `http://localhost:${PORT}`;
const isCI = !!process.env["CI"];

/**
 * Playwright configuration for the Ananke theme.
 *
 * The `webServer` builds the test fixture site against the local theme working
 * tree and serves it statically, so the suite always runs against the current
 * branch. See tests/support/dev-server.mjs.
 */
export default defineConfig({
	testDir: "./tests/e2e",
	outputDir: "./tests/.playwright/results",
	fullyParallel: true,
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	reporter: isCI ? [["github"], ["list"]] : "list",
	use: {
		baseURL,
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "node tests/support/dev-server.mjs",
		url: baseURL,
		reuseExistingServer: !isCI,
		timeout: 120_000,
	},
});
