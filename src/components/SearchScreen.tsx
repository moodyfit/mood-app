"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SUGGESTIONS } from "@/lib/moods";

// 모먼트 1: '아무말 검색' — 일상어 로테이션으로 "그냥 쳐도 된다"를 신호
const ROTATING = [
  "소개팅 깔끔하게",
  "남들이 아는 그 느낌",
  "꾸안꾸 그거 뭐냐",
  "면접인데 안 딱딱하게",
  "퇴근하고 한잔",
];

export default function SearchScreen() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [ph, setPh] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPh((i) => (i + 1) % ROTATING.length), 2600);
    return () => clearInterval(t);
  }, []);

  function search(value: string) {
    const query = value.trim();
    if (!query) return;
    router.push(`/results?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="flex min-h-[62vh] animate-fade flex-col justify-center px-5 pb-12">
      <h1 className="text-[28px] font-extrabold leading-[1.32] tracking-[-0.9px]">
        취향이 없는 게 아니다.
        <br />
        <span className="text-ink-soft">이름을 몰랐을 뿐.</span>
      </h1>
      <p className="mt-3 text-[14px] leading-[1.6] text-ink-soft">
        찾는 느낌 그대로 적으면, 무드로 보여준다.
      </p>

      <div className="relative mt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") search(q);
          }}
          placeholder={`예) ${ROTATING[ph]}`}
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
