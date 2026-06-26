/**
 * Vite plugin that serves HTML files from the runs/ directory at /renders/.
 *
 * In dev mode, requests to /renders/<run>/<case>/<cell>/0.html are resolved
 * to the actual file in ../../runs/ (relative to the app/ directory).
 *
 * This eliminates the copy-samples.ts step entirely — the viewer serves
 * generated HTML directly from its canonical location.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";

export function serveRuns(): Plugin {
  const runsDir = resolve(process.cwd(), "..", "runs");

  return {
    name: "design-bench-serve-runs",

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/renders/")) return next();

        const relPath = decodeURIComponent(req.url.slice("/renders/".length));
        const filePath = join(runsDir, relPath);

        if (existsSync(filePath)) {
          const content = readFileSync(filePath, "utf8");
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
          // Allow the iframe to load without CORS issues
          res.setHeader("X-Frame-Options", "SAMEORIGIN");
          res.statusCode = 200;
          res.end(content);
        } else {
          res.statusCode = 404;
          res.end(`Not found: ${relPath}`);
        }
      });
    },
  };
}
