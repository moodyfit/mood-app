"use client";

import { useMoodStore } from "@/lib/store";
import { computeTaste } from "@/lib/taste";

export default function TasteCardModal() {
  const { cardOpen, closeCard, affinity } = useMoodStore();
  if (!cardOpen) return null;

  const { title, bars, rarityPct } = computeTaste(affinity);

  return (
    <div
      className="fixed inset-0 z-[80] flex animate-fade items-center justify-center bg-black/55 p-6 backdrop-blur-sm"
      onClick={closeCard}
    >
      <div
        className="w-full max-w-[340px] animate-pop rounded-[22px] p-[30px_26px] text-white shadow-[0_24px_70px_rgba(14,14,16,0.4)]"
        style={{ background: "linear-gradient(160deg,#1E1E20,#000000)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[11px] font-semibold tracking-[2px] opacity-70">
          나의 추구미
        </div>
        <div className="mt-2.5 text-[26px] font-extrabold leading-[1.28] tracking-[-0.6px]">
          {title}
        </div>
        <div className="mt-3 text-[13px] leading-relaxed opacity-85">
          이 무드를 가진 사람, 전체의{" "}
          <span className="font-latin font-semibold">{rarityPct}%</span>
        </div>

        <div className="mt-[22px] flex flex-col gap-[11px]">
          {bars.map((b) => (
            <div
              key={b.name}
              className="flex items-center gap-2.5 font-latin text-xs font-medium"
            >
              <span className="w-[92px] flex-shrink-0">{b.name}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${b.pct}%` }}
                />
              </div>
              <span>{b.pct}%</span>
            </div>
          ))}
        </div>

        <div className="mt-5 border-t border-white/15 pt-4 text-[13px] leading-relaxed opacity-90">
          취향이 없는 게 아니라
          <br />
          이름을 몰랐을 뿐.
        </div>

        <button
          type="button"
          onClick={closeCard}
          className="mt-5 w-full rounded-[10px] bg-white py-3.5 text-sm font-bold text-ink"
        >
          계속 보기
        </button>
      </div>
    </div>
  );
}
