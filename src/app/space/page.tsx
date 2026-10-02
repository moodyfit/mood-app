"use client";

import { useEffect } from "react";
import Link from "next/link";
import TasteProfile from "@/components/TasteProfile";
import { MOODS } from "@/lib/moods";
import { useMoodStore } from "@/lib/store";

const PREVIEW_COUNT = 4;

/**
 * 나의 공간 — 3블록 구조: 취향 카드 + 내 옷(썸네일 프리뷰) + 계정.
 */
export default function SpacePage() {
  const { clearSpaceDot, owned, user, signOut } = useMoodStore();

  useEffect(() => {
    clearSpaceDot();
  }, [clearSpaceDot]);

  const preview = owned.slice(0, PREVIEW_COUNT);
  const hasMore = owned.length > PREVIEW_COUNT;

  return (
    <div className="animate-fade px-5 pb-14">
      <h1 className="mb-4 pt-3 text-[22px] font-extrabold tracking-[-0.5px]">나의 공간</h1>

      {/* 블록 1: 취향 카드 + 공유 */}
      <TasteProfile />

      {/* 블록 2: 내 옷 — 썸네일 프리뷰 + 더보기 */}
      <div className="mt-8">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-[16px] font-bold tracking-[-0.3px]">내 옷</h2>
          {owned.length > 0 && (
            <Link href="/closet" className="text-[13px] text-ink-soft">
              {owned.length}벌 ›
            </Link>
          )}
        </div>

        {owned.length === 0 ? (
          <p className="text-[13px] text-ink-soft">아직 담은 옷이 없어.</p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2">
              {preview.map((item) => {
                const mood = MOODS[item.moodKey];
                return (
                  <Link
                    key={item.id}
                    href={`/closet/${encodeURIComponent(item.id)}`}
                    className="relative overflow-hidden rounded-xl"
                    style={{ aspectRatio: "1" }}
                  >
                    <div
                      className="absolute inset-0"
                      style={
                        mood?.imageUrl
                          ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                          : { background: mood?.gradient }
                      }
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-1.5 pt-4">
                      <div className="truncate text-[10px] font-medium text-white">{item.name}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {hasMore && (
              <Link
                href="/closet"
                className="mt-3 flex items-center justify-center rounded-[10px] border border-line py-2.5 text-[13px] font-semibold text-ink-soft transition hover:bg-paper-2"
              >
                더보기
              </Link>
            )}
          </>
        )}
      </div>

      {/* 블록 3: 로그인/계정 */}
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
