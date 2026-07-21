"use client";

import type { Mood } from "@/lib/types";
import { useMoodStore } from "@/lib/store";

export default function MoodHero({ mood }: { mood: Mood }) {
  const { isSaved, toggleSave } = useMoodStore();
  const saved = isSaved(mood.key);

  return (
    <div className="relative mb-1 aspect-[16/10] overflow-hidden rounded-xl">
      <div
        className="absolute inset-0"
        style={
          mood.imageUrl
            ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: mood.gradient }
        }
      />
      <div className="grain" />
      <button
        type="button"
        onClick={() => toggleSave(mood.key)}
        aria-label={saved ? "저장 취소" : "저장"}
        className={`absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border text-base backdrop-blur transition ${
          saved
            ? "border-accent bg-accent text-white"
            : "border-white/35 bg-black/25 text-white"
        }`}
      >
        {saved ? "♥" : "♡"}
      </button>
    </div>
  );
}
