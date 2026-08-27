"use client";

import Link from "next/link";
import { MOODS } from "@/lib/moods";
import { useMoodStore } from "@/lib/store";

/**
 * 7.8 검색 기억 — 같은 상황어를 다시 검색하면 지난번 저장한 룩을 되짚어준다.
 * "무신사는 검색을 기억하고, 무드핏은 상황을 기억한다."
 * 재검색(searchCount >= 2)이고 이 검색어로 저장한 무드가 있을 때만 노출.
 */
export default function SearchMemory({ query }: { query: string }) {
  const { saves, searchCount } = useMoodStore();

  const q = query.trim().toLowerCase();
  const prior = saves.filter((s) => (s.query ?? "").trim().toLowerCase() === q);

  if (searchCount(query) < 2 || prior.length === 0) return null;

  return (
    <div className="mb-4 rounded-xl border border-line bg-paper-2 p-3">
      <div className="text-[13px] text-ink-soft">
        지난번 <span className="font-semibold text-ink">&lsquo;{query}&rsquo;</span> 때 담은 룩 {prior.length}개
      </div>
      <div className="mt-2.5 flex gap-2 overflow-x-auto">
        {prior.map((s) => {
          const mood = MOODS[s.moodKey];
          if (!mood) return null;
          return (
            <Link
              key={`${s.moodKey}-${s.savedAt}`}
              href={`/mood/${s.moodKey}`}
              className="relative h-16 w-[52px] flex-shrink-0 overflow-hidden rounded-lg"
              style={
                mood.imageUrl
                  ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { background: mood.gradient }
              }
            />
          );
        })}
      </div>
    </div>
  );
}
