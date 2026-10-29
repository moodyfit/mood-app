"use client";

import type { Photo } from "@/lib/photos";
import { photoUrl } from "@/lib/photos";

/** 무드 상세 "이 무드의 다른 코디" — 가로 스크롤 썸네일, 탭하면 그 코디로 바뀐다. 불러오는 동안 같은 크기 스켈레톤, 1장 이하면 숨김 */
export default function LookStrip({
  photos,
  selectedId,
  loading,
  onSelect,
}: {
  photos: Photo[];
  selectedId: string;
  loading: boolean;
  onSelect: (photo: Photo) => void;
}) {
  if (loading) {
    return (
      <div className="mt-3" aria-hidden>
        <div className="mb-1.5 h-5 w-28 animate-pulse rounded bg-paper-2" />
        <div className="-mr-5 flex gap-2 overflow-hidden p-1">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="h-[70px] w-14 flex-shrink-0 animate-pulse rounded-lg bg-paper-2" />
          ))}
        </div>
      </div>
    );
  }
  if (photos.length <= 1) return null;
  const index = photos.findIndex((p) => p.id === selectedId);

  return (
    <div className="mt-3">
      <div className="mb-1.5 flex items-baseline justify-between">
        <div className="text-[13px] font-semibold">이 무드의 다른 코디</div>
        <div className="font-latin tnum text-[11px] text-ink-faint">
          {index + 1} / {photos.length}
        </div>
      </div>
      <div className="relative -mr-5">
        <div className="flex gap-2 overflow-x-auto p-1 pr-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              aria-label={p.caption_item ?? "코디 보기"}
              aria-pressed={p.id === selectedId}
              className={`relative h-[70px] w-14 flex-shrink-0 overflow-hidden rounded-lg bg-paper-2 transition ${
                p.id === selectedId ? "outline outline-2 outline-offset-2 outline-ink" : "opacity-75"
              }`}
            >
              <img src={photoUrl(p.image_url)} alt="" loading="lazy" className="h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-1 top-1 rounded bg-black/55 px-1 text-[9px] font-medium text-white">
                  대표
                </span>
              )}
            </button>
          ))}
        </div>
        {/* 옆으로 더 있다는 표시 */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-paper to-transparent" />
      </div>
    </div>
  );
}
