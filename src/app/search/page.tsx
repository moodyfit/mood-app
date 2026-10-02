"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMoodStore } from "@/lib/store";
import { MOODS, ALL_MOOD_KEYS } from "@/lib/moods";

const PENDING_SHOT_KEY = "moodfit.pendingShot";

const DAILY = [
  "전여친 결혼식",
  "월급날 플렉스인 척",
  "비 오는 날 재즈바",
  "퇴사 통보하는 날",
  "아무도 안 만나는 날",
  "집앞인데 각 잡고",
  "첫 출근 얕보이기 싫을 때",
];

const SITUATION_CHIPS = [
  "소개팅 깔끔하게",
  "퇴근 후 약속",
  "면접인데 안 딱딱하게",
  "꾸안꾸 그거 뭐냐",
  "남들이 아는 그 느낌",
  "퇴근하고 한잔",
];

const MEME_CHIPS = ["테토남 그 느낌", "느좋 그 자체", "남친룩"];

export default function SearchPage() {
  const router = useRouter();
  const { recordSearch } = useMoodStore();
  const [query, setQuery] = useState("");
  const [dailyIdx, setDailyIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const shotInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDailyIdx(Math.floor(Date.now() / 86400000) % DAILY.length);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function search(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    recordSearch(trimmed);
    router.push(`/results?q=${encodeURIComponent(trimmed)}`);
  }

  function onShot(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        sessionStorage.setItem(PENDING_SHOT_KEY, String(reader.result));
      } catch { /* ignore */ }
      router.push("/shot");
    };
    reader.readAsDataURL(file);
  }

  const todayChip = DAILY[dailyIdx];

  return (
    <div className="animate-fade px-5 pb-14">
      {/* 검색 입력 */}
      <div className="relative mt-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") search(query);
          }}
          placeholder="느낌, 상황, 뭐든 검색해봐"
          className="w-full rounded-[10px] border border-line bg-white py-4 pl-4 pr-[52px] text-[15px] outline-none transition placeholder:text-ink-faint focus:border-accent"
        />
        <button
          type="button"
          onClick={() => search(query)}
          aria-label="검색"
          className="absolute right-2 top-1/2 flex h-[38px] w-[38px] -translate-y-1/2 items-center justify-center rounded-[10px] bg-accent text-lg text-white"
        >
          →
        </button>
      </div>

      {/* 스크린샷으로 찾기 */}
      <button
        type="button"
        onClick={() => shotInput.current?.click()}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-line py-3 text-[13px] font-semibold text-ink-soft transition hover:bg-paper-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="14" rx="2.5" />
          <circle cx="12" cy="13" r="3.2" />
          <path d="M8.5 6l1.2-2h4.6l1.2 2" />
        </svg>
        스크린샷으로 찾기
      </button>
      <input
        ref={shotInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onShot}
      />

      {/* 오늘의 추천 + 밈 */}
      <div className="mt-8">
        <h2 className="mb-3 text-[14px] font-bold tracking-[-0.3px]">오늘의 추천</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => search(todayChip)}
            className="rounded-full border border-accent/30 bg-accent/5 px-3.5 py-2 text-[13px] font-medium text-ink transition hover:bg-accent/10"
          >
            {todayChip}
          </button>
          {MEME_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => search(chip)}
              className="rounded-full border border-line px-3.5 py-2 text-[13px] transition hover:border-accent hover:bg-paper-2"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 상황별 검색 */}
      <div className="mt-8">
        <h2 className="mb-3 text-[14px] font-bold tracking-[-0.3px]">상황별</h2>
        <div className="flex flex-wrap gap-2">
          {SITUATION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => search(chip)}
              className="rounded-full border border-line px-3.5 py-2 text-[13px] transition hover:border-accent hover:bg-paper-2"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 무드별 탐색 */}
      <div className="mt-8">
        <h2 className="mb-3 text-[14px] font-bold tracking-[-0.3px]">무드별</h2>
        <div className="grid grid-cols-3 gap-2">
          {ALL_MOOD_KEYS.map((moodKey) => {
            const mood = MOODS[moodKey];
            return (
              <Link
                key={moodKey}
                href={`/mood/${moodKey}`}
                className="relative overflow-hidden rounded-xl"
                style={{ aspectRatio: "1" }}
              >
                <div
                  className="absolute inset-0"
                  style={
                    mood.imageUrl
                      ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: mood.gradient }
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2.5 text-[12px] font-semibold text-white">
                  {mood.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
