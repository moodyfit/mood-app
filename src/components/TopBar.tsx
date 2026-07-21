"use client";

import Link from "next/link";

/**
 * 상단바 — 로고만 (가이드라인 v2 §4.1). 나의 공간 진입은 하단 탭바로 이관.
 */
export default function TopBar() {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-5 pb-3.5 pt-5 bg-gradient-to-b from-paper from-[72%] to-transparent">
      <Link href="/" className="text-[21px] font-extrabold tracking-[-0.6px]">
        무드핏
      </Link>
    </div>
  );
}
