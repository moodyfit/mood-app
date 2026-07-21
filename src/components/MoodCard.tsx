"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Mood } from "@/lib/types";
import { useMoodStore } from "@/lib/store";
import { lookTotal, formatMan } from "@/lib/products";

export default function MoodCard({
  mood,
  query,
  hint = false,
}: {
  mood: Mood;
  query?: string;
  hint?: boolean;
}) {
  const { isSaved, toggleSave } = useMoodStore();
  const saved = isSaved(mood.key);

  // 7.10 '길게 눌러 해줌' — 롱프레스 중 해설 노출, 떼면 사라짐. 롱프레스 후엔 이동 억제.
  const [caption, setCaption] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  function press() {
    longPressed.current = false;
    timer.current = setTimeout(() => {
      longPressed.current = true;
      setCaption(true);
    }, 380);
  }
  function release() {
    if (timer.current) clearTimeout(timer.current);
    setCaption(false);
  }

  return (
    <Link
      href={`/mood/${mood.key}`}
      onClick={(e) => {
        if (longPressed.current) {
          e.preventDefault();
          longPressed.current = false;
        }
      }}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onContextMenu={(e) => e.preventDefault()}
      className="group relative block aspect-[3/4] select-none overflow-hidden rounded-xl transition active:scale-[0.98]"
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
      {/* 첫 인상 감정 대응 + 롱프레스 발견성: 첫 카드에만 해설 힌트 */}
      {hint && !caption && (
        <div className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink">
          꾹 눌러봐
        </div>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleSave(mood.key, query);
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

      {/* 모먼트 2: 무드 완성가 */}
      <div className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
        이 느낌 완성 · <span className="font-latin">{formatMan(lookTotal(mood.key))}</span>
      </div>

      {/* 7.10 길게 눌러 해줌 — 해설 오버레이 */}
      <div
        className={`absolute inset-0 flex items-end bg-black/70 p-3 text-[12.5px] leading-relaxed text-white transition-opacity duration-150 ${
          caption ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {mood.caption}
      </div>
    </Link>
  );
}
