"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// 고민(자연어)으로 검색 → 관련 패션 영상 찾기. 톤은 홈 검색과 동일하되 '고민' 지향.
const ROTATING = [
  "소개팅인데 뭐 입지",
  "배 나온 거 가리고 싶어",
  "첫 출근 오피스룩",
  "미니멀하게 입고 싶어",
  "셔츠 잘 입는 법",
  "여름에 안 더워 보이게",
];

const CHIPS = [
  "소개팅 코디",
  "체형 커버",
  "미니멀 데일리",
  "여름 코디",
  "셔츠 활용",
];

export default function VideoSearch({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  const [ph, setPh] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPh((i) => (i + 1) % ROTATING.length), 2600);
    return () => clearInterval(t);
  }, []);

  function search(value: string) {
    const query = value.trim();
    if (!query) return;
    router.push(`/watch?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-paper px-5 pb-3 pt-5">
      <div className="mb-1">
        <span className="text-[17px] font-extrabold tracking-[-0.4px]">영상으로 배우기</span>
      </div>
      <div className="mb-2.5 text-[12.5px] text-ink-soft">
        고민을 적으면 관련 패션 영상을 찾아 핵심만 요약해줄게.
      </div>

      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") search(q);
          }}
          placeholder={`예) ${ROTATING[ph]}`}
          className="w-full rounded-[10px] border border-line bg-white py-4 pl-4 pr-[52px] text-[15px] outline-none transition placeholder:text-ink-faint focus:border-accent"
        />
        <button
          type="button"
          onClick={() => search(q)}
          aria-label="영상 찾기"
          className="absolute right-2 top-1/2 flex h-[38px] w-[38px] -translate-y-1/2 items-center justify-center rounded-[10px] bg-accent text-lg text-white"
        >
          →
        </button>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
        {CHIPS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => search(s)}
            className="shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[13px] transition hover:border-accent hover:bg-paper-2"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
