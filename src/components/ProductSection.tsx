"use client";

import { useState } from "react";
import type { Mood, PriceTier } from "@/lib/types";
import { useMoodStore } from "@/lib/store";
import {
  BUDGETS,
  buildLook,
  slotHasTier,
  tierForBudget,
  hasDial,
  primaryPrice,
  formatMan,
} from "@/lib/products";
import ProductRow from "./ProductRow";

/**
 * #8 예산 다이얼 — "같은 느낌, 다른 완성".
 * 슬롯별 기본템(미드)에서 예산 프리셋(다이얼)으로 같은 무드의 해당 티어로 교체(양방향).
 * 티어 대안 없는 슬롯은 기본템 유지 + "이 슬롯은 그대로가 최선". 슬롯별 개별 애니메이션.
 * 취향(무드)은 그대로, 실행(예산)만 유저 것 — 제0조.
 */
export default function ProductSection({ mood }: { mood: Mood }) {
  const { isSaved } = useMoodStore();
  const saved = isSaved(mood.key);
  const dial = hasDial(mood.key);

  const [tier, setTier] = useState<PriceTier>("미드"); // 기본 = 미드 기본템
  const look = buildLook(mood.key, tier);
  const total = look.reduce((s, p) => s + primaryPrice(p), 0);

  const reason = saved
    ? "저장한 무드와 같은 결의 아이템"
    : "지금 보는 무드와 같은 결의 아이템";

  return (
    <div className="mt-[22px]">
      {/* 겹3① 추천 이유 */}
      <div className="flex items-center gap-3 rounded-xl bg-paper-2 p-3">
        <div
          className="h-11 w-11 flex-shrink-0 rounded-lg"
          style={
            mood.imageUrl
              ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: mood.gradient }
          }
        />
        <div className="min-w-0">
          <div className="text-[11px] text-ink-faint">이게 뜬 이유</div>
          <div className="mt-0.5 text-[13px] leading-snug text-ink-soft">{reason}</div>
        </div>
      </div>

      {/* 예산 다이얼 */}
      {dial && (
        <div className="mt-5">
          <div className="text-[13px] font-semibold">같은 느낌, 다른 완성</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {BUDGETS.map((b) => {
              const t = tierForBudget(b.won);
              const active = t === tier;
              return (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] transition ${
                    active ? "border-accent bg-accent text-white" : "border-line text-ink-soft hover:border-accent"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
          <div className="mt-2.5 text-[13px] text-ink-soft">
            이 느낌 완성 ·{" "}
            <span className="font-latin tnum font-semibold text-ink">{formatMan(total)}</span>
          </div>
        </div>
      )}

      {/* 슬롯 — 교체된 슬롯만 개별 애니메이션(id에 티어 반영), 전체 리로드 없음 */}
      <div className="mt-3 flex flex-col gap-2.5">
        {look.map((p, i) => (
          <div key={p.id} className="animate-rise">
            <ProductRow product={p} />
            {dial && tier !== "미드" && !slotHasTier(i, tier) && (
              <div className="mt-1 px-1 text-[11.5px] text-ink-faint">이 슬롯은 그대로가 최선</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
