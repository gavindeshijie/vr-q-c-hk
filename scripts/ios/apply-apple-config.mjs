import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const teamId = process.env.APPLE_TEAM_ID;
const appStoreId = process.env.APP_STORE_ID;

if (!teamId) fail("缺少 APPLE_TEAM_ID。");

replaceInFile("ios/VRQCScanner/project.yml", /DEVELOPMENT_TEAM: TEAMID/g, `DEVELOPMENT_TEAM: ${teamId}`);
replaceInFile("apps/web/public/.well-known/apple-app-site-association", /TEAMID/g, teamId);
replaceInFile("docs/DEPLOY_3D_SCAN.md", /TEAMID/g, teamId);

if (appStoreId) {
  replaceInFile("apps/web/index.html", /app-id=YOUR_APP_STORE_ID/g, `app-id=${appStoreId}`);
  replaceInFile("docs/DEPLOY_3D_SCAN.md", /YOUR_APP_STORE_ID/g, appStoreId);
} else {
  console.warn("未设置 APP_STORE_ID，Smart App Banner 保留 YOUR_APP_STORE_ID 占位。");
}

console.log("Apple config applied. Run npm run build and regenerate iOS project after reviewing the diff.");

function replaceInFile(relativePath, pattern, replacement) {
  const file = path.join(repoRoot, relativePath);
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace(pattern, replacement);
  fs.writeFileSync(file, after);
  console.log(`Updated ${relativePath}`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
