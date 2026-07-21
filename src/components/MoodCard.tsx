"use client";

import Link from "next/link";
import type { Mood } from "@/lib/types";
import { useMoodStore } from "@/lib/store";

export default function MoodCard({ mood }: { mood: Mood }) {
  const { isSaved, toggleSave } = useMoodStore();
  const saved = isSaved(mood.key);

  return (
    <Link
      href={`/mood/${mood.key}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-xl transition active:scale-[0.98]"
      aria-label={`${mood.name} 무드 보기`}
    >
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
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSave(mood.key);
        }}
        aria-label={saved ? "저장 취소" : "저장"}
        className={`absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border text-base backdrop-blur transition ${
          saved
            ? "border-accent bg-accent text-white"
            : "border-white/35 bg-black/25 text-white"
        }`}
      >
        {saved ? "♥" : "♡"}
      </button>
    </Link>
  );
}
