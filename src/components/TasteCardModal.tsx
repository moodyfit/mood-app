"use client";

import { useRouter } from "next/navigation";
import { useMoodStore } from "@/lib/store";
import { computeTaste, aliasType } from "@/lib/taste";

export default function TasteCardModal() {
  const router = useRouter();
  const { cardOpen, closeCard, affinity } = useMoodStore();
  if (!cardOpen) return null;

  const { title, rarityPct } = computeTaste(affinity);
  const alias = aliasType(affinity);

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
        <div className="mt-2.5 text-[25px] font-extrabold leading-[1.24] tracking-[-0.6px]">
          {alias || title}
        </div>
        {alias && <div className="mt-1 text-[12.5px] opacity-55">{title}</div>}
        <div className="mt-3 text-[13px] leading-relaxed opacity-85">
          이 무드를 가진 사람, 전체의{" "}
          <span className="font-latin font-semibold">{rarityPct}%</span>
        </div>

        <div className="mt-5 border-t border-white/15 pt-4 text-[13px] leading-relaxed opacity-90">
          취향이 없는 게 아니라
          <br />
          이름을 몰랐을 뿐.
        </div>

        {/* 카드 = 종착지가 아니라 개인화 출입구 (원칙 1.7: 실용 요약 → 다음 행동) */}
        <button
          type="button"
          onClick={() => {
            closeCard();
            router.push("/results?you=1");
          }}
          className="mt-5 w-full rounded-[10px] bg-white py-3.5 text-sm font-bold text-ink"
        >
          이 추구미로 다시 보기
        </button>
      </div>
    </div>
  );
}
