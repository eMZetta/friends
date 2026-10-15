import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  // Must match the bundle ID registered in App Store Connect; change before the first upload.
  appId: 'ch.lumikids.app',
  appName: 'Galip',
  webDir: 'dist',
  backgroundColor: '#4b3f9e',
  ios: {
    // The web app handles safe areas itself and never scrolls.
    contentInset: 'never',
    scrollEnabled: false,
    backgroundColor: '#4b3f9e',
    // Children's app: links never open inside the app.
    allowsLinkPreview: false,
  },
}

export default config
