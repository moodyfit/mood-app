"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { primaryPrice, formatPrice, formatMan } from "@/lib/products";
import { useMoodStore } from "@/lib/store";

/**
 * 1.5 통념 파괴 — '통째로 담기' (스펙: 상품 뷰 최하단 고정 버튼 1개).
 * 룩 전체를 판매처별로 묶어 한 번에. "마네킹째 주세요"의 온라인 복원.
 * TabBar(하단 고정) 위에 떠 있고, 탭하면 판매처별 구매 동선표를 바텀시트로 편다.
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
    <>
      {/* 최하단 고정 CTA — 상품 뷰 유일 버튼. TabBar 위에 뜬다 */}
      <div className="fixed bottom-[calc(62px+env(safe-area-inset-bottom))] left-1/2 z-40 w-full max-w-frame -translate-x-1/2 px-5">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between rounded-[12px] bg-ink px-4 py-3.5 text-white shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
        >
          <span className="text-[14px] font-semibold">이 느낌 통째로 담기</span>
          <span className="font-latin tnum text-[14px] font-semibold">{formatMan(total)}</span>
        </button>
      </div>

      {/* 판매처별 구매 동선표 — 바텀시트 */}
      {open && (
        <div
          className="fixed inset-0 z-[60] flex animate-fade items-end justify-center bg-black/45"
          onClick={() => setOpen(false)}
        >
          <div
            className="animate-sheet max-h-[78vh] w-full max-w-frame overflow-auto rounded-t-[20px] bg-white p-5 pb-9"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[16px] font-bold">
                이 느낌 통째로 ·{" "}
                <span className="font-latin tnum">{formatMan(total)}</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="text-xl text-ink-faint"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {[...groups.entries()].map(([src, items]) => {
                const sum = items.reduce((s, p) => s + primaryPrice(p), 0);
                return (
                  <div key={src} className="rounded-xl border border-line p-3">
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
            </div>

            <div className="mt-3 px-1 text-[11px] leading-relaxed text-ink-faint">
              판매처별로 나눠 담아도 결정은 한 번. 고르는 고통은 우리가 가져간다.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
