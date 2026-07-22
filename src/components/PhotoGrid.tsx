"use client";

import { useState } from "react";
import type { Photo } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";
import { topShare, SKEW_THRESHOLD } from "@/lib/taste";
import PhotoCard from "./PhotoCard";
import GridTail from "./GridTail";

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
  const { affinity, cardEverIssued } = useMoodStore();
  const [personal, setPersonal] = useState(you);

  const showToggle = you || (cardEverIssued && topShare(affinity) >= SKEW_THRESHOLD);

  const ordered =
    personal
      ? [...photos]
          .map((p) => ({
            p,
            s: Object.entries(p.mood_vector ?? {}).reduce((a, [k, v]) => a + (affinity[k] ?? 0) * v, 0),
          }))
          .sort((a, b) => b.s - a.s)
          .map((x) => x.p)
      : photos;

  // 히어로는 개인화 + 표본이 충분할 때만(작은 결과가 통짜 히어로가 되지 않게)
  const hero = personal && ordered.length > 3 ? ordered[0] : null;
  const rest = hero ? ordered.slice(1) : ordered;

  return (
    <div>
      <h2 className="mb-4 text-[20px] font-bold tracking-[-0.4px]">
        {you ? "너의 추구미로 골라봤어" : `‘${query}’ 느낌`}
      </h2>

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

      {/* 개인화 전용 히어로: 너의 결과에서만 최상위 매치를 전면폭으로 = 크기로 적합도를 말한다 */}
      {personal && hero && (
        <div className="mb-3">
          <PhotoCard photo={hero} query={query} size="hero" />
        </div>
      )}

      {/* 메이슨리 = CSS 멀티컬럼(핀터레스트 배치). 세로 리듬은 사진 실비율에서 나옴 */}
      <div style={{ columnCount: 2, columnGap: "12px" }}>
        {rest.map((p, idx) => (
          <div key={p.id} className="mb-3 break-inside-avoid">
            <PhotoCard photo={p} query={query} hint={!hero && idx === 0} />
          </div>
        ))}
      </div>

      {/* 유한 구경(③) + v2.6 검색어 제안: 무한 스크롤 대신 재검색 유도 */}
      <GridTail query={query} count={ordered.length} unit="장" />
    </div>
  );
}
