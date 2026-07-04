import ARKit
import RealityKit
import RoomPlan
import SwiftUI

struct DeviceCapabilityView: View {
    let context: ScanLaunchContext

    private var isSupported: Bool {
        switch context.mode {
        case .room:
            return RoomCaptureSession.isSupported
        case .object:
            if #available(iOS 17.0, *) {
                return ObjectCaptureSession.isSupported
            }
            return false
        }
    }

    var body: some View {
        Group {
            if isSupported {
                switch context.mode {
                case .room:
                    RoomScanView(context: context)
                case .object:
                    ObjectScanView(context: context)
                }
            } else {
                VStack(spacing: 18) {
                    Text("当前设备不支持高精度三维扫描。请使用支持 LiDAR 的 iPhone Pro 或 iPad Pro。")
                        .font(.headline)
                        .multilineTextAlignment(.center)
                    Link("返回网站", destination: context.returnUrl)
                }
                .padding()
            }
        }
    }
}
