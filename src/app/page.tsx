"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import HomeGallery from "@/components/HomeGallery";
import HomeCloset from "@/components/HomeCloset";
import { usePhotos } from "@/lib/hooks/usePhotos";
import { filterByGender, dominantMood } from "@/lib/photos";
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
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 코드리뷰 P1-2: 카테고리를 고른 채 상세 → 뒤로가기하면 "전체"로 리셋되던 문제 — 선택
  // 상태를 컴포넌트 state가 아니라 URL(`?mood=`)에 둬서, 뒤로가기해도 같은 URL로 돌아오며
  // 자연스럽게 유지되게 한다(정적 export/Capacitor에서도 클라이언트에서 그대로 읽힘).
  const activeMood = searchParams.get("mood");
  const activeCategory = CATEGORIES.find((c) => c.mood === activeMood) ?? null;

  const { photos, loading } = usePhotos();
  const [query, setQuery] = useState("");
  const [moodKeys, setMoodKeys] = useState<string[]>([]);
  // FEAT-030: 남/녀 토글 제거 — genderFilter는 store에서 "male"로 고정돼 있음(향후 재활성화 대비 유지).
  const { genderFilter, recordView } = useMoodStore();
  const genderedPhotos = useMemo(
    () => filterByGender(photos, genderFilter),
    [photos, genderFilter]
  );
  // 코드리뷰 Q-1: 처음엔 rankPhotos로 "정렬"만 해서 스크롤을 내리면 다른 무드 사진도 섞여
  // 나왔다 — 카테고리는 검색이 아니라 "이 느낌만 보기"라 실제로 걸러내는 게 맞다(그래야
  // 애초에 축을 1:1로 나눈 의미가 산다). dominantMood 기준 필터.
  const categoryPhotos = useMemo(
    () =>
      activeCategory
        ? genderedPhotos.filter((p) => dominantMood(p.mood_vector) === activeCategory.mood)
        : genderedPhotos,
    [genderedPhotos, activeCategory]
  );
  // BUG(소피 코드리뷰): 카테고리를 걸러도 moodKeys를 안 넘겨서 HomeGallery의 searching이 계속
  // false로 남아, 카테고리 화면에 홈 인사말 헤더+히어로 카드가 그대로 나오던 문제. 티켓 결정
  // 그대로(Q3: FEAT-006 moodKeys/query 메커니즘 재사용) — 카테고리 선택 중엔 그 축 하나를
  // moodKeys로 넘겨 검색 모드와 동일하게 헤더·히어로·순서스냅샷을 생략시킨다.
  const galleryMoodKeys = activeCategory ? [activeCategory.mood] : moodKeys;

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

  // 소피 코드리뷰: recordSearch(cat.label)로 기록했더니 엉뚱한 축(주로 amekaji) 취향 점수가
  // 올라감 — recordSearch는 내부적으로 resolveMoods(query)로 텍스트를 "추측"해서 반영하는데,
  // "미니멀"/"캐주얼" 같은 라벨은 QUERY_MAP에 없어서 fallbackMoods(글자수 기반 해시 회전)로
  // 떨어져 실제 선택한 축과 무관한 결과가 나왔다. 이미 축을 정확히 알고 있는 상황(추측이 필요
  // 없음)이라 recordView(moodKey)로 바꿔서 그 축을 직접 반영한다 — recordView는 사진 클릭
  // 때도 쓰는, 텍스트 추측 없이 정확한 축 하나를 받는 함수.
  function selectCategory(cat: { label: string; mood: string }) {
    recordView(cat.mood);
    router.replace(`/?mood=${cat.mood}`, { scroll: false });
  }

  function clearCategory() {
    router.replace("/", { scroll: false });
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

      {/* 밑줄 텍스트탭처럼 생겼지만 실제로는 단일 선택 버튼 묶음 — 코드리뷰 P2-1: role="tab"은
          aria-controls로 연결된 tabpanel과 좌우 화살표 이동이 따라와야 완성되는 패턴인데
          둘 다 없어서, 그 기대에 안 맞는 role 대신 aria-pressed 버튼 묶음으로 뺐다. */}
      <div className="flex gap-5 overflow-x-auto px-5 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          aria-pressed={!activeCategory}
          onClick={clearCategory}
          className={`shrink-0 whitespace-nowrap border-b-2 pb-2 text-[14px] transition ${
            !activeCategory ? "border-ink font-semibold text-ink" : "border-transparent text-ink-faint"
          }`}
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.mood}
            type="button"
            aria-pressed={activeCategory?.mood === cat.mood}
            onClick={() => selectCategory(cat)}
            className={`shrink-0 whitespace-nowrap border-b-2 pb-2 text-[14px] transition ${
              activeCategory?.mood === cat.mood
                ? "border-ink font-semibold text-ink"
                : "border-transparent text-ink-faint"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="pt-3">
        <HomeGallery photos={categoryPhotos} loading={loading} moodKeys={galleryMoodKeys} query={query} />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
