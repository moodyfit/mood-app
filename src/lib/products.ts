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
