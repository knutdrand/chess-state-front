import { Capacitor } from "@capacitor/core";

/** True inside the iOS/Android app shells, false in a browser. */
export const isNativeApp = (): boolean => Capacitor.isNativePlatform();
export const nativePlatform = (): string => Capacitor.getPlatform(); // "ios" | "android" | "web"
