"use client";

import { useState } from "react";
import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import { personalizeOrder, TASTE_CARD_THRESHOLD } from "@/lib/taste";
import { rankPersonalized, personalizationStrength, HERO_MIN_STRENGTH } from "@/lib/rank";
import { useMoodStore } from "@/lib/store";
import type { Photo } from "@/lib/photos";
import MoodCard from "./MoodCard";
import PhotoCard from "./PhotoCard";
import ResultToggle from "./ResultToggle";

/**
 * 홈 상시 전시 (장소화 = "내 추구미만 모아두는 곳") + [내 느낌 ↔ 새로운 느낌] 토글.
 * photos 있으면 실제 사진 볼륨(90장) 메이슨리 — 핀터레스트식 벽돌 전시(내 취향 크게, 나머지 작게).
 * 없으면 6무드 커버로 폴백(로컬/빈 DB).
 * 크기 = 추구미 적합도(개인화 시각화), 인기 랭킹 아님(헌법). 유한 구경(무한 스크롤 금지).
 */
// 더보기 = 유한 구경(무한 스크롤 금지). 처음엔 한 화면 분량만, 눌러서 더.
const INITIAL_VISIBLE = 12;
const LOAD_STEP = 12;

export default function HomeGallery({ photos = [] }: { photos?: Photo[] }) {
  const { affinity, savedCount, recordSearch } = useMoodStore();

  const hasTaste = Object.keys(affinity).length > 0;
  const formed = savedCount >= TASTE_CARD_THRESHOLD;
  const [override, setOverride] = useState<boolean | null>(null);
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  // 기본 = 메인 피드(콜드는 flagship 다양성 → 신호 쌓이면 개인화). '새로운 느낌'은 명시 토글 시에만 explore.
  const personal = override ?? true;

  function onToggle(p: boolean) {
    setOverride(p);
    setVisible(INITIAL_VISIBLE); // 순서가 바뀌니 다시 처음부터 끊어 보여줌
    // user_actions: '새로운 느낌' 탭 = 탐색 의지 신호 (로컬 로깅, DB 연동 시 동일)
    if (!p) recordSearch("탐색:새로운느낌");
  }

  const header = (
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
        invite="3장만 저장하면 네 느낌이 생겨"
        rightNote=""
        leftNote="안 가본 느낌들이야"
      />
    </>
  );

  // ── 사진 볼륨 전시 (기본 경로) ──────────────────────────────
  if (photos.length > 0) {
    // 콜드=최대 다양성 → 신호 쌓일수록 매끄럽게 개인화(탐색 항상 잔존). 새로운 느낌=안 가본 결 우선.
    const strength = personalizationStrength(affinity);
    const ordered = rankPersonalized(photos, affinity, { explore: !personal });

    // 히어로(크기=적합도)는 '내 느낌' + 개인화가 유의미해진 뒤에만(콜드엔 다양한 격자, 히어로 없음)
    const heroPhoto =
      personal && strength >= HERO_MIN_STRENGTH && ordered.length > 3 ? ordered[0] : null;
    const rest = heroPhoto ? ordered.slice(1) : ordered;
    const shown = rest.slice(0, visible);
    const remaining = rest.length - shown.length;

    return (
      <div className="animate-fade px-5 pb-8">
        {header}
        <div key={personal ? "me" : "new"} className="animate-fade">
          {heroPhoto && (
            <div className="mb-3 animate-rise">
              <PhotoCard photo={heroPhoto} size="hero" />
            </div>
          )}
          <div style={{ columnCount: 2, columnGap: "12px" }}>
            {shown.map((p, i) => (
              <div key={p.id} className="mb-3 break-inside-avoid animate-rise">
                <PhotoCard photo={p} hint={!heroPhoto && i === 0} />
              </div>
            ))}
          </div>

          {/* 유한 구경: 무한 스크롤 대신 명시적 더보기. 다 보면 좁히기(검색)로 유도 */}
          {remaining > 0 ? (
            <button
              type="button"
              onClick={() => setVisible((v) => v + LOAD_STEP)}
              className="mt-1 w-full rounded-2xl border border-line py-3 text-[13.5px] font-semibold text-ink-soft transition active:scale-[0.99]"
            >
              더보기 <span className="text-ink-faint">· {remaining}장 더</span>
            </button>
          ) : (
            rest.length > INITIAL_VISIBLE && (
              <div className="mt-2 text-center text-[12.5px] text-ink-faint">
                여기까지 — 위에서 검색하면 네 느낌으로 좁혀줄게
              </div>
            )
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
