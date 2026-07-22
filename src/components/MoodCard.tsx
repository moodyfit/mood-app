"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Mood } from "@/lib/types";
import { useMoodStore } from "@/lib/store";
import { lookTotal, formatMan } from "@/lib/products";
import { moodCoverRatio } from "@/lib/photos";

/**
 * 무드 카드 (가이드라인 v2 §2·§4.2) — 메이슨리 전시 문법.
 * 표준 제스처: 단일 탭=상세 이동 / 더블탭=저장(인스타 문법) / 롱프레스=해설.
 * size: "hero"(너의 결과 최상위, 전면폭) | "sm"(일반). 소형 카드는 완성가 라벨 생략(②).
 */
export default function MoodCard({
  mood,
  query,
  hint = false,
  size = "sm",
  ratio,
}: {
  mood: Mood;
  query?: string;
  hint?: boolean;
  size?: "hero" | "sm";
  ratio?: number;
}) {
  const router = useRouter();
  const { isSaved, toggleSave } = useMoodStore();
  const saved = isSaved(mood.key);
  const hero = size === "hero";
  // 실측 비율 미도입 로컬 커버는 key 기반 안전 변주로 메이슨리 스태거 확보
  const cardR = ratio ?? moodCoverRatio(mood.key);

  const [caption, setCaption] = useState(false);
  const [pop, setPop] = useState(false);
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);
  const lastTap = useRef(0);

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
    const now = Date.now();
    if (now - lastTap.current < 260) {
      // 더블탭 = 저장 (인스타 문법)
      if (tapTimer.current) clearTimeout(tapTimer.current);
      lastTap.current = 0;
      if (!saved) {
        setPop(true);
        setTimeout(() => setPop(false), 500);
      }
      toggleSave(mood.key, query);
    } else {
      lastTap.current = now;
      tapTimer.current = setTimeout(() => {
        lastTap.current = 0;
        router.push(`/mood/${mood.key}`);
      }, 260);
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      aria-label={`${mood.name} 무드 보기`}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={() => {
        if (longTimer.current) clearTimeout(longTimer.current);
        setCaption(false);
      }}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/mood/${mood.key}`);
      }}
      style={{ aspectRatio: String(hero ? 0.78 : cardR) }}
      className="group relative block w-full cursor-pointer select-none overflow-hidden rounded-2xl transition active:scale-[0.98]"
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

      {/* 첫 카드: 해설을 펼쳐서 상시 노출 (v2.6 1번 사진 해설 펼침). 롱프레스 학습은 덤 */}
      {hint && !caption && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
          <div className="line-clamp-2 text-[11.5px] leading-relaxed text-white/90">{mood.caption}</div>
        </div>
      )}

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
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

      {/* 모먼트 2: 무드 완성가 — hero에서만(소형 카드는 사진을 덮지 않음, ②). 상세에서 항상 노출 */}
      {hero && (
        <div className="absolute bottom-2 left-2 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          이 느낌 완성 · <span className="tnum">{formatMan(lookTotal(mood.key))}</span>
        </div>
      )}

      {/* 더블탭 저장 하트 팝 */}
      {pop && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="animate-pop text-6xl text-white drop-shadow">♥</span>
        </div>
      )}

      {/* 롱프레스 해설 */}
      <div
        className={`absolute inset-0 flex items-end p-3 text-[12.5px] leading-relaxed text-white transition-opacity duration-150 ${
          caption ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ background: "rgba(26,26,26,0.72)" }}
      >
        {mood.caption}
      </div>
    </div>
  );
}
