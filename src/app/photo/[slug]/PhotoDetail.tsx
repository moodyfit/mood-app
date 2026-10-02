"use client";

import { dominantMood } from "@/lib/photos";
import { usePhotoBySlug, useProductsForPhoto } from "@/lib/hooks/usePhotos";
import PhotoProductView from "@/components/PhotoProductView";
import type { MoodKey } from "@/lib/types";

export function PhotoDetail({ slug }: { slug: string }) {
  const { photo, loading: photoLoading } = usePhotoBySlug(slug);

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
