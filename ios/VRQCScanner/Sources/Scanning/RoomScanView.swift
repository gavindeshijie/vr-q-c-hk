import RoomPlan
import SwiftUI
import UIKit

struct RoomScanView: View {
    let context: ScanLaunchContext
    @StateObject private var model = RoomScanViewModel()
    @State private var showUpload = false

    var body: some View {
        ZStack(alignment: .bottom) {
            RoomCaptureRepresentable(model: model)
                .ignoresSafeArea()

            VStack(spacing: 10) {
                Text("慢慢移动 iPhone，扫描墙角、地面、门窗，保持光线充足。")
                    .font(.callout)
                    .padding(10)
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 8))

                HStack {
                    Button(model.isRunning ? "暂停" : "开始扫描") {
                        model.isRunning ? model.pause() : model.start()
                    }
                    .buttonStyle(.borderedProminent)

                    Button("完成扫描并生成模型") {
                        model.finish()
                    }
                    .buttonStyle(.bordered)

                    Button("取消") {
                        model.cancel()
                    }
                    .buttonStyle(.bordered)
                }
            }
            .padding()
        }
        .navigationTitle("房间扫描")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showUpload) {
            if let output = model.output {
                UploadView(context: context, output: output)
            }
        }
        .onChange(of: model.output?.id) { _, outputId in
            showUpload = outputId != nil
        }
    }
}

struct RoomCaptureRepresentable: UIViewRepresentable {
    @ObservedObject var model: RoomScanViewModel

    func makeUIView(context: Context) -> RoomCaptureView {
        let view = RoomCaptureView(frame: .zero)
        view.captureSession.delegate = model
        model.captureView = view
        return view
    }

    func updateUIView(_ uiView: RoomCaptureView, context: Context) {}
}

@MainActor
final class RoomScanViewModel: NSObject, ObservableObject, RoomCaptureSessionDelegate {
    @Published var isRunning = false
    @Published var output: ScanOutput?
    weak var captureView: RoomCaptureView?

    private let configuration = RoomCaptureSession.Configuration()
    private var finalRoom: CapturedRoom?

    func start() {
        captureView?.captureSession.run(configuration: configuration)
        isRunning = true
    }

    func pause() {
        captureView?.captureSession.stop()
        isRunning = false
    }

    func finish() {
        captureView?.captureSession.stop()
        isRunning = false
        guard let finalRoom else { return }
        do {
            output = try RoomPlanExporter.export(room: finalRoom)
        } catch {
            print("Room export failed: \(error.localizedDescription)")
        }
    }

    func cancel() {
        captureView?.captureSession.stop()
        isRunning = false
    }

    nonisolated func captureSession(_ session: RoomCaptureSession, didUpdate room: CapturedRoom) {
        Task { @MainActor in
            self.finalRoom = room
        }
    }

    nonisolated func captureSession(_ session: RoomCaptureSession, didEndWith data: CapturedRoomData, error: (any Error)?) {
        if let error {
            print("Room capture ended with error: \(error.localizedDescription)")
        }
    }
}
