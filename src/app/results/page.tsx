import BackButton from "@/components/BackButton";
import ResultsGrid from "@/components/ResultsGrid";
import PhotoGrid from "@/components/PhotoGrid";
import { isSupabaseEnabled } from "@/lib/supabase";
import { fetchPhotos, rankPhotos } from "@/lib/photos";
import { resolveMoods } from "@/lib/moods";

// ?q= 는 매 요청 달라지므로 동적 렌더
export const revalidate = 60; // 검색 파라미터로 동적이되, photos fetch는 60초 캐시 재사용

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { q?: string; you?: string };
}) {
  const q = searchParams.q ?? "";
  const you = searchParams.you === "1"; // 추구미 카드 → "이 추구미로 다시 보기"

  if (isSupabaseEnabled()) {
    const photos = await fetchPhotos();
    if (photos.length > 0) {
      // you 모드: 검색어 랭킹 없이 프로필(너의 결과)로 정렬 — 클라에서 affinity 적용
      const ranked = you ? photos : rankPhotos(photos, resolveMoods(q));
      return (
        <div className="animate-fade px-5 pb-12">
          <BackButton href="/" />
          <PhotoGrid photos={ranked} query={q} you={you} />
        </div>
      );
    }
  }

  return (
    <div className="animate-fade px-5 pb-12">
      <BackButton href="/" />
      <ResultsGrid query={q} you={you} />
    </div>
  );
}
