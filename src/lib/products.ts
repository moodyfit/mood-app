import type { MoodKey, Product } from "./types";
import { MOODS } from "./moods";

/** 무드별 상품 아이템 (프로토타입 시드). 실서비스에선 products 테이블 조회로 대체 */
const ITEM_TEMPLATE: { name: string; price: number; source: string }[] = [
  { name: "셋업 자켓", price: 89000, source: "무신사 · 새상품" },
  { name: "코튼 니트", price: 42000, source: "번개장터 · A급" },
  { name: "와이드 슬랙스", price: 38000, source: "무신사 · 새상품" },
  { name: "레더 로퍼", price: 115000, source: "크림 · 정품검수" },
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
    price: t.price,
    source: t.source,
    gradient: shiftGradient(mood.gradient, i),
  }));
}

export function formatPrice(won: number): string {
  return `${won.toLocaleString("ko-KR")}원`;
}
