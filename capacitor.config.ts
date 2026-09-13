import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sixtyseven.clicker",
  appName: "6-7 Clicker",
  webDir: "out",
  ios: {
    contentInset: "automatic",
    allowsLinkPreview: false,
    backgroundColor: "#070709",
  },
  android: {
    allowMixedContent: true,
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
