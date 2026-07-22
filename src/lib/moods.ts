import type { Mood, MoodKey, QueryMapping } from "./types";

/**
 * Layer 1 — 무드 축 (전략 §5 / TAGGING.md §3.1: 캐논 6축 고정, 다른 축 창조 금지).
 * DB photos.mood_vector 키와 정확히 일치해야 저장·추구미·지도·방이 일관된다.
 * gradient = 실 룩북 이미지 확보 전 자리표시자(폴백).
 */
export const MOODS: Record<MoodKey, Mood> = {
  clean: {
    key: "clean",
    name: "클린 미니멀",
    description: "군더더기 없는 정제된 무드",
    caption: "화이트 라운드 반팔에 차콜 슬랙스. 색을 둘로만 끊어서 대충 입어도 정돈돼 보여.",
    imageUrl: "/moods/clean.webp",
    gradient: "linear-gradient(150deg,#d9d4cc,#8f8a82)",
  },
  cityboy: {
    key: "cityboy",
    name: "시티보이",
    description: "재핑한 레이어드, 캐주얼과 단정 사이",
    caption: "어깨에 걸친 셋업 재킷에 토트백. 톤 맞추고 티로 끊으면 셋업도 데일리로 풀려.",
    imageUrl: "/moods/cityboy.jpg",
    gradient: "linear-gradient(150deg,#cbb79c,#7a6a52)",
  },
  street: {
    key: "street",
    name: "스트릿",
    description: "오버핏·볼륨, 도시적 날것",
    caption: "오버핏 후디에 와이드 팬츠. 위아래 다 크게 놀면 힘 안 준 듯 멋 나.",
    imageUrl: "/moods/street.webp",
    gradient: "linear-gradient(150deg,#4a4d55,#17181c)",
  },
  amekaji: {
    key: "amekaji",
    name: "아메카지",
    description: "워크웨어·데님·밀리터리, 빈티지 손맛",
    caption: "밀리터리 코트에 청청 데님. 흙색 톤으로 붙이면 낡은 느낌이 멋으로 읽혀.",
    imageUrl: "/moods/amekaji.webp",
    gradient: "linear-gradient(150deg,#8a6b4a,#3d2f22)",
  },
  classic: {
    key: "classic",
    name: "클래식",
    description: "셋업·코트·구두, 정돈된 실루엣",
    caption: "차콜 수트에 화이트 셔츠. 타이 빼고 단추 풀면 각 잡혔는데 안 답답해.",
    imageUrl: "/moods/classic.jpg",
    gradient: "linear-gradient(150deg,#3a4256,#171b26)",
  },
  soft: {
    key: "soft",
    name: "소프트 캐주얼",
    description: "니트·가디건, 부드러운 톤",
    caption: "오트밀 가디건에 크림 티. 톤을 아이보리로 붙이면 대충 입어도 포근하게 정리돼.",
    imageUrl: "/moods/soft.webp",
    gradient: "linear-gradient(150deg,#e6c9c0,#b08a9a)",
  },
};

export const ALL_MOOD_KEYS: MoodKey[] = Object.keys(MOODS);

/**
 * Layer 2 — 검색어 → 무드 매핑 (캐논 6축). 실서비스에선 LLM 번역/캐시.
 * 미매핑 입력은 resolveMoods 폴백(축 분산)으로 — 실패 없는 검색(모먼트 1).
 */
export const QUERY_MAP: QueryMapping[] = [
  { keyword: "첫 소개팅", moodKeys: ["clean", "soft", "cityboy", "classic"] },
  { keyword: "퇴근 후 술약속", moodKeys: ["street", "amekaji", "clean", "classic"] },
  { keyword: "친구 결혼식", moodKeys: ["classic", "clean", "cityboy"] },
  { keyword: "주말 카페", moodKeys: ["soft", "amekaji", "clean", "cityboy"] },
  { keyword: "면접 가는 날", moodKeys: ["classic", "clean", "cityboy"] },
  { keyword: "동네 산책", moodKeys: ["amekaji", "soft", "street"] },
  { keyword: "갑자기 모임", moodKeys: ["clean", "cityboy", "street", "amekaji"] },
];

export const SUGGESTIONS = QUERY_MAP.map((q) => q.keyword);

export function resolveMoods(query: string): MoodKey[] {
  const q = query.trim();
  if (!q) return fallbackMoods(q);
  const exact = QUERY_MAP.find((m) => m.keyword === q);
  if (exact) return exact.moodKeys;
  const partial = QUERY_MAP.find((m) => q.includes(m.keyword) || m.keyword.includes(q));
  if (partial) return partial.moodKeys;
  return fallbackMoods(q);
}

/** 미매핑 입력: 6축을 최대한 분산해 취향을 측정 (콜드스타트) */
function fallbackMoods(seed: string): MoodKey[] {
  const base: MoodKey[] = ["clean", "cityboy", "street", "amekaji", "classic", "soft"];
  const offset = seed.length % base.length;
  return [...base.slice(offset), ...base.slice(0, offset)];
}
