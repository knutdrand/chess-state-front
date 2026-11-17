import { useEffect } from "react";
import { pushBackHandler } from "./backButton";

/** While `active`, the Android back button calls `onBack` (e.g. close this dialog). */
export function useBackHandler(active: boolean, onBack: () => void) {
  useEffect(() => {
    if (!active) return;
    return pushBackHandler(onBack);
  }, [active, onBack]);
}
