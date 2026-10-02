"use client";

import Link from "next/link";

/**
 * 상단바 — 로고(좌) + 검색 아이콘(우). 모든 페이지에서 표시.
 */
export default function TopBar() {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-5 pb-3.5 pt-[max(1.25rem,env(safe-area-inset-top))] bg-gradient-to-b from-paper from-[72%] to-transparent">
      <Link href="/" className="text-[17px] font-extrabold tracking-[-0.4px]">
        무드핏
      </Link>
      <Link href="/search" className="p-1" aria-label="검색">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-ink">
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 4.5 4.5" />
        </svg>
      </Link>
    </div>
  );
}
