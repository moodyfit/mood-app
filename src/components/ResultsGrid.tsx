"use client";

import { useState } from "react";
import MoodCard from "./MoodCard";
import SearchMemory from "./SearchMemory";
import { MOODS, ALL_MOOD_KEYS, resolveMoods } from "@/lib/moods";
import { personalizeOrder, TASTE_CARD_THRESHOLD } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";
import GridTail from "./GridTail";
import ResultToggle from "./ResultToggle";

/**
 * 모먼트 3 + 7.6: [모두의 결과 ↔ 너의 결과] 토글. (로컬 폴백 메이슨리)
 * 균등 격자 대신 메이슨리(전시 문법). 너의 결과에서만 최상위 매치를 전면폭 히어로로 = 개인화 시각화.
 */
export default function ResultsGrid({ query, you = false }: { query: string; you?: boolean }) {
  const { affinity, savedCount } = useMoodStore();
  const formed = savedCount >= TASTE_CARD_THRESHOLD;
  const [override, setOverride] = useState<boolean | null>(null);
  const personal = override ?? (you || formed);

  const base = you ? [...ALL_MOOD_KEYS] : resolveMoods(query);
  const personalOrder = personalizeOrder(base, affinity);
  const changedCount = base.reduce((n, k, i) => (personalOrder[i] !== k ? n + 1 : n), 0);
  const ordered = personal ? personalOrder : base;

  // B6: 1번 카드는 모두/너의 무관하게 항상 대형 고정 + 해설 펼침
  const heroKey = ordered.length > 3 ? ordered[0] : null;
  const restKeys = heroKey ? ordered.slice(1) : ordered;

  return (
    <div>
      <h2 className="mb-4 text-[20px] font-bold tracking-[-0.4px]">
        {you ? "너의 추구미로 골라봤어" : `‘${query}’ — 대충 쳐도 돼`}
      </h2>

      {!you && <SearchMemory query={query} />}

      <ResultToggle
        personal={personal}
        formed={formed}
        savedCount={savedCount}
        changedCount={changedCount}
        onChange={setOverride}
      />

      {heroKey && MOODS[heroKey] && (
        <div className="mb-3 animate-rise">
          <MoodCard mood={MOODS[heroKey]} query={query} size="hero" />
        </div>
      )}

      <div style={{ columnCount: 2, columnGap: "12px" }}>
        {restKeys.map((key, idx) => {
          const mood = MOODS[key];
          if (!mood) return null;
          return (
            <div key={key} className="mb-3 break-inside-avoid animate-rise">
              <MoodCard mood={mood} query={query} hint={!heroKey && idx === 0} />
            </div>
          );
        })}
      </div>

      <GridTail query={query} count={ordered.length} unit="개" />
    </div>
  );
}
