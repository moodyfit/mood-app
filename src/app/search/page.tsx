"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMoodStore } from "@/lib/store";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { topSituations } from "@/lib/photos";
import { MOODS, ALL_MOOD_KEYS } from "@/lib/moods";

const PENDING_SHOT_KEY = "moodfit.pendingShot";

// 밈 언어는 DB 태그가 아니라 트렌드 문구라 실데이터화 대상이 아니다(상황별과 성격이 다름).
const MEME_CHIPS = ["테토남 그 느낌", "느좋 그 자체", "남친룩"];

export default function SearchPage() {
  const router = useRouter();
  const { recordSearch } = useMoodStore();
  const { photos } = usePhotos();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const shotInput = useRef<HTMLInputElement>(null);

  // 10/28 회의록 "검색창의 추천/상황별(더미데이터->실데이터로 교체)" — photos.situations를
  // 빈도순 집계(topSituations)해서 "오늘의 추천"(날짜 기반 로테이션 1개)과 "상황별"(전체) 둘 다 쓴다.
  const situations = useMemo(() => topSituations(photos), [photos]);
  const todayChip = situations.length > 0 ? situations[Math.floor(Date.now() / 86400000) % situations.length] : null;

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
      {(todayChip || MEME_CHIPS.length > 0) && (
        <div className="mt-8">
          <h2 className="mb-3 text-[14px] font-bold tracking-[-0.3px]">오늘의 추천</h2>
          <div className="flex flex-wrap gap-2">
            {todayChip && (
              <button
                type="button"
                onClick={() => search(todayChip)}
                className="rounded-full border border-accent/30 bg-accent/5 px-3.5 py-2 text-[13px] font-medium text-ink transition hover:bg-accent/10"
              >
                {todayChip}
              </button>
            )}
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
      )}

      {/* 상황별 검색 — photos.situations 실데이터 */}
      {situations.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-[14px] font-bold tracking-[-0.3px]">상황별</h2>
          <div className="flex flex-wrap gap-2">
            {situations.map((chip) => (
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
      )}

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
