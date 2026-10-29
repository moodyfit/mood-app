"use client";

import { useRouter } from "next/navigation";

/** spacing — 제목과 한 줄에 둘 때 기본 위아래 여백을 바꾼다 */
export default function BackButton({ href, spacing = "mb-0.5 pb-3.5 pt-1" }: { href?: string; spacing?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      aria-label="뒤로"
      className={`${spacing} -ml-1.5 inline-flex items-center text-ink transition hover:text-ink-soft`}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 5l-7 7 7 7" />
      </svg>
    </button>
  );
}
