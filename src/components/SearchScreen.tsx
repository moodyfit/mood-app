"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUGGESTIONS } from "@/lib/moods";

export default function SearchScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function search(value: string) {
    const query = value.trim();
    if (!query) return;
    router.push(`/results?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="flex min-h-[62vh] animate-fade flex-col justify-center px-5 pb-12">
      <h1 className="text-[28px] font-extrabold leading-[1.32] tracking-[-0.9px]">
        옷 이름은 몰라도 괜찮아요.
        <br />
        느낌만 적으면, 무드로 보여드려요.
      </h1>

      <div className="relative mt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") search(q);
          }}
          placeholder="무엇이든 적어보세요"
          className="w-full rounded-[10px] border border-line bg-white px-[18px] py-4 pr-[52px] text-[15px] outline-none transition placeholder:text-ink-faint focus:border-accent"
        />
        <button
          type="button"
          onClick={() => search(q)}
          aria-label="검색"
          className="absolute right-2 top-1/2 flex h-[38px] w-[38px] -translate-y-1/2 items-center justify-center rounded-[10px] bg-accent text-lg text-white"
        >
          →
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => search(s)}
            className="rounded-full border border-line px-[15px] py-[9px] text-[13px] transition hover:border-accent hover:bg-paper-2"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
