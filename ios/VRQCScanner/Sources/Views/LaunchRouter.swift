import SwiftUI

struct LaunchRouter: View {
    @EnvironmentObject private var router: LaunchRouterViewModel

    var body: some View {
        NavigationStack {
            Group {
                if let context = router.launchContext {
                    DeviceCapabilityView(context: context)
                } else {
                    ModeSelectionView()
                }
            }
            .navigationTitle("VR QC Scanner")
        }
    }
}
