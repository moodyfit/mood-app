import { notFound } from "next/navigation";
import type { MoodKey } from "@/lib/types";
import { fetchPhotoBySlug, getProductsForPhoto, dominantMood } from "@/lib/photos";
import PhotoProductView from "@/components/PhotoProductView";

// (B) 사진 전용 상품 뷰. slug = 파일명(clean-001), 확장자 무관 조회
export const revalidate = 60; // 슬러그별 60초 캐시

export default async function PhotoPage({ params }: { params: { slug: string } }) {
  const photo = await fetchPhotoBySlug(params.slug);
  if (!photo) notFound();

  const moodKey = dominantMood(photo.mood_vector) as MoodKey;
  const products = await getProductsForPhoto(photo.image_url, moodKey);

  return <PhotoProductView photo={photo} products={products} />;
}
