"use client";

import Link from "next/link";
import { MOODS } from "@/lib/moods";
import { useMoodStore } from "@/lib/store";

/**
 * 1.5.2 '내 옷' 결 — 나의 공간 3결(동경/발견/소유)의 소유.
 * "샀어" 표시한 아이템이 모임. 탭 → "이거 들어간 룩 보기"(상함형: 존재하는 무드 룩으로 이동).
 * 제0조 경계: 생성형 조합("이 바지 매치해봐") 금지, 상함형(있는 룩 필터)만.
 */
export default function Closet({ promotedName }: { promotedName?: string }) {
  const { owned } = useMoodStore();
  if (owned.length === 0) return null;

  return (
    <div>
      <div className="mb-2 text-[12px] text-ink-faint">
        {promotedName ? `새로 온 ${promotedName}, 입어볼 조합` : "내 옷"}
      </div>
      <div className="flex flex-col gap-2">
        {owned.map((item) => {
          const mood = MOODS[item.moodKey];
          return (
            <Link
              key={item.id}
              href={`/mood/${item.moodKey}`}
              className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 transition hover:bg-paper-2"
            >
              <div
                className="h-11 w-11 flex-shrink-0 rounded-lg"
                style={
                  mood?.imageUrl
                    ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: mood?.gradient }
                }
              />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-medium">{item.name}</div>
                <div className="mt-0.5 text-[12px] text-ink-soft">이거 들어간 룩 보기 ›</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
