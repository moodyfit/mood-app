"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { primaryPrice, formatPrice, formatMan } from "@/lib/products";
import { useMoodStore } from "@/lib/store";

/**
 * 1.5 통념 파괴 — '통째로 담기'.
 * 룩 전체를 판매처별로 묶어 한 번에 담는다. 개별 상품 단위가 아니라 "그 사진 그 무드".
 * 결정 1회로 '고르는 고통'을 제거 = 오프라인 "마네킹째 주세요"의 온라인 복원.
 */
export default function WholeLook({ products }: { products: Product[] }) {
  const { showToast } = useMoodStore();
  const [open, setOpen] = useState(false);

  const total = products.reduce((s, p) => s + primaryPrice(p), 0);

  // 최저가 판매처별로 묶기
  const groups = new Map<string, Product[]>();
  for (const p of products) {
    const src = p.sources[0]?.name ?? "기타";
    groups.set(src, [...(groups.get(src) ?? []), p]);
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-[12px] bg-ink px-4 py-3.5 text-white"
      >
        <span className="text-[14px] font-semibold">이 룩 한 번에 담기</span>
        <span className="font-latin tnum text-[14px] font-semibold">{formatMan(total)}</span>
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {[...groups.entries()].map(([src, items]) => {
            const sum = items.reduce((s, p) => s + primaryPrice(p), 0);
            return (
              <div key={src} className="rounded-xl border border-line bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold">{src}</span>
                  <span className="font-latin tnum text-[13px] text-ink-soft">
                    {formatPrice(sum)}
                  </span>
                </div>
                <div className="mt-1.5 text-[12px] text-ink-soft">
                  {items.map((p) => p.name).join(" · ")}
                </div>
                <button
                  type="button"
                  onClick={() => showToast(`데모 · ${src} 장바구니로 연결`)}
                  className="mt-2.5 w-full rounded-[8px] border border-line py-2 text-[12px] font-medium text-ink transition hover:bg-paper-2"
                >
                  {src}에서 담기
                </button>
              </div>
            );
          })}
          <div className="px-1 text-[11px] leading-relaxed text-ink-faint">
            판매처별로 나눠 담아도 결정은 한 번. 고르는 고통은 우리가 가져간다.
          </div>
        </div>
      )}
    </div>
  );
}
