"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PhotoDetail } from "./PhotoDetail";

// 사진 상세 — /photo?slug=clean-001. 앱(정적 빌드)은 동적 경로를 만들 수 없어 쿼리로 받는다
function PhotoBySlugQuery() {
  const slug = useSearchParams()?.get("slug") ?? "";
  return <PhotoDetail slug={slug} />;
}

export default function PhotoPage() {
  return (
    <Suspense>
      <PhotoBySlugQuery />
    </Suspense>
  );
}
