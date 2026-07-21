import type { Mood, MoodKey, QueryMapping } from "./types";

/**
 * Layer 1 — 무드 축 (전략 문서 §5 태그 체계).
 * 상품과 무관하게 유지되는 축. 모든 사진·상품은 이 축으로만 태깅.
 * gradient = 실제 룩북 이미지 확보 전까지의 자리표시자.
 */
export const MOODS: Record<MoodKey, Mood> = {
  clean: {
    key: "clean",
    name: "클린 미니멀",
    description: "군더더기 없는 정제된 무드",
    gradient: "linear-gradient(150deg,#d9d4cc,#8f8a82)",
  },
  amekaji: {
    key: "amekaji",
    name: "아메카지",
    description: "빈티지 워크웨어, 편안한 손맛",
    gradient: "linear-gradient(150deg,#8a6b4a,#3d2f22)",
  },
  street: {
    key: "street",
    name: "스트릿",
    description: "오버핏·레이어드, 도시적 날것",
    gradient: "linear-gradient(150deg,#4a4d55,#17181c)",
  },
  soft: {
    key: "soft",
    name: "소프트 캐주얼",
    description: "부드러운 톤, 포근한 데일리",
    gradient: "linear-gradient(150deg,#e6c9c0,#b08a9a)",
  },
  formal: {
    key: "formal",
    name: "모던 클래식",
    description: "각 잡힌 셋업, 정돈된 실루엣",
    gradient: "linear-gradient(150deg,#3a4256,#171b26)",
  },
  outdoor: {
    key: "outdoor",
    name: "고프코어",
    description: "테크웨어·아웃도어 기능미",
    gradient: "linear-gradient(150deg,#5c6e4a,#232b1c)",
  },
  romantic: {
    key: "romantic",
    name: "로맨틱",
    description: "여리여리, 은은한 무드",
    gradient: "linear-gradient(150deg,#e8d0d8,#c9a2b0)",
  },
  warm: {
    key: "warm",
    name: "웜톤 뉴트럴",
    description: "따뜻한 베이지·카멜 조합",
    gradient: "linear-gradient(150deg,#e8d5c0,#a8865f)",
  },
};

export const ALL_MOOD_KEYS: MoodKey[] = Object.keys(MOODS);

/**
 * Layer 2 — 검색어 → 무드 매핑 (전략 문서 §5).
 * 입력은 상황·감성·트렌드 무엇이든 가능(LLM처럼 열린 입력).
 * 실서비스에선 LLM이 임의 입력을 무드 축으로 번역하고, 이 테이블은
 * 캐시/시드 역할. 프로토타입에선 미매핑 입력은 폴백 로직으로 처리.
 */
export const QUERY_MAP: QueryMapping[] = [
  { keyword: "첫 소개팅", moodKeys: ["clean", "soft", "warm", "romantic"] },
  { keyword: "퇴근 후 술약속", moodKeys: ["street", "amekaji", "clean", "formal"] },
  { keyword: "친구 결혼식", moodKeys: ["formal", "clean", "warm", "romantic"] },
  { keyword: "주말 카페", moodKeys: ["soft", "amekaji", "clean", "warm"] },
  { keyword: "면접 가는 날", moodKeys: ["formal", "clean", "warm", "street"] },
  { keyword: "동네 산책", moodKeys: ["amekaji", "outdoor", "soft", "street"] },
];

/** 홈 화면 예시 칩 */
export const SUGGESTIONS = QUERY_MAP.map((q) => q.keyword);

/**
 * 검색어 → 무드 키 배열 해석.
 * 1) 정확 매칭 → 2) 부분 포함 매칭 → 3) 폴백(축 분산).
 * 폴백은 "첫 사용 = 취향 측정 도구"라는 콜드스타트 전략(문서 §4)을 구현.
 */
export function resolveMoods(query: string): MoodKey[] {
  const q = query.trim();
  if (!q) return fallbackMoods(q);

  const exact = QUERY_MAP.find((m) => m.keyword === q);
  if (exact) return exact.moodKeys;

  const partial = QUERY_MAP.find(
    (m) => q.includes(m.keyword) || m.keyword.includes(q)
  );
  if (partial) return partial.moodKeys;

  return fallbackMoods(q);
}

/** 미매핑 입력: 무드 축을 최대한 분산해 취향을 측정한다 */
function fallbackMoods(seed: string): MoodKey[] {
  const base: MoodKey[] = ["clean", "amekaji", "street", "soft", "formal", "warm"];
  // 입력 문자열로 시작점을 흔들어 매번 같은 6장만 나오지 않게 (결정적)
  const offset = seed.length % base.length;
  const rotated = [...base.slice(offset), ...base.slice(0, offset)];
  return rotated.slice(0, 4);
}
