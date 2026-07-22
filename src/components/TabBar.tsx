"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 가이드라인 v2 §2 — 하단 탭바 (v1 금지 철회, 대중적 관습 채택).
 * 3탭 고정: [홈] [스캔] [나의 공간]. 아이콘+라벨 표준. 콜드 모드는 홈 안 진입점(탭 승격 금지).
 */
const TABS = [
  {
    href: "/",
    label: "홈",
    match: (p: string) =>
      p === "/" || p.startsWith("/results") || p.startsWith("/mood") || p.startsWith("/promise"),
    icon: (
      <path d="M4 11.5 12 5l8 6.5M6 10.5V19h12v-8.5" strokeWidth="1.6" />
    ),
  },
  {
    href: "/scan",
    label: "스캔",
    match: (p: string) => p.startsWith("/scan"),
    icon: (
      <>
        <rect x="4.5" y="4.5" width="15" height="15" rx="3" strokeWidth="1.6" />
        <path d="M8.5 12h7M12 8.5v7" strokeWidth="1.6" />
      </>
    ),
  },
  {
    href: "/space",
    label: "나의 공간",
    match: (p: string) => p.startsWith("/space") || p.startsWith("/shot"),
    icon: (
      <>
        <circle cx="12" cy="8.5" r="3.2" strokeWidth="1.6" />
        <path d="M5.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" strokeWidth="1.6" />
      </>
    ),
  },
];

export default function TabBar() {
  const pathname = usePathname() || "/";
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-frame -translate-x-1/2 grid grid-cols-3 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)]">
      {TABS.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition ${
              active ? "text-ink" : "text-ink-faint"
            }`}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {t.icon}
            </svg>
            <span className={active ? "font-semibold" : "font-medium"}>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
