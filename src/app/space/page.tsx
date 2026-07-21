"use client";

import Link from "next/link";
import BackButton from "@/components/BackButton";
import TasteProfile from "@/components/TasteProfile";
import MoodMap from "@/components/MoodMap";
import Room from "@/components/Room";
import { useMoodStore } from "@/lib/store";

/**
 * 나의 공간 — N3(재방문) 엔진 + 겹4(시간 방어)의 얼굴.
 * 척추: 추구미 카드 프로필(A) + 무드 지도(C) + 자동 콜라주 무드보드(A).
 */
export default function SpacePage() {
  const { savedCount } = useMoodStore();

  return (
    <div className="animate-fade px-5 pb-14">
      <BackButton href="/" />
      <h1 className="mb-4 text-[22px] font-extrabold tracking-[-0.5px]">나의 공간</h1>

      <TasteProfile />

      {savedCount > 0 && (
        <>
          <div className="mt-8">
            <MoodMap />
          </div>
          <div className="mt-8">
            <Room />
          </div>
          <Link
            href="/scan"
            className="mt-8 block rounded-[12px] border border-line py-3.5 text-center text-[14px] font-semibold text-ink-soft transition hover:bg-paper-2"
          >
            취향 스캔 한 판 더
          </Link>
        </>
      )}
    </div>
  );
}
