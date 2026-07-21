"use client";

import Link from "next/link";
import { MOODS } from "@/lib/moods";
import { useMoodStore } from "@/lib/store";

/**
 * 컨셉 A — 저장한 스트릿샷이 자동 조립되는 무드보드 콜라주.
 * 균일 그리드가 아니라 높이가 엇갈리는 masonry(CSS columns)로 '보드 벽' 느낌.
 * N3(재방문)의 본체 = 내 취향의 초상, 구경거리 자체.
 */
const ASPECTS = ["aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]"];

export default function Moodboard() {
  const { saves, isSaved, toggleSave } = useMoodStore();

  return (
    <div>
      <div className="mb-2 text-[12px] text-ink-faint">나의 무드보드</div>
      <div className="columns-2 gap-2 [&>*]:mb-2">
        {saves.map((s, i) => {
          const mood = MOODS[s.moodKey];
          if (!mood) return null;
          return (
            <Link
              key={`${s.moodKey}-${s.savedAt}`}
              href={`/mood/${mood.key}`}
              className={`group relative block break-inside-avoid overflow-hidden rounded-xl ${ASPECTS[i % ASPECTS.length]}`}
            >
              <div
                className="absolute inset-0"
                style={
                  mood.imageUrl
                    ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: mood.gradient }
                }
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSave(mood.key);
                }}
                aria-label="무드보드에서 빼기"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-black/25 text-sm text-white backdrop-blur"
              >
                {isSaved(mood.key) ? "♥" : "♡"}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
