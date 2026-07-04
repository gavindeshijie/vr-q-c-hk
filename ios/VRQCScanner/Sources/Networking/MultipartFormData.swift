import Foundation

struct MultipartFormData {
    private let boundary: String
    private var data = Data()

    init(boundary: String) {
        self.boundary = boundary
    }

    func addField(name: String, value: String) -> MultipartFormData {
        var copy = self
        copy.data.appendString("--\(boundary)\r\n")
        copy.data.appendString("Content-Disposition: form-data; name=\"\(name)\"\r\n\r\n")
        copy.data.appendString("\(value)\r\n")
        return copy
    }

    func addFile(name: String, fileURL: URL, mimeType: String) throws -> MultipartFormData {
        var copy = self
        copy.data.appendString("--\(boundary)\r\n")
        copy.data.appendString("Content-Disposition: form-data; name=\"\(name)\"; filename=\"\(fileURL.lastPathComponent)\"\r\n")
        copy.data.appendString("Content-Type: \(mimeType)\r\n\r\n")
        copy.data.append(try Data(contentsOf: fileURL))
        copy.data.appendString("\r\n")
        return copy
    }

    func addOptionalFile(name: String, fileURL: URL?, mimeType: String) throws -> MultipartFormData {
        guard let fileURL else { return self }
        return try addFile(name: name, fileURL: fileURL, mimeType: mimeType)
    }

    func finish() -> Data {
        var copy = data
        copy.appendString("--\(boundary)--\r\n")
        return copy
    }
}

extension Data {
    mutating func appendString(_ string: String) {
        append(Data(string.utf8))
    }
}
