import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(currentDir, "../dist");
const routes = [
  "authorize",
  "scan",
  "scan/start",
  "scan/app/start",
  "scan/history",
  "scan/camera",
  "scan/result"
];

copyFileSync(path.join(distDir, "index.html"), path.join(distDir, "404.html"));

for (const route of routes) {
  const routeDir = path.join(distDir, route);
  mkdirSync(routeDir, { recursive: true });
  copyFileSync(path.join(distDir, "index.html"), path.join(routeDir, "index.html"));
}
