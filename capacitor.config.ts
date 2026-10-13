import type { CapacitorConfig } from "@capacitor/cli";

/** Native shell for the Glide app. In development it loads the Next dev server's /app route. */
const config: CapacitorConfig = {
  appId: "ae.glide.app",
  appName: "Glide",
  webDir: "native-www",
  backgroundColor: "#FFF3DF",
  server: {
    // iOS Simulator reaches the host as localhost; the Android emulator uses 10.0.2.2 (set below per platform).
    url: `http://${process.env.CAP_HOST ?? "localhost"}:3000/app`,
    cleartext: true,
  },
};

export default config;
