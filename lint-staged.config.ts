import { createLintStagedConfig } from "@dnbhq/lintstaged-config";
import type { Configuration } from "lint-staged";

const config: Configuration = createLintStagedConfig({
  secrets: { enabled: false },
  markdown: {
    configPath:
      "./node_modules/@dnbhq/markdownlint-config/.markdownlint-cli2.jsonc",
  },
  yaml: {
    enabled: true,
    configPath: ".yamllint.yml",
  },
  overrides: {
    ".github/workflows/**/*.y(a?)ml": ["zizmor --no-exit-codes"],
    "package-lock.json": [
      "lockfile-lint --path package-lock.json --validate-https --allowed-hosts npm",
    ],
  },
});

export default config;
