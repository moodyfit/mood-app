// FEAT-041 프로토타입: 무신사 스냅 필터 시트 참고 — 탭(스타일/TPO/무드) 안에서는 OR(여러 개
// 고르면 합집합), 탭 사이는 AND. 스타일은 캐논 축 자체가 라벨이라 1:1이지만, TPO·무드는
// resolveMoods(QUERY_MAP)로 라벨 하나가 축 여러 개에 걸친다 — 그래서 축 집합으로 변환해야 교집합을
// 계산할 수 있다.
import { resolveMoods } from "./moods";
import { dominantMood } from "./photos";
import type { Photo } from "./photos";

// FEAT-032: 캐논 6축에 1:1 매칭한 "스타일" 옵션 — 서로 다른 축=서로 다른 사진이라 안 겹치고,
// 라벨 자체가 옷차림을 가리켜서 패션 지식 없이도 예측 가능하다.
export const STYLE_OPTIONS: { label: string; mood: string }[] = [
  { label: "미니멀", mood: "clean" },
  { label: "캐주얼", mood: "cityboy" },
  { label: "스트릿", mood: "street" },
  { label: "빈티지", mood: "amekaji" },
  { label: "댄디", mood: "classic" },
  { label: "소프트", mood: "soft" },
];

export interface FilterSelections {
  style: Set<string>; // CATEGORIES의 mood 값(캐논 축) 그대로
  tpo: Set<string>; // OCCASIONS 라벨
  vibe: Set<string>; // VIBE_CHIPS 라벨
}

export const EMPTY_FILTERS: FilterSelections = { style: new Set(), tpo: new Set(), vibe: new Set() };

export function toMoodSet(labels: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const l of labels) for (const k of resolveMoods(l)) out.add(k);
  return out;
}

export function matchesFilters(photo: Photo, sel: FilterSelections): boolean {
  const dom = dominantMood(photo.mood_vector);
  const tpoMoods = toMoodSet(sel.tpo);
  const vibeMoods = toMoodSet(sel.vibe);
  if (sel.style.size > 0 && !sel.style.has(dom)) return false;
  if (tpoMoods.size > 0 && !tpoMoods.has(dom)) return false;
  if (vibeMoods.size > 0 && !vibeMoods.has(dom)) return false;
  return true;
}

export function countMatches(photos: Photo[], sel: FilterSelections): number {
  if (sel.style.size === 0 && sel.tpo.size === 0 && sel.vibe.size === 0) return photos.length;
  return photos.filter((p) => matchesFilters(p, sel)).length;
}
