"use client";

import BackButton from "@/components/BackButton";
import MoodHero from "@/components/MoodHero";
import ProductSection from "@/components/ProductSection";
import WholeLook from "@/components/WholeLook";
import { MOODS } from "@/lib/moods";
import { primaryPrice } from "@/lib/products";
import { photoUrl } from "@/lib/photos";
import { useMoodLooks } from "@/lib/hooks/usePhotos";
import type { MoodKey } from "@/lib/types";

export function MoodDetail({ moodKey }: { moodKey: string }) {
  const mood = MOODS[moodKey as MoodKey];
  const { lookFor } = useMoodLooks();

  if (!mood) {
    return (
      <div className="animate-fade px-5 pb-8">
        <BackButton />
        <p className="mt-10 text-center text-[14px] text-ink-soft">존재하지 않는 무드야.</p>
      </div>
    );
  }

  // 사진·해설·완성가·통째로 담기·상품 목록이 같은 대표 사진 코디를 쓴다. 없으면 무드 내장 이미지·해설
  const look = lookFor(mood.key);
  const products = look?.products ?? [];
  const heroUrl = look ? photoUrl(look.photo.image_url) : mood.imageUrl;
  const total = products.reduce((sum, product) => sum + primaryPrice(product), 0);

  return (
    <div className="animate-fade px-5 pb-8">
      <BackButton />
      <MoodHero mood={mood} total={total} imageUrl={heroUrl} />

      {/* 해설 전면화 — 우리의 최강 무기(왜 멋있는지)를 숨기지 않고 상시 노출 */}
      <div className="mt-4 rounded-xl bg-paper-2 p-4">
        <div className="mb-1 text-[11px] text-ink-faint">왜 멋있냐면</div>
        {look?.photo.caption_item || look?.photo.caption_why ? (
          <>
            {look.photo.caption_item && <p className="text-[14px] font-semibold">{look.photo.caption_item}</p>}
            {look.photo.caption_why && (
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{look.photo.caption_why}</p>
            )}
          </>
        ) : (
          <p className="text-[14px] leading-relaxed">{mood.caption}</p>
        )}
      </div>

      {products.length > 0 && (
        <>
          <ProductSection mood={mood} look={products} imageUrl={heroUrl} />
          <WholeLook products={products} />
        </>
      )}
    </div>
  );
}
