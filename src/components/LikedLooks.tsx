"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ShelfCard, { Shelf, ShelfHeader } from "@/components/ShelfCard";
import { MOODS } from "@/lib/moods";
import { dominantMood, fetchPhotos, photoUrl, type Photo } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";
import { TASTE_CARD_THRESHOLD } from "@/lib/taste";
import type { MoodKey } from "@/lib/types";

interface Tile {
  key: string;
  href: string;
  label: string;
  image?: string;
  background?: string;
}

/** 내 취향 코디 — 하트 누른 코디(최신순) 다음에 하트 누른 무드. */
export default function LikedLooks() {
  const { likedPhotoIds, likedMoods, savedCount } = useMoodStore();
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const hasLikedPhotos = likedPhotoIds.length > 0;

  useEffect(() => {
    if (!hasLikedPhotos) return;
    let alive = true;
    // ponytail: 전체 조회 후 필터. 사진이 많아져 느려지면 lib에 id 조회 함수를 추가
    void fetchPhotos().then((all) => {
      if (alive) setPhotos(all);
    });
    return () => {
      alive = false;
    };
  }, [hasLikedPhotos]);

  const tiles = useMemo<Tile[]>(() => {
    const byId = new Map((photos ?? []).map((p) => [p.id, p]));
    const photoTiles = [...likedPhotoIds].reverse().flatMap((id): Tile[] => {
      const p = byId.get(id);
      if (!p) return [];
      const slug = p.image_url.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
      const mood = MOODS[dominantMood(p.mood_vector) as MoodKey];
      return [
        {
          key: `photo-${id}`,
          href: `/photo?slug=${encodeURIComponent(slug)}`,
          label: `코디 · ${mood?.name ?? ""}`,
          image: photoUrl(p.image_url),
        },
      ];
    });
    const moodTiles = likedMoods.flatMap((r): Tile[] => {
      const mood = MOODS[r.moodKey];
      if (!mood) return [];
      return [
        {
          key: `mood-${r.moodKey}`,
          href: `/mood/${r.moodKey}`,
          label: `무드 · ${mood.name}`,
          image: mood.imageUrl,
          background: mood.gradient,
        },
      ];
    });
    return [...photoTiles, ...moodTiles];
  }, [photos, likedPhotoIds, likedMoods]);

  // 하트가 없으면 위 취향 카드의 빈 상태가 같은 안내를 한다
  if (!hasLikedPhotos && likedMoods.length === 0) return null;

  const loading = hasLikedPhotos && photos === null;

  return (
    <div id="liked" className="mt-8 scroll-mt-16">
      <ShelfHeader title="내 취향 코디" count={tiles.length > 0 ? `${tiles.length}개` : undefined} />
      {loading && tiles.length === 0 ? (
        <Shelf>
          {Array.from({ length: Math.min(likedPhotoIds.length, 3) }, (_, i) => (
            <ShelfCard key={i} />
          ))}
        </Shelf>
      ) : tiles.length === 0 ? (
        <p className="text-[13px] text-ink-soft">내 취향 코디를 불러오지 못했어.</p>
      ) : (
        <Shelf>
          {tiles.map((t) => (
            <ShelfCard key={t.key} href={t.href} image={t.image} background={t.background} label={t.label} />
          ))}
          {savedCount >= TASTE_CARD_THRESHOLD && (
            <Link
              href="/results?you=1"
              className="flex aspect-[3/4] w-[38%] flex-none snap-start flex-col self-start justify-end rounded-xl bg-paper-2 p-3.5"
            >
              <span className="text-[14px] font-bold leading-snug">
                이 취향으로
                <br />더 보기 →
              </span>
              <span className="mt-1 text-[11.5px] text-ink-soft">비슷한 코디 추천</span>
            </Link>
          )}
        </Shelf>
      )}
    </div>
  );
}
