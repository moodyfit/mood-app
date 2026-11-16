"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LikedLooks from "@/components/LikedLooks";
import ShelfCard, { Shelf, ShelfHeader } from "@/components/ShelfCard";
import TasteProfile from "@/components/TasteProfile";
import { MOODS } from "@/lib/moods";
import { fetchPhotoProducts, photoUrl } from "@/lib/photos";
import type { Product } from "@/lib/types";
import { useMoodStore } from "@/lib/store";

/**
 * 나의 공간 — 취향 카드 + 내 취향 코디 + 내 옷장 + 계정.
 */
export default function SpacePage() {
  const { clearSpaceDot, wardrobeItems, user, signOut } = useMoodStore();
  // null = 상품 조회 중. 실패하면 빈 Map이 와서 코디 사진으로 넘어간다
  const [byPhoto, setByPhoto] = useState<Map<string, Product[]> | null>(null);

  useEffect(() => {
    clearSpaceDot();
  }, [clearSpaceDot]);

  useEffect(() => {
    fetchPhotoProducts().then(setByPhoto);
  }, []);

  return (
    <div className="animate-fade px-5 pb-14">
      <h1 className="mb-4 pt-3 text-[22px] font-extrabold tracking-[-0.5px]">나의 공간</h1>

      <TasteProfile />

      <LikedLooks />

      <div className="mt-8">
        <ShelfHeader title="내 옷장" count={wardrobeItems.length > 0 ? `${wardrobeItems.length}벌` : undefined} href="/closet" />

        {wardrobeItems.length === 0 ? (
          <p className="text-[13px] text-ink-soft">코디 속 사고 싶은 옷을 담아 봐.</p>
        ) : (
          <Shelf>
            {[...wardrobeItems].reverse().map((item) => {
              const mood = MOODS[item.moodKey];
              const crop = item.photo && byPhoto?.get(item.photo)?.find((p) => p.id === item.id)?.imageUrl;
              // 상품 조회 전에는 비워 둔다 — 코디 사진이 보였다가 크롭으로 바뀌지 않게
              const image = crop || (item.photo ? (byPhoto ? photoUrl(item.photo) : undefined) : mood?.imageUrl);
              const slug = item.photo?.split("/").pop()?.replace(/\.\w+$/, "");
              return (
                <ShelfCard
                  key={item.id}
                  square
                  href={slug ? `/photo?slug=${encodeURIComponent(slug)}` : `/closet/item?id=${encodeURIComponent(item.id)}`}
                  image={image}
                  background={item.photo ? undefined : mood?.gradient}
                  label={item.name}
                />
              );
            })}
          </Shelf>
        )}
      </div>

      {user ? (
        <div className="mt-8 flex items-center justify-between rounded-[12px] border border-line px-4 py-3.5">
          <div className="min-w-0">
            <div className="text-[12px] text-ink-faint">로그인됨</div>
            <div className="truncate text-[13.5px] font-medium">{user.email}</div>
          </div>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex-shrink-0 rounded-full border border-line px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft transition hover:border-accent"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <Link
          href="/login"
          className="mt-8 flex items-center justify-between rounded-[12px] border border-line px-4 py-3.5 transition hover:bg-paper-2"
        >
          <span className="text-[14px] font-semibold">로그인 / 회원가입</span>
          <span className="text-[13px] text-ink-soft">취향 이어가기 ›</span>
        </Link>
      )}
    </div>
  );
}
