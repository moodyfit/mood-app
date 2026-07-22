"use client";

import { useState } from "react";
import MoodCard from "./MoodCard";
import SearchMemory from "./SearchMemory";
import { MOODS, ALL_MOOD_KEYS, resolveMoods } from "@/lib/moods";
import { personalizeOrder, topShare, SKEW_THRESHOLD } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";

/**
 * 모먼트 3 + 7.6: [모두의 결과 ↔ 너의 결과] 토글. (로컬 폴백 그리드)
 * you=true(추구미 카드 진입): 검색어 없이 전체를 프로필로 정렬.
 */
export default function ResultsGrid({ query, you = false }: { query: string; you?: boolean }) {
  const { cardEverIssued, affinity } = useMoodStore();
  const [personal, setPersonal] = useState(you);

  const base = you ? [...ALL_MOOD_KEYS] : resolveMoods(query);
  const ordered = personal ? personalizeOrder(base, affinity) : base;
  const showToggle = you || (cardEverIssued && topShare(affinity) >= SKEW_THRESHOLD);

  return (
    <div>
      <h2 className="mb-4 text-[20px] font-bold tracking-[-0.4px]">
        {you ? "너의 추구미로 골라봤어" : `‘${query}’ 느낌`}
      </h2>

      {!you && <SearchMemory query={query} />}

      {showToggle && (
        <div className="mb-4 inline-flex rounded-full border border-line p-1 text-[13px]">
          <button
            type="button"
            onClick={() => setPersonal(false)}
            className={`rounded-full px-3.5 py-1.5 transition ${!personal ? "bg-accent text-white" : "text-ink-soft"}`}
          >
            모두의 결과
          </button>
          <button
            type="button"
            onClick={() => setPersonal(true)}
            className={`rounded-full px-3.5 py-1.5 transition ${personal ? "bg-accent text-white" : "text-ink-soft"}`}
          >
            너의 결과
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {ordered.map((key, idx) => {
          const mood = MOODS[key];
          if (!mood) return null;
          return <MoodCard key={key} mood={mood} query={query} hint={idx === 0} />;
        })}
      </div>
    </div>
  );
}
