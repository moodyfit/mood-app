"use client";

import { useState } from "react";
import type { Mood, Product } from "@/lib/types";
import { useMoodStore } from "@/lib/store";
import { BUDGETS, fitLookToBudget, formatMan } from "@/lib/products";
import ProductRow from "./ProductRow";

/**
 * 겹3① 추천 이유 + 7.10 본진 '자연 번역기'.
 * · 추천 이유: 이 상품이 뜬 근거를 투명하게 → "내 취향 소비" 프레이밍.
 * · 자연 번역기: 같은 무드를 내 예산 안에서 재구성. "같은 느낌, 다른 예산."
 *   취향(무드)은 그대로, 실행(예산)만 유저 것 — 제0조.
 */
export default function ProductSection({
  mood,
  products,
}: {
  mood: Mood;
  products: Product[];
}) {
  const { isSaved } = useMoodStore();
  const saved = isSaved(mood.key);

  // 기본 '상관없음'(전체) = won null
  const [budget, setBudget] = useState<number | null>(null);
  const fit = fitLookToBudget(mood.key, budget);
  const trimmed = budget != null && fit.dropped.length > 0;

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

      {/* 7.10 자연 번역기 */}
      <div className="mt-5">
        <div className="text-[13px] font-semibold">내 예산으로 이 느낌</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {BUDGETS.map((b) => {
            const active = b.won === budget;
            return (
              <button
                key={b.label}
                type="button"
                onClick={() => setBudget(b.won)}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] transition ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-line text-ink-soft hover:border-accent"
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2.5 text-[13px] text-ink-soft">
          이 느낌 완성 ·{" "}
          <span className="font-latin font-semibold text-ink">{formatMan(fit.total)}</span>
          {trimmed && (
            <span className="text-ink-faint">
              {" "}· {fit.dropped.map((d) => d.name).join(", ")} 빼고 이 느낌의 {fit.coverage}%
            </span>
          )}
        </div>
      </div>

      {/* 상품 — 예산 밖은 흐리게 */}
      <div className="mt-3 flex flex-col gap-2.5">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} muted={!fit.includedIds.has(p.id)} />
        ))}
      </div>
    </div>
  );
}
