"use client";

import { useEffect } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import TasteProfile from "@/components/TasteProfile";
import Room from "@/components/Room";
import Discovered from "@/components/Discovered";
import { MOODS } from "@/lib/moods";
import { useMoodStore } from "@/lib/store";

/**
 * 나의 공간 — N3(재방문) 엔진 + 겹4(시간 방어)의 얼굴.
 * 척추: 추구미 카드 프로필(A) + 무드 지도(C) + 자동 콜라주 무드보드(A).
 */
const WEEK = 7 * 24 * 60 * 60 * 1000;

export default function SpacePage() {
  const { savedCount, clearSpaceDot, owned } = useMoodStore();

  // B5: 나의 공간 진입 시 카드 발급 dot 제거
  useEffect(() => {
    clearSpaceDot();
  }, [clearSpaceDot]);

  // #7-d: 최근 7일 내 담은 '내 옷'이 있으면 소유 결을 카드 바로 아래로 승격
  const newest = [...owned].sort((a, b) => (b.at ?? 0) - (a.at ?? 0))[0];
  const promoted = newest && newest.at ? Date.now() - newest.at < WEEK : false;

  return (
    <div className="animate-fade px-5 pb-14">
      <BackButton href="/" />
      <h1 className="mb-4 text-[22px] font-extrabold tracking-[-0.5px]">나의 공간</h1>

      <TasteProfile />

      {/* 승격(7일): 새로 온 옷 스포트라이트 — 단일 카드, 탭 시 원본 소환 */}
      {promoted && newest && MOODS[newest.moodKey] && (
        <Link
          href={`/closet/${newest.id}`}
          className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white p-3 transition hover:border-accent"
        >
          <div
            className="h-14 w-12 flex-shrink-0 rounded-lg"
            style={
              MOODS[newest.moodKey]!.imageUrl
                ? { backgroundImage: `url(${MOODS[newest.moodKey]!.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                : { background: MOODS[newest.moodKey]!.gradient }
            }
          />
          <div className="min-w-0 flex-1">
            <div className="text-[12px] text-ink-faint">새로 온 {newest.name}</div>
            <div className="mt-0.5 text-[13px] font-semibold">입어볼 조합 보기 ›</div>
          </div>
        </Link>
      )}

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

      {/* 소유 결 — 리스트는 하위 페이지(/closet)로. 여기선 컴팩트 진입만(길어짐 방지) */}
      {owned.length > 0 && (
        <Link
          href="/closet"
          className="mt-8 flex items-center justify-between rounded-[12px] border border-line px-4 py-3.5 transition hover:bg-paper-2"
        >
          <span className="text-[14px] font-semibold">내 옷</span>
          <span className="font-latin text-[13px] text-ink-soft">{owned.length}벌 ›</span>
        </Link>
      )}
    </div>
  );
}
