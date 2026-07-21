import type { MoodKey, SaveRecord, TasteResult } from "./types";
import { MOODS } from "./moods";

/** 추구미 카드 발급 기준 저장 수 (전략 문서 §4: 2~3회 누적) */
export const TASTE_CARD_THRESHOLD = 3;

/**
 * 저장된 무드들의 축 분포 → 상위 성분 조합 = 추구미.
 * 규칙 기반이면 충분(문서 §8). ML 불필요.
 */
export function computeTaste(saves: SaveRecord[]): TasteResult {
  const counts = countByMood(saves);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const total = saves.length || 1;

  const bars = ranked.slice(0, 4).map(([key, count]) => ({
    name: MOODS[key]?.name ?? key,
    pct: Math.round((count / total) * 100),
  }));

  const top = ranked.slice(0, 2).map(([key]) => MOODS[key]?.name ?? key);
  const title = top.length >= 2 ? `${top[0]} × ${top[1]}` : top[0] ?? "";

  return { title, bars, rarityPct: rarityFor(title) };
}

function countByMood(saves: SaveRecord[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const s of saves) {
    counts.set(s.moodKey, (counts.get(s.moodKey) ?? 0) + 1);
  }
  return counts;
}

/**
 * 포용성 수치 (2.5장): "이 무드 가진 사람, 전체의 X.X%".
 * MVP는 조합 문자열 기반 결정적 의사값(1.2~9.6%). 실서비스에선 실제 분포로 대체.
 * 동경(특별함)이 아니라 소속감(같은 3.2%의 존재)을 겨냥.
 */
function rarityFor(title: string): number {
  const seed = [...title].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Math.round((((seed % 85) + 12) / 10) * 10) / 10; // 1.2 ~ 9.6, 소수 1자리
}

/**
 * 모먼트 3: "너의 결과" 정렬.
 * 저장 이력이 많은 무드를 앞으로 (안정 정렬). 취향을 유저가 직접 조작해 체감.
 */
export function personalizeOrder(
  moodKeys: MoodKey[],
  saves: SaveRecord[]
): MoodKey[] {
  const counts = countByMood(saves);
  return moodKeys
    .map((key, i) => ({ key, i, w: counts.get(key) ?? 0 }))
    .sort((a, b) => (b.w - a.w) || (a.i - b.i)) // 가중치 desc, 동률은 원순서 유지
    .map((x) => x.key);
}
