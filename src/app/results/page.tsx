import BackButton from "@/components/BackButton";
import ResultsGrid from "@/components/ResultsGrid";
import PhotoGrid from "@/components/PhotoGrid";
import { isSupabaseEnabled } from "@/lib/supabase";
import { fetchPhotos, rankPhotos } from "@/lib/photos";
import { resolveMoods } from "@/lib/moods";

// ?q= 는 매 요청 달라지므로 동적 렌더
export const dynamic = "force-dynamic";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";

  // 마일스톤: Supabase 설정 시 그리드를 photos(DB)에서. 미설정/빈 결과면 로컬 폴백.
  if (isSupabaseEnabled()) {
    const photos = await fetchPhotos();
    if (photos.length > 0) {
      const ranked = rankPhotos(photos, resolveMoods(q));
      return (
        <div className="animate-fade px-5 pb-12">
          <BackButton href="/" />
          <PhotoGrid photos={ranked} query={q} />
        </div>
      );
    }
  }

  return (
    <div className="animate-fade px-5 pb-12">
      <BackButton href="/" />
      <ResultsGrid query={q} />
    </div>
  );
}
