"use client";

import BackButton from "@/components/BackButton";
import ScanDeck from "@/components/ScanDeck";

// 3초 취향 스캔 — 설문 없는 온보딩/상시 취향 측정
export default function ScanPage() {
  return (
    <div className="animate-fade px-5 pb-12">
      <BackButton href="/" />
      <ScanDeck />
    </div>
  );
}
