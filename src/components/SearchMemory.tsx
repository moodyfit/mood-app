"use client";

import Link from "next/link";
import { MOODS } from "@/lib/moods";
import type { Photo } from "@/lib/photos";
import { photoUrl } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";

/**
 * 7.8 검색 기억 — 같은 상황어를 다시 검색하면 지난번 이 검색어로 ♡ 누른 코디를 되짚어준다.
 * "무신사는 검색을 기억하고, 무드핏은 상황을 기억한다."
 * 재검색(searchCount >= 2)이고 기록이 있을 때만 노출. 코디 기록이 없으면 무드 ♡ 기록(사진 DB가 빈 화면).
 */
export default function SearchMemory({ query, photos = [] }: { query: string; photos?: Photo[] }) {
  const { likedMoods, searchCount, searchLikedPhotoIds } = useMoodStore();

  const q = query.trim().toLowerCase();
  const photoIds = searchLikedPhotoIds(query);
  const priorMoods = likedMoods.filter((s) => (s.query ?? "").trim().toLowerCase() === q);

  if (searchCount(query) < 2 || (photoIds.length === 0 && priorMoods.length === 0)) return null;

  const byId = new Map(photos.map((p) => [p.id, p]));
  const priorPhotos = photoIds.map((id) => byId.get(id)).filter((p): p is Photo => !!p);
  const label = photoIds.length > 0 ? `코디 ${photoIds.length}개` : `무드 ${priorMoods.length}개`;

  return (
    <div className="mb-4 rounded-xl border border-line bg-paper-2 p-3">
      <div className="text-[13px] text-ink-soft">
        지난번 <span className="font-semibold text-ink">&lsquo;{query}&rsquo;</span> 때 마음에 든 {label}
      </div>
      <div className="mt-2.5 flex gap-2 overflow-x-auto">
        {photoIds.length > 0
          ? priorPhotos.map((p) => (
              <Link
                key={p.id}
                href={`/photo?slug=${p.image_url.split("/").pop()?.replace(/\.\w+$/, "") ?? ""}`}
                className="relative h-16 w-[52px] flex-shrink-0 overflow-hidden rounded-lg bg-paper"
                style={{ backgroundImage: `url(${photoUrl(p.image_url)})`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
            ))
          : priorMoods.map((s) => {
              const mood = MOODS[s.moodKey];
              if (!mood) return null;
              return (
                <Link
                  key={`${s.moodKey}-${s.savedAt}`}
                  href={`/mood/${s.moodKey}`}
                  className="relative h-16 w-[52px] flex-shrink-0 overflow-hidden rounded-lg"
                  style={
                    mood.imageUrl
                      ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: mood.gradient }
                  }
                />
              );
            })}
      </div>
    </div>
  );
}
