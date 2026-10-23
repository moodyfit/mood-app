"use client";

import type { Product } from "@/lib/types";
import { useMoodStore } from "@/lib/store";

/**
 * 코디 통째로 담기 — 상품 목록 바로 아래. 안 담은 옷만 옷장에 넣고, 다 담았으면 숨는다.
 */
export default function WholeLook({ products }: { products: Product[] }) {
  const { isOwned, addOwnedMany } = useMoodStore();

  const missing = products.filter((p) => !isOwned(p.id));
  if (missing.length === 0) return null;

  return (
    <button
      type="button"
      onClick={() =>
        addOwnedMany(
          missing.map((p) => ({ id: p.id, moodKey: p.moodKey, name: p.name, category: p.category, photo: p.photo }))
        )
      }
      className="mt-3 w-full rounded-[12px] border border-ink py-3 text-[14px] font-semibold text-ink transition hover:bg-paper-2"
    >
      {missing.length === products.length ? "코디 통째로 담기" : `나머지 ${missing.length}벌 담기`}
    </button>
  );
}
