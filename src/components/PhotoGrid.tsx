"use client";

import type { Photo } from "@/lib/photos";
import PhotoCard from "./PhotoCard";

/** DB photos 그리드 (검색 맥락 한 줄 + 2열 카드). 완성가 라벨 없음. */
export default function PhotoGrid({ photos, query }: { photos: Photo[]; query: string }) {
  return (
    <div>
      <h2 className="mb-4 text-[20px] font-bold tracking-[-0.4px]">‘{query}’ 느낌</h2>
      <div className="grid grid-cols-2 gap-3">
        {photos.map((p, idx) => (
          <PhotoCard key={p.id} photo={p} query={query} hint={idx === 0} />
        ))}
      </div>
    </div>
  );
}
