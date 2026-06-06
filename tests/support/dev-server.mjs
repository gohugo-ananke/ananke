#!/usr/bin/env node
/**
 * Build the fixture site, then serve it as a static site for Playwright.
 *
 * Used as the Playwright `webServer.command`: it builds first (so tests always
 * run against the current theme), then serves `tests/fixtures/site/public`
 * until the process is killed.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { buildFixtureSite } from "./prepare-site.mjs";

const PORT = Number(process.env.ANANKE_TEST_PORT || 4321);

const TYPES = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".xml": "application/xml; charset=utf-8",
	".txt": "text/plain; charset=utf-8",
	".woff2": "font/woff2",
};

const root = buildFixtureSite();

function resolvePath(urlPath) {
	const clean = normalize(decodeURIComponent(urlPath.split("?")[0])).replace(
		/^(\.\.[/\\])+/,
		"",
	);
	let filePath = join(root, clean);
	if (existsSync(filePath) && statSync(filePath).isDirectory()) {
		filePath = join(filePath, "index.html");
	}
	return filePath;
}

const server = createServer((req, res) => {
	let filePath = resolvePath(req.url || "/");
	if (!existsSync(filePath)) {
		// Serve Hugo's generated 404 page so /404.html and unknown routes work.
		filePath = join(root, "404.html");
		if (!existsSync(filePath)) {
			res.statusCode = 404;
			res.end("Not found");
			return;
		}
		res.statusCode = req.url === "/404.html" ? 200 : 404;
	}
	res.setHeader(
		"Content-Type",
		TYPES[extname(filePath)] || "application/octet-stream",
	);
	createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
	console.log(`Fixture site served at http://localhost:${PORT}/`);
});
