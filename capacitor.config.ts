import type { CapacitorConfig } from "@capacitor/cli";

// Native iOS/Android shells around the Vite build (see ../CLAUDE.md, "Mobile apps").
// appId is permanent once published: confirm it before the first store upload.
const config: CapacitorConfig = {
  appId: "com.polarchess.app",
  appName: "Polar Chess",
  webDir: "build",
  android: {
    // Served from https://localhost (allowed in the API's CORS_ORIGINS).
  },
  ios: {
    // Served from capacitor://localhost (allowed in the API's CORS_ORIGINS).
    contentInset: "never",
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false, // hidden from src/native/init.ts once the app has rendered
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
};

export default config;
