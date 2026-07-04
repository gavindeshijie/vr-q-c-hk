import Foundation
import RoomPlan
import UIKit

struct ScanOutput: Identifiable {
    let id = UUID()
    var directory: URL
    var modelURL: URL
    var measurementsURL: URL
    var rawJSONURL: URL?
    var thumbnailURL: URL?
    var measurements: ScanMeasurements
}

enum ExporterError: Error {
    case documentsUnavailable
}

enum RoomPlanExporter {
    static func export(room: CapturedRoom) throws -> ScanOutput {
        let directory = try makeOutputDirectory(prefix: "room")
        let modelURL = directory.appendingPathComponent("room.usdz")
        let rawJSONURL = directory.appendingPathComponent("room.json")
        let measurementsURL = directory.appendingPathComponent("measurements.json")

        try room.export(to: modelURL, exportOptions: .parametric)
        try JSONEncoder.pretty.encode(room).write(to: rawJSONURL)
        let measurements = makeMeasurements(room: room)
        try JSONEncoder.pretty.encode(measurements).write(to: measurementsURL)

        return ScanOutput(
            directory: directory,
            modelURL: modelURL,
            measurementsURL: measurementsURL,
            rawJSONURL: rawJSONURL,
            thumbnailURL: nil,
            measurements: measurements
        )
    }

    static func makeMeasurements(room: CapturedRoom) -> ScanMeasurements {
        var result = ScanMeasurements(room: RoomMeasurement(), object: nil)

        result.surfaces = room.walls.enumerated().map { index, wall in
            let width = Double(wall.dimensions.x)
            let height = Double(wall.dimensions.y)
            return SurfaceMeasurement(
                id: "wall_\(index)",
                type: "wall",
                widthM: width,
                heightM: height,
                areaSqm: width * height,
                confidence: "medium",
                transform: wall.transform.doubleArray
            )
        }

        let floorAreas = room.floors.map { Double($0.dimensions.x * $0.dimensions.y) }
        let area = floorAreas.reduce(0, +)
        let ceilingHeights = room.walls.map { Double($0.dimensions.y) }
        result.room?.approxAreaSqm = area > 0 ? area : nil
        result.room?.approxCeilingHeightM = ceilingHeights.max()
        result.room?.approxPerimeterM = result.surfaces.compactMap(\.widthM).reduce(0, +)

        result.openings = room.doors.enumerated().map { index, door in
            OpeningMeasurement(
                id: "door_\(index)",
                type: "door",
                widthM: Double(door.dimensions.x),
                heightM: Double(door.dimensions.y),
                confidence: "medium",
                transform: door.transform.doubleArray
            )
        } + room.windows.enumerated().map { index, window in
            OpeningMeasurement(
                id: "window_\(index)",
                type: "window",
                widthM: Double(window.dimensions.x),
                heightM: Double(window.dimensions.y),
                confidence: "medium",
                transform: window.transform.doubleArray
            )
        } + room.openings.enumerated().map { index, opening in
            OpeningMeasurement(
                id: "opening_\(index)",
                type: "opening",
                widthM: Double(opening.dimensions.x),
                heightM: Double(opening.dimensions.y),
                confidence: "medium",
                transform: opening.transform.doubleArray
            )
        }

        result.objects = room.objects.enumerated().map { index, object in
            DetectedObjectMeasurement(
                id: "object_\(index)",
                category: "\(object.category)",
                widthM: Double(object.dimensions.x),
                heightM: Double(object.dimensions.y),
                depthM: Double(object.dimensions.z),
                confidence: "medium",
                transform: object.transform.doubleArray
            )
        }

        return result
    }

    private static func makeOutputDirectory(prefix: String) throws -> URL {
        let base = try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
        let directory = base.appendingPathComponent("\(prefix)-\(UUID().uuidString)", isDirectory: true)
        try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
        return directory
    }
}

extension JSONEncoder {
    static var pretty: JSONEncoder {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        return encoder
    }
}
