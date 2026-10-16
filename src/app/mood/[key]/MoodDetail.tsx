"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";
import MoodHero from "@/components/MoodHero";
import ProductSection from "@/components/ProductSection";
import WholeLook from "@/components/WholeLook";
import { MOODS } from "@/lib/moods";
import { buildLook, primaryPrice } from "@/lib/products";
import type { MoodKey, PriceTier } from "@/lib/types";

export function MoodDetail({ moodKey }: { moodKey: string }) {
  const mood = MOODS[moodKey as MoodKey];
  const [tier, setTier] = useState<PriceTier>("미드"); // 기본 = 미드 기본템

  if (!mood) {
    return (
      <div className="animate-fade px-5 pb-8">
        <BackButton />
        <p className="mt-10 text-center text-[14px] text-ink-soft">존재하지 않는 무드야.</p>
      </div>
    );
  }

  // 완성가·통째로 사기·다이얼 목록이 같은 4칸을 쓴다
  const products = buildLook(mood.key, tier);
  const total = products.reduce((sum, product) => sum + primaryPrice(product), 0);

  return (
    <div className="animate-fade px-5 pb-8">
      <BackButton />
      <MoodHero mood={mood} total={total} />

      {/* 해설 전면화 — 우리의 최강 무기(왜 멋있는지)를 숨기지 않고 상시 노출 */}
      <div className="mt-4 rounded-xl bg-paper-2 p-4">
        <div className="mb-1 text-[11px] text-ink-faint">왜 멋있냐면</div>
        <p className="text-[14px] leading-relaxed">{mood.caption}</p>
      </div>

      <WholeLook products={products} />
      <ProductSection mood={mood} tier={tier} onTierChange={setTier} look={products} />
    </div>
  );
}
