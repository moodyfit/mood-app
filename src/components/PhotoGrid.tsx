"use client";

import { useEffect, useRef } from "react";
import type { Photo } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";
import { TASTE_CARD_THRESHOLD } from "@/lib/taste";
import { rankPersonalized, personalizationStrength, HERO_MIN_STRENGTH } from "@/lib/rank";
import { useScrollRestore } from "@/lib/hooks/useScrollRestore";
import PhotoCard from "./PhotoCard";

// 성능: 한 번에 90장(≈23MB) 로드 대신 12장씩 끊어서 — 초기 이미지 로드 급감
const INITIAL_VISIBLE = 12;
const LOAD_STEP = 12;

/**
 * DB photos 메이슨리. 균등 격자(커머스 문법=비교) 대신 메이슨리(전시 문법=갤러리/무드보드).
 * 크기 = 정보 채널: 개인화(취향 형성 후)에서만 최상위 매치를 전면폭 히어로로.
 * 10/28 회의록 "모두의 결과/너의 결과 토글 제거" — 수동 전환 없이 `formed`(저장 3장 이상)
 * 여부로 자동 결정. /results?you=1(홈 "내 취향 코디 보기")은 항상 개인화.
 * FEAT-004(2026-08-19 회의): 무한 스크롤 — 핀터레스트처럼 스크롤 끝에서 자동 로드.
 * "유한 구경" 원칙은 폐기됨. 전체 사진은 이미 한 번에 받아온 상태(photos prop)라
 * 추가 네트워크 요청 없이 클라이언트에서 보여줄 양만 늘림.
 */
export default function PhotoGrid({
  photos,
  query,
  you = false,
}: {
  photos: Photo[];
  query: string;
  you?: boolean;
}) {
  const { affinity, savedCount } = useMoodStore();
  // 프로필 형성 = 저장 3장 이상. 형성되면 자동으로 개인화 결과.
  const formed = savedCount >= TASTE_CARD_THRESHOLD;
  const personal = you || formed;
  // BUG-008: 뒤로가기 시 로드량/스크롤 복원(HomeGallery와 동일한 BUG-004 패턴).
  // storageKey에 query·you를 섞어 검색어·모드별로 복원 슬롯을 분리 — 다른 검색 결과의 스크롤
  // 위치가 섞여 들어오지 않게 한다.
  const [visible, setVisible] = useScrollRestore(
    `moodfit:results-scroll:${query}:${you}`,
    `${query}|${you}|${personal}`,
    INITIAL_VISIBLE,
    false
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const neutral = photos; // 중립 = 검색 관련도 순
  // 개인화 = 콜드 다양성 → 신호 쌓일수록 개인화(탐색 잔존). 개인화 엔진 공용.
  const personalOrder = rankPersonalized(photos, affinity);
  const strength = personalizationStrength(affinity);

  const ordered = personal ? personalOrder : neutral;

  // B6: 1번 카드 대형 히어로 — 개인화 결과일 때만(콜드/중립은 히어로 없이 다양한 격자)
  const hero = personal && strength >= HERO_MIN_STRENGTH && ordered.length > 3 ? ordered[0] : null;
  const allRest = hero ? ordered.slice(1) : ordered;
  const rest = allRest.slice(0, visible);
  const remaining = allRest.length - rest.length;

  // 무한 스크롤: sentinel이 화면에 들어오면 다음 배치 로드. remaining=0이면 관찰 중단.
  useEffect(() => {
    if (remaining <= 0) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible((v) => v + LOAD_STEP);
      },
      { rootMargin: "600px" } // 바닥 도달 전 미리 로드 — 로딩 끊김 체감 방지
    );
    io.observe(el);
    return () => io.disconnect();
  }, [remaining]);

  return (
    <div>
      <h2 className="mb-4 text-[20px] font-bold tracking-[-0.4px]">
        {you ? "너의 추구미로 골라봤어" : `‘${query}’`}
      </h2>

      {/* 개인화 전용 히어로: 개인화 결과에서만 최상위 매치를 전면폭으로 = 크기로 적합도를 말한다 */}
      {hero && (
        <div className="mb-3 animate-rise">
          <PhotoCard photo={hero} query={query} size="hero" />
        </div>
      )}

      {/* 메이슨리 = CSS 멀티컬럼(핀터레스트 배치). 세로 리듬은 사진 실비율에서 나옴 */}
      <div style={{ columnCount: 2, columnGap: "12px" }}>
        {rest.map((p) => (
          <div key={p.id} className="mb-3 break-inside-avoid animate-rise">
            <PhotoCard photo={p} query={query} />
          </div>
        ))}
      </div>

      {/* 무한 스크롤: 이 sentinel이 보이면 다음 배치 로드. 다 보여준 뒤엔 관찰 중단(위 useEffect). */}
      {remaining > 0 && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint" />
        </div>
      )}
    </div>
  );
}
