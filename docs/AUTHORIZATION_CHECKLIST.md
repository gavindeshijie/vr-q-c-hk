# VR.q-c.hk 授权清单

本文用于把 `https://vr.q-c.hk` 的三维扫描功能从“网页已上线”推进到“iPhone 真机扫描、上传、结果页展示”。

## 先确认一句

这里的 API 指 **Cloudflare Worker API**。如果你说的是 Microsoft SharePoint API，需要另开一套授权。

## A. 你需要授权给我的 Cloudflare 内容

推荐目标：

- Web：继续使用 `https://vr.q-c.hk`
- API：使用 `https://vr-q-c-hk-scan-api.vr-q-c-hk-gavin.workers.dev`
- 模型文件：当前不使用 R2，避免绑定银行卡。第一版先跑通 scan session 和 D1 记录。
- 数据库：Cloudflare D1 database `vrqc-scans`

需要你提供或授权：

- Cloudflare 账号登录授权，或 API Token
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_ZONE_ID`，如果需要我自动绑定 `api.vr.q-c.hk`
- 域名 `q-c.hk` 在 Cloudflare 中的管理权限

API Token 最小权限建议：

- Account / Workers Scripts / Edit
- Account / D1 / Edit
- Account / R2 Storage / Edit
- Zone / DNS / Edit
- Zone / Workers Routes / Edit
- Zone / Zone / Read

不要把 token 发到公开地方。可以在本机终端临时设置：

~~~bash
export CLOUDFLARE_ACCOUNT_ID=你的账号ID
export CLOUDFLARE_ZONE_ID=你的ZoneID
export CLOUDFLARE_API_TOKEN=你的临时Token
~~~

然后我会执行：

~~~bash
node scripts/cloudflare/bootstrap-scan-api.mjs
~~~

这个脚本会：

- 创建或复用 R2 bucket：`vrqc-scans`
- 创建或复用 D1 database：`vrqc-scans`
- 写入 `apps/api/wrangler.toml` 的 D1/R2 binding
- 执行 `apps/api/schema.sql`
- 部署 Worker：`vr-q-c-hk-scan-api`
- 发布 Worker API：`https://vr-q-c-hk-scan-api.vr-q-c-hk-gavin.workers.dev`

部署后我会把 GitHub Pages 的构建变量切到：

~~~bash
VITE_API_BASE_URL=https://vr-q-c-hk-scan-api.vr-q-c-hk-gavin.workers.dev
~~~

## B. 你需要授权给我的 Apple / iOS 内容

必须有 Apple Developer Program 账号。

需要你提供或授权：

- Apple Developer Team ID
- App Store Connect 访问权限
- App Store Connect 里创建 App 的权限
- Bundle ID：
  - `hk.qc.vr.scanner`
  - `hk.qc.vr.scanner.Clip`
- App Clip 配置权限
- TestFlight 上传和内测权限

需要开启的能力：

- Associated Domains
- App Clip
- Camera permission
- RoomPlan / ARKit 真机能力

Associated Domains：

~~~text
applinks:vr.q-c.hk
appclips:vr.q-c.hk
~~~

App Clip Invocation URL：

~~~text
https://vr.q-c.hk/scan/app/start
~~~

你给我 `APPLE_TEAM_ID` 后，我会执行：

~~~bash
export APPLE_TEAM_ID=你的TeamID
export APP_STORE_ID=App创建后得到的数字ID
node scripts/ios/apply-apple-config.mjs
~~~

这个脚本会替换：

- iOS `project.yml` 的 `DEVELOPMENT_TEAM`
- AASA 文件中的 `TEAMID`
- Smart App Banner 中的 `YOUR_APP_STORE_ID`
- 部署文档里的占位值

## C. 我需要你现场点击授权的步骤

Cloudflare：

1. 如果用浏览器登录方式，我运行 `npx wrangler login`。
2. 你在弹出的 Cloudflare 页面点击授权。
3. 我继续创建 R2/D1、部署 Worker、绑定 API 域名。

Apple：

1. 你登录 Apple Developer / App Store Connect。
2. 给当前 Mac/Xcode 选择你的开发团队。
3. 如果 Apple 弹出证书、Bundle ID、App Clip、TestFlight 相关确认，你点击允许。
4. 我生成 Xcode 项目、配置签名、上传 TestFlight。

## D. 授权后验收

Cloudflare API：

~~~bash
curl -s https://vr-q-c-hk-scan-api.vr-q-c-hk-gavin.workers.dev/api/scans
~~~

应该返回 JSON，不应该返回 GitHub Pages HTML。

Web 创建扫描：

~~~bash
curl -s https://vr-q-c-hk-scan-api.vr-q-c-hk-gavin.workers.dev/api/scans \
  -H 'content-type: application/json' \
  -d '{"mode":"room","source":"web","deviceHint":"iPhone","userId":null}'
~~~

应该返回 `scanId`、`uploadToken`、`appStartUrl`、`returnUrl`。

iOS：

- 真机 Safari 打开 `https://vr.q-c.hk/scan`
- 点击「开始扫描」
- 进入 `/scan/start`
- 已安装 TestFlight App 时，Universal Link 拉起 VR QC Scanner
- 完成 RoomPlan 或 Object Capture 扫描后上传
- 网站结果页显示模型、尺寸和免责声明

## E. 当前缺口

- Cloudflare Worker API 还没有实际部署，所以网页只能进入本地启动会话，不能上传保存。
- Apple Team ID / App Store ID 还没有填，所以 Universal Link 还不能真正打开已签名 App。
- 当前机器没有 Homebrew，不能直接 `brew install xcodegen`。授权后我会优先用你本机可用方式安装 XcodeGen，或改为生成 `.xcodeproj`。
