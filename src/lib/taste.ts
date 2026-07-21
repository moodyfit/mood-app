import type { SaveRecord, TasteResult } from "./types";
import { MOODS } from "./moods";

/** 추구미 카드 발급 기준 저장 수 (전략 문서 §4: 2~3회 누적) */
export const TASTE_CARD_THRESHOLD = 3;

/**
 * 저장된 무드들의 축 분포 → 상위 성분 조합 = 추구미.
 * 규칙 기반이면 충분(문서 §8). ML 불필요.
 */
export function computeTaste(saves: SaveRecord[]): TasteResult {
  const counts = new Map<string, number>();
  for (const s of saves) {
    counts.set(s.moodKey, (counts.get(s.moodKey) ?? 0) + 1);
  }

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const total = saves.length || 1;

  const bars = ranked.slice(0, 4).map(([key, count]) => ({
    name: MOODS[key]?.name ?? key,
    pct: Math.round((count / total) * 100),
  }));

  const top = ranked.slice(0, 2).map(([key]) => MOODS[key]?.name ?? key);
  const title = top.length >= 2 ? `${top[0]} × ${top[1]}` : top[0] ?? "";

  return { title, bars };
}
