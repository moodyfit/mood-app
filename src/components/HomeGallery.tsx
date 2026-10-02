"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
// FEAT-010: 순환 재생이라 종료 조건이 없어 DOM이 무한히 쌓일 수 있음(Capacitor WebView 메모리 취약).
// 실사용 상한을 둔다 — rest 90장 기준 약 2.5바퀴. 이미지 볼륨이 늘면 이 상수를 올리거나 윈도잉으로 전환.
const MAX_VISIBLE = 216;

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
  // rankPersonalized는 O(n²) greedy MMR을 2회 호출 → visible 바뀔 때마다(스크롤 배치) 재계산되면 안 됨.
  // visible은 deps에서 제외(잘라내기는 아래 shown에서). photos/affinity/검색어가 바뀔 때만 다시 랭킹.
  const ordered = useMemo(
    () =>
      searching
        ? rankPhotos(photos, moodKeys ?? [])
        : blendFeed(
            rankPersonalized(photos, affinity, { explore: false }),
            rankPersonalized(photos, affinity, { explore: true })
          ),
    [photos, affinity, searching, moodKeys]
  );

  // 히어로(크기=적합도)는 검색 아니고 개인화가 유의미해진 뒤에만(랭킹 중립 원칙 — 검색 결과엔 히어로 없음)
  const heroPhoto = !searching && strength >= HERO_MIN_STRENGTH && ordered.length > 3 ? ordered[0] : null;
  const rest = heroPhoto ? ordered.slice(1) : ordered;
  // FEAT-010: 무한 스크롤 — rest 다 보여주면 처음부터 순환 재생(이미지 볼륨 늘어날 때까지 임시).
  // MAX_VISIBLE에서 잘라 DOM 누적 상한을 건다.
  const cappedVisible = Math.min(visible, MAX_VISIBLE);
  const shown =
    rest.length > 0 ? Array.from({ length: cappedVisible }, (_, i) => rest[i % rest.length]) : [];
  const hasMore = rest.length > 0 && cappedVisible < MAX_VISIBLE;

  // 무한 스크롤: sentinel이 화면에 들어오면 다음 배치 로드(FEAT-004와 동일 패턴)
  useEffect(() => {
    if (!hasMore) return;
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
    // visible을 deps에 포함 — 배치마다 observer를 재연결해 다음 교차를 다시 잡는다(스크롤을 멈춰도
    // 이어서 로드). searching/query도 필요: key 변경 시 sentinel DOM이 통째로 리마운트되므로
    // (remaining 상수화 이전, 이 deps 누락으로 검색 후 무한스크롤이 먹통이던 버그 — FEAT-006 Playwright 재현·수정).
  }, [visible, hasMore, searching, query]);

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
              배열을 직접 반으로 나눠 두 칸이 같이 자라게 함(FEAT-009 QA에서 발견).
              트레이드오프: i%2 교대는 카드 높이를 안 봄 → 세로 긴 카드가 한쪽에 몰리면 패킹 불균형.
              현재 cardRatio 범위가 0.78~0.9로 좁아 실측상 무시할 수준. 이미지 볼륨/비율 다양성이
              커지면 cardRatio로 예상 높이 누적해 짧은 컬럼에 넣는 방식으로 전환. */}
          <div className="flex gap-3">
            {[0, 1].map((col) => (
              <div key={col} className="flex flex-1 flex-col gap-3">
                {shown
                  .map((p, i) => ({ p, i }))
                  .filter(({ i }) => i % 2 === col)
                  .map(({ p, i }) => (
                    // FEAT-010: 무한반복이라 같은 사진 id가 여러 번 나올 수 있음 — 인덱스 합성 key 필요.
                    <div key={`${p.id}-${i}`} className="animate-rise">
                      <PhotoCard photo={p} query={query} hint={!heroPhoto && i === 0} />
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* 무한 스크롤: sentinel이 보이면 다음 배치 로드(FEAT-004와 동일 패턴) */}
          {hasMore && (
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
