import type { Affinity, MoodKey, TasteResult } from "./types";
import { MOODS } from "./moods";

/** 추구미 카드 발급 기준 저장 수 (전략 문서 §4: 2~3회 누적) */
export const TASTE_CARD_THRESHOLD = 3;

/** "너의 결과" 토글 노출 기준: 프로필이 특정 축에 이만큼 쏠렸을 때 (7.6) */
export const SKEW_THRESHOLD = 0.34;

function ranked(affinity: Affinity): [MoodKey, number][] {
  return Object.entries(affinity)
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1]);
}

/**
 * 프로필 무드 벡터 → 추구미. 규칙 기반(문서 §8), ML 불필요.
 * affinity = 저장·클릭 누적 가중치(7.6).
 */
export function computeTaste(affinity: Affinity): TasteResult {
  const r = ranked(affinity);
  const total = r.reduce((s, [, w]) => s + w, 0) || 1;

  const bars = r.slice(0, 4).map(([key, w]) => ({
    name: MOODS[key]?.name ?? key,
    pct: Math.round((w / total) * 100),
  }));

  const top = r.slice(0, 2).map(([key]) => MOODS[key]?.name ?? key);
  const title = top.length >= 2 ? `${top[0]} × ${top[1]}` : top[0] ?? "";

  return { title, bars, rarityPct: rarityFor(title) };
}

/**
 * 포용성 수치 (2.5장): "이 무드를 가진 사람, 전체의 X.X%".
 * MVP는 조합 문자열 기반 결정적 의사값(1.2~9.6%). 실서비스는 실제 분포로 대체.
 * 동경(특별함)이 아니라 소속감(같은 X%의 존재)을 겨냥.
 */
function rarityFor(title: string): number {
  const seed = [...title].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Math.round((((seed % 85) + 12) / 10) * 10) / 10;
}

/** 프로필이 특정 축에 의미있게 쏠렸는가 = 상위 축 점유율 (7.6 토글 게이트) */
export function topShare(affinity: Affinity): number {
  const r = ranked(affinity);
  if (r.length === 0) return 0;
  const total = r.reduce((s, [, w]) => s + w, 0) || 1;
  return r[0][1] / total;
}

/** affinity 내림차순 무드 키 (7.7 방 레이아웃 정렬용) */
export function moodsByAffinity(affinity: Affinity): MoodKey[] {
  return ranked(affinity).map(([k]) => k);
}

/**
 * 7.6 "너의 결과" 정렬: 일치도(원순서) × (1 + 프로필 가중치) 재정렬.
 * 후보군은 그대로, 순서만 교체. 프로필 가중치가 큰 무드가 앞으로.
 */
export function personalizeOrder(
  moodKeys: MoodKey[],
  affinity: Affinity
): MoodKey[] {
  const n = moodKeys.length || 1;
  return moodKeys
    .map((key, i) => {
      const base = (n - i) / n; // 원순서 일치도 (앞일수록 큼)
      const w = affinity[key] ?? 0;
      return { key, i, score: base * (1 + w) };
    })
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.key);
}
