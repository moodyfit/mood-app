"use client";

import { useState } from "react";
import type { Photo } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";
import { TASTE_CARD_THRESHOLD } from "@/lib/taste";
import { rankPersonalized, personalizationStrength, HERO_MIN_STRENGTH } from "@/lib/rank";
import PhotoCard from "./PhotoCard";
import GridTail from "./GridTail";
import ResultToggle from "./ResultToggle";

// 성능: 한 번에 90장(≈23MB) 로드 대신 12장씩 끊어서 — 초기 이미지 로드 급감
const INITIAL_VISIBLE = 12;
const LOAD_STEP = 12;

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
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const personal = override ?? (you || formed);

  function onToggle(v: boolean) {
    setOverride(v);
    setVisible(INITIAL_VISIBLE); // 순서 바뀌니 처음부터 다시 끊어 보여줌
  }

  const neutral = photos; // 모두의 결과 = 검색 관련도 순(중립)
  // 너의 결과 = 콜드 다양성 → 신호 쌓일수록 개인화(탐색 잔존). 개인화 엔진 공용.
  const personalOrder = rankPersonalized(photos, affinity);
  const strength = personalizationStrength(affinity);

  // 두 정렬에서 자리가 바뀐 장수 (모먼트3 "너를 배웠다")
  const changedCount = neutral.reduce(
    (n, p, i) => (personalOrder[i]?.id !== p.id ? n + 1 : n),
    0
  );

  const ordered = personal ? personalOrder : neutral;

  // B6: 1번 카드 대형 히어로 — 개인화 결과일 때만(콜드/중립은 히어로 없이 다양한 격자)
  const hero = personal && strength >= HERO_MIN_STRENGTH && ordered.length > 3 ? ordered[0] : null;
  const allRest = hero ? ordered.slice(1) : ordered;
  const rest = allRest.slice(0, visible);
  const remaining = allRest.length - rest.length;

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
        onChange={onToggle}
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

      {/* 유한 구경(③): 우선 더보기로 끊고(성능·리듬), 다 보면 재검색 유도 */}
      {remaining > 0 ? (
        <button
          type="button"
          onClick={() => setVisible((v) => v + LOAD_STEP)}
          className="mt-1 w-full rounded-2xl border border-line py-3 text-[13.5px] font-semibold text-ink-soft transition active:scale-[0.99]"
        >
          더보기 <span className="text-ink-faint">· {remaining}장 더</span>
        </button>
      ) : (
        <GridTail query={query} count={ordered.length} unit="장" />
      )}
    </div>
  );
}
