"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import HomeGallery from "@/components/HomeGallery";
import HomeCloset from "@/components/HomeCloset";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { filterByGender } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";

// FEAT-032: 회의록 "무드 카테고리 보여주기(힙함, 댄디 등)". 처음엔 QUERY_MAP의 밈/스타일
// 키워드(힙하게·댄디하게 등, 2~3축 조합)로 했는데, 조합끼리 축이 겹쳐서 결과가 비슷해
// 보이는 문제(댄디하게/올드머니)와 "카테고리를 봐도 어떤 옷이 나올지 예상이 안 된다"는
// 피드백이 있었다. 캐논 6축에 1:1로 매칭해서 — 서로 다른 축 = 서로 다른 사진이라 겹칠 수
// 없고, 패션 지식 없어도 라벨 자체가 옷차림을 가리켜서 예측 가능하다.
const CATEGORIES: { label: string; mood: string }[] = [
  { label: "미니멀", mood: "clean" },
  { label: "캐주얼", mood: "cityboy" },
  { label: "스트릿", mood: "street" },
  { label: "빈티지", mood: "amekaji" },
  { label: "댄디", mood: "classic" },
  { label: "소프트", mood: "soft" },
];

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

  // 코드리뷰: "같은 칩 다시 눌러서 해제"가 안 와닿는다는 피드백 — "전체" 탭을 라디오처럼
  // 항상 하나는 활성인 구조로 바꿔서, 되돌아가는 동작 자체를 명시적인 선택지로 만든다.
  // moodKeys는 단일 축만 — 조합(resolveMoods)을 쓰면 카테고리끼리 축이 겹쳐 결과가 비슷해진다.
  function selectCategory(cat: { label: string; mood: string }) {
    recordSearch(cat.label);
    setQuery(cat.label);
    setMoodKeys([cat.mood]);
  }

  function clearCategory() {
    setQuery("");
    setMoodKeys([]);
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

      {/* 밑줄 텍스트탭 — 알약 버튼(테두리+배경 전부 같은 모양)은 피함(frontend-design 스킬:
          "SaaS 카드 키트" 패턴이 AI 생성 티가 나는 대표 사례). 가로 스크롤은 ShelfCard.tsx와
          동일 컨벤션([scrollbar-width:none] 등 스크롤바 숨김). */}
      <div
        className="flex gap-5 overflow-x-auto px-5 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="무드 카테고리"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!query}
          onClick={clearCategory}
          className={`shrink-0 whitespace-nowrap border-b-2 pb-2 text-[14px] transition ${
            !query ? "border-ink font-semibold text-ink" : "border-transparent text-ink-faint"
          }`}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.mood}
            type="button"
            role="tab"
            aria-selected={query === cat.label}
            onClick={() => selectCategory(cat)}
            className={`shrink-0 whitespace-nowrap border-b-2 pb-2 text-[14px] transition ${
              query === cat.label
                ? "border-ink font-semibold text-ink"
                : "border-transparent text-ink-faint"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="pt-3">
        <HomeGallery photos={filteredPhotos} loading={loading} moodKeys={moodKeys} query={query} />
      </div>
    </div>
  );
}
