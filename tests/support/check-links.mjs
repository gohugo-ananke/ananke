import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(process.argv[2] || "tests/fixtures/site/public");
const port = process.env.ANANKE_TEST_PORT || 4321;
const result = spawnSync(
  "lychee",
  [
    "--config",
    "tests/lychee.toml",
    "--offline",
    "--root-dir",
    root,
    "--remap",
    `^http://localhost:${port}/(.*) ${pathToFileURL(root).href}/$1`,
    `${root}/**/*.html`,
  ],
  { stdio: "inherit" },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
