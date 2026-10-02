import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

/**
 * soft impact 햅틱 — 저장·토글 전환·스캔 판정에.
 * 네이티브: Capacitor Haptics / 웹: navigator.vibrate 폴백(iOS Safari 미지원은 조용히 무시).
 */
export function haptic(): void {
  if (Capacitor.isNativePlatform()) {
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
    return;
  }
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(8);
    } catch {
      /* 무시 */
    }
  }
}
