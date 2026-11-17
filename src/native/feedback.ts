import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { isNativeApp } from "./platform";

/** Light tap for a correct move, error buzz for a wrong one. No-op on the web. */
export function moveFeedback(correct: boolean): void {
  if (!isNativeApp()) return;
  const p = correct ? Haptics.impact({ style: ImpactStyle.Light }) : Haptics.notification({ type: NotificationType.Error });
  p.catch(() => undefined);
}
