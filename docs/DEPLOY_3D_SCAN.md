# VR.q-c.hk 三维扫描部署说明

本文只适用于独立网站 `https://vr.q-c.hk`。不要把这里的配置混到其他网站或仓库。

## 1. Web 环境变量

在 GitHub Actions、Cloudflare Pages 或 Vite 部署环境配置：

~~~bash
PUBLIC_SITE_URL=https://vr.q-c.hk
VITE_PUBLIC_SITE_URL=https://vr.q-c.hk
VITE_API_BASE_URL=https://vr.q-c.hk
STORAGE_PROVIDER=r2|supabase|local
R2_ACCOUNT_ID=TODO
R2_ACCESS_KEY_ID=TODO
R2_SECRET_ACCESS_KEY=TODO
R2_BUCKET=TODO
R2_PUBLIC_BASE_URL=https://assets.vr.q-c.hk
DATABASE_URL=TODO
USDZ_CONVERTER_ENDPOINT=TODO
MAX_USDZ_MB=500
MAX_IMAGES_ZIP_MB=1024
~~~

第一版 Web 继续由 GitHub Pages 自动部署。API 建议部署到 Cloudflare Worker 或 Cloudflare Pages Functions；如果 API 使用独立子域，例如 `https://api.vr.q-c.hk`，把 `VITE_API_BASE_URL` 改成该地址。

## 2. iOS 配置

- App Name：VR QC Scanner
- Bundle ID：`hk.qc.vr.scanner`
- App Clip Bundle ID：`hk.qc.vr.scanner.Clip`
- Deployment Target：iOS 17.0+
- Associated Domains：
  - `applinks:vr.q-c.hk`
  - `appclips:vr.q-c.hk`
- Camera usage text：用于扫描房间或物体并生成 3D 模型。
- App Store ID：`YOUR_APP_STORE_ID`，等 App Store Connect 创建 App 后替换。
- Apple Team ID：`TEAMID`，替换成 Apple Developer Team ID。

真机调试步骤：

1. 安装 XcodeGen：`brew install xcodegen`。
2. 进入 `ios/VRQCScanner`。
3. 运行 `xcodegen generate`。
4. 用 Xcode 打开 `VRQCScanner.xcodeproj`。
5. 替换 Team ID，选择真实开发团队。
6. 用支持 LiDAR 的 iPhone Pro 或 iPad Pro 真机运行。

## 3. AASA 配置

文件路径：

~~~text
apps/web/public/.well-known/apple-app-site-association
~~~

模板：

~~~json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["TEAMID.hk.qc.vr.scanner"],
        "components": [
          {
            "/": "/scan/app/*",
            "comment": "Open VR QC Scanner from scan links"
          }
        ]
      }
    ]
  },
  "appclips": {
    "apps": ["TEAMID.hk.qc.vr.scanner.Clip"]
  }
}
~~~

上线后验证：

~~~bash
curl -i https://vr.q-c.hk/.well-known/apple-app-site-association
~~~

返回必须是 JSON 内容，不能跳转到 HTML 页面。`TEAMID` 必须替换成真实 Apple Developer Team ID。App Clip 需要在 App Store Connect 配置 Invocation URL，TestFlight 也要绑定 `https://vr.q-c.hk/scan/app/start`。

## 4. 本地开发

安装依赖：

~~~bash
npm install
~~~

启动 Web：

~~~bash
npm run dev
~~~

启动 API：

~~~bash
npm run dev -w @vrqc/api
~~~

测试创建任务：

~~~bash
curl -s http://127.0.0.1:8787/api/scans \
  -H 'content-type: application/json' \
  -d '{"mode":"room","source":"web","deviceHint":"iPhone","userId":null}'
~~~

测试 Universal Link：

1. 在真机 Safari 打开 `https://vr.q-c.hk/scan/start?mode=room`。
2. 页面会创建任务并跳转到 `/scan/app/start`。
3. 安装 App 后，iOS 会通过 Universal Link 打开 App 并解析 `mode`、`scanId`、`uploadToken`、`returnUrl`。

测试上传：

- 房间扫描输出：`room.usdz`、`room.json`、`measurements.json`、`thumbnail.jpg`。
- 物体扫描输出：`object.usdz`、`objectMeasurements.json`、`thumbnail.jpg`。
- `POST /api/scans/:scanId/upload` 使用 multipart/form-data，并带 `Authorization: Bearer <uploadToken>`。

## 5. 生产上线

1. Push 到 `main`，GitHub Actions 自动构建 `apps/web` 并发布到 GitHub Pages。
2. 在 GitHub Pages 确认自定义域名 `vr.q-c.hk` 和 HTTPS。
3. 部署 Cloudflare Worker API：`npm run deploy:api`。
4. 配置 Worker 环境变量、R2 bucket、D1 数据库。
5. 建表：

~~~sql
create table if not exists scans (
  id text primary key,
  mode text not null,
  status text not null,
  created_at text not null,
  updated_at text not null,
  upload_token_hash text not null,
  return_url text not null,
  payload_json text not null
);
~~~

6. 配置 CORS 只允许 `https://vr.q-c.hk` 和本地开发地址。
7. 在 iPhone 上测试摄像头权限、RoomPlan、Object Capture、上传失败重试、Universal Link 和 App Clip。

## 6. 安全和限制

- 上传接口必须校验 `uploadToken`。
- USDZ 最大 500MB，可用 `MAX_USDZ_MB` 调整。
- JSON 和图片最大 20MB。
- `imagesZip` 最大 1GB，可用 `MAX_IMAGES_ZIP_MB` 调整。
- 允许 MIME：USDZ、JSON、JPG/PNG、ZIP。
- 不要在日志打印 uploadToken、用户照片、带签名参数的完整 URL。
- 所有尺寸都必须展示：尺寸为扫描估算值，装修、施工、采购前请人工复核。

## 7. 后续 TODO

- 用真实 R2 公网域名或签名下载策略替换本地占位 URL。
- 接入真实 USDZ 转 GLB 服务，可选 Blender、Reality Converter、外部 Worker 或自建转换服务。
- App Store Connect 创建 App 后替换 `YOUR_APP_STORE_ID`。
- 替换 AASA 中的 `TEAMID`。
- 完成 App Clip target 的 Xcode capability 和 Invocation URL。
