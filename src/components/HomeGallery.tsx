"use client";

import { useState } from "react";
import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import { personalizeOrder, TASTE_CARD_THRESHOLD } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";
import MoodCard from "./MoodCard";
import ResultToggle from "./ResultToggle";

/**
 * 홈 상시 전시 (장소화 = "내 추구미만 모아두는 곳") + [내 느낌 ↔ 새로운 느낌] 토글.
 * 내 느낌: 추구미 가중 피드(내 취향 크게). 새로운 느낌: 프로필 하위/미노출 축 위주(인기·최신 금지).
 * 크기 = 추구미 적합도(개인화 시각화), 인기 랭킹 아님(헌법).
 */
export default function HomeGallery() {
  const { affinity, savedCount, recordSearch } = useMoodStore();

  const hasTaste = Object.keys(affinity).length > 0;
  const formed = savedCount >= TASTE_CARD_THRESHOLD;
  const [override, setOverride] = useState<boolean | null>(null);
  const personal = override ?? formed; // 내 느낌(기본, 형성 시) ↔ 새로운 느낌

  const personalOrder = personalizeOrder([...ALL_MOOD_KEYS], affinity);
  // 새로운 느낌 = 프로필 하위 축 먼저(인기·최신 아님 — affinity 오름차순). '아직 안 가본 곳'과 축 일치
  const newOrder = [...ALL_MOOD_KEYS].sort((a, b) => (affinity[a] ?? 0) - (affinity[b] ?? 0));
  const ordered = personal ? personalOrder : newOrder;

  // 히어로(크기=적합도)는 '내 느낌'에서만. '새로운 느낌'은 탐색이라 랭크 히어로 없음
  const heroKey = personal && hasTaste && ordered.length > 3 ? ordered[0] : null;
  const restKeys = heroKey ? ordered.slice(1) : ordered;

  function onToggle(p: boolean) {
    setOverride(p);
    // user_actions: '새로운 느낌' 탭 = 탐색 의지 신호 (로컬 로깅, DB 연동 시 동일)
    if (!p) recordSearch("탐색:새로운느낌");
  }

  return (
    <div className="animate-fade px-5 pb-8">
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
        labels={["새로운 느낌", "내 느낌"]}
        invite="3장만 저장하면 네 느낌이 생겨"
        rightNote=""
        leftNote="안 가본 느낌들이야"
      />

      {/* 크로스페이드: 모드 전환 시 remount로 페이드 재생 */}
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
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
