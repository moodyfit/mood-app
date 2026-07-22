"use client";

import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import { personalizeOrder, computeTaste } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";
import MoodCard from "./MoodCard";

/**
 * 홈 상시 전시 (장소화 = "내 추구미만 모아두는 곳").
 * 들어오자마자 지금까지 종합된 취향을 메이슨리로 — 내 취향은 크게(히어로), 나머지는 작게.
 * 취향 신호가 없으면(신규) 6축을 중립 전시 → 항상 구경거리가 있어 재방문 유도(N3).
 * 크기 = 추구미 적합도(개인화 시각화), 인기 랭킹 아님(헌법).
 */
export default function HomeGallery() {
  // SSR/첫 페인트는 중립 전시(affinity 빈 값 → 히어로 없음), 하이드레이션 후 개인화로 승격.
  // 가드로 null 반환하지 않음 → 들어오자마자 항상 구경거리가 있게.
  const { affinity } = useMoodStore();

  const hasTaste = Object.keys(affinity).length > 0;
  const ordered = personalizeOrder([...ALL_MOOD_KEYS], affinity);
  const { title } = computeTaste(affinity);

  const heroKey = hasTaste && ordered.length > 3 ? ordered[0] : null;
  const restKeys = heroKey ? ordered.slice(1) : ordered;

  return (
    <div className="animate-fade px-5 pb-8">
      <div className="mb-3">
        <div className="text-[15px] font-bold tracking-[-0.3px]">
          {title ? `${title}, 지금까지` : "여러 느낌부터 둘러봐"}
        </div>
        {!hasTaste && (
          <div className="mt-0.5 text-[12.5px] text-ink-soft">
            취향이 없는 게 아니야, 이름을 몰랐을 뿐. 눈에 드는 것부터.
          </div>
        )}
      </div>

      {/* 내 취향 = 크게 (전면폭 히어로) */}
      {heroKey && MOODS[heroKey] && (
        <div className="mb-3 animate-rise">
          <MoodCard mood={MOODS[heroKey]} size="hero" />
        </div>
      )}

      {/* 나머지 = 작게, 벽돌형 메이슨리 */}
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
  );
}
