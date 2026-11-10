"use client";

import MoodCard from "./MoodCard";
import SearchMemory from "./SearchMemory";
import { MOODS, ALL_MOOD_KEYS, resolveMoods } from "@/lib/moods";
import { personalizeOrder } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";
import GridTail from "./GridTail";

/**
 * (로컬 폴백 메이슨리, DB photos 없을 때) 균등 격자 대신 메이슨리(전시 문법). 10/28 회의록
 * "모두의 결과/너의 결과 토글 제거" — 검색 결과(you=false)는 항상 검색 순서, you=1만 항상
 * 개인화(코드리뷰 P0-1 — PhotoGrid.tsx와 동일 기준, 저장량으로 검색 순서를 덮지 않음).
 */
export default function ResultsGrid({ query, you = false }: { query: string; you?: boolean }) {
  const { affinity } = useMoodStore();
  const personal = you;

  const base = you ? [...ALL_MOOD_KEYS] : resolveMoods(query);
  const personalOrder = personalizeOrder(base, affinity);
  const ordered = personal ? personalOrder : base;

  // B6: 1번 카드는 검색/개인화 무관하게 항상 대형 고정 + 해설 펼침
  const heroKey = ordered.length > 3 ? ordered[0] : null;
  const restKeys = heroKey ? ordered.slice(1) : ordered;

  return (
    <div>
      <h2 className="mb-4 text-[20px] font-bold tracking-[-0.4px]">
        {you ? "너의 추구미로 골라봤어" : `‘${query}’ — 대충 쳐도 돼`}
      </h2>

      {!you && <SearchMemory query={query} />}

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
