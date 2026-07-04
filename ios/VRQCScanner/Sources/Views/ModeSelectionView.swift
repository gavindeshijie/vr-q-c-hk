import SwiftUI

struct ModeSelectionView: View {
    @EnvironmentObject private var router: LaunchRouterViewModel

    var body: some View {
        List {
            Section("三维扫描") {
                Button("房间扫描") {
                    router.selectedMode = .room
                }
                Button("物体扫描") {
                    router.selectedMode = .object
                }
            }
            Section {
                Text("请从 vr.q-c.hk 创建扫描任务后打开 App。这样网站会传入 scanId、uploadToken 和 returnUrl。")
                Text("扫描会使用摄像头和 LiDAR 数据生成 3D 模型。请不要扫描身份证、银行卡、密码、私人照片等敏感信息。")
            }
        }
        .navigationDestination(item: $router.selectedMode) { mode in
            ManualLaunchView(mode: mode)
        }
    }
}

struct ManualLaunchView: View {
    let mode: ScanMode

    var body: some View {
        VStack(spacing: 16) {
            Text(mode.title)
                .font(.title.bold())
            Text("缺少网站创建的 scanId 和上传令牌。请返回 vr.q-c.hk 点击「用 iPhone 开始扫描」。")
                .multilineTextAlignment(.center)
            Link("返回网站", destination: URL(string: "https://vr.q-c.hk/scan")!)
        }
        .padding()
    }
}
