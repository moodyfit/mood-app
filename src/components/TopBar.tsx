"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 상단바 — 로고만 (가이드라인 v2 §4.1). 나의 공간 진입은 하단 탭바로 이관.
 * 홈('/')은 SearchScreen의 sticky 헤더(워드마크+검색)가 대신하므로 숨긴다(중복 방지).
 */
export default function TopBar() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-5 pb-3.5 pt-[max(1.25rem,env(safe-area-inset-top))] bg-gradient-to-b from-paper from-[72%] to-transparent">
      <Link href="/" className="text-[21px] font-extrabold tracking-[-0.6px]">
        무드핏
      </Link>
    </div>
  );
}
