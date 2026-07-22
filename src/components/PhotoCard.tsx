"use client";

import { useRef, useState } from "react";
import type { Photo } from "@/lib/photos";
import { photoUrl, dominantMood } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";

/**
 * DB photos 카드 (마일스톤: 그리드가 Supabase에서 뜸).
 * 완성가 라벨 없음(products 비어 있음). 롱프레스=해설(caption_item/why), 더블탭/하트=저장.
 * 저장/프로필은 mood_vector 최상위 축으로 적재.
 */
export default function PhotoCard({
  photo,
  query,
  hint = false,
}: {
  photo: Photo;
  query?: string;
  hint?: boolean;
}) {
  const { isSaved, toggleSave } = useMoodStore();
  const key = dominantMood(photo.mood_vector);
  const saved = isSaved(key);

  const [caption, setCaption] = useState(false);
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  function down() {
    longPressed.current = false;
    longTimer.current = setTimeout(() => {
      longPressed.current = true;
      setCaption(true);
    }, 380);
  }
  function up() {
    if (longTimer.current) clearTimeout(longTimer.current);
    setCaption(false);
  }

  const url = photoUrl(photo.image_url);

  return (
    <div
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onContextMenu={(e) => e.preventDefault()}
      className="group relative block aspect-[4/5] select-none overflow-hidden rounded-2xl"
    >
      <div
        className="absolute inset-0 bg-paper-2"
        style={url ? { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      />

      {hint && !caption && (
        <div className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink">
          꾹 눌러봐
        </div>
      )}

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          toggleSave(key, query);
        }}
        aria-label={saved ? "저장 취소" : "저장"}
        className={`absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border text-base backdrop-blur transition ${
          saved ? "border-accent bg-accent text-white" : "border-white/35 bg-black/25 text-white"
        }`}
      >
        {saved ? "♥" : "♡"}
      </button>

      {/* 해설 (길게 눌러 해줌) */}
      <div
        className={`absolute inset-0 flex flex-col justify-end gap-1 p-3 text-white transition-opacity duration-150 ${
          caption ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ background: "rgba(26,26,26,0.72)" }}
      >
        {photo.caption_item && <div className="text-[13px] font-semibold">{photo.caption_item}</div>}
        {photo.caption_why && <div className="text-[12.5px] leading-relaxed opacity-90">{photo.caption_why}</div>}
      </div>
    </div>
  );
}
