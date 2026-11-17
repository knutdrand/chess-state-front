import { useEffect } from "react";
import { KeepAwake } from "@capacitor-community/keep-awake";
import { isNativeApp } from "./platform";

/** Keep the screen on while the component (the Play screen) is mounted. */
export function useKeepAwake() {
  useEffect(() => {
    if (!isNativeApp()) return;
    KeepAwake.keepAwake().catch(() => undefined);
    return () => {
      KeepAwake.allowSleep().catch(() => undefined);
    };
  }, []);
}
