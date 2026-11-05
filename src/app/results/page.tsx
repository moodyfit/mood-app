"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import BackButton from "@/components/BackButton";
import ResultsGrid from "@/components/ResultsGrid";
import PhotoGrid from "@/components/PhotoGrid";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { rankPhotos, filterByGender, fetchProductPhotoUrls } from "@/lib/photos";
import { resolveMoods } from "@/lib/moods";
import { useMoodStore } from "@/lib/store";

// ?q= 검색어로 무드 기반 사진 랭킹 → 그리드 표시.
// FEAT-008: resolveMoods(고정 20문구)는 즉시 폴백으로만 쓰고, AI 번역(/api/search/translate)
// 응답 오면 그걸로 교체 — 등록 안 된 자유 문구도 실제로 의미 이해해서 매칭됨.
function ResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const you = searchParams.get("you") === "1";

  const { photos, loading } = usePhotos();
  const [moodKeys, setMoodKeys] = useState<string[]>(() => resolveMoods(q));
  // 10/28 회의록 "제품 검색"(예: "와이드 슬랙스" → 그 상품 포함된 코디). 매칭 있으면 무드 랭킹 대신
  // 이 사진들만 보여준다 — null이면 매칭 없음(상황/느낌 검색어)이라는 뜻, 기존 무드 검색으로 폴백.
  const [productPhotoUrls, setProductPhotoUrls] = useState<Set<string> | null>(null);
  // 홈에서 고른 남/녀 필터를 검색 결과에도 그대로 적용(전역 설정, 회의록 2026-10-08).
  const { genderFilter } = useMoodStore();
  const filteredPhotos = useMemo(
    () => filterByGender(photos, genderFilter),
    [photos, genderFilter]
  );

  useEffect(() => {
    if (you || !q) return;
    setMoodKeys(resolveMoods(q)); // q 바뀌는 즉시 폴백 순서부터 먼저 보여줌(빈 화면 없음)
    setProductPhotoUrls(null); // q 바뀌면 이전 제품 검색 결과부터 비움
    let cancelled = false;
    fetch(`/api/search/translate?q=${encodeURIComponent(q)}`)
      // res.ok를 따로 안 본다: 4xx/5xx면 본문이 HTML이라 res.json()이 throw → 아래 catch로 흡수.
      // 성공/실패/비-JSON 응답 전부 "폴백 순서 유지"로 수렴시키는 게 의도(검색은 실패해도 결과가 나와야 함).
      .then((res) => res.json())
      .then((data: { moodKeys?: string[] }) => {
        if (!cancelled && data.moodKeys?.length) setMoodKeys(data.moodKeys);
      })
      .catch(() => {
        /* 실패하면 이미 보여준 폴백 순서 그대로 유지 */
      });
    fetchProductPhotoUrls(q).then((urls) => {
      if (!cancelled) setProductPhotoUrls(urls);
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

  if (filteredPhotos.length > 0) {
    const productMatched =
      !you && productPhotoUrls && productPhotoUrls.size > 0
        ? filteredPhotos.filter((p) => productPhotoUrls.has(p.image_url))
        : null;
    const ranked = productMatched ?? (you ? filteredPhotos : rankPhotos(filteredPhotos, moodKeys));
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
