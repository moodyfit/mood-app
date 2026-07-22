"use client";

import Link from "next/link";
import { useMoodStore } from "@/lib/store";
import { computeTaste, TASTE_CARD_THRESHOLD } from "@/lib/taste";

/**
 * 컨셉 A 헤더 — 진화하는 추구미 카드 프로필.
 * 원칙 7(복구): 저장 0이면 결핍이 아니라 "채워질 당신의 공간"으로,
 * 임계치 전이면 "선명해지는 중"으로 — 절대 "부족함/진행률"로 보여주지 않는다.
 */
export default function TasteProfile() {
  const { affinity, savedCount, openCard } = useMoodStore();

  // 저장 0 — 복구 프레이밍 빈 상태 (결핍 표현 금지)
  if (savedCount === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-line bg-paper-2 p-6 text-center">
        <div className="text-[15px] font-semibold">여기가 나의 공간</div>
        <div className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          저장하면 여기 쌓여.
        </div>
        <Link
          href="/scan"
          className="mt-4 inline-block rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white"
        >
          3초 취향 스캔 →
        </Link>
      </div>
    );
  }

  const { title, bars, rarityPct } = computeTaste(affinity);
  const settled = savedCount >= TASTE_CARD_THRESHOLD;

  return (
    <div
      className="rounded-[18px] p-6 text-white"
      style={{ background: "linear-gradient(160deg,#1E1E20,#000000)" }}
    >
      <div className="text-[11px] font-semibold tracking-[2px] opacity-70">
        {settled ? "나의 추구미" : "선명해지는 중"}
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
        <div className="mt-4 flex gap-2">
          <Link
            href="/results?you=1"
            className="flex-1 rounded-[10px] bg-white py-2.5 text-center text-[13px] font-bold text-ink"
          >
            이 추구미로 다시 보기
          </Link>
          <button
            type="button"
            onClick={openCard}
            className="rounded-[10px] border border-white/25 px-3 py-2.5 text-[13px] font-semibold text-white/90 transition hover:bg-white/10"
          >
            카드
          </button>
        </div>
      )}
    </div>
  );
}
