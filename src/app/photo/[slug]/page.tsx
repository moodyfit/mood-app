import { Suspense } from "react";
import { PhotoDetail } from "./PhotoDetail";

// 정적 빌드용 — slug는 DB 기반이라 빌드 시점에 열거 불가.
// Capacitor에서는 SPA 폴백 라우팅(CAP-002)으로 처리.
export async function generateStaticParams() {
  return [];
}

// (B) 사진 전용 상품 뷰. slug = 파일명(clean-001), 확장자 무관 조회
// PhotoDetail 이 useSearchParams 를 쓴다 — 경계가 없으면 이 라우트가 런타임에 500 난다.
export default function PhotoPage({ params }: { params: { slug: string } }) {
  return (
    <Suspense>
      <PhotoDetail slug={params.slug} />
    </Suspense>
  );
}
