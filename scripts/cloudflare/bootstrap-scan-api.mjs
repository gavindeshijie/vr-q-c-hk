import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const apiDir = path.join(repoRoot, "apps/api");
const wranglerToml = path.join(apiDir, "wrangler.toml");
const schemaFile = path.join(apiDir, "schema.sql");

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_API_TOKEN;
const apiHost = process.env.VRQC_API_HOST ?? "api.vr.q-c.hk";
const d1Name = process.env.VRQC_D1_NAME ?? "vrqc-scans";
const r2Bucket = process.env.VRQC_R2_BUCKET ?? "vrqc-scans";
const r2PublicBaseUrl = process.env.R2_PUBLIC_BASE_URL ?? "https://assets.vr.q-c.hk";

if (!accountId) fail("缺少 CLOUDFLARE_ACCOUNT_ID。");
if (!apiToken) fail("缺少 CLOUDFLARE_API_TOKEN。");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function run(command, args, options = {}) {
  console.log(`$ ${command} ${args.join(" ")}`);
  return execFileSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: {
      ...process.env,
      CLOUDFLARE_ACCOUNT_ID: accountId,
      CLOUDFLARE_API_TOKEN: apiToken
    },
    encoding: "utf8"
  });
}

function tryRun(command, args, options = {}) {
  try {
    return run(command, args, options);
  } catch (error) {
    if (options.allowFailure) return String(error.stdout ?? error.stderr ?? "");
    throw error;
  }
}

console.log("Creating Cloudflare R2 bucket if needed...");
tryRun("npx", ["wrangler", "r2", "bucket", "create", r2Bucket], { allowFailure: true });

console.log("Creating Cloudflare D1 database if needed...");
const d1Output = tryRun("npx", ["wrangler", "d1", "create", d1Name], { capture: true, allowFailure: true });
const databaseId = findDatabaseId(d1Output) ?? process.env.CLOUDFLARE_D1_DATABASE_ID;

if (!databaseId) {
  console.warn("没有从 wrangler 输出中读取到 database_id。如果数据库已存在，请设置 CLOUDFLARE_D1_DATABASE_ID 后重跑。");
} else {
  updateWranglerToml(databaseId);
  console.log("Applying D1 schema...");
  run("npx", ["wrangler", "d1", "execute", d1Name, "--remote", "--file", schemaFile], { cwd: apiDir });
}

console.log("Deploying Worker...");
run("npx", ["wrangler", "deploy"], { cwd: apiDir });

console.log("");
console.log("Cloudflare API bootstrap complete.");
console.log(`API host target: https://${apiHost}`);
console.log("If custom domain/route was not created automatically, add a Worker Custom Domain in Cloudflare:");
console.log(`  ${apiHost} -> vr-q-c-hk-scan-api`);
console.log("Then set GitHub Actions VITE_API_BASE_URL=https://api.vr.q-c.hk");

function findDatabaseId(output) {
  const match = output.match(/database_id\s*=\s*"([^"]+)"/) ?? output.match(/Created D1 database .*? ([0-9a-f-]{20,})/i);
  return match?.[1];
}

function updateWranglerToml(databaseId) {
  const next = `name = "vr-q-c-hk-scan-api"
main = "src/index.ts"
compatibility_date = "2026-07-04"

[vars]
PUBLIC_SITE_URL = "https://vr.q-c.hk"
STORAGE_PROVIDER = "r2"
R2_PUBLIC_BASE_URL = "${r2PublicBaseUrl}"
MAX_USDZ_MB = "500"
MAX_IMAGES_ZIP_MB = "1024"

[[d1_databases]]
binding = "DB"
database_name = "${d1Name}"
database_id = "${databaseId}"

[[r2_buckets]]
binding = "SCANS_BUCKET"
bucket_name = "${r2Bucket}"
`;
  fs.writeFileSync(wranglerToml, next);
  console.log(`Updated ${path.relative(repoRoot, wranglerToml)}`);
}
