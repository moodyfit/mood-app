"use client";

import type { Mood, Product } from "@/lib/types";
import { useMoodStore } from "@/lib/store";
import ProductRow from "./ProductRow";

/**
 * 겹3① 추천 이유 공개 — "이게 뜬 이유: 네가 저장한 무드와 같은 결" + 근거 썸네일.
 * 상품이 이 무드로 뜬 근거를 투명하게 보여줘 "충동구매 아닌 내 취향 소비"로 프레이밍.
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

  const reason = saved
    ? "네가 저장한 무드예요. 같은 결의 아이템이에요."
    : "지금 보는 무드와 같은 결의 아이템이에요.";

  return (
    <div className="mt-[22px]">
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
          <div className="mt-0.5 text-[13px] leading-snug text-ink-soft">
            {reason}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
