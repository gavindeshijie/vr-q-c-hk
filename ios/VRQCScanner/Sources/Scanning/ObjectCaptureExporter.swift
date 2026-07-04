import Foundation
import RealityKit

@available(iOS 17.0, *)
enum ObjectCaptureExporter {
    static func reconstruct(from imagesDirectory: URL) async throws -> ScanOutput {
        let outputDirectory = try makeOutputDirectory(prefix: "object")
        let modelURL = outputDirectory.appendingPathComponent("object.usdz")
        let measurementsURL = outputDirectory.appendingPathComponent("objectMeasurements.json")

        var configuration = PhotogrammetrySession.Configuration()
        configuration.sampleOrdering = .unordered
        configuration.featureSensitivity = .normal
        let session = try PhotogrammetrySession(input: imagesDirectory, configuration: configuration)

        try session.process(requests: [.modelFile(url: modelURL, detail: .reduced)])
        for try await output in session.outputs {
            switch output {
            case .processingComplete:
                let measurements = ScanMeasurements(
                    room: nil,
                    object: ObjectMeasurement(widthM: nil, heightM: nil, depthM: nil, volumeCbm: nil),
                    surfaces: [],
                    openings: [],
                    objects: []
                )
                try JSONEncoder.pretty.encode(measurements).write(to: measurementsURL)
                return ScanOutput(
                    directory: outputDirectory,
                    modelURL: modelURL,
                    measurementsURL: measurementsURL,
                    rawJSONURL: nil,
                    thumbnailURL: nil,
                    measurements: measurements
                )
            case .requestError(_, let error):
                throw error
            case .processingCancelled:
                throw CancellationError()
            default:
                continue
            }
        }

        throw CancellationError()
    }

    private static func makeOutputDirectory(prefix: String) throws -> URL {
        let base = try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        let directory = base.appendingPathComponent("\(prefix)-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        return directory
    }
}
