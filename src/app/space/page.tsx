"use client";

import { useEffect } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import TasteProfile from "@/components/TasteProfile";
import Room from "@/components/Room";
import Closet from "@/components/Closet";
import Discovered from "@/components/Discovered";
import { useMoodStore } from "@/lib/store";

/**
 * 나의 공간 — N3(재방문) 엔진 + 겹4(시간 방어)의 얼굴.
 * 척추: 추구미 카드 프로필(A) + 무드 지도(C) + 자동 콜라주 무드보드(A).
 */
export default function SpacePage() {
  const { savedCount, clearSpaceDot } = useMoodStore();

  // B5: 나의 공간 진입 시 카드 발급 dot 제거
  useEffect(() => {
    clearSpaceDot();
  }, [clearSpaceDot]);

  return (
    <div className="animate-fade px-5 pb-14">
      <BackButton href="/" />
      <h1 className="mb-4 text-[22px] font-extrabold tracking-[-0.5px]">나의 공간</h1>

      <TasteProfile />

      <Link
        href="/shot"
        className="mt-3 flex items-center justify-center gap-2 rounded-[12px] border border-line py-3 text-[14px] font-semibold text-ink-soft transition hover:bg-paper-2"
      >
        멋있는 거 봤으면 스샷으로 찾기
      </Link>

      {savedCount > 0 && (
        <>
          {/* 저장 사진 밀도 그리드 + 아직 안 가본 곳 (숫자·바 없음) */}
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

      {/* 발견 결 (스크린샷) */}
      <div className="mt-8">
        <Discovered />
      </div>

      {/* 소유 결 — 있으면 저장 여부와 무관하게 노출 */}
      <div className="mt-8">
        <Closet />
      </div>
    </div>
  );
}
