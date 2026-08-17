"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import ResultsGrid from "@/components/ResultsGrid";
import PhotoGrid from "@/components/PhotoGrid";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { rankPhotos } from "@/lib/photos";
import { resolveMoods } from "@/lib/moods";

// ?q= 검색어로 무드 기반 사진 랭킹 → 그리드 표시
function ResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const you = searchParams.get("you") === "1";

  const { photos, loading } = usePhotos();

  if (loading) {
    return (
      <div className="animate-fade px-5 pb-12">
        <BackButton href="/" />
      </div>
    );
  }

  if (photos.length > 0) {
    const ranked = you ? photos : rankPhotos(photos, resolveMoods(q));
    return (
      <div className="animate-fade px-5 pb-12">
        <BackButton href="/" />
        <PhotoGrid photos={ranked} query={q} you={you} />
      </div>
    );
  }

  return (
    <div className="animate-fade px-5 pb-12">
      <BackButton href="/" />
      <ResultsGrid query={q} you={you} />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense>
      <ResultsContent />
    </Suspense>
  );
}
