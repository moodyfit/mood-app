// 개인화 랭킹 엔진 — "콜드=최대 다양성 → 신호 쌓일수록 매끄럽게 개인화, 항상 탐색 유지".
// 헌법: 크기·순서는 '추구미 적합도'지 인기 아님. 취향 고착 방지 위해 다양성(탐색) 항상 잔존.
import type { Photo } from "./photos";
import { dominantMood } from "./photos";
import type { Affinity } from "./types";
import { getConfig } from "./config";

/** 개인화 강도 0(콜드)~1(충분). affinity 신호 총량 기반 — 부드러운 램프. 포화값은 튜닝 가능(config). */
export function personalizationStrength(affinity: Affinity): number {
  const total = Object.values(affinity).reduce((a, b) => a + (b || 0), 0);
  return Math.min(1, total / getConfig().saturate);
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

// 극적 대표성 — 콜드 스타트에서 '확 다른 스타일'을 앞세우기 위한 점수.
// flagship(큐레이션된 강한 컷) + 순수 단일무드(전형적일수록)일수록 높음.
function prominence(p: Photo): number {
  const flag = p.is_flagship ? 1 : 0;
  const v = p.mood_vector ?? {};
  const purity = Object.values(v).length ? Math.max(...Object.values(v)) : 0;
  return flag * 1 + purity * 0.3;
}

/**
 * 개인화 재정렬(greedy MMR): value = α·적합도 − 다양성페널티·(이미 뽑은 같은무드 수).
 * - α=0(콜드): 적합도 0 + 강한 다양성 → 무드 라운드로빈(최대 다양성).
 * - α↑(신호 축적): 적합도가 앞서고, 페널티는 완화되되 잔존 → 개인화 + 탐색 20~30%.
 * - explore(새로운 느낌): 적합도 반전(안 가본 무드 우선).
 * 결정적(안정 tiebreak) — 하이드레이션 불일치 없음.
 */
export function rankPersonalized(
  photos: Photo[],
  affinity: Affinity,
  opts: { explore?: boolean } = {},
): Photo[] {
  if (photos.length <= 1) return photos;
  const alpha = personalizationStrength(affinity);

  const raw = photos.map((p) => {
    const v = p.mood_vector ?? {};
    let s = 0;
    for (const [k, val] of Object.entries(v)) s += (affinity[k] ?? 0) * val;
    return s;
  });
  const maxRaw = Math.max(1, ...raw);
  const affNorm = (i: number) => raw[i] / maxRaw; // 0..1
  // 새로운 느낌: 낮은 적합도(안 가본 결) 우선. α는 탐색 의지로 최소 0.5 보장.
  const score = (i: number) => (opts.explore ? 1 - affNorm(i) : affNorm(i));
  const a = opts.explore ? Math.max(0.5, alpha) : alpha;
  // 다양성 페널티: 콜드일수록 큼(라운드로빈), 개인화될수록 완화하되 바닥 유지(탐색 잔존). 강도 튜닝 가능.
  const penalty = getConfig().diversity * (1 - 0.7 * alpha);

  const remaining = photos.map((p, i) => ({ p, i }));
  const moodCount: Record<string, number> = {};
  const out: Photo[] = [];
  while (remaining.length) {
    let bestJ = 0;
    let bestVal = -Infinity;
    for (let j = 0; j < remaining.length; j++) {
      const { p, i } = remaining[j];
      const dom = dominantMood(p.mood_vector ?? {});
      // (1-α)·극적대표성: 콜드일수록 flagship/전형 컷을 앞세워 '확 다른 스타일'로 시작, 개인화되면 소멸.
      const promoTerm = opts.explore ? 0 : (1 - alpha) * 0.5 * prominence(p);
      const val = a * score(i) - penalty * (moodCount[dom] ?? 0) + promoTerm + (hash(p.id) % 100) / 1e5;
      if (val > bestVal) {
        bestVal = val;
        bestJ = j;
      }
    }
    const { p } = remaining.splice(bestJ, 1)[0];
    moodCount[dominantMood(p.mood_vector ?? {})] = (moodCount[dominantMood(p.mood_vector ?? {})] ?? 0) + 1;
    out.push(p);
  }
  return out;
}

/** 히어로(대형 카드) 노출 기준 — 개인화가 유의미해진 뒤에만(콜드엔 다양한 격자). */
export const HERO_MIN_STRENGTH = 0.25;
