import { execSync } from "node:child_process";
import { createReleaseConfig } from "@dnbhq/release-config";
import type { Config } from "release-it";

function getCurrentBranch(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error: unknown) {
    console.error("Failed to determine the current Git branch.");
    console.error(error);
    process.exit(1);
  }
}

function isPreReleaseRun(argv: string[]): boolean {
  return argv.some((argument) => {
    return (
      argument === "--preRelease" ||
      argument.startsWith("--preRelease=") ||
      argument === "--preReleaseId" ||
      argument.startsWith("--preReleaseId=")
    );
  });
}

const currentBranch = getCurrentBranch();
const preReleaseRun = isPreReleaseRun(process.argv);

if (preReleaseRun && currentBranch !== "development") {
  console.error(
    `Pre-releases are only allowed on "development". Current branch: "${currentBranch}".`,
  );
  process.exit(1);
}

if (!preReleaseRun && currentBranch !== "main") {
  console.error(
    `Stable releases are only allowed on "main". Current branch: "${currentBranch}".`,
  );
  process.exit(1);
}

const config: Config = createReleaseConfig({
  githubTokenRef: "GITHUB_ANANKE_TOKEN_ADMIN_PRIVATE",
  scopes: {
    minorTypes: ["feat"],
    patchTypes: [
      "fix",
      "build",
      "chore",
      "ci",
      "docs",
      "perf",
      "refactor",
      "revert",
      "style",
      "test",
      "ai",
    ],
  },
  overrides: {
    git: {
      requireCleanWorkingDir: true,
      requireBranch: currentBranch,
      commit: true,
      // biome-ignore lint/suspicious/noTemplateCurlyInString: release-it expands this placeholder.
      commitMessage: "chore(release): v${version}",
      commitArgs: ["--no-verify"],
      tag: true,
      // biome-ignore lint/suspicious/noTemplateCurlyInString: release-it expands this placeholder.
      tagName: "v${version}",
      push: true,
      pushArgs: ["--follow-tags"],
    },
    github: {
      release: true,
      // biome-ignore lint/suspicious/noTemplateCurlyInString: release-it expands this placeholder.
      releaseName: "Release v${version}",
      skipChecks: true,
      tokenRef: "GITHUB_ANANKE_TOKEN_ADMIN_PRIVATE",
      comments: {
        submit: true,
      },
      discussionCategoryName: "1-release-notes",
    },
  },
});

export default config;
