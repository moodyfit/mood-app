"use client";

import { useState } from "react";
import MoodCard from "./MoodCard";
import SearchMemory from "./SearchMemory";
import { MOODS, resolveMoods } from "@/lib/moods";
import { personalizeOrder, topShare, SKEW_THRESHOLD } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";

/**
 * 모먼트 3 + 7.6: [모두의 결과 ↔ 너의 결과] 토글.
 * · 모두의 결과 = 검색어→사진 일치도(중립, 인기순 아님)
 * · 너의 결과 = 일치도 × (1+프로필 가중치) 재정렬
 * · 토글은 카드 발급 이후 + 프로필이 특정 축에 의미있게 쏠렸을 때만 노출
 */
export default function ResultsGrid({ query }: { query: string }) {
  const { cardEverIssued, affinity } = useMoodStore();
  const [personal, setPersonal] = useState(false);

  const base = resolveMoods(query); // 실패 없는 폴백 보장
  const ordered = personal ? personalizeOrder(base, affinity) : base;
  const showToggle = cardEverIssued && topShare(affinity) >= SKEW_THRESHOLD;

  return (
    <div>
      <SearchMemory query={query} />

      {showToggle && (
        <div className="mb-4 inline-flex rounded-full border border-line p-1 text-[13px]">
          <button
            type="button"
            onClick={() => setPersonal(false)}
            className={`rounded-full px-3.5 py-1.5 transition ${
              !personal ? "bg-accent text-white" : "text-ink-soft"
            }`}
          >
            모두의 결과
          </button>
          <button
            type="button"
            onClick={() => setPersonal(true)}
            className={`rounded-full px-3.5 py-1.5 transition ${
              personal ? "bg-accent text-white" : "text-ink-soft"
            }`}
          >
            너의 결과
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {ordered.map((key) => {
          const mood = MOODS[key];
          if (!mood) return null;
          return <MoodCard key={key} mood={mood} query={query} />;
        })}
      </div>
    </div>
  );
}
