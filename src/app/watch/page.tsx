import VideoSearch from "@/components/VideoSearch";
import VideoCard from "@/components/VideoCard";
import { searchVideosLive, isVideoSearchLive } from "@/lib/videos";

// 픽어뷰 패션판 — 고민 검색 → 관련 패션 영상 + 요약. YOUTUBE_API_KEY 있으면 실검색, 없으면 시드.
export const revalidate = 60;

export default async function WatchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const videos = await searchVideosLive(q);
  const live = isVideoSearchLive();

  return (
    <div className="animate-fade">
      <VideoSearch initial={q} />

      <div className="px-5 pb-24 pt-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-[18px] font-bold tracking-[-0.4px]">
            {q ? `‘${q}’ 관련 영상` : "이런 고민, 이 영상들"}
          </h2>
          <span className="text-[12px] text-ink-faint">{videos.length}개</span>
        </div>

        {videos.length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-6 text-center text-[13.5px] text-ink-soft">
            딱 맞는 영상을 못 찾았어. 다른 말로 검색해봐.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}

        {!live && (
          <p className="mt-6 text-center text-[11.5px] leading-relaxed text-ink-faint">
            지금은 큐레이션된 영상에서 찾고 있어.
            <br />
            실시간 유튜브 검색은 API 키 연결 후 켜져.
          </p>
        )}
      </div>
    </div>
  );
}
