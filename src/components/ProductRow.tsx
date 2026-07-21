"use client";

import type { Product } from "@/lib/types";
import { formatPrice, primaryPrice } from "@/lib/products";
import { useMoodStore } from "@/lib/store";

export default function ProductRow({ product }: { product: Product }) {
  const { showToast } = useMoodStore();
  const cheapest = product.sources[0];

  function goTo(url?: string) {
    if (url) window.open(url, "_blank", "noopener");
    else showToast("데모 · 실제 서비스에선 판매처로 연결");
  }

  return (
    <div className="rounded-xl border border-line bg-white p-3">
      <button
        type="button"
        onClick={() => goTo(cheapest?.affiliateUrl)}
        className="flex w-full items-center gap-3.5 text-left"
      >
        <div
          className="h-[78px] w-[66px] flex-shrink-0 rounded-[10px]"
          style={
            product.imageUrl
              ? { backgroundImage: `url(${product.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: product.gradient }
          }
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{product.name}</div>
          <div className="mt-1.5 font-latin text-[15px] font-medium tracking-[-0.2px]">
            {formatPrice(primaryPrice(product))}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-faint">
            최저 · {cheapest?.name}
          </div>
        </div>
        <div className="text-xl text-ink-faint">›</div>
      </button>

      {/* 겹3② 판매처 횡단 가격 비교 (PCPartPicker 신뢰) */}
      {product.sources.length > 1 && (
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 border-t border-line pt-2.5">
          {product.sources.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => goTo(s.affiliateUrl)}
              className="flex items-baseline gap-1.5 text-[12px] text-ink-soft transition hover:text-ink"
            >
              <span>{s.name}</span>
              <span className="font-latin font-medium text-ink">
                {formatPrice(s.price)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
