import type { PriceTier, Product } from "./types";

/** 가격 → 티어 (7.10 태깅 스키마) */
export function tierOf(won: number): PriceTier {
  if (won < 50000) return "로우";
  if (won < 100000) return "미드";
  return "하이";
}

/** 상품의 대표(최저) 가격 */
export function primaryPrice(product: Product): number {
  return product.sources[0]?.price ?? 0;
}

export function formatPrice(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}

/** 만원 단위 요약 표기 (26.2만) */
export function formatMan(won: number): string {
  const man = won / 10000;
  const rounded = Math.round(man * 10) / 10;
  return `${rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)}만`;
}

/* ── 7.10 자연 번역기 ─────────────────────────────────────────
   "같은 느낌, 다른 예산." 꽂힌 룩을 내 예산 안에서 재구성한다.
   취향(무드)은 그대로, 실행(예산)만 유저 것 — 제0조. */

export const BUDGETS: { label: string; won: number | null }[] = [
  { label: "5만", won: 50000 },
  { label: "10만", won: 100000 },
  { label: "20만", won: 200000 },
  { label: "상관없음", won: null },
];

export interface FitResult {
  includedIds: Set<string>;
  total: number;
  coverage: number; // 이 느낌을 몇 % 담았나
  dropped: Product[];
}

/**
 * 예산에 맞춰 룩 재구성. 최저가 기준, 싼 아이템부터 담아 예산 내 최대 커버.
 * budget=null(상관없음) → 전체 포함. 초과 시 아이템 절출을 제안(7.10.3).
 */
export function fitLookToBudget(
  products: Product[],
  budget: number | null
): FitResult {
  if (budget == null) {
    return {
      includedIds: new Set(products.map((p) => p.id)),
      total: products.reduce((s, p) => s + primaryPrice(p), 0),
      coverage: 100,
      dropped: [],
    };
  }
  const sorted = [...products].sort((a, b) => primaryPrice(a) - primaryPrice(b));
  const includedIds = new Set<string>();
  let total = 0;
  for (const p of sorted) {
    if (total + primaryPrice(p) <= budget) {
      includedIds.add(p.id);
      total += primaryPrice(p);
    }
  }
  const dropped = products.filter((p) => !includedIds.has(p.id));
  const coverage = Math.round((includedIds.size / products.length) * 100);
  return { includedIds, total, coverage, dropped };
}
