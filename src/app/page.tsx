"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import HomeGallery from "@/components/HomeGallery";
import HomeCloset from "@/components/HomeCloset";
import FilterSheet from "@/components/FilterSheet";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { filterByGender } from "@/lib/photos";
import { rankByVector } from "@/lib/rank";
import {
  EMPTY_FILTERS,
  matchesFilters,
  toMoodSet,
  STYLE_OPTIONS,
  type FilterSelections,
} from "@/lib/filters";
import { useMoodStore } from "@/lib/store";
import type { Affinity } from "@/lib/types";

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

  // FEAT-041 프로토타입 — 무신사 스냅 필터 시트 참고(성별/스타일/TPO 등 축마다 탭 + 체크박스 +
  // 선택 즉시 결과 수 미리보기). 탭 안에서는 OR(여러 개 고르면 합집합), 탭 사이는 AND — 데이터가
  // 적어도 "0개 보기"가 미리 보이니 교집합이 비어도 사용자가 직접 보고 빼면 된다(무신사 참고로
  // 방향 전환 — 축 1개씩만 고르게 한 이전 결정 대체).
  const [sheetOpen, setSheetOpen] = useState(false);
  const [applied, setApplied] = useState<FilterSelections>(EMPTY_FILTERS);
  const styleMoods = applied.style; // 스타일은 이미 캐논 축이라 라벨=축
  const tpoMoods = useMemo(() => toMoodSet(applied.tpo), [applied.tpo]);
  const vibeMoods = useMemo(() => toMoodSet(applied.vibe), [applied.vibe]);
  const hasAnyFilter = styleMoods.size > 0 || tpoMoods.size > 0 || vibeMoods.size > 0;
  const filteredPhotos = useMemo(
    () => (hasAnyFilter ? genderedPhotos.filter((p) => matchesFilters(p, applied)) : genderedPhotos),
    [genderedPhotos, hasAnyFilter, applied]
  );

  // "커스텀 필터"(슬라이더로 축별 가중치 지정): 칩은 필터(걸러내기)지만 이건 랭킹(순서
  // 매기기)이라 0장이 될 일이 없다 — rankByVector로 genderedPhotos 전부를 가까운 순으로
  // 재배열만 한다. 체크박스 필터 시트와는 서로 리셋(동시에 안 켜짐).
  const [customOpen, setCustomOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState<Affinity>({});
  const [customApplied, setCustomApplied] = useState<Affinity>({});
  const hasAppliedWeight = Object.values(customApplied).some((v) => v > 0);
  const customActive = hasAppliedWeight;
  const displayPhotos = useMemo(
    () => (customActive ? rankByVector(genderedPhotos, customApplied) : filteredPhotos),
    [customActive, customApplied, genderedPhotos, filteredPhotos]
  );
  // 체크박스 필터 중 하나라도 걸려 있으면 검색 모드와 동일하게 헤더·히어로·순서스냅샷 생략
  // (FEAT-032 Q3 결정 재사용) — 축 라벨들을 그대로 moodKeys로 넘긴다.
  const galleryMoodKeys = hasAnyFilter ? [...styleMoods, ...tpoMoods, ...vibeMoods] : moodKeys;

  function applyFilters(next: FilterSelections) {
    setApplied(next);
    setSheetOpen(false);
    setCustomOpen(false);
    setCustomDraft({});
    setCustomApplied({});
    // 코드리뷰 Q-2와 동일 원칙 — 칩 선택은 view가 아니라 별도 이벤트로(첫 선택 축 하나만 대표로 기록).
    const firstMood = [...next.style][0] ?? [...toMoodSet(next.tpo)][0] ?? [...toMoodSet(next.vibe)][0];
    if (firstMood) recordView(firstMood, "category_select");
  }

  function toggleCustom() {
    setCustomOpen((v) => !v);
    setSheetOpen(false);
  }

  function applyCustom() {
    setCustomApplied(customDraft);
    setCustomOpen(false);
    setApplied(EMPTY_FILTERS);
  }

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

      <div className="flex gap-2 overflow-x-auto px-5 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition ${
            hasAnyFilter ? "border-ink bg-ink text-white" : "border-line text-ink-soft"
          }`}
        >
          필터{hasAnyFilter ? ` · ${styleMoods.size + applied.tpo.size + applied.vibe.size}` : ""} ▾
        </button>
        <button
          type="button"
          aria-expanded={customOpen}
          onClick={toggleCustom}
          className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] transition ${
            customActive || customOpen ? "border-ink bg-ink text-white" : "border-line text-ink-soft"
          }`}
        >
          커스텀 ▾
        </button>
      </div>

      {/* FEAT-041 프로토타입 — 축별 가중치 슬라이더. 결과 품질·UI 느낌 확인용, 디자인 다듬기 전. */}
      {customOpen && (
        <div className="flex flex-col gap-3 px-5 pt-3">
          {STYLE_OPTIONS.map((cat) => (
            <div key={cat.mood}>
              <div className="mb-1 flex items-center justify-between text-[13px]">
                <span>{cat.label}</span>
                <span className="text-ink-faint">{customDraft[cat.mood] ?? 0}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={customDraft[cat.mood] ?? 0}
                onChange={(e) =>
                  setCustomDraft((prev) => ({ ...prev, [cat.mood]: Number(e.target.value) }))
                }
                className="w-full"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={applyCustom}
            className="mt-1 w-full rounded-[10px] bg-ink py-3 text-[14px] font-semibold text-white"
          >
            적용
          </button>
        </div>
      )}

      <div className="pt-3">
        <HomeGallery
          photos={displayPhotos}
          loading={loading}
          moodKeys={galleryMoodKeys}
          query={query}
          preRanked={customActive}
        />
      </div>

      {sheetOpen && (
        <FilterSheet
          initial={applied}
          genderedPhotos={genderedPhotos}
          onApply={applyFilters}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return <HomeContent />;
}
