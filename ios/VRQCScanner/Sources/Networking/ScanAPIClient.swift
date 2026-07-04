import Foundation
import UIKit

struct ScanAPIClient {
    func upload(context: ScanLaunchContext, output: ScanOutput, deviceInfo: String) async throws {
        let url = context.apiBaseUrl.appending(path: "api/scans/\(context.scanId)/upload")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(context.uploadToken)", forHTTPHeaderField: "Authorization")

        let boundary = "Boundary-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.httpBody = try MultipartFormData(boundary: boundary)
            .addField(name: "mode", value: context.mode.rawValue)
            .addField(name: "deviceInfo", value: deviceInfo)
            .addFile(name: "modelUsdz", fileURL: output.modelURL, mimeType: "model/vnd.usdz+zip")
            .addFile(name: "measurementsJson", fileURL: output.measurementsURL, mimeType: "application/json")
            .addOptionalFile(name: "roomJson", fileURL: output.rawJSONURL, mimeType: "application/json")
            .addOptionalFile(name: "thumbnail", fileURL: output.thumbnailURL, mimeType: "image/jpeg")
            .finish()

        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
    }

    func complete(context: ScanLaunchContext, output: ScanOutput) async throws {
        let url = context.apiBaseUrl.appending(path: "api/scans/\(context.scanId)/complete")
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(context.uploadToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload = CompletePayload(status: "ready", files: CompleteFiles(usdzUrl: nil, glbUrl: nil, thumbnailUrl: nil, rawJsonUrl: nil), measurements: output.measurements)
        request.httpBody = try JSONEncoder().encode(payload)
        let (_, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
    }
}

struct CompletePayload: Codable {
    var status: String
    var files: CompleteFiles
    var measurements: ScanMeasurements
}

struct CompleteFiles: Codable {
    var usdzUrl: String?
    var glbUrl: String?
    var thumbnailUrl: String?
    var rawJsonUrl: String?
}

extension UIDevice {
    static var currentDeviceDescription: String {
        "\(current.model), \(current.systemName) \(current.systemVersion)"
    }
}
