# VR QC Scanner iOS

SwiftUI iOS 扫描端。真实扫描能力必须运行在真机：

- 房间扫描：RoomPlan + ARKit + LiDAR。
- 物体扫描：RealityKit Object Capture + PhotogrammetrySession。
- 网页 Safari 只能通过 Universal Link / App Clip 拉起本 App，不能直接调用 RoomPlan 或 Object Capture。

## 生成 Xcode 项目

~~~bash
brew install xcodegen
cd ios/VRQCScanner
xcodegen generate
open VRQCScanner.xcodeproj
~~~

把 `TEAMID` 替换成真实 Apple Developer Team ID。不要提交真实证书、Profile 或密钥。

## Bundle

- App：`hk.qc.vr.scanner`
- App Clip：`hk.qc.vr.scanner.Clip`
- Deployment Target：iOS 17.0+
