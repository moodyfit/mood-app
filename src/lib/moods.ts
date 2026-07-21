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
    caption: "화이트 티에 차콜 슬랙스. 색을 둘로 줄여서 정돈돼 보이는 룩.",
    imageUrl: "/moods/clean.webp",
    gradient: "linear-gradient(150deg,#d9d4cc,#8f8a82)",
  },
  amekaji: {
    key: "amekaji",
    name: "아메카지",
    description: "빈티지 워크웨어, 편안한 손맛",
    caption: "워싱 데님에 브라운 셋업. 낡은 듯한 톤이 편한데 멋있는 이유.",
    imageUrl: "/moods/amekaji.webp",
    gradient: "linear-gradient(150deg,#8a6b4a,#3d2f22)",
  },
  street: {
    key: "street",
    name: "스트릿",
    description: "오버핏·레이어드, 도시적 날것",
    caption: "오버핏 후디에 와이드 팬츠. 실루엣을 키워서 힘 안 준 듯 멋 나는 룩.",
    imageUrl: "/moods/street.webp",
    gradient: "linear-gradient(150deg,#4a4d55,#17181c)",
  },
  soft: {
    key: "soft",
    name: "소프트 캐주얼",
    description: "부드러운 톤, 포근한 데일리",
    caption: "베이지 가디건에 부드러운 니트. 톤을 낮춰서 포근해 보이는 데일리.",
    imageUrl: "/moods/soft.webp",
    gradient: "linear-gradient(150deg,#e6c9c0,#b08a9a)",
  },
  formal: {
    key: "formal",
    name: "모던 클래식",
    description: "각 잡힌 셋업, 정돈된 실루엣",
    caption: "네이비 셋업에 각 잡힌 셔츠. 라인을 살려서 단정한데 안 딱딱한 룩.",
    imageUrl: "/moods/formal.webp",
    gradient: "linear-gradient(150deg,#3a4256,#171b26)",
  },
  outdoor: {
    key: "outdoor",
    name: "고프코어",
    description: "테크웨어·아웃도어 기능미",
    caption: "테크 셸 재킷에 카고. 기능성 소재가 도심에서도 자연스러운 이유.",
    imageUrl: "/moods/outdoor.webp",
    gradient: "linear-gradient(150deg,#5c6e4a,#232b1c)",
  },
  romantic: {
    key: "romantic",
    name: "로맨틱",
    description: "여리여리, 은은한 무드",
    caption: "여린 톤 레이어드. 힘을 뺀 부드러움이 은은하게 사는 룩.",
    imageUrl: "/moods/romantic.webp",
    gradient: "linear-gradient(150deg,#e8d0d8,#c9a2b0)",
  },
  warm: {
    key: "warm",
    name: "웜톤 뉴트럴",
    description: "따뜻한 베이지·카멜 조합",
    caption: "카멜 코트에 베이지 니트. 따뜻한 톤으로 묶어서 고급스러워 보이는 조합.",
    imageUrl: "/moods/warm.webp",
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
