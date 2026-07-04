# App Clip

第一版 App Clip 配置保留为轻量扫描入口：

- Bundle ID：`hk.qc.vr.scanner.Clip`
- 只负责从 `/scan/app/start` 启动扫描和上传。
- 不做完整历史管理。
- 需要在 App Store Connect 配置 App Clip Invocation URL。
- 需要 AASA 中 `appclips.apps` 替换真实 Team ID。

`project.yml` 已包含 `VRQCScannerClip` target。生成 Xcode 项目后，需要在 Apple Developer 和 App Store Connect 中配置真实 Team ID、App Clip Invocation URL 与 TestFlight 测试入口。
