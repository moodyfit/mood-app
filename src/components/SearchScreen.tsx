"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMoodStore } from "@/lib/store";

export const PENDING_SHOT_KEY = "moodfit.pendingShot";

// 모먼트 1: '아무말 검색' — 일상어 로테이션으로 "그냥 쳐도 된다"를 신호
const ROTATING = [
  "소개팅 깔끔하게",
  "남들이 아는 그 느낌",
  "꾸안꾸 그거 뭐냐",
  "면접인데 안 딱딱하게",
  "퇴근하고 한잔",
  "멋있던 스샷 올려도 돼",
];

// 칩 구성 고정(#5): [오늘의 아무말 1] + [밈 3] + [상황어 2]. 밈→축 번역은 뒤에서만.
const MEME_CHIPS = ["테토남 그 느낌", "느좋 그 자체", "남친룩"];
const SITU_CHIPS = ["소개팅 깔끔하게", "퇴근 후 약속"];

// C8 오늘의 아무말 칩 — 1번 슬롯 daily 로테이션(이상한 검색어). 스타일 동일, 내용만.
const DAILY = [
  "전여친 결혼식",
  "월급날 플렉스인 척",
  "비 오는 날 재즈바",
  "퇴사 통보하는 날",
  "아무도 안 만나는 날",
  "집앞인데 각 잡고",
  "첫 출근 얕보이기 싫을 때",
];

export default function SearchScreen() {
  const router = useRouter();
  const { recordSearch } = useMoodStore();
  const [q, setQ] = useState("");
  const [ph, setPh] = useState(0);
  const [dailyIdx, setDailyIdx] = useState(0);
  const shotInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setInterval(() => setPh((i) => (i + 1) % ROTATING.length), 2600);
    return () => clearInterval(t);
  }, []);

  // 날짜 기반 로테이션(클라이언트에서만 산정 — 하이드레이션 불일치 방지)
  useEffect(() => {
    setDailyIdx(Math.floor(Date.now() / 86400000) % DAILY.length);
  }, []);

  const chips = [DAILY[dailyIdx], ...MEME_CHIPS, ...SITU_CHIPS];

  function search(value: string) {
    const query = value.trim();
    if (!query) return;
    recordSearch(query); // 7.8 검색 기억
    router.push(`/results?q=${encodeURIComponent(query)}`);
  }

  // 7.11 스크린샷 부하 — 챗창에서 바로 스샷 올리기
  function onShot(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        sessionStorage.setItem(PENDING_SHOT_KEY, String(reader.result));
      } catch {
        /* ignore */
      }
      router.push("/shot");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="sticky top-0 z-30 border-b border-line bg-paper px-5 pb-3 pt-5">
      <div className="mb-2.5">
        <span className="text-[17px] font-extrabold tracking-[-0.4px]">무드핏</span>
      </div>

      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") search(q);
          }}
          placeholder={`예) ${ROTATING[ph]}`}
          className="w-full rounded-[10px] border border-line bg-white py-4 pl-[50px] pr-[52px] text-[15px] outline-none transition placeholder:text-ink-faint focus:border-accent"
        />
        {/* 스크린샷 올리기 */}
        <button
          type="button"
          onClick={() => shotInput.current?.click()}
          aria-label="스크린샷 올리기"
          className="absolute left-2.5 top-1/2 flex h-[34px] w-[34px] -translate-y-1/2 items-center justify-center rounded-[8px] text-ink-soft transition hover:bg-paper-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="6" width="18" height="14" rx="2.5" />
            <circle cx="12" cy="13" r="3.2" />
            <path d="M8.5 6l1.2-2h4.6l1.2 2" />
          </svg>
        </button>
        <input
          ref={shotInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onShot}
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
      <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5">
        {chips.map((s) => (
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
