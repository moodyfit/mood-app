"use client";

import { useEffect } from "react";
import type { Product } from "@/lib/types";
import type { Photo } from "@/lib/photos";
import { photoUrl } from "@/lib/photos";
import { primaryPrice, formatMan } from "@/lib/products";
import { useMoodStore } from "@/lib/store";
import BackButton from "./BackButton";
import ProductRow from "./ProductRow";
import WholeLook from "./WholeLook";

/**
 * (B) 사진 전용 상품 뷰 — "그 사진 그대로 산다".
 * 반했던 사진 원본 → 해설 3행 → 완성가 → 그 사진 속 아이템(사진 연결 상품) → 통째로 담기.
 * 상품 미연결 사진은 무드 폴백(getProductsForPhoto)로 완결.
 */
export default function PhotoProductView({
  photo,
  products,
}: {
  photo: Photo;
  products: Product[];
}) {
  const { recordView } = useMoodStore();
  useEffect(() => {
    if (photo.mood_vector) recordView(photo.mood_vector); // 다축 그대로 반영(FEAT-001)
  }, [photo.mood_vector, recordView]);

  const url = photoUrl(photo.image_url);
  const total = products.reduce((s, p) => s + primaryPrice(p), 0);

  return (
    <div className="animate-fade px-5 pb-32">
      <BackButton href="/results" />

      {/* 반했던 원본 사진 */}
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ aspectRatio: String(photo.aspect_ratio ?? 0.8) }}
      >
        <div
          className="absolute inset-0 bg-paper-2"
          style={url ? { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        />
        {total > 0 && (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur">
            이 느낌 완성 · <span className="font-latin tnum">{formatMan(total)}</span>
          </div>
        )}
      </div>

      {/* 해설 3행 — 왜 멋있는지(우리 최강 무기) 전면 */}
      <div className="mt-4 rounded-xl bg-paper-2 p-4">
        <div className="mb-1 text-[11px] text-ink-faint">왜 멋있냐면</div>
        {photo.caption_item && <p className="text-[14px] font-semibold">{photo.caption_item}</p>}
        {photo.caption_why && <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{photo.caption_why}</p>}
        {photo.caption_how && <p className="mt-1 text-[13px] leading-relaxed text-ink-faint">{photo.caption_how}</p>}
      </div>

      {/* 그 사진 속 아이템 */}
      <div className="mt-6 mb-2 flex items-baseline justify-between">
        <div className="text-[13px] font-semibold">이 사진 그대로</div>
        <div className="text-[11px] text-ink-faint">가격·링크 확인 중(공개 링크)</div>
      </div>
      <div className="flex flex-col gap-2.5">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
      </div>

      <WholeLook products={products} />
    </div>
  );
}
