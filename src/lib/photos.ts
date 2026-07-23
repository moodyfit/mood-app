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
  caption_how?: string | null;
  is_flagship: boolean | null;
  // 메이슨리(전시 문법)용 세로 비율 = width/height. null이면 기본값.
  // 실값은 생성 단계(GENERATION)에서 부여(4:5 기본 + 3:4/9:16 일부) — 크롭으로 위조 금지.
  aspect_ratio?: number | null;
}

/** 카드 기본 비율(width/height). 스트릿샷 세로 구도 기준 4:5. */
export const DEFAULT_CARD_RATIO = 0.8;

/** 문자열 → 안정 해시(결정적, Math.random 미사용) */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * 실비율(aspect_ratio) 없을 때의 폴백 변주.
 * 전부 원본(≈0.78)보다 '넓게'만 → cover 가 좌우 배경만 크롭, 인물 세로 구도는 보존(①).
 * 실값 이미지가 생성되면 cardRatio 가 실값을 우선 사용.
 */
const FALLBACK_RATIOS = [0.78, 0.82, 0.86, 0.9];

/** 무드 커버(≈0.75) 폴백 변주 — 넓게만. */
const COVER_RATIOS = [0.75, 0.79, 0.84, 0.88];

/** 카드 렌더 비율. 실값 있으면 클램프해서 사용, 없으면 id 기반 안전 변주 폴백. */
export function cardRatio(p: Photo): number {
  const r = p.aspect_ratio;
  if (typeof r === "number" && isFinite(r) && r > 0) return Math.min(0.95, Math.max(0.5, r));
  return FALLBACK_RATIOS[hashStr(p.id) % FALLBACK_RATIOS.length];
}

/** 무드 커버 카드 비율(로컬 폴백 그리드). key 기반 결정적 변주 — 넓게만(인물 보존). */
export function moodCoverRatio(key: string): number {
  return COVER_RATIOS[hashStr(key) % COVER_RATIOS.length];
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
  // photos-seed.sql 마이그레이션으로 caption_how·aspect_ratio 컬럼 보장됨(입고 후). 실측 비율로 메이슨리.
  const { data, error } = await sb
    .from("photos")
    .select("id,image_url,mood_vector,situations,seasons,caption_item,caption_why,caption_how,is_flagship,aspect_ratio");
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

/** (B) 사진 레벨 — 특정 사진에 연결된 상품(photo_products = products.photo_image_url) */
export async function fetchProductsByPhoto(imageUrl: string): Promise<Product[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("products")
    .select("name,category,price,source,gradient,affiliate_url,mood_key")
    .eq("photo_image_url", imageUrl);
  if (error || !data) return []; // 컬럼 미존재/미연결 → 빈 배열, 호출부가 무드 폴백
  const byName = new Map<string, Product>();
  for (const r of data as (ProductRow & { mood_key: string })[]) {
    let p = byName.get(r.name);
    if (!p) {
      p = {
        id: `${imageUrl}-${r.name}`,
        moodKey: r.mood_key as MoodKey,
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

/** 사진 연결 상품 있으면 그것, 없으면 무드 폴백 → 로컬 더미 (부분 교체·무중단) */
export async function getProductsForPhoto(imageUrl: string, moodKey: MoodKey): Promise<Product[]> {
  const p = await fetchProductsByPhoto(imageUrl);
  return p.length > 0 ? p : getProductsForMood(moodKey);
}

/** 사진 1건 조회(사진 전용 상품 뷰용) — slug(clean-001) 로, 확장자 무관(.jpg/.png 모두) */
export async function fetchPhotoBySlug(slug: string): Promise<Photo | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("photos")
    .select("id,image_url,mood_vector,situations,seasons,caption_item,caption_why,caption_how,is_flagship,aspect_ratio")
    .ilike("image_url", `moods/${slug}.%`)
    .limit(1);
  if (error || !data || data.length === 0) return null;
  return data[0] as Photo;
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
