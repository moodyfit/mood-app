import type {
  MoodKey,
  PriceTier,
  Product,
  ProductCategory,
  ProductSource,
} from "./types";
import { MOODS } from "./moods";

/**
 * 무드별 상품 아이템 (프로토타입 시드). 실서비스에선 products 테이블 조회로 대체.
 * 각 아이템은 2~3곳 판매처 + 카테고리 태그를 가진다.
 * (겹3② 횡단 가격 비교 = PCPartPicker 신뢰 / 7.10 자연 번역기의 카테고리 전제)
 */
/**
 * #8 예산 다이얼 — 슬롯(아우터/상의/하의/신발)마다 티어별 변형.
 * 기본템 = 미드(is_default). 예산 다이얼이 같은 무드의 해당 티어로 슬롯을 교체.
 * 티어 변형이 없는 슬롯은 미드 유지("이 슬롯은 그대로가 최선"). 로고 비전면 기본템.
 * (로컬 6무드 = 간판 룩으로 취급, 티어 완비. 실데이터는 간판 10개만 완비 → hasDial)
 */
type Variant = { name: string; sources: ProductSource[] };
// 모든 슬롯에 로우/미드/하이 완비 — 예산을 내려도 아이템을 '빼지' 않고 같은 결의 저렴한 대체품으로 '교체'.
// 구성(상의·하의·아우터·신발 4칸)은 언제나 그대로.
const SLOTS: { category: ProductCategory; variants: Partial<Record<PriceTier, Variant>> }[] = [
  {
    category: "아우터",
    variants: {
      로우: { name: "코치 자켓", sources: [{ name: "번개장터", price: 29000 }, { name: "무신사", price: 39000 }] },
      미드: { name: "셋업 자켓", sources: [{ name: "번개장터", price: 72000 }, { name: "무신사", price: 89000 }, { name: "29CM", price: 94000 }] },
      하이: { name: "울 블레이저", sources: [{ name: "무신사", price: 159000 }, { name: "29CM", price: 179000 }] },
    },
  },
  {
    category: "상의",
    variants: {
      로우: { name: "베이직 스웻", sources: [{ name: "유니클로", price: 19900 }, { name: "무신사", price: 24000 }] },
      미드: { name: "코튼 니트", sources: [{ name: "번개장터", price: 42000 }, { name: "무신사", price: 49000 }] },
      하이: { name: "메리노 니트", sources: [{ name: "무신사", price: 89000 }, { name: "29CM", price: 98000 }] },
    },
  },
  {
    category: "하의",
    variants: {
      로우: { name: "코튼 치노", sources: [{ name: "유니클로", price: 29900 }] },
      미드: { name: "와이드 슬랙스", sources: [{ name: "번개장터", price: 33000 }, { name: "무신사", price: 38000 }, { name: "29CM", price: 41000 }] },
      하이: { name: "울 슬랙스", sources: [{ name: "무신사", price: 79000 }, { name: "29CM", price: 89000 }] },
    },
  },
  {
    category: "신발",
    variants: {
      로우: { name: "캔버스 스니커", sources: [{ name: "무신사", price: 34900 }, { name: "번개장터", price: 27000 }] },
      미드: { name: "레더 스니커", sources: [{ name: "무신사", price: 79000 }, { name: "크림", price: 89000 }] },
      하이: { name: "레더 로퍼", sources: [{ name: "무신사", price: 145000 }, { name: "크림", price: 159000 }] },
    },
  },
];

export const DIAL_SLOT_COUNT = SLOTS.length;
/** 슬롯 i에 해당 티어 대안이 있나 (없으면 기본템 유지) */
export function slotHasTier(i: number, tier: PriceTier): boolean {
  return Boolean(SLOTS[i]?.variants[tier]);
}
/** 예산 프리셋 → 목표 티어. 5만=로우 / 10만=미드 / 20만·상관없음=하이. 양방향 다이얼(상향 포함) */
export function tierForBudget(won: number | null): PriceTier {
  if (won == null) return "하이";
  if (won <= 50000) return "로우";
  if (won <= 100000) return "미드";
  return "하이";
}
/** 티어별 대안 완비된 간판 룩만 다이얼 노출 (로컬 전체 true) */
export function hasDial(moodKey: MoodKey): boolean {
  return Boolean(MOODS[moodKey]);
}
/** 무드 룩을 특정 티어로 구성. 슬롯에 티어 없으면 미드(기본템) 폴백 */
export function buildLook(moodKey: MoodKey, tier: PriceTier = "미드"): Product[] {
  const mood = MOODS[moodKey];
  if (!mood) return [];
  return SLOTS.map((s, i) => {
    // 해당 티어 대안이 없으면 미드로 폴백 — id도 실제 티어를 반영(스왑 안 된 슬롯은 리마운트/애니메이션 없음)
    const resolvedTier: PriceTier = s.variants[tier] ? tier : "미드";
    const v = s.variants[resolvedTier]!;
    const sources = [...v.sources].sort((a, b) => a.price - b.price);
    return {
      id: `${moodKey}-${i}-${resolvedTier}`,
      moodKey,
      name: v.name,
      category: s.category,
      tier: tierOf(sources[0].price),
      gradient: shiftGradient(mood.gradient, i),
      sources,
    };
  });
}

function shiftGradient(gradient: string, i: number): string {
  const angles = [150, 30, 210, 300];
  return gradient.replace(/\d+deg/, `${angles[i % 4]}deg`);
}

/** 가격 → 티어 (7.10 태깅 스키마) */
export function tierOf(won: number): PriceTier {
  if (won < 50000) return "로우";
  if (won < 100000) return "미드";
  return "하이";
}

/** 기본 룩 = 미드 티어(is_default). 완성가 라벨의 산식 기준 */
export function productsFor(moodKey: MoodKey): Product[] {
  return buildLook(moodKey, "미드");
}

/** #9 마지막 조각용 슬롯 메타: 카테고리 + 기본템(미드) 이름 + 로우~미드 최저가 */
export interface SlotPiece {
  category: ProductCategory;
  name: string;
  low: number;
  mid: number;
}
export function slotPieces(): SlotPiece[] {
  return SLOTS.map((s) => {
    const mid = s.variants["미드"]!;
    const midPrice = Math.min(...mid.sources.map((x) => x.price));
    const lowV = s.variants["로우"];
    const low = lowV ? Math.min(...lowV.sources.map((x) => x.price)) : midPrice;
    return { category: s.category, name: mid.name, low, mid: midPrice };
  });
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
