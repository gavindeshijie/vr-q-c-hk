import RealityKit
import SwiftUI

@available(iOS 17.0, *)
struct ObjectScanView: View {
    let context: ScanLaunchContext
    @StateObject private var model = ObjectScanViewModel()
    @State private var showUpload = false

    var body: some View {
        ZStack(alignment: .bottom) {
            ObjectCaptureView(session: model.session)
                .ignoresSafeArea()

            VStack(spacing: 10) {
                Text("围绕物体 360° 缓慢移动。透明、反光、细线状、会变形的物体可能不适合自动三维重建，结果可能不完整。")
                    .font(.callout)
                    .padding(10)
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 8))

                HStack {
                    Button("开始扫描") { model.start() }
                        .buttonStyle(.borderedProminent)
                    Button("完成扫描并生成模型") { model.finish() }
                        .buttonStyle(.bordered)
                    Button("取消") { model.cancel() }
                        .buttonStyle(.bordered)
                }
            }
            .padding()
        }
        .navigationTitle("物体扫描")
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

@available(iOS 17.0, *)
@MainActor
final class ObjectScanViewModel: ObservableObject {
    let session = ObjectCaptureSession()
    @Published var output: ScanOutput?
    private var imageDirectory: URL?

    func start() {
        do {
            let directory = try makeOutputDirectory(prefix: "object-source")
            imageDirectory = directory
            var configuration = ObjectCaptureSession.Configuration()
            configuration.checkpointDirectory = directory
            session.start(imagesDirectory: directory, configuration: configuration)
        } catch {
            print("Object capture start failed: \(error.localizedDescription)")
        }
    }

    func finish() {
        session.finish()
        guard let imageDirectory else { return }
        Task {
            do {
                output = try await ObjectCaptureExporter.reconstruct(from: imageDirectory)
            } catch {
                print("Object reconstruction failed: \(error.localizedDescription)")
            }
        }
    }

    func cancel() {
        session.cancel()
    }

    private func makeOutputDirectory(prefix: String) throws -> URL {
        let base = try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        let directory = base.appendingPathComponent("\(prefix)-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        return directory
    }
}
