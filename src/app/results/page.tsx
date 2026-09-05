"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import ResultsGrid from "@/components/ResultsGrid";
import PhotoGrid from "@/components/PhotoGrid";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { rankPhotos } from "@/lib/photos";
import { resolveMoods } from "@/lib/moods";

// ?q= 검색어로 무드 기반 사진 랭킹 → 그리드 표시.
// FEAT-008: resolveMoods(고정 20문구)는 즉시 폴백으로만 쓰고, AI 번역(/api/search/translate)
// 응답 오면 그걸로 교체 — 등록 안 된 자유 문구도 실제로 의미 이해해서 매칭됨.
function ResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const you = searchParams.get("you") === "1";

  const { photos, loading } = usePhotos();
  const [moodKeys, setMoodKeys] = useState<string[]>(() => resolveMoods(q));

  useEffect(() => {
    if (you || !q) return;
    setMoodKeys(resolveMoods(q)); // q 바뀌는 즉시 폴백 순서부터 먼저 보여줌(빈 화면 없음)
    let cancelled = false;
    fetch(`/api/search/translate?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((data: { moodKeys?: string[] }) => {
        if (!cancelled && data.moodKeys?.length) setMoodKeys(data.moodKeys);
      })
      .catch(() => {
        /* 실패하면 이미 보여준 폴백 순서 그대로 유지 */
      });
    return () => {
      cancelled = true; // q가 바뀌기 전 요청의 응답이 늦게 와서 최신 상태를 덮어쓰는 것 방지
    };
  }, [q, you]);

  if (loading) {
    return (
      <div className="animate-fade px-5 pb-12">
        <BackButton href="/" />
      </div>
    );
  }

  if (photos.length > 0) {
    const ranked = you ? photos : rankPhotos(photos, moodKeys);
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
