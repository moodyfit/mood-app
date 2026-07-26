"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMoodStore } from "@/lib/store";

/**
 * 가이드라인 v2 §2 — 하단 탭바 (v1 금지 철회, 대중적 관습 채택).
 * 3탭 고정: [홈] [스캔] [나의 공간]. 아이콘+라벨 표준. 콜드 모드는 홈 안 진입점(탭 승격 금지).
 */
const TABS = [
  {
    href: "/",
    label: "홈",
    match: (p: string) =>
      p === "/" || p.startsWith("/results") || p.startsWith("/mood") || p.startsWith("/promise") || p.startsWith("/photo"),
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
    href: "/watch",
    label: "영상",
    match: (p: string) => p.startsWith("/watch"),
    icon: (
      <>
        <rect x="3.5" y="5.5" width="17" height="13" rx="3" strokeWidth="1.6" />
        <path d="M10.5 9.5v5l4-2.5z" strokeWidth="1.6" strokeLinejoin="round" />
      </>
    ),
  },
  {
    href: "/space",
    label: "나의 공간",
    match: (p: string) => p.startsWith("/space") || p.startsWith("/shot") || p.startsWith("/closet"),
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
  const { spaceDot } = useMoodStore();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-frame -translate-x-1/2 grid grid-cols-4 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)]">
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
            <div className="relative">
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
              {/* B5 추구미 카드 발급 신호 — dot 하나(숫자·문구 없음). 진입 시 제거 */}
              {t.href === "/space" && spaceDot && (
                <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-accent" />
              )}
            </div>
            <span className={active ? "font-semibold" : "font-medium"}>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
