"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Photo } from "@/lib/photos";
import type { MoodKey } from "@/lib/types";
import { photoUrl, dominantMood, cardRatio } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";

/**
 * DB photos 카드 (메이슨리 = 전시 문법).
 * 단일 탭 = 무드 상세(살 수 있는 surface) / 롱프레스 = 해설 / 하트 = 저장.
 * size: "hero"(개인화 시각화 — 너의 결과 최상위 매치, 전면폭) | "sm"(일반).
 * 해설 밴드는 hero/hint 카드에서만 → 소형 카드는 사진을 덮지 않음(액자 원칙 ②).
 * 높이는 사진 실비율(cardRatio)로 — 크롭으로 세로를 위조하지 않음(①).
 */
export default function PhotoCard({
  photo,
  query,
  hint = false,
  size = "sm",
}: {
  photo: Photo;
  query?: string;
  hint?: boolean;
  size?: "hero" | "sm";
}) {
  const router = useRouter();
  const { isPhotoSaved, togglePhotoSave, recordView } = useMoodStore();
  const key = dominantMood(photo.mood_vector);
  const saved = isPhotoSaved(photo.id); // 사진별 저장 — 같은 무드의 다른 사진과 독립
  // (B) 사진 전용 상품 뷰로 — slug = 파일명(moods/clean-001.jpg → clean-001)
  const slug = photo.image_url.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
  const hero = size === "hero";
  const showCaption = hero || hint;
  const ratio = hero ? 0.78 : cardRatio(photo);

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
    if (slug) {
      recordView(key as MoodKey); // 클릭(상세 열기)도 취향 신호 → 점점 개인화
      router.push(`/photo/${slug}`);
    }
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
      onKeyDown={(e) => slug && e.key === "Enter" && router.push(`/photo/${slug}`)}
      style={{ aspectRatio: String(ratio) }}
      className="group relative block w-full cursor-pointer select-none overflow-hidden rounded-2xl transition active:scale-[0.98]"
    >
      <div
        className="absolute inset-0 bg-paper-2"
        style={url ? { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      />

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          togglePhotoSave(photo.id, key as MoodKey, query);
        }}
        aria-label={saved ? "저장 취소" : "저장"}
        className={`absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border text-base backdrop-blur transition ${
          saved ? "border-accent bg-accent text-white" : "border-white/35 bg-black/25 text-white"
        }`}
      >
        {saved ? "♥" : "♡"}
      </button>

      {/* hero/첫 카드: 해설을 '펼쳐서' 상시 노출 (v2.6 1번 사진 해설 펼침 + §7.10 무기#1).
          왜 멋있는지를 롱프레스 없이 즉시 보여 최강 무기를 전면화. 소형 일반 카드는 생략(②) */}
      {showCaption && !caption && photo.caption_item && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
          <div className="text-[12.5px] font-semibold text-white">{photo.caption_item}</div>
          {/* 해설이 펼쳐진 것 자체가 노출 — 별도 안내 문구 금지(스펙) */}
          {photo.caption_why && (
            <div className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-white/85">
              {photo.caption_why}
            </div>
          )}
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
