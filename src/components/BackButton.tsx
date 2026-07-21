"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ href }: { href?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (href ? router.push(href) : router.back())}
      aria-label="뒤로"
      className="mb-0.5 inline-flex items-center pb-3.5 pt-1 text-[22px] leading-none text-ink transition hover:text-ink-soft"
    >
      ←
    </button>
  );
}
