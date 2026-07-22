/**
 * soft impact 햅틱 — 저장·토글 전환·스캔 판정에.
 * navigator.vibrate 지원 브라우저 한정(iOS Safari 등 미지원은 조용히 무시).
 */
export function haptic(ms = 8): void {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      navigator.vibrate(ms);
    } catch {
      /* 무시 */
    }
  }
}
