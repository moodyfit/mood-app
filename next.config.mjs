/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESLint 미설정 상태 — 배포 빌드에서 lint 단계로 실패하지 않게(타입 검증은 tsc로 수행)
  eslint: { ignoreDuringBuilds: true },
  // Capacitor 빌드 시 정적 HTML 출력 (BUILD_TARGET=capacitor next build)
  // Vercel 배포 시에는 일반 빌드 유지 (API Route 등 서버 기능 보존)
  ...(process.env.BUILD_TARGET === "capacitor" && { output: "export" }),
  // 화면 코드에서 앱 빌드 여부를 빌드 시점에 알 수 있게 넘긴다
  env: { BUILD_TARGET: process.env.BUILD_TARGET ?? "web" },
};

export default nextConfig;
