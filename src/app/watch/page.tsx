import VideoSearch from "@/components/VideoSearch";
import ProfileBar from "@/components/ProfileBar";
import LookResults from "@/components/LookResults";
import { searchLooksLive, isVideoSearchLive } from "@/lib/videos";

// 유튜브를 룩북으로 재편집 — 상황 검색 → 영상에서 뽑은 룩 카드. 신체 프로필로 필터(락인).
export const revalidate = 60;

export default async function WatchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const looks = await searchLooksLive(q); // 상황 후보(서버). 프로필 필터는 클라이언트에서.
  const live = isVideoSearchLive();

  return (
    <div className="animate-fade">
      <VideoSearch initial={q} />
      <ProfileBar />
      <LookResults looks={looks} query={q} live={live} />
    </div>
  );
}
