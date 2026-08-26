"use client";

import Link from "next/link";

/**
 * 상단바 — 로고만. 모든 페이지에서 표시.
 */
export default function TopBar() {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-5 pb-3.5 pt-[max(1.25rem,env(safe-area-inset-top))] bg-gradient-to-b from-paper from-[72%] to-transparent">
      <Link href="/" className="text-[17px] font-extrabold tracking-[-0.4px]">
        무드핏
      </Link>
    </div>
  );
}
