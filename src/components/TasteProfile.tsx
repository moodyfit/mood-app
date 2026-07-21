"use client";

import { useMoodStore } from "@/lib/store";
import { computeTaste, TASTE_CARD_THRESHOLD } from "@/lib/taste";

/**
 * 컨셉 A 헤더 — 진화하는 추구미 카드 프로필.
 * 원칙 7(복구): 저장 0이면 결핍이 아니라 "채워질 당신의 공간"으로,
 * 임계치 전이면 "선명해지는 중"으로 — 절대 "부족함/진행률"로 보여주지 않는다.
 */
export default function TasteProfile() {
  const { saves, savedCount, openCard } = useMoodStore();

  // 저장 0 — 복구 프레이밍 빈 상태 (결핍 표현 금지)
  if (savedCount === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-line bg-paper-2 p-6 text-center">
        <div className="text-[15px] font-semibold">여기가 당신의 공간이에요</div>
        <div className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          마음에 드는 사진을 저장할수록
          <br />
          당신의 취향이 선명해져요.
        </div>
      </div>
    );
  }

  const { title, bars, rarityPct } = computeTaste(saves);
  const settled = savedCount >= TASTE_CARD_THRESHOLD;

  return (
    <div
      className="rounded-[18px] p-6 text-white"
      style={{ background: "linear-gradient(160deg,#1E1E20,#000000)" }}
    >
      <div className="text-[11px] font-semibold tracking-[2px] opacity-70">
        {settled ? "당신의 추구미" : "선명해지는 중"}
      </div>
      <div className="mt-2 text-[23px] font-extrabold leading-[1.25] tracking-[-0.5px]">
        {title}
      </div>
      <div className="mt-2 text-[12.5px] opacity-85">
        이 무드를 가진 사람, 전체의{" "}
        <span className="font-latin font-semibold">{rarityPct}%</span>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {bars.map((b) => (
          <div
            key={b.name}
            className="flex items-center gap-2.5 font-latin text-[11px] font-medium"
          >
            <span className="w-[84px] flex-shrink-0">{b.name}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${b.pct}%` }} />
            </div>
            <span>{b.pct}%</span>
          </div>
        ))}
      </div>

      {settled && (
        <button
          type="button"
          onClick={openCard}
          className="mt-4 w-full rounded-[10px] border border-white/25 py-2.5 text-[13px] font-semibold text-white/90 transition hover:bg-white/10"
        >
          추구미 카드 크게 보기
        </button>
      )}
    </div>
  );
}
