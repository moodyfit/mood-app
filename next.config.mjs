/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ESLint 미설정 상태 — 배포 빌드에서 lint 단계로 실패하지 않게(타입 검증은 tsc로 수행)
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
