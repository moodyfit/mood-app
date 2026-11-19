"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import HomeGallery from "@/components/HomeGallery";
import HomeCloset from "@/components/HomeCloset";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { filterByGender } from "@/lib/photos";
import { resolveMoods } from "@/lib/moods";
import { useMoodStore } from "@/lib/store";

// FEAT-032: 회의록 "무드 카테고리 보여주기(힙함, 댄디 등)" — QUERY_MAP의 밈/스타일 키워드
// 묶음 중 축 조합이 뚜렷이 구분되는 것만 추려서 카테고리로 노출. 각 키워드는 QUERY_MAP에
// 이미 정확히 매칭되는 항목이라 resolveMoods가 결정적으로 같은 조합을 돌려준다(AI 번역 왕복
// 불필요 — "테토남"/"느좋" 같은 캐릭터형 어휘는 PromiseMode 쪽 칩과 겹쳐서 제외).
const CATEGORY_CHIPS = ["힙하게", "댄디하게", "올드머니", "시크하게"];

// 홈 = 약속 모드 진입 카드 + 종합 취향 상시 메이슨리 전시. 검색은 /search 페이지로 분리.
// HomeGallery는 moodKeys/query를 받아 인플레이스 필터링 지원 (FEAT-006).
export default function HomePage() {
  const { photos, loading } = usePhotos();
  const [query, setQuery] = useState("");
  const [moodKeys, setMoodKeys] = useState<string[]>([]);
  // FEAT-030: 남/녀 토글 제거 — genderFilter는 store에서 "male"로 고정돼 있음(향후 재활성화 대비 유지).
  const { genderFilter, recordSearch } = useMoodStore();
  const filteredPhotos = useMemo(
    () => filterByGender(photos, genderFilter),
    [photos, genderFilter]
  );

  // 빈 문자열 = 검색 해제(기본 피드 복귀). AI 실패해도 API가 폴백을 함께 반환해서 항상 결과 있음.
  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q) {
      setMoodKeys([]);
      return;
    }
    try {
      const res = await fetch(`/api/search/translate?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { moodKeys?: string[] };
      setMoodKeys(data.moodKeys ?? []);
    } catch {
      setMoodKeys([]); // 요청 자체가 실패(네트워크 등)하면 조용히 기본 피드로(에러 화면 대신)
    }
  }, []);

  // 카테고리 칩은 QUERY_MAP 정확 매칭이라 AI 왕복 없이 바로 반영 — 같은 칩 다시 누르면 해제.
  function selectCategory(label: string) {
    if (query === label) {
      setQuery("");
      setMoodKeys([]);
      return;
    }
    recordSearch(label);
    setQuery(label);
    setMoodKeys(resolveMoods(label));
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

      <div className="flex flex-wrap gap-2 px-5 pt-5">
        {CATEGORY_CHIPS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => selectCategory(label)}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] transition ${
              query === label
                ? "border-accent bg-accent text-white"
                : "border-line text-ink-soft hover:border-accent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="pt-3">
        <HomeGallery photos={filteredPhotos} loading={loading} moodKeys={moodKeys} query={query} />
      </div>
    </div>
  );
}
