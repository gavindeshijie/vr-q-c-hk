import Foundation
import simd

enum ScanMode: String, Codable, CaseIterable, Identifiable {
    case room
    case object

    var id: String { rawValue }
    var title: String { self == .room ? "房间扫描" : "物体扫描" }
}

struct ScanLaunchContext: Codable, Equatable {
    var mode: ScanMode
    var scanId: String
    var uploadToken: String
    var returnUrl: URL
    var apiBaseUrl: URL
}

struct ScanMeasurements: Codable {
    var unit: String = "m"
    var accuracyNotice: String = "尺寸为扫描估算值，装修、施工、采购前请人工复核。"
    var room: RoomMeasurement?
    var object: ObjectMeasurement?
    var surfaces: [SurfaceMeasurement] = []
    var openings: [OpeningMeasurement] = []
    var objects: [DetectedObjectMeasurement] = []
}

struct RoomMeasurement: Codable {
    var approxAreaSqm: Double?
    var approxPerimeterM: Double?
    var approxCeilingHeightM: Double?
    var widthM: Double?
    var depthM: Double?
    var heightM: Double?
}

struct ObjectMeasurement: Codable {
    var widthM: Double?
    var heightM: Double?
    var depthM: Double?
    var volumeCbm: Double?
}

struct SurfaceMeasurement: Codable {
    var id: String
    var type: String
    var widthM: Double?
    var heightM: Double?
    var areaSqm: Double?
    var confidence: String?
    var transform: [Double]?
}

struct OpeningMeasurement: Codable {
    var id: String
    var type: String
    var widthM: Double?
    var heightM: Double?
    var confidence: String?
    var transform: [Double]?
}

struct DetectedObjectMeasurement: Codable {
    var id: String
    var category: String
    var widthM: Double?
    var heightM: Double?
    var depthM: Double?
    var confidence: String?
    var transform: [Double]?
}

struct LocalScanRecord: Codable, Identifiable {
    var id: String
    var mode: ScanMode
    var createdAt: Date
    var directory: URL
    var uploaded: Bool
}

extension simd_float4x4 {
    var doubleArray: [Double] {
        [
            Double(columns.0.x), Double(columns.0.y), Double(columns.0.z), Double(columns.0.w),
            Double(columns.1.x), Double(columns.1.y), Double(columns.1.z), Double(columns.1.w),
            Double(columns.2.x), Double(columns.2.y), Double(columns.2.z), Double(columns.2.w),
            Double(columns.3.x), Double(columns.3.y), Double(columns.3.z), Double(columns.3.w)
        ]
    }
}
