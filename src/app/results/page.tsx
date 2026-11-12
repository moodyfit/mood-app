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

/** 상품 조회 중(P1-2) — 결과가 정해지기 전엔 무드 검색이든 빈 화면이든 먼저 그리지 않고 이걸로 */
function ResultsSkeleton() {
  return (
    <div style={{ columnCount: 2, columnGap: "12px" }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="mb-3 animate-pulse rounded-2xl bg-paper-2"
          style={{ aspectRatio: "0.8", breakInside: "avoid" }}
        />
      ))}
    </div>
  );
}

// ?q= 검색어로 무드 기반 사진 랭킹 → 그리드 표시.
// FEAT-008: resolveMoods(고정 20문구)는 즉시 폴백으로만 쓰고, AI 번역(/api/search/translate)
// 응답 오면 그걸로 교체 — 등록 안 된 자유 문구도 실제로 의미 이해해서 매칭됨.
function ResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const you = searchParams.get("you") === "1";

  const { photos, loading } = usePhotos();
  const [moodKeys, setMoodKeys] = useState<string[]>(() => resolveMoods(q));
  // 10/28 회의록 "제품 검색"(예: "와이드 슬랙스" → 그 상품 포함된 코디). undefined = 조회 중,
  // null = 매칭 없음(상황/느낌 검색어 — 기존 무드 검색으로 폴백), Set = 매칭 있음(제품 검색).
  // 조회 끝나기 전엔 "모름" 상태로 둬서(코드리뷰 P1-2) 무드 검색 결과가 먼저 보이다 사라지는
  // 깜빡임을 없앤다.
  const [productPhotoUrls, setProductPhotoUrls] = useState<Set<string> | null | undefined>(undefined);
  // 홈에서 고른 남/녀 필터를 검색 결과에도 그대로 적용(전역 설정, 회의록 2026-10-08).
  const { genderFilter } = useMoodStore();
  const filteredPhotos = useMemo(
    () => filterByGender(photos, genderFilter),
    [photos, genderFilter]
  );

  useEffect(() => {
    if (you) return;
    setMoodKeys(resolveMoods(q)); // 제품 매칭이 없을 때 쓸 폴백 순서를 미리 준비(빈 화면 없음)
    if (!q) {
      // 쿼리 없이 바로 /results 진입(북마크·히스토리 등) — 조회할 게 없으니 "매칭 없음"으로
      // 바로 확정한다. undefined로 두면 아래 fetch가 전혀 안 돌아서 스켈레톤이 영원히 안 풀림(회귀).
      setProductPhotoUrls(null);
      return;
    }
    setProductPhotoUrls(undefined); // q 바뀌면 새로 "조회 중"부터
    let cancelled = false;
    fetchProductPhotoUrls(q).then((urls) => {
      if (cancelled) return;
      setProductPhotoUrls(urls);
      if (urls) return; // 제품 매칭 있으면 무드 번역 결과는 안 쓰임(P2-2) — 호출 자체를 생략
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

  if (photos.length === 0) {
    // DB 전체가 비어있음(로컬/미설정) — 기존 로컬 폴백
    return (
      <div className="animate-fade px-5 pb-12">
        <BackButton href="/" />
        <ResultsGrid query={q} you={you} />
      </div>
    );
  }

  if (!you && productPhotoUrls === undefined) {
    return (
      <div className="animate-fade px-5 pb-12">
        <BackButton href="/" />
        <ResultsSkeleton />
      </div>
    );
  }

  // 성별 필터 적용 후 0장이면(P1-1) 전역 필터는 그대로 두고 이 화면에서만 전체 성별로 넓혀 보여준다 —
  // 조용히 무드 검색으로 빠지면 찾던 상품과 무관한 코디가 나와서 검색이 틀린 것처럼 보인다.
  let ranked: typeof filteredPhotos;
  let genderWidened = false;
  if (you) {
    ranked = filteredPhotos;
  } else if (productPhotoUrls) {
    const matchedAll = photos.filter((p) => productPhotoUrls.has(p.image_url));
    const matchedByGender = filterByGender(matchedAll, genderFilter);
    if (matchedByGender.length === 0 && matchedAll.length > 0) {
      ranked = matchedAll;
      genderWidened = true;
    } else {
      ranked = matchedByGender;
    }
  } else {
    ranked = rankPhotos(filteredPhotos, moodKeys);
  }

  return (
    <div className="animate-fade px-5 pb-12">
      <BackButton href="/" />
      {genderWidened && (
        <p className="mb-3 text-[12.5px] text-ink-soft">
          {genderFilter === "female" ? "여자" : "남자"} 코디가 없어서 전체로 보여줄게
        </p>
      )}
      <PhotoGrid photos={ranked} query={q} you={you} />
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
