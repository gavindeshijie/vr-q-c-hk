import SwiftUI

@main
struct VRQCScannerApp: App {
    @StateObject private var router = LaunchRouterViewModel()

    var body: some Scene {
        WindowGroup {
            LaunchRouter()
                .environmentObject(router)
                .onContinueUserActivity(NSUserActivityTypeBrowsingWeb) { userActivity in
                    guard let url = userActivity.webpageURL else { return }
                    router.handleUniversalLink(url)
                }
                .onOpenURL { url in
                    router.handleUniversalLink(url)
                }
        }
    }
}
