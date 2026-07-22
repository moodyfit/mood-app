"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Photo } from "@/lib/photos";
import { photoUrl, dominantMood } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";

/**
 * DB photos 카드.
 * 단일 탭 = 무드 상세(살 수 있는 surface) / 롱프레스 = 해설 / 하트 = 저장.
 * 첫 카드(hint)는 해설을 밴드로 상시 노출 → 최강 무기(왜 멋있는지) 발견성 확보.
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
  const router = useRouter();
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
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    if (key) router.push(`/mood/${key}`);
  }

  const url = photoUrl(photo.image_url);

  return (
    <div
      role="link"
      tabIndex={0}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={() => {
        if (longTimer.current) clearTimeout(longTimer.current);
        setCaption(false);
      }}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => key && e.key === "Enter" && router.push(`/mood/${key}`)}
      className="group relative block aspect-[4/5] cursor-pointer select-none overflow-hidden rounded-2xl transition active:scale-[0.98]"
    >
      <div
        className="absolute inset-0 bg-paper-2"
        style={url ? { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      />

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

      {/* 첫 카드: 해설을 밴드로 상시 노출 (무기 발견성) */}
      {hint && !caption && photo.caption_item && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8">
          <div className="text-[12.5px] font-medium text-white">{photo.caption_item}</div>
          <div className="mt-0.5 text-[11px] text-white/70">꾹 누르면 왜 멋진지 →</div>
        </div>
      )}

      {/* 롱프레스 해설 (전문) */}
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
