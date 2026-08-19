// Copies the static swagger-ui-dist assets we need into public/swagger-ui/
// so the /api-docs page can serve them without any CDN dependency.
// Runs automatically on `npm install` via the postinstall script.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = join(__dirname, "..", "node_modules", "swagger-ui-dist");
const destDir = join(__dirname, "..", "public", "swagger-ui");

const files = [
  "swagger-ui-bundle.js",
  "swagger-ui-standalone-preset.js",
  "swagger-ui.css",
  "favicon-16x16.png",
  "favicon-32x32.png",
];

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

for (const file of files) {
  const src = join(srcDir, file);
  if (!existsSync(src)) {
    console.warn(`[copy-swagger-ui] missing ${file}, skipping`);
    continue;
  }
  copyFileSync(src, join(destDir, file));
}

console.log("[copy-swagger-ui] copied swagger-ui-dist assets to public/swagger-ui/");
