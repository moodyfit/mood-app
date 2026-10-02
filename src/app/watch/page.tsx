"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import VideoSearch from "@/components/VideoSearch";
import ProfileBar from "@/components/ProfileBar";
import LookResults from "@/components/LookResults";
import { useLooks } from "@/lib/hooks/useLooks";

// 유튜브를 룩북으로 재편집 — 상황 검색 → 영상에서 뽑은 룩 카드. 신체 프로필로 필터(락인).
// Capacitor에서는 YouTube API 키가 없으므로 시드 기반 검색만 동작.
function WatchContent() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();
  const looks = useLooks(q);

  return (
    <div className="animate-fade">
      <VideoSearch initial={q} />
      <ProfileBar />
      <LookResults looks={looks} query={q} live={false} />
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense>
      <WatchContent />
    </Suspense>
  );
}
