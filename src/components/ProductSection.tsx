"use client";

import type { Mood, Product } from "@/lib/types";
import { useMoodStore } from "@/lib/store";
import ProductRow from "./ProductRow";

/** 무드 상세 상품 섹션 — 추천 이유 + 대표 사진 코디 */
export default function ProductSection({
  mood,
  look,
  imageUrl = mood.imageUrl,
}: {
  mood: Mood;
  look: Product[];
  imageUrl?: string;
}) {
  const { isSaved } = useMoodStore();
  const saved = isSaved(mood.key);

  const reason = saved
    ? "담은 무드와 같은 결의 아이템"
    : "지금 보는 무드와 같은 결의 아이템";

  return (
    <div className="mt-[22px]">
      {/* 겹3① 추천 이유 */}
      <div className="flex items-center gap-3 rounded-xl bg-paper-2 p-3">
        <div
          className="h-11 w-11 flex-shrink-0 rounded-lg"
          style={
            imageUrl
              ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: mood.gradient }
          }
        />
        <div className="min-w-0">
          <div className="text-[11px] text-ink-faint">이게 뜬 이유</div>
          <div className="mt-0.5 text-[13px] leading-snug text-ink-soft">{reason}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2.5">
        {look.map((p) => (
          <div key={p.id} className="animate-rise">
            <ProductRow product={p} />
          </div>
        ))}
      </div>
    </div>
  );
}
