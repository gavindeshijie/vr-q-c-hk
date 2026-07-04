# VR.q-c.hk 三维扫描

这是 `vr.q-c.hk` 的独立仓库，没有运行时依赖或部署关联到任何其他网站。

第一项功能是「三维扫描」：网站负责入口、任务创建、结果展示和历史记录；真正的高精度房间/物体扫描由 iPhone 原生 App 通过 RoomPlan、ARKit、RealityKit Object Capture 完成。

## 项目结构

- `apps/web`：React + TypeScript + Vite 前端，包含首页、扫描启动、网页相机备用预览、结果页和历史页。
- `apps/api`：Cloudflare Worker/Pages Functions API，包含扫描任务、上传、完成、转换接口，以及 Storage/Repository/Converter 抽象。
- `ios/VRQCScanner`：SwiftUI iOS 扫描 App 源码与 XcodeGen 项目配置，包含 RoomPlan 房间扫描、Object Capture 物体扫描、上传和本地历史。
- `shared`：前后端共享类型、API contract 和中文文案。
- `docs`：部署、Apple 配置、API 和交接文档。

## 本地开发

~~~bash
npm install
npm run dev
~~~

Web 默认启动在 Vite 本地地址。API 可通过 Cloudflare Worker 本地开发：

~~~bash
npm run build:api
npm run deploy:api
~~~

Cloudflare 本地调试和 iOS 真机调试见 [docs/DEPLOY_3D_SCAN.md](./docs/DEPLOY_3D_SCAN.md)。

授权清单见 [docs/AUTHORIZATION_CHECKLIST.md](./docs/AUTHORIZATION_CHECKLIST.md)。授权后可按脚本自动创建 Cloudflare R2/D1、部署 Worker API，并替换 Apple Team ID / App Store ID。

## 构建

~~~bash
npm run build
~~~

GitHub Pages 仍负责 `https://vr.q-c.hk` 的 Web 静态部署，构建产物来自 `apps/web/dist`。扫描 API 需要按文档部署到 Cloudflare Worker/Pages Functions，并通过 `VITE_API_BASE_URL` 指向 API 域名。

## 必填外部配置

不要提交真实密钥。以下值在部署平台配置：

- `PUBLIC_SITE_URL=https://vr.q-c.hk`
- `STORAGE_PROVIDER=r2|supabase|local`
- `R2_ACCOUNT_ID`、`R2_ACCESS_KEY_ID`、`R2_SECRET_ACCESS_KEY`、`R2_BUCKET`
- `DATABASE_URL`
- `USDZ_CONVERTER_ENDPOINT`
- `MAX_USDZ_MB=500`
- `MAX_IMAGES_ZIP_MB=1024`

iOS 还需要 Apple Developer Team ID、App Store ID、Associated Domains 和 TestFlight/App Clip 配置。仓库中只保留 TODO 占位，不提交假的真实 ID。
