"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import HomeGallery from "@/components/HomeGallery";
import HomeCloset from "@/components/HomeCloset";
import FilterSheet, { Chevron } from "@/components/FilterSheet";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { filterByGender } from "@/lib/photos";
import { rankByVector } from "@/lib/rank";
import { OCCASIONS, VIBE_CHIPS } from "@/lib/moods";
import {
  EMPTY_FILTERS,
  matchesFilters,
  toMoodSet,
  STYLE_OPTIONS,
  type FilterSelections,
} from "@/lib/filters";
import { useMoodStore } from "@/lib/store";
import type { Affinity } from "@/lib/types";

type Axis = "style" | "tpo" | "vibe";

const AXIS_OPTIONS: Record<Axis, { key: string; label: string }[]> = {
  style: STYLE_OPTIONS.map((c) => ({ key: c.mood, label: c.label })),
  tpo: OCCASIONS.map((o) => ({ key: o, label: o })),
  vibe: VIBE_CHIPS.map((v) => ({ key: v, label: v })),
};

// 홈 = 약속 모드 진입 카드 + 종합 취향 상시 메이슨리 전시. 검색은 /search 페이지로 분리.
function HomeContent() {
  const { photos, loading } = usePhotos();
  const [query] = useState("");
  const [moodKeys] = useState<string[]>([]);
  // FEAT-030: 남/녀 토글 제거 — genderFilter는 store에서 "male"로 고정돼 있음(향후 재활성화 대비 유지).
  const { genderFilter, recordView } = useMoodStore();
  const genderedPhotos = useMemo(
    () => filterByGender(photos, genderFilter),
    [photos, genderFilter]
  );

  // FEAT-041 프로토타입 — 무신사 스냅 필터 참고. 메인화면에 스타일/TPO/무드 칩 3개를 바로 두고,
  // 각자 자기 패널을 연다(탭 전환 없음). 탭 안 다중선택은 OR, 세 축 사이는 AND — 데이터가 적어
  // 교집합이 0이 될 수 있는데, 정확한 장 수는 안 보여주고(에린 피드백) 0일 때만 적용 버튼을 막는다.
  const [openAxis, setOpenAxis] = useState<Axis | null>(null);
  const [applied, setApplied] = useState<FilterSelections>(EMPTY_FILTERS);
  const styleMoods = applied.style; // 스타일은 이미 캐논 축이라 라벨=축
  const tpoMoods = useMemo(() => toMoodSet(applied.tpo), [applied.tpo]);
  const vibeMoods = useMemo(() => toMoodSet(applied.vibe), [applied.vibe]);
  const hasAnyFilter = styleMoods.size > 0 || tpoMoods.size > 0 || vibeMoods.size > 0;
  const filteredPhotos = useMemo(
    () => (hasAnyFilter ? genderedPhotos.filter((p) => matchesFilters(p, applied)) : genderedPhotos),
    [genderedPhotos, hasAnyFilter, applied]
  );

  // "비율로 직접 정하기"(스타일 패널 안 슬라이더 모드): 체크박스는 필터(걸러내기)지만 이건
  // 랭킹(순서 매기기)이라 0장이 될 일이 없다 — rankByVector로 genderedPhotos 전부를 가까운
  // 순으로 재배열만 한다. 체크박스로 고른 스타일과는 서로 대체(동시에 안 켜짐).
  const [customDraft, setCustomDraft] = useState<Affinity>({});
  const [customApplied, setCustomApplied] = useState<Affinity>({});
  const customActive = Object.values(customApplied).some((v) => v > 0);
  // 버그 수정(로직 설명 중 발견): 커스텀이 켜져도 TPO·무드는 계속 AND로 걸려야 하는데(규칙 3),
  // genderedPhotos 전체를 그대로 랭킹해버려서 TPO·무드 칩에 숫자가 남아있어도 실제로는 적용
  // 안 되고 있었다 — 먼저 TPO·무드로 거르고(스타일은 커스텀이 대체하므로 비움) 그 안에서만
  // 커스텀 비율로 순위를 매긴다.
  const tpoVibeFiltered = useMemo(
    () =>
      tpoMoods.size > 0 || vibeMoods.size > 0
        ? genderedPhotos.filter((p) => matchesFilters(p, { style: new Set(), tpo: applied.tpo, vibe: applied.vibe }))
        : genderedPhotos,
    [genderedPhotos, tpoMoods, vibeMoods, applied.tpo, applied.vibe]
  );
  const displayPhotos = useMemo(
    () => (customActive ? rankByVector(tpoVibeFiltered, customApplied) : filteredPhotos),
    [customActive, customApplied, tpoVibeFiltered, filteredPhotos]
  );
  // 체크박스 필터 중 하나라도 걸려 있으면 검색 모드와 동일하게 헤더·히어로·순서스냅샷 생략
  // (FEAT-032 Q3 결정 재사용) — 축 라벨들을 그대로 moodKeys로 넘긴다.
  const galleryMoodKeys = hasAnyFilter ? [...styleMoods, ...tpoMoods, ...vibeMoods] : moodKeys;

  function applyAll(next: FilterSelections) {
    setApplied(next);
    setCustomApplied({}); // 체크박스로 고르면 슬라이더 지정은 해제
    setOpenAxis(null);
    // 코드리뷰 Q-2와 동일 원칙 — 칩 선택은 view가 아니라 별도 이벤트로(대표로 1개만 기록).
    const firstMood = [...next.style][0] ?? [...toMoodSet(next.tpo)][0] ?? [...toMoodSet(next.vibe)][0];
    if (firstMood) recordView(firstMood, "category_select");
  }

  // BUG 수정(에린 리포트 — 간헐적 TPO/무드 초기화): 시트를 연 채로 TPO·무드를 먼저 고르고
  // 스타일 탭의 슬라이더로 적용하면, 그 선택들은 아직 page.tsx의 applied에 안 올라가고 시트
  // 안 draft에만 있는 상태였다 — 그런데 applyCustom이 draft가 아니라 기존 applied(prev)만
  // 기준으로 style만 비웠어서, 같은 세션에서 고른 TPO·무드가 반영되지 않고 날아갔다. 이제
  // 시트가 넘겨주는 draft 전체를 기준으로 style만 비우고 적용한다.
  function applyCustom(restDraft: FilterSelections) {
    setCustomApplied(customDraft);
    setApplied({ ...restDraft, style: new Set() }); // 슬라이더로 고르면 체크박스 선택은 해제
    setOpenAxis(null);
  }

  // 에린 피드백 — 탭별 초기화만 있으면 다른 탭에 남은 선택을 잊은 채 테스트하다가 "몇 개를
  // 눌러도 안 바뀐다"고 느끼기 쉬움(실제로는 다른 탭 필터와 계속 교집합되고 있었을 뿐). 전부
  // 한 번에 비우고 바로 적용(기본 피드로 복귀).
  function resetAll() {
    setApplied(EMPTY_FILTERS);
    setCustomDraft({});
    setCustomApplied({});
    setOpenAxis(null);
  }

  const chipButtonClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap inline-flex items-center gap-1 rounded-[8px] border px-2.5 py-1 text-[12px] transition ${
      active ? "border-ink bg-ink text-white" : "border-line text-ink-soft"
    }`;

  return (
    <div className="animate-fade">
      {/* 홈의 유일한 카드형 진입점 — 약속 모드 */}
      <div className="px-5 pt-4">
        <Link
          href="/promise"
          className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3.5 text-white"
        >
          <div className="min-w-0">
            <div className="text-[14px] font-bold">약속 잡혔어? 3분 안에 결정 끝</div>
            <div className="mt-0.5 text-[12px] text-white/70">자리·예산만 고르면 완성 조합을 골라줄게</div>
          </div>
          <span className="ml-2 text-lg">›</span>
        </Link>
      </div>

      <HomeCloset />

      {/* 무신사 스냅처럼 맨 앞 아이콘 버튼(전체 필터) + 스타일/TPO/무드 칩 — 뭘 눌러도 같은
          시트가 열리고, 시트 안에서 탭을 자유롭게 넘나들 수 있다(에린 피드백). */}
      <div className="flex items-center gap-2 overflow-x-auto px-5 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setOpenAxis("style")}
          aria-label="전체 필터"
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-line text-ink-soft"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
            <circle cx="9" cy="7" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="16" cy="12" r="1.8" fill="currentColor" stroke="none" />
            <circle cx="11" cy="17" r="1.8" fill="currentColor" stroke="none" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setOpenAxis("style")}
          className={chipButtonClass(styleMoods.size > 0 || customActive)}
        >
          <span>스타일{styleMoods.size > 0 ? ` · ${styleMoods.size}` : customActive ? " · 커스텀" : ""}</span>
          <Chevron />
        </button>
        <button
          type="button"
          onClick={() => setOpenAxis("tpo")}
          className={chipButtonClass(applied.tpo.size > 0)}
        >
          <span>TPO{applied.tpo.size > 0 ? ` · ${applied.tpo.size}` : ""}</span>
          <Chevron />
        </button>
        <button
          type="button"
          onClick={() => setOpenAxis("vibe")}
          className={chipButtonClass(applied.vibe.size > 0)}
        >
          <span>무드{applied.vibe.size > 0 ? ` · ${applied.vibe.size}` : ""}</span>
          <Chevron />
        </button>
      </div>

      <div className="pt-3">
        <HomeGallery
          photos={displayPhotos}
          loading={loading}
          moodKeys={galleryMoodKeys}
          query={query}
          preRanked={customActive}
        />
      </div>

      {openAxis && (
        <FilterSheet
          initialTab={openAxis}
          options={AXIS_OPTIONS}
          initial={applied}
          genderedPhotos={genderedPhotos}
          onApply={applyAll}
          onClose={() => setOpenAxis(null)}
          customDraft={customDraft}
          onCustomChange={setCustomDraft}
          onApplyCustom={applyCustom}
          onResetAll={resetAll}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return <HomeContent />;
}
