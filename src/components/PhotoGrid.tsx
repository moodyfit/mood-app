"use client";

import { useState } from "react";
import type { Photo } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";
import { TASTE_CARD_THRESHOLD } from "@/lib/taste";
import PhotoCard from "./PhotoCard";
import GridTail from "./GridTail";
import ResultToggle from "./ResultToggle";

/**
 * DB photos 메이슨리 + 모먼트3 [모두의 결과 ↔ 너의 결과] 토글.
 * 균등 격자(커머스 문법=비교) 대신 메이슨리(전시 문법=갤러리/무드보드).
 * 크기 = 정보 채널: '너의 결과'에서만 최상위 매치를 전면폭 히어로로 = 개인화 시각화(인기 랭킹 아님).
 * '모두의 결과'는 히어로 없음 = 랭킹 중립(헌법). 토글 차이가 순서+크기로 두 배 선명.
 * 유한 구경(③): 무한 스크롤 아님 — 끝을 명시.
 */
export default function PhotoGrid({
  photos,
  query,
  you = false,
}: {
  photos: Photo[];
  query: string;
  you?: boolean;
}) {
  const { affinity, savedCount } = useMoodStore();
  // 프로필 형성 = 저장 3장 이상. 형성되면 기본값이 '너의 결과'.
  const formed = savedCount >= TASTE_CARD_THRESHOLD;
  const [override, setOverride] = useState<boolean | null>(null);
  const personal = override ?? (you || formed);

  const neutral = photos;
  const personalOrder = [...photos]
    .map((p) => ({
      p,
      s: Object.entries(p.mood_vector ?? {}).reduce((a, [k, v]) => a + (affinity[k] ?? 0) * v, 0),
    }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);

  // 두 정렬에서 자리가 바뀐 장수 (모먼트3 "너를 배웠다")
  const changedCount = neutral.reduce(
    (n, p, i) => (personalOrder[i]?.id !== p.id ? n + 1 : n),
    0
  );

  const ordered = personal ? personalOrder : neutral;

  // B6: 1번 카드는 모두/너의 무관하게 항상 대형 고정 + 해설 펼침(표본 충분할 때)
  const hero = ordered.length > 3 ? ordered[0] : null;
  const rest = hero ? ordered.slice(1) : ordered;

  return (
    <div>
      <h2 className="mb-4 text-[20px] font-bold tracking-[-0.4px]">
        {you ? "너의 추구미로 골라봤어" : `‘${query}’ — 대충 쳐도 돼`}
      </h2>

      <ResultToggle
        personal={personal}
        formed={formed}
        savedCount={savedCount}
        changedCount={changedCount}
        onChange={setOverride}
      />

      {/* 개인화 전용 히어로: 너의 결과에서만 최상위 매치를 전면폭으로 = 크기로 적합도를 말한다 */}
      {hero && (
        <div className="mb-3 animate-rise">
          <PhotoCard photo={hero} query={query} size="hero" />
        </div>
      )}

      {/* 메이슨리 = CSS 멀티컬럼(핀터레스트 배치). 세로 리듬은 사진 실비율에서 나옴 */}
      <div style={{ columnCount: 2, columnGap: "12px" }}>
        {rest.map((p, idx) => (
          <div key={p.id} className="mb-3 break-inside-avoid animate-rise">
            <PhotoCard photo={p} query={query} hint={!hero && idx === 0} />
          </div>
        ))}
      </div>

      {/* 유한 구경(③) + v2.6 검색어 제안: 무한 스크롤 대신 재검색 유도 */}
      <GridTail query={query} count={ordered.length} unit="장" />
    </div>
  );
}
