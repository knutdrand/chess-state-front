/**
 * Native app start-up. Must run before the auth store is created
 * (src/index.tsx awaits it, then imports App).
 *
 * The login token lives in localStorage on the web. iOS may clear a web
 * view's localStorage under storage pressure, so in the apps the token is
 * also kept in native Preferences and copied back on start.
 */
import { App as CapApp } from "@capacitor/app";
import { Preferences } from "@capacitor/preferences";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { runBackHandler } from "./backButton";
import { isNativeApp, nativePlatform } from "./platform";

const TOKEN_KEY = "token";

export async function restoreNativeState(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    if (value && !localStorage.getItem(TOKEN_KEY)) localStorage.setItem(TOKEN_KEY, value);
  } catch {
    // start logged out
  }
}

/** Wire native behaviour once React and the stores exist. */
export async function startNative(opts: {
  subscribeToken: (listener: (token: string | null) => void) => void;
  goToPlayTab: () => boolean; // returns false if already on Play
}): Promise<void> {
  if (!isNativeApp()) return;

  opts.subscribeToken((token) => {
    const write = token
      ? Preferences.set({ key: TOKEN_KEY, value: JSON.stringify(token) })
      : Preferences.remove({ key: TOKEN_KEY });
    write.catch(() => undefined);
  });

  if (nativePlatform() === "android") {
    CapApp.addListener("backButton", () => {
      if (runBackHandler()) return; // a dialog closed
      if (window.location.pathname !== "/") {
        window.history.back(); // e.g. privacy page -> login
        return;
      }
      if (opts.goToPlayTab()) return;
      CapApp.minimizeApp().catch(() => undefined);
    });
  }

  StatusBar.setStyle({ style: Style.Light }).catch(() => undefined);
  SplashScreen.hide().catch(() => undefined);
}
