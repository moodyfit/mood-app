"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter();

  function handleBack() {
    if (href) {
      router.push(href);
      return;
    }
    // 새 탭·URL 직접 입력·외부 링크(SNS 등)로 바로 들어오면 앱 안에서 쌓인 기록이 없어
    // router.back()이 이전 사이트로 나가버리거나 무반응이다(코드리뷰 P1-1). Navigation API
    // (같은 출처 기록만 셈 — history.length·document.referrer보다 정확)로 판별 가능한
    // 환경에서만, 기록이 없으면 홈으로 보낸다. 미지원 환경(Safari 등)은 기존처럼 back().
    const nav = (window as { navigation?: { canGoBack?: boolean } }).navigation;
    if (nav && nav.canGoBack === false) {
      router.push("/");
      return;
    }
    router.back();
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="뒤로"
      className="mb-0.5 inline-flex items-center pb-3.5 pt-1 text-[22px] leading-none text-ink transition hover:text-ink-soft"
    >
      ←
    </button>
  );
}
