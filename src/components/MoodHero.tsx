"use client";

import { useEffect } from "react";
import type { Mood } from "@/lib/types";
import { useMoodStore } from "@/lib/store";
import { formatMan } from "@/lib/products";

export default function MoodHero({ mood, total }: { mood: Mood; total: number }) {
  const { isSaved, toggleSave, recordView } = useMoodStore();
  const saved = isSaved(mood.key);

  // 7.6 프로필 누적: 무드 상세 조회도 취향 신호
  useEffect(() => {
    recordView(mood.key);
  }, [mood.key, recordView]);

  return (
    <div className="relative mb-1 aspect-[3/4] overflow-hidden rounded-xl">
      <div
        className="absolute inset-0"
        style={
          mood.imageUrl
            ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: mood.gradient }
        }
      />
      {!mood.imageUrl && <div className="grain" />}
      <button
        type="button"
        onClick={() => toggleSave(mood.key)}
        aria-label={saved ? "담기 취소" : "담기"}
        className={`absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border text-base backdrop-blur transition ${
          saved
            ? "border-accent bg-accent text-white"
            : "border-white/35 bg-black/25 text-white"
        }`}
      >
        {saved ? "♥" : "♡"}
      </button>
      <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur">
        이 느낌 완성 · <span className="font-latin tnum">{formatMan(total)}</span>
      </div>
    </div>
  );
}
