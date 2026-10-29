"use client";

import Link from "next/link";
import { useMoodStore } from "@/lib/store";

export default function Toast() {
  const { toast: raw } = useMoodStore();
  // 링크가 가리키는 화면에 이미 있으면 띄우지 않는다(결과 페이지는 "새로 정렬" 버튼이 대신 알린다)
  const toast =
    raw?.link && typeof window !== "undefined" && raw.link.href === location.pathname + location.search
      ? null
      : raw;
  const link = toast?.link;
  return (
    <div
      className={`fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-5 py-3 text-[13px] font-medium text-paper shadow-[0_10px_30px_rgba(14,14,16,0.18)] transition ${
        link ? "pointer-events-auto" : "pointer-events-none"
      } ${toast ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
    >
      {toast?.msg}
      {link && (
        <Link href={link.href} className="ml-3 font-semibold underline underline-offset-2">
          {link.label}
        </Link>
      )}
    </div>
  );
}
