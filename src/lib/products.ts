import type { MoodKey, Product, ProductSource } from "./types";
import { MOODS } from "./moods";

/**
 * 무드별 상품 아이템 (프로토타입 시드). 실서비스에선 products 테이블 조회로 대체.
 * 각 아이템은 2~3곳 판매처를 가진다 (겹3② 횡단 가격 비교 = PCPartPicker 신뢰).
 */
const ITEM_TEMPLATE: { name: string; sources: ProductSource[] }[] = [
  {
    name: "셋업 자켓",
    sources: [
      { name: "번개장터", price: 72000 },
      { name: "무신사", price: 89000 },
      { name: "29CM", price: 94000 },
    ],
  },
  {
    name: "코튼 니트",
    sources: [
      { name: "번개장터", price: 42000 },
      { name: "무신사", price: 49000 },
    ],
  },
  {
    name: "와이드 슬랙스",
    sources: [
      { name: "번개장터", price: 33000 },
      { name: "무신사", price: 38000 },
      { name: "29CM", price: 41000 },
    ],
  },
  {
    name: "레더 로퍼",
    sources: [
      { name: "크림", price: 115000 },
      { name: "무신사", price: 129000 },
    ],
  },
];

function shiftGradient(gradient: string, i: number): string {
  const angles = [150, 30, 210, 300];
  return gradient.replace(/\d+deg/, `${angles[i % 4]}deg`);
}

export function productsFor(moodKey: MoodKey): Product[] {
  const mood = MOODS[moodKey];
  if (!mood) return [];
  return ITEM_TEMPLATE.map((t, i) => ({
    id: `${moodKey}-${i}`,
    moodKey,
    name: t.name,
    gradient: shiftGradient(mood.gradient, i),
    // 가격 오름차순 정렬 → sources[0] = 최저가
    sources: [...t.sources].sort((a, b) => a.price - b.price),
  }));
}

/** 상품의 대표(최저) 가격 */
export function primaryPrice(product: Product): number {
  return product.sources[0]?.price ?? 0;
}

/** 모먼트 2: 무드 완성가 = 연결 상품 최저가 합산 ("이 룩 완성 · 26.2만") */
export function lookTotal(moodKey: MoodKey): number {
  return productsFor(moodKey).reduce((sum, p) => sum + primaryPrice(p), 0);
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
