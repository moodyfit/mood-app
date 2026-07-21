"use client";

import { useState } from "react";
import Link from "next/link";
import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import { computeTaste, personalizeOrder } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";
import MoodCard from "./MoodCard";

/**
 * 7.10 3초 취향 스캔 — 질문 0개. 사진 좋아/별로만으로 취향 방향을 잡는다.
 * 온보딩(설문)을 제거. '좋아'는 프로필 벡터에 적재(recordScanLike) → 즉시 방향 그리드.
 * 스와이프=고르는 모드(스캔), 그리드=사는 모드(메인)로 역할 분리.
 */
export default function ScanDeck() {
  const { recordScanLike, affinity } = useMoodStore();
  const [i, setI] = useState(0);
  const [likes, setLikes] = useState(0);

  const deck = ALL_MOOD_KEYS;
  const done = i >= deck.length;

  function like(key: string) {
    recordScanLike(key);
    setLikes((n) => n + 1);
    setI((n) => n + 1);
  }
  function skip() {
    setI((n) => n + 1);
  }

  if (done) {
    const { title } = computeTaste(affinity);
    const ordered = personalizeOrder([...ALL_MOOD_KEYS], affinity);
    return (
      <div className="animate-fade">
        <div className="text-[20px] font-bold tracking-[-0.4px]">
          {likes > 0 && title ? `너는 지금 ${title} 쪽` : "일단 눈에 드는 것부터"}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {ordered.map((k) => {
            const mood = MOODS[k];
            if (!mood) return null;
            return <MoodCard key={k} mood={mood} />;
          })}
        </div>
        <Link
          href="/space"
          className="mt-6 block rounded-[10px] bg-accent py-3.5 text-center text-sm font-bold text-white"
        >
          나의 공간 보기
        </Link>
      </div>
    );
  }

  const mood = MOODS[deck[i]];

  return (
    <div className="animate-fade">
      <div className="mb-3 flex items-center justify-between text-[13px] text-ink-faint">
        <span>눈에 들면 좋아, 아니면 넘겨</span>
        <span className="font-latin">
          {i + 1} / {deck.length}
        </span>
      </div>

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0"
          style={
            mood.imageUrl
              ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: mood.gradient }
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={skip}
          className="rounded-[12px] border border-line py-4 text-[15px] font-semibold text-ink-soft transition hover:bg-paper-2"
        >
          별로
        </button>
        <button
          type="button"
          onClick={() => like(mood.key)}
          className="rounded-[12px] bg-accent py-4 text-[15px] font-semibold text-white transition"
        >
          좋아
        </button>
      </div>
    </div>
  );
}
