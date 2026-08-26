"use client";

import { useEffect, useRef, useState } from "react";
import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import { personalizeOrder, TASTE_CARD_THRESHOLD } from "@/lib/taste";
import { rankPersonalized, personalizationStrength, HERO_MIN_STRENGTH } from "@/lib/rank";
import { useMoodStore } from "@/lib/store";
import type { Photo } from "@/lib/photos";
import { rankPhotos } from "@/lib/photos";
import MoodCard from "./MoodCard";
import PhotoCard from "./PhotoCard";
import ResultToggle from "./ResultToggle";

/**
 * 홈 상시 전시 (장소화 = "내 추구미만 모아두는 곳") + [내 느낌 ↔ 새로운 느낌] 토글.
 * photos 있으면 실제 사진 볼륨(90장) 메이슨리 — 핀터레스트식 벽돌 전시(내 취향 크게, 나머지 작게).
 * 없으면 6무드 커버로 폴백(로컬/빈 DB).
 * 크기 = 추구미 적합도(개인화 시각화), 인기 랭킹 아님(헌법).
 * FEAT-006(2026-08-19 회의): 무한 스크롤로 전환, moodKeys/query 있으면 검색 결과 모드
 * (rankPhotos 관련도 정렬, 개인화 토글 숨김) — 페이지 이동 없이 이 그리드가 그대로 바뀜.
 */
const INITIAL_VISIBLE = 12;
const LOAD_STEP = 12;

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
  const { affinity, savedCount, recordSearch } = useMoodStore();
  const searching = Boolean(moodKeys && moodKeys.length > 0);

  const hasTaste = Object.keys(affinity).length > 0;
  const formed = savedCount >= TASTE_CARD_THRESHOLD;
  const [override, setOverride] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  // 기본 = 메인 피드(콜드는 flagship 다양성 → 신호 쌓이면 개인화). '새로운 느낌'은 명시 토글 시에만 explore.
  const personal = override ?? true;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  function onToggle(p: boolean) {
    setOverride(p);
    setVisible(INITIAL_VISIBLE); // 순서가 바뀌니 다시 처음부터 끊어 보여줌
    // user_actions: '새로운 느낌' 탭 = 탐색 의지 신호 (로컬 로깅, DB 연동 시 동일)
    if (!p) recordSearch("탐색:새로운느낌");
  }

  // 검색 모드로 전환/해제되거나 검색어가 바뀌면 처음부터 다시 끊어 보여줌
  useEffect(() => {
    setVisible(INITIAL_VISIBLE);
  }, [searching, query]);

  // 콜드=최대 다양성 → 신호 쌓일수록 매끄럽게 개인화(탐색 항상 잔존). 새로운 느낌=안 가본 결 우선.
  // FEAT-006: 검색 모드면 관련도 순(rankPhotos, 중립) — 개인화 랭킹과 안 섞음.
  const strength = personalizationStrength(affinity);
  const ordered = searching ? rankPhotos(photos, moodKeys ?? []) : rankPersonalized(photos, affinity, { explore: !personal });

  // 히어로(크기=적합도)는 검색 아닌 '내 느낌' + 개인화가 유의미해진 뒤에만(랭킹 중립 원칙 — 검색 결과엔 히어로 없음)
  const heroPhoto =
    !searching && personal && strength >= HERO_MIN_STRENGTH && ordered.length > 3 ? ordered[0] : null;
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
    // searching/query/personal 전부 deps 필요 — 이 값들이 바뀌면 아래 key={...}로 sentinel
    // DOM이 통째로 리마운트되는데, remaining값이 우연히 같으면(예: 매번 첫 배치는 78 근처)
    // effect가 재실행 안 돼서 끊어진 옛 DOM 노드를 계속 관찰하는 버그가 있었음
    // (실측: 검색 후 무한스크롤 완전 먹통 — Playwright로 재현·수정 확인).
  }, [remaining, searching, query, personal]);

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

      <ResultToggle
        personal={personal}
        formed={formed}
        savedCount={savedCount}
        changedCount={0}
        onChange={onToggle}
        labels={["새로운 느낌", "나의 느낌"]}
        invite="3장만 담으면 네 느낌이 생겨"
        rightNote=""
        leftNote="안 가본 느낌들이야"
      />
    </>
  );

  // ── 사진 볼륨 전시 (기본 경로) ──────────────────────────────
  if (photos.length > 0) {
    return (
      <div className="animate-fade px-5 pb-8">
        {header}
        <div key={searching ? `q:${query}` : personal ? "me" : "new"} className="animate-fade">
          {heroPhoto && (
            <div className="mb-3 animate-rise">
              <PhotoCard photo={heroPhoto} size="hero" />
            </div>
          )}
          <div style={{ columnCount: 2, columnGap: "12px" }}>
            {shown.map((p, i) => (
              <div key={p.id} className="mb-3 break-inside-avoid animate-rise">
                <PhotoCard photo={p} query={query} hint={!heroPhoto && i === 0} />
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

  // ── 폴백: 6무드 커버 (빈 DB/로컬) ──────────────────────────
  const personalKeys = personalizeOrder([...ALL_MOOD_KEYS], affinity);
  const newKeys = [...ALL_MOOD_KEYS].sort(
    (a, b) => (affinity[a] ?? 0) - (affinity[b] ?? 0),
  );
  const orderedKeys = personal ? personalKeys : newKeys;
  const heroKey =
    personal && hasTaste && orderedKeys.length > 3 ? orderedKeys[0] : null;
  const restKeys = heroKey ? orderedKeys.slice(1) : orderedKeys;

  return (
    <div className="animate-fade px-5 pb-8">
      {header}
      <div key={personal ? "me" : "new"} className="animate-fade">
        {heroKey && MOODS[heroKey] && (
          <div className="mb-3 animate-rise">
            <MoodCard mood={MOODS[heroKey]} size="hero" />
          </div>
        )}
        <div style={{ columnCount: 2, columnGap: "12px" }}>
          {restKeys.map((k, i) =>
            MOODS[k] ? (
              <div key={k} className="mb-3 break-inside-avoid animate-rise">
                <MoodCard mood={MOODS[k]} hint={!heroKey && i === 0} />
              </div>
            ) : null,
          )}
        </div>
      </div>
    </div>
  );
}
