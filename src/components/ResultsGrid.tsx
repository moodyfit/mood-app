"use client";

import { useState } from "react";
import MoodCard from "./MoodCard";
import SearchMemory from "./SearchMemory";
import { MOODS, ALL_MOOD_KEYS, resolveMoods } from "@/lib/moods";
import { personalizeOrder, topShare, SKEW_THRESHOLD } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";

/**
 * 모먼트 3 + 7.6: [모두의 결과 ↔ 너의 결과] 토글. (로컬 폴백 메이슨리)
 * 균등 격자 대신 메이슨리(전시 문법). 너의 결과에서만 최상위 매치를 전면폭 히어로로 = 개인화 시각화.
 */
export default function ResultsGrid({ query, you = false }: { query: string; you?: boolean }) {
  const { cardEverIssued, affinity } = useMoodStore();
  const [personal, setPersonal] = useState(you);

  const base = you ? [...ALL_MOOD_KEYS] : resolveMoods(query);
  const ordered = personal ? personalizeOrder(base, affinity) : base;
  const showToggle = you || (cardEverIssued && topShare(affinity) >= SKEW_THRESHOLD);

  // 히어로는 개인화 + 표본 충분할 때만
  const heroKey = personal && ordered.length > 3 ? ordered[0] : null;
  const restKeys = heroKey ? ordered.slice(1) : ordered;

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

      {personal && heroKey && MOODS[heroKey] && (
        <div className="mb-3">
          <MoodCard mood={MOODS[heroKey]} query={query} size="hero" />
        </div>
      )}

      <div style={{ columnCount: 2, columnGap: "12px" }}>
        {restKeys.map((key, idx) => {
          const mood = MOODS[key];
          if (!mood) return null;
          return (
            <div key={key} className="mb-3 break-inside-avoid">
              <MoodCard mood={mood} query={query} hint={!heroKey && idx === 0} />
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[12px] text-ink-faint">여기까지 · {ordered.length}개</p>
    </div>
  );
}
