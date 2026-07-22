import { getSupabase } from "./supabase";
import type { MoodKey, Product } from "./types";
import { productsFor, tierOf } from "./products";

/** 라이브 photos 테이블 (태깅 스키마) */
export interface Photo {
  id: string;
  image_url: string; // 'moods/clean-001.png'
  mood_vector: Record<string, number>;
  situations: string[] | null;
  seasons: string[] | null;
  caption_item: string | null;
  caption_why: string | null;
  is_flagship: boolean | null;
  // 메이슨리(전시 문법)용 세로 비율 = width/height. null이면 기본값.
  // 실값은 생성 단계(GENERATION)에서 부여(4:5 기본 + 3:4/9:16 일부) — 크롭으로 위조 금지.
  aspect_ratio?: number | null;
}

/** 카드 기본 비율(width/height). 스트릿샷 세로 구도 기준 4:5. */
export const DEFAULT_CARD_RATIO = 0.8;

/** 카드 렌더 비율. 비정상값은 0.5~0.9로 클램프(구도 보호). */
export function cardRatio(p: Photo): number {
  const r = p.aspect_ratio;
  if (typeof r !== "number" || !isFinite(r) || r <= 0) return DEFAULT_CARD_RATIO;
  return Math.min(0.9, Math.max(0.5, r));
}

/** Storage 공개 URL (moods 버킷은 public 이어야 함) */
export function photoUrl(imagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !imagePath) return "";
  return `${base}/storage/v1/object/public/${imagePath}`;
}

/** photos 전체 조회. 미설정/실패 시 빈 배열 → 호출부가 로컬로 폴백 */
export async function fetchPhotos(): Promise<Photo[]> {
  const sb = getSupabase();
  if (!sb) return [];
  // aspect_ratio 는 컬럼이 있을 때만 select 에 추가(없으면 쿼리 에러 → 그리드 붕괴). 없으면 cardRatio 가 0.8 폴백.
  const { data, error } = await sb
    .from("photos")
    .select("id,image_url,mood_vector,situations,seasons,caption_item,caption_why,is_flagship");
  if (error || !data) return [];
  return data as Photo[];
}

/** mood_vector 최상위 축 */
export function dominantMood(v: Record<string, number>): string {
  return Object.entries(v ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

interface ProductRow {
  name: string;
  category: string;
  price: number;
  source: string;
  gradient: string;
  affiliate_url: string | null;
}

/** DB products(아이템×판매처 행)를 무드별로 조회해 Product[](sources 묶음)로 그룹 */
export async function fetchProductsByMood(moodKey: MoodKey): Promise<Product[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("products")
    .select("name,category,price,source,gradient,affiliate_url")
    .eq("mood_key", moodKey);
  if (error || !data) return [];

  const byName = new Map<string, Product>();
  for (const r of data as ProductRow[]) {
    let p = byName.get(r.name);
    if (!p) {
      p = {
        id: `${moodKey}-${r.name}`,
        moodKey,
        name: r.name,
        category: r.category as Product["category"],
        tier: tierOf(r.price),
        gradient: r.gradient,
        sources: [],
      };
      byName.set(r.name, p);
    }
    p.sources.push({ name: r.source, price: r.price, affiliateUrl: r.affiliate_url ?? undefined });
  }
  const list = [...byName.values()];
  for (const p of list) p.sources.sort((a, b) => a.price - b.price);
  return list;
}

/** DB에 있으면 DB, 없으면 로컬 시드 (살 수 있다 완결 — 시딩 전엔 로컬 데모, 시딩 후 DB) */
export async function getProductsForMood(moodKey: MoodKey): Promise<Product[]> {
  const db = await fetchProductsByMood(moodKey);
  return db.length > 0 ? db : productsFor(moodKey);
}

/**
 * 검색어가 해석한 무드축 가중치로 photos 랭킹.
 * 매칭 0이어도 배열은 유지(그리드가 비지 않게) — 첫 DB 그리드 마일스톤 보장.
 */
export function rankPhotos(photos: Photo[], moodKeys: string[]): Photo[] {
  const n = moodKeys.length || 1;
  const w = new Map(moodKeys.map((k, i) => [k, (n - i) / n]));
  return [...photos]
    .map((p) => ({
      p,
      s: Object.entries(p.mood_vector ?? {}).reduce((a, [k, val]) => a + (w.get(k) ?? 0) * val, 0),
    }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}
