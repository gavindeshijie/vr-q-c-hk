import Foundation
import SwiftUI

@MainActor
final class LaunchRouterViewModel: ObservableObject {
    @Published var launchContext: ScanLaunchContext?
    @Published var selectedMode: ScanMode?

    func handleUniversalLink(_ url: URL) {
        guard url.path == "/scan/app/start",
              let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let modeValue = components.queryItems?.first(where: { $0.name == "mode" })?.value,
              let mode = ScanMode(rawValue: modeValue),
              let scanId = components.queryItems?.first(where: { $0.name == "scanId" })?.value,
              let uploadToken = components.queryItems?.first(where: { $0.name == "uploadToken" })?.value,
              let returnValue = components.queryItems?.first(where: { $0.name == "returnUrl" })?.value,
              let returnUrl = URL(string: returnValue)
        else { return }

        launchContext = ScanLaunchContext(
            mode: mode,
            scanId: scanId,
            uploadToken: uploadToken,
            returnUrl: returnUrl,
            apiBaseUrl: URL(string: "https://vr.q-c.hk")!
        )
        selectedMode = mode
    }
}
