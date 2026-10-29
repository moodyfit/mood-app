"use client";

import { useEffect } from "react";
import type { Mood } from "@/lib/types";
import type { Photo } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";
import { formatMan } from "@/lib/products";

/** imageUrl — 지금 보는 사진. 없으면 무드 내장 이미지. photo — 하트가 저장할 사진, 없으면 무드를 저장 */
export default function MoodHero({
  mood,
  total,
  imageUrl = mood.imageUrl,
  photo,
}: {
  mood: Mood;
  total: number;
  imageUrl?: string;
  photo?: Photo;
}) {
  const { isSaved, toggleSave, isPhotoSaved, togglePhotoSave, recordView } = useMoodStore();
  const saved = photo ? isPhotoSaved(photo.id) : isSaved(mood.key);

  // 7.6 프로필 누적: 무드 상세 조회도 취향 신호
  useEffect(() => {
    recordView(mood.key);
  }, [mood.key, recordView]);

  return (
    <div className="relative mb-1 aspect-[3/4] overflow-hidden rounded-xl bg-paper-2">
      <div
        className="absolute inset-0"
        style={
          imageUrl
            ? { backgroundImage: `url(${imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
            : { background: mood.gradient }
        }
      />
      {!imageUrl && <div className="grain" />}
      <button
        type="button"
        onClick={() => (photo ? togglePhotoSave(photo.id, photo.mood_vector) : toggleSave(mood.key))}
        aria-label={saved ? "담기 취소" : "담기"}
        className={`absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border text-base backdrop-blur transition ${
          saved
            ? "border-accent bg-accent text-white"
            : "border-white/35 bg-black/25 text-white"
        }`}
      >
        {saved ? "♥" : "♡"}
      </button>
      {total > 0 && (
        <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur">
          이 느낌 완성 · <span className="font-latin tnum">{formatMan(total)}</span>
        </div>
      )}
    </div>
  );
}
