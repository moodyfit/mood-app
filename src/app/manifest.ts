import type { MetadataRoute } from "next";

// PWA 설치 메타데이터(FEAT-018, 10/16 회의록 "릴스에서 홈화면에 앱처럼 추가").
// Next가 /manifest.webmanifest 로 자동 서빙한다.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "무드핏 — 느낌 기반 스타일 추천",
    short_name: "무드핏",
    description: "느낌으로 찾는 스타일링 사진·상품 추천",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF8",
    // 웹 viewport(layout.tsx)와 동일한 값(코드리뷰 P2-1) — 앱 배경(paper)과 같은 밝은 톤으로
    // 맞춰, 설치한 앱의 상태바가 화면마다 따로 튀지 않게 한다.
    theme_color: "#FAFAF8",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
