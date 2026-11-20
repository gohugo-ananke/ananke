import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { get } from "node:http";
import { test } from "node:test";
import { gunzipSync } from "node:zlib";
import { load } from "cheerio";

function request(url, encoding) {
  return new Promise((resolve, reject) => {
    get(url, { headers: { "Accept-Encoding": encoding } }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () =>
        resolve({
          status: response.statusCode,
          headers: response.headers,
          body: Buffer.concat(chunks),
        }),
      );
      response.on("error", reject);
    }).on("error", reject);
  });
}

test("fixture hosting negotiates gzip without changing content", {
  timeout: 15_000,
}, async (t) => {
  const server = spawn(process.execPath, ["tests/support/dev-server.mjs"], {
    env: { ...process.env, ANANKE_TEST_PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(async () => {
    server.kill();
    await once(server, "exit");
  });
  const origin = await new Promise((resolve, reject) => {
    let log = "";
    server.on("error", reject);
    server.stdout.on("data", (chunk) => {
      log += chunk;
      const match = log.match(
        /Fixture site served at (http:\/\/localhost:\d+\/)/,
      );
      if (match) resolve(match[1]);
    });
    server.once("exit", (code) =>
      reject(new Error(`Fixture server exited ${code}: ${log}`)),
    );
  });
  const html = await request(origin, "identity");
  assert.equal(html.status, 200);
  const $ = load(html.body.toString());
  const stylesheet = new URL(
    $('link[rel="stylesheet"]').first().attr("href"),
    origin,
  );
  const plain = await request(stylesheet, "identity");
  const gzip = await request(stylesheet, "br, gzip");
  assert.equal(gzip.headers["content-encoding"], "gzip");
  assert.equal(gzip.headers.vary, "Accept-Encoding");
  assert.deepEqual(gunzipSync(gzip.body), plain.body);
  assert.ok(gzip.body.length < plain.body.length);
  const excluded = await request(stylesheet, "gzip;q=0, identity");
  assert.equal(excluded.headers["content-encoding"], undefined);
  assert.deepEqual(excluded.body, plain.body);
});
