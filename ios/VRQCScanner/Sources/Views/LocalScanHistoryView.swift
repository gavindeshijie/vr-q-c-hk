import SwiftUI

struct LocalScanHistoryView: View {
    @State private var records: [LocalScanRecord] = []

    var body: some View {
        List(records) { record in
            VStack(alignment: .leading) {
                Text(record.mode.title)
                    .font(.headline)
                Text(record.createdAt.formatted())
                Text(record.uploaded ? "已上传" : "未上传")
            }
        }
        .navigationTitle("本机扫描记录")
        .task {
            records = LocalScanStore.load()
        }
    }
}

enum LocalScanStore {
    private static var fileURL: URL? {
        guard let docs = try? FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true) else { return nil }
        return docs.appendingPathComponent("local-scans.json")
    }

    static func load() -> [LocalScanRecord] {
        guard let fileURL, let data = try? Data(contentsOf: fileURL) else { return [] }
        return (try? JSONDecoder().decode([LocalScanRecord].self, from: data)) ?? []
    }

    static func save(_ records: [LocalScanRecord]) {
        guard let fileURL, let data = try? JSONEncoder().encode(records) else { return }
        try? data.write(to: fileURL)
    }
}
