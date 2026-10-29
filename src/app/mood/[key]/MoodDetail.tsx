"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";
import LookStrip from "@/components/LookStrip";
import MoodHero from "@/components/MoodHero";
import ProductRow from "@/components/ProductRow";
import WholeLook from "@/components/WholeLook";
import { MOODS } from "@/lib/moods";
import { primaryPrice } from "@/lib/products";
import { photoUrl } from "@/lib/photos";
import { useMoodLooks, useMoodPhotos, usePhotoProducts } from "@/lib/hooks/usePhotos";
import type { MoodKey } from "@/lib/types";

export function MoodDetail({ moodKey }: { moodKey: string }) {
  const mood = MOODS[moodKey as MoodKey];
  const { lookFor, loading: lookLoading } = useMoodLooks();
  const look = lookFor(moodKey as MoodKey);
  const { photos, loading: photosLoading } = useMoodPhotos(moodKey, look?.photo);
  const byPhoto = usePhotoProducts();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 고른 코디가 성별 필터로 목록에서 빠지면 대표 사진으로
  const current = photos.find((p) => p.id === selectedId) ?? look?.photo;

  if (!mood) {
    return (
      <div className="animate-fade px-5 pb-8">
        <BackButton />
        <p className="mt-10 text-center text-[14px] text-ink-soft">존재하지 않는 무드야.</p>
      </div>
    );
  }

  // 사진·해설·완성가·통째로 담기·상품 목록이 지금 고른 코디(기본 대표 사진)를 쓴다. 없으면 무드 내장 이미지·해설
  const products = current?.id === look?.photo.id ? look?.products ?? [] : byPhoto.get(current?.image_url ?? "") ?? [];
  const heroUrl = current ? photoUrl(current.image_url) : mood.imageUrl;
  const total = products.reduce((sum, product) => sum + primaryPrice(product), 0);

  return (
    <div className="animate-fade px-5 pb-8">
      <div className="mb-3 pt-1">
        <div className="flex items-center gap-1">
          <BackButton spacing="" />
          <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">{mood.name}</h1>
        </div>
        <p className="mt-0.5 pl-[22px] text-[12.5px] text-ink-soft">{mood.description}</p>
      </div>
      {/* 대표 사진을 불러오는 동안 사진·해설·상품 자리를 같은 크기 스켈레톤으로 잡아 둔다 */}
      {lookLoading ? (
        <div className="mb-1 aspect-[3/4] animate-pulse rounded-xl bg-paper-2" />
      ) : (
        <MoodHero mood={mood} total={total} imageUrl={heroUrl} photo={current} />
      )}

      <LookStrip
        photos={photos}
        selectedId={current?.id ?? ""}
        loading={lookLoading || photosLoading}
        onSelect={(p) => setSelectedId(p.id)}
      />

      {/* 해설 전면화 — 우리의 최강 무기(왜 멋있는지)를 숨기지 않고 상시 노출 */}
      <div className="mt-4 rounded-xl bg-paper-2 p-4">
        <div className="mb-1 text-[11px] text-ink-faint">왜 멋있냐면</div>
        {lookLoading ? (
          <div className="animate-pulse">
            <div className="h-[18px] w-11/12 rounded bg-paper-3" />
            <div className="mt-1.5 h-[18px] w-2/3 rounded bg-paper-3" />
            <div className="mt-2.5 h-4 w-full rounded bg-paper-3" />
            <div className="mt-1.5 h-4 w-3/4 rounded bg-paper-3" />
          </div>
        ) : current?.caption_item || current?.caption_why ? (
          <>
            {current.caption_item && <p className="text-[14px] font-semibold">{current.caption_item}</p>}
            {current.caption_why && (
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{current.caption_why}</p>
            )}
          </>
        ) : (
          <p className="text-[14px] leading-relaxed">{mood.caption}</p>
        )}
      </div>

      {lookLoading && (
        <div className="mt-4 flex flex-col gap-2.5">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-[141px] animate-pulse rounded-xl bg-paper-2" />
          ))}
        </div>
      )}
      {products.length > 0 && (
        <>
          <div className="mt-4 flex flex-col gap-2.5">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </div>
          <WholeLook products={products} />
        </>
      )}
    </div>
  );
}
