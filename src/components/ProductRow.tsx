"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { formatPrice, primaryPrice } from "@/lib/products";
import { useMoodStore } from "@/lib/store";

export default function ProductRow({
  product,
  muted = false,
}: {
  product: Product;
  muted?: boolean;
}) {
  const { showToast, isOwned, toggleOwned } = useMoodStore();
  const cheapest = product.sources[0];
  const owned = isOwned(product.id);

  // "샀어?" — 외부 링크로 나갔다 돌아오면 이 카드에 인라인 1줄(팝업 금지)
  const [awaiting, setAwaiting] = useState(false);
  const [askBuy, setAskBuy] = useState(false);

  useEffect(() => {
    function onVis() {
      if (document.visibilityState === "visible" && awaiting) {
        setAwaiting(false);
        if (!isOwned(product.id)) setAskBuy(true);
      }
    }
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [awaiting, product.id, isOwned]);

  function goTo(url?: string) {
    if (url) {
      window.open(url, "_blank", "noopener");
      setAwaiting(true); // 복귀 감지 준비
    } else {
      showToast("데모 · 실제 서비스에선 판매처로 연결");
    }
  }

  return (
    <div
      className={`rounded-xl border border-line bg-white p-3 transition ${
        muted ? "opacity-45" : ""
      }`}
    >
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
          <div className="flex items-center gap-1.5 text-sm font-medium">
            {product.name}
            {muted && (
              <span className="rounded-full bg-paper-3 px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
                예산 밖
              </span>
            )}
          </div>
          <div className="mt-1.5 font-latin tnum text-[15px] font-medium tracking-[-0.2px]">
            {formatPrice(primaryPrice(product))}
          </div>
          <div className="mt-0.5 text-[11px] text-ink-faint">
            최저 · {cheapest?.name}
          </div>
        </div>
        <div className="text-xl text-ink-faint">›</div>
      </button>

      {/* 겹3② 판매처 횡단 가격 비교 + 1.5.2 "샀어?" 소유 표시 */}
      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {product.sources.length > 1 &&
            product.sources.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => goTo(s.affiliateUrl)}
                className="flex items-baseline gap-1.5 text-[12px] text-ink-soft transition hover:text-ink"
              >
                <span>{s.name}</span>
                <span className="font-latin tnum font-medium text-ink">
                  {formatPrice(s.price)}
                </span>
              </button>
            ))}
        </div>
        <button
          type="button"
          onClick={() =>
            toggleOwned({ id: product.id, moodKey: product.moodKey, name: product.name, category: product.category })
          }
          className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
            owned
              ? "border-accent bg-accent text-white"
              : "border-line text-ink-soft hover:border-accent"
          }`}
        >
          {owned ? "✓ 내 옷" : "샀어"}
        </button>
      </div>

      {/* 외부 복귀 감지 인라인 — 탭 1회로 '내 옷' 입주 (팝업 아님) */}
      {askBuy && !owned && (
        <button
          type="button"
          onClick={() => {
            toggleOwned({ id: product.id, moodKey: product.moodKey, name: product.name, category: product.category });
            setAskBuy(false);
          }}
          className="mt-2 w-full rounded-[8px] border border-accent bg-accent/10 py-2 text-[12.5px] font-semibold text-accent"
        >
          샀어? 탭하면 ‘내 옷’으로 →
        </button>
      )}
    </div>
  );
}
