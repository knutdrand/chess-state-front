import { isNativeApp } from "../native/platform";

/**
 * Space around the board, in px. A bit of breathing room in the browser;
 * edge to edge in the iOS/Android apps where every pixel counts.
 * Used both to size the board (MainScreen) and to pad it (GameScreen),
 * so the Play screen still never scrolls.
 */
export const boardPadding = (): number => (isNativeApp() ? 0 : 12);
