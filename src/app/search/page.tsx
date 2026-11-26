"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMoodStore } from "@/lib/store";

const PENDING_SHOT_KEY = "moodfit.pendingShot";

export default function SearchPage() {
  const router = useRouter();
  const { recordSearch } = useMoodStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const shotInput = useRef<HTMLInputElement>(null);

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
      {/* FEAT-041: 검색창 통합 — /results가 상품명 매칭을 먼저 시도하고, 안 되면 상황/느낌
          문구(QUERY_MAP → AI 번역)로 자동 폴백하므로 이 입력창 하나로 상품명·TPO·무드 전부
          받는다. 예전엔 "제품명 전용"으로 문구를 못박고 상황/느낌은 약속 모드(/promise)로
          역할을 분리했었는데, 약속 모드 진입 카드를 홈에서 뺀 지금은 이 입력창이 유일한
          검색 입구라 문구도 둘 다 받는다는 걸 보여주게 바꿨다. */}
      <div className="relative mt-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") search(query);
          }}
          placeholder="슬랙스든 비 오는 날 느낌이든, 뭐든 검색해봐"
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
    </div>
  );
}
