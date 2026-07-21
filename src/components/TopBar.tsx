"use client";

import Link from "next/link";
import { useMoodStore } from "@/lib/store";

export default function TopBar() {
  const { savedCount } = useMoodStore();
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between px-5 pb-3.5 pt-5 bg-gradient-to-b from-paper from-[72%] to-transparent">
      <Link href="/" className="text-[21px] font-extrabold tracking-[-0.6px]">
        무드핏
      </Link>
      <Link
        href="/space"
        className="flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-xs transition hover:bg-paper-2"
      >
        <span>나의 공간</span>
        <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1.5 font-latin text-[11px] font-medium text-white">
          {savedCount}
        </span>
      </Link>
    </div>
  );
}
