"use client";

import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/products";
import { useMoodStore } from "@/lib/store";

export default function ProductRow({ product }: { product: Product }) {
  const { showToast } = useMoodStore();

  function handleClick() {
    if (product.affiliateUrl) {
      window.open(product.affiliateUrl, "_blank", "noopener");
    } else {
      showToast("데모 · 실제 서비스에선 판매처로 연결됩니다");
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center gap-3.5 rounded-xl border border-line bg-white p-3 text-left transition hover:bg-paper-2"
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
        <div className="mt-2 font-latin text-[15px] font-medium tracking-[-0.2px]">
          {formatPrice(product.price)}
        </div>
      </div>
      <div className="text-xl text-ink-faint">›</div>
    </button>
  );
}
