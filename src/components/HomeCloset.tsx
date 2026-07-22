"use client";

import Link from "next/link";
import { useMoodStore } from "@/lib/store";

/**
 * #7-d 홈 슬림 진입 줄 — '내 옷' 보유 유저에게만.
 * "산 {아이템명}, 오늘 입어볼까" → 해당 아이템 포함 룩(소환형). 여러 개면 최신순 로테이션. 0개면 미노출.
 */
export default function HomeCloset() {
  const { owned, hydrated } = useMoodStore();
  if (!hydrated || owned.length === 0) return null;

  // 최신순 + 날짜 기반 로테이션(여러 개일 때). SSR은 hydrated=false로 null → 불일치 없음
  const sorted = [...owned].sort((a, b) => (b.at ?? 0) - (a.at ?? 0));
  const idx = Math.floor(Date.now() / 86400000) % sorted.length;
  const item = sorted[idx];

  return (
    <div className="px-5 pt-2.5">
      <Link
        href={`/mood/${item.moodKey}`}
        className="flex items-center justify-between rounded-xl border border-line bg-white px-4 py-3 transition hover:bg-paper-2"
      >
        <span className="text-[13px] font-medium">
          산 {item.name}, 오늘 입어볼까
        </span>
        <span className="text-ink-faint">›</span>
      </Link>
    </div>
  );
}
