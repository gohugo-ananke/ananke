import { defineConfig } from "@playwright/test";
import config from "./playwright.config.ts";

export default defineConfig(config, {
  testIgnore: [],
  testMatch: "**/visual.spec.ts",
  snapshotPathTemplate:
    "{testDir}/../visual-baselines/{projectName}/{arg}{ext}",
  updateSnapshots: "none",
  use: { timezoneId: "UTC", locale: "en-GB", reducedMotion: "reduce" },
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 0,
    },
  },
});
