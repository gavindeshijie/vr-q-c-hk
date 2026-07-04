import SwiftUI
import UIKit

struct UploadView: View {
    let context: ScanLaunchContext
    let output: ScanOutput
    @StateObject private var model = UploadViewModel()

    var body: some View {
        VStack(spacing: 18) {
            Text(model.title)
                .font(.title2.bold())
            ProgressView(value: model.progress)
            Text(model.message)
                .multilineTextAlignment(.center)

            if model.failed {
                Button("重新上传") {
                    Task { await model.upload(context: context, output: output) }
                }
                .buttonStyle(.borderedProminent)
            }

            Link("返回网站", destination: context.returnUrl)
        }
        .padding()
        .task {
            await model.upload(context: context, output: output)
        }
    }
}

@MainActor
final class UploadViewModel: ObservableObject {
    @Published var title = "正在上传扫描结果"
    @Published var message = "请保持 App 打开，不要删除本地扫描文件。"
    @Published var progress = 0.1
    @Published var failed = false

    private let client = ScanAPIClient()

    func upload(context: ScanLaunchContext, output: ScanOutput) async {
        failed = false
        title = "正在上传扫描结果"
        message = "上传 USDZ、JSON 和缩略图。"
        progress = 0.25

        do {
            let deviceInfo = UIDevice.currentDeviceDescription
            try await client.upload(context: context, output: output, deviceInfo: deviceInfo)
            progress = 0.75
            title = "正在生成 3D 模型"
            try await client.complete(context: context, output: output)
            progress = 1
            title = "上传完成"
            message = "可以返回网站查看扫描结果。你可以保留本地副本，确认结果后再手动删除。"
            await UIApplication.shared.open(context.returnUrl)
        } catch {
            failed = true
            title = "上传失败"
            message = "扫描结果已保存在本机，请稍后重新上传。错误：\(error.localizedDescription)"
        }
    }
}
