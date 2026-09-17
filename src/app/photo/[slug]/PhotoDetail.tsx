"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { dominantMood } from "@/lib/photos";
import { usePhotoBySlug, useProductsForPhoto } from "@/lib/hooks/usePhotos";
import PhotoProductView from "@/components/PhotoProductView";
import { useMoodStore } from "@/lib/store";
import type { MoodKey } from "@/lib/types";

export function PhotoDetail({ slug }: { slug: string }) {
  const { photo, loading: photoLoading } = usePhotoBySlug(slug);

  // 업로드 직후 도착(FEAT-013). 업로드 화면에서 띄우면 화면 전환에 묻혀 안 보인다
  const uploaded = useSearchParams()?.get("uploaded") === "1";
  const { showToast } = useMoodStore();
  const toasted = useRef(false);
  useEffect(() => {
    if (!uploaded || toasted.current) return;
    toasted.current = true;
    showToast("무드 붙였어");
  }, [uploaded, showToast]);

  const moodKey = photo ? (dominantMood(photo.mood_vector) as MoodKey) : ("clean" as MoodKey);
  const { products, loading: productsLoading } = useProductsForPhoto(
    photo?.image_url ?? "",
    moodKey,
  );

  if (photoLoading || productsLoading) {
    return (
      <div className="animate-fade px-5 py-20 text-center text-[13px] text-ink-soft">
        불러오는 중…
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="animate-fade px-5 py-20 text-center text-[13px] text-ink-soft">
        사진을 찾을 수 없어.
      </div>
    );
  }

  return <PhotoProductView photo={photo} products={products} />;
}
