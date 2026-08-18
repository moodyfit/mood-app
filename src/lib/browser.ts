import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

/**
 * 외부 URL 열기 — 네이티브: 인앱 브라우저 / 웹: 새 탭.
 */
export async function openExternal(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url });
  } else {
    window.open(url, "_blank", "noopener");
  }
}
