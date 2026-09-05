"use client";

import { useEffect, useRef, useState } from "react";
import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import { personalizeOrder } from "@/lib/taste";
import { rankPersonalized, personalizationStrength, HERO_MIN_STRENGTH } from "@/lib/rank";
import { useMoodStore } from "@/lib/store";
import type { Photo } from "@/lib/photos";
import { rankPhotos } from "@/lib/photos";
import MoodCard from "./MoodCard";
import PhotoCard from "./PhotoCard";

/**
 * 홈 상시 전시 (장소화 = "내 추구미만 모아두는 곳").
 * photos 있으면 실제 사진 볼륨(90장) 메이슨리 — 핀터레스트식 벽돌 전시(내 취향 크게, 나머지 작게).
 * 없으면 6무드 커버로 폴백(로컬/빈 DB).
 * 크기 = 추구미 적합도(개인화 시각화), 인기 랭킹 아님(헌법).
 * FEAT-006(2026-08-19): 무한 스크롤. moodKeys/query 있으면 검색 결과 모드(rankPhotos 관련도순).
 * FEAT-009(2026-08-25 회의): [나의느낌↔새로운느낌] 토글 제거 — 항상 개인화7:탐색3으로 자동 블렌드.
 */
const INITIAL_VISIBLE = 12;
const LOAD_STEP = 12;
const PERSONAL_BATCH = 7;
const EXPLORE_BATCH = 3;

/** personalOrder·exploreOrder를 7:3 블록 단위로 번갈아 뽑아 하나로 합침(중복 스킵). */
function blendFeed(personalOrder: Photo[], exploreOrder: Photo[]): Photo[] {
  const used = new Set<string>();
  const out: Photo[] = [];
  let pi = 0;
  let ei = 0;
  const total = personalOrder.length;
  while (out.length < total && (pi < personalOrder.length || ei < exploreOrder.length)) {
    for (let n = 0; n < PERSONAL_BATCH && pi < personalOrder.length; pi++) {
      const p = personalOrder[pi];
      if (used.has(p.id)) continue;
      used.add(p.id);
      out.push(p);
      n++;
    }
    for (let n = 0; n < EXPLORE_BATCH && ei < exploreOrder.length; ei++) {
      const p = exploreOrder[ei];
      if (used.has(p.id)) continue;
      used.add(p.id);
      out.push(p);
      n++;
    }
  }
  return out;
}

export default function HomeGallery({
  photos = [],
  moodKeys,
  query,
}: {
  photos?: Photo[];
  /** FEAT-006: 검색 결과 모드 — 있으면 이 순서로, 없으면 기존 개인화 피드 */
  moodKeys?: string[];
  query?: string;
}) {
  const { affinity } = useMoodStore();
  const searching = Boolean(moodKeys && moodKeys.length > 0);

  const hasTaste = Object.keys(affinity).length > 0;
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // 검색 모드로 전환/해제되거나 검색어가 바뀌면 처음부터 다시 끊어 보여줌
  useEffect(() => {
    setVisible(INITIAL_VISIBLE);
  }, [searching, query]);

  // FEAT-009: 토글 없이 항상 개인화(7):탐색(3) 자동 블렌드. 검색 모드면 관련도 순(rankPhotos, 중립) 그대로.
  const strength = personalizationStrength(affinity);
  const ordered = searching
    ? rankPhotos(photos, moodKeys ?? [])
    : blendFeed(
        rankPersonalized(photos, affinity, { explore: false }),
        rankPersonalized(photos, affinity, { explore: true })
      );

  // 히어로(크기=적합도)는 검색 아니고 개인화가 유의미해진 뒤에만(랭킹 중립 원칙 — 검색 결과엔 히어로 없음)
  const heroPhoto = !searching && strength >= HERO_MIN_STRENGTH && ordered.length > 3 ? ordered[0] : null;
  const rest = heroPhoto ? ordered.slice(1) : ordered;
  const shown = rest.slice(0, visible);
  const remaining = rest.length - shown.length;

  // 무한 스크롤: sentinel이 화면에 들어오면 다음 배치 로드(FEAT-004와 동일 패턴)
  useEffect(() => {
    if (remaining <= 0) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible((v) => v + LOAD_STEP);
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
    // searching/query 전부 deps 필요 — 이 값들이 바뀌면 아래 key={...}로 sentinel DOM이
    // 통째로 리마운트되는데, remaining값이 우연히 같으면 effect가 재실행 안 돼서 끊어진
    // 옛 DOM 노드를 계속 관찰하는 버그가 있었음(실측·Playwright로 재현·수정 확인, FEAT-006).
  }, [remaining, searching, query]);

  const header = searching ? (
    <div className="mb-3">
      <div className="text-[15px] font-bold tracking-[-0.3px]">‘{query}’ — 대충 쳐도 돼</div>
    </div>
  ) : (
    <>
      <div className="mb-3">
        <div className="text-[15px] font-bold tracking-[-0.3px]">
          {hasTaste ? "네가 좋아한 느낌, 지금까지" : "오늘의 한 장"}
        </div>
        {!hasTaste && (
          <div className="mt-0.5 text-[12.5px] text-ink-soft">
            취향이 없는 게 아니야, 이름을 몰랐을 뿐. 눈에 드는 것부터.
          </div>
        )}
      </div>
    </>
  );

  // ── 사진 볼륨 전시 (기본 경로) ──────────────────────────────
  if (photos.length > 0) {
    return (
      <div className="animate-fade px-5 pb-8">
        {header}
        <div key={searching ? `q:${query}` : "feed"} className="animate-fade">
          {heroPhoto && (
            <div className="mb-3 animate-rise">
              <PhotoCard photo={heroPhoto} size="hero" />
            </div>
          )}
          {/* CSS columnCount는 높이 기준으로 왼쪽부터 꽉 채워서 좌우가 따로 자라 보임(비대칭) —
              배열을 직접 반으로 나눠 두 칸이 같이 자라게 함(FEAT-009 QA에서 발견). */}
          <div className="flex gap-3">
            {[0, 1].map((col) => (
              <div key={col} className="flex flex-1 flex-col gap-3">
                {shown
                  .map((p, i) => ({ p, i }))
                  .filter(({ i }) => i % 2 === col)
                  .map(({ p, i }) => (
                    <div key={p.id} className="animate-rise">
                      <PhotoCard photo={p} query={query} hint={!heroPhoto && i === 0} />
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* 무한 스크롤: sentinel이 보이면 다음 배치 로드(FEAT-004와 동일 패턴) */}
          {remaining > 0 && (
            <div ref={sentinelRef} className="flex justify-center py-6">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 폴백: 6무드 커버 (빈 DB/로컬) — 토글 제거로 항상 개인화 순 ──────────
  const orderedKeys = personalizeOrder([...ALL_MOOD_KEYS], affinity);
  const heroKey = hasTaste && orderedKeys.length > 3 ? orderedKeys[0] : null;
  const restKeys = heroKey ? orderedKeys.slice(1) : orderedKeys;

  return (
    <div className="animate-fade px-5 pb-8">
      {header}
      <div className="animate-fade">
        {heroKey && MOODS[heroKey] && (
          <div className="mb-3 animate-rise">
            <MoodCard mood={MOODS[heroKey]} size="hero" />
          </div>
        )}
        <div className="flex gap-3">
          {[0, 1].map((col) => (
            <div key={col} className="flex flex-1 flex-col gap-3">
              {restKeys
                .map((k, i) => ({ k, i }))
                .filter(({ i }) => i % 2 === col)
                .map(({ k, i }) =>
                  MOODS[k] ? (
                    <div key={k} className="animate-rise">
                      <MoodCard mood={MOODS[k]} hint={!heroKey && i === 0} />
                    </div>
                  ) : null,
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
