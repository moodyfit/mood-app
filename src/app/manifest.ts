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
    theme_color: "#1A1A1A",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
