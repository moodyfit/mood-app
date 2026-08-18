"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

/**
 * Capacitor 네이티브 초기화 — 앱 시작 시 StatusBar 스타일 설정 + 스플래시 숨김.
 * 웹에서는 아무 동작도 하지 않음.
 */
export default function CapacitorInit() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    StatusBar.setStyle({ style: Style.Light }).catch(() => {});
    SplashScreen.hide().catch(() => {});
  }, []);

  return null;
}
