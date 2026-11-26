"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import HomeGallery from "@/components/HomeGallery";
import HomeCloset from "@/components/HomeCloset";
import FilterSheet from "@/components/FilterSheet";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { filterByGender } from "@/lib/photos";
import { rankByVector } from "@/lib/rank";
import { OCCASIONS, VIBE_CHIPS } from "@/lib/moods";
import {
  EMPTY_FILTERS,
  matchesFilters,
  toMoodSet,
  countMatches,
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
  const displayPhotos = useMemo(
    () => (customActive ? rankByVector(genderedPhotos, customApplied) : filteredPhotos),
    [customActive, customApplied, genderedPhotos, filteredPhotos]
  );
  // 체크박스 필터 중 하나라도 걸려 있으면 검색 모드와 동일하게 헤더·히어로·순서스냅샷 생략
  // (FEAT-032 Q3 결정 재사용) — 축 라벨들을 그대로 moodKeys로 넘긴다.
  const galleryMoodKeys = hasAnyFilter ? [...styleMoods, ...tpoMoods, ...vibeMoods] : moodKeys;

  function countIfApplied(axis: Axis, selected: Set<string>): number {
    return countMatches(genderedPhotos, { ...applied, [axis]: selected });
  }

  function applyAxis(axis: Axis, next: Set<string>) {
    setApplied((prev) => ({ ...prev, [axis]: next }));
    if (axis === "style") setCustomApplied({}); // 체크박스로 고르면 슬라이더 지정은 해제
    setOpenAxis(null);
    // 코드리뷰 Q-2와 동일 원칙 — 칩 선택은 view가 아니라 별도 이벤트로.
    const firstMood = axis === "style" ? [...next][0] : [...toMoodSet(next)][0];
    if (firstMood) recordView(firstMood, "category_select");
  }

  function applyCustom() {
    setCustomApplied(customDraft);
    setApplied((prev) => ({ ...prev, style: new Set() })); // 슬라이더로 고르면 체크박스 선택은 해제
    setOpenAxis(null);
  }

  const chipButtonClass = (active: boolean) =>
    `shrink-0 whitespace-nowrap rounded-[10px] border px-3.5 py-1.5 text-[13px] transition ${
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

      {/* 무신사 스냅처럼 스타일/TPO/무드를 각자 모서리둥근 사각형 칩으로 — 눌러야 그 축 패널이 열림. */}
      <div className="flex gap-2 overflow-x-auto px-5 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setOpenAxis("style")}
          className={chipButtonClass(styleMoods.size > 0 || customActive)}
        >
          스타일{styleMoods.size > 0 ? ` · ${styleMoods.size}` : customActive ? " · 커스텀" : ""}
        </button>
        <button
          type="button"
          onClick={() => setOpenAxis("tpo")}
          className={chipButtonClass(applied.tpo.size > 0)}
        >
          TPO{applied.tpo.size > 0 ? ` · ${applied.tpo.size}` : ""}
        </button>
        <button
          type="button"
          onClick={() => setOpenAxis("vibe")}
          className={chipButtonClass(applied.vibe.size > 0)}
        >
          무드{applied.vibe.size > 0 ? ` · ${applied.vibe.size}` : ""}
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
          axis={openAxis}
          options={AXIS_OPTIONS[openAxis]}
          initialSelected={applied[openAxis]}
          countIfApplied={(sel) => countIfApplied(openAxis, sel)}
          onApply={(next) => applyAxis(openAxis, next)}
          onClose={() => setOpenAxis(null)}
          customDraft={openAxis === "style" ? customDraft : undefined}
          onCustomChange={openAxis === "style" ? setCustomDraft : undefined}
          onApplyCustom={openAxis === "style" ? applyCustom : undefined}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return <HomeContent />;
}
