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
  // 작성자가 직접 쓴 한마디(FEAT-013). caption_* 는 AI 채점값이라 별개. 시드엔 없음.
  user_description?: string | null;
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
  // select("*") — caption_how·aspect_ratio 컬럼이 마이그레이션 전이어도 쿼리가 안 깨지게(있으면 포함).
  const { data, error } = await sb.from("photos").select("*");
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
        // 슬래시 금지 — 이 id가 /closet/[id] 라우트 세그먼트로 쓰여서 'moods/xxx'는 다중 세그먼트로 깨짐
        id: `${imageUrl.split("/").pop()?.replace(/\.\w+$/, "") ?? imageUrl}-${r.name}`,
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

// 상품명 토큰 → 캡션에 나오는 다른 표현
const CAPTION_ALIASES: Record<string, string[]> = {
  자켓: ["재킷"],
  워크부츠: ["워커"],
  오버코트: ["롱코트"],
  옥스퍼드: ["셔츠"],
  진: ["청바지"],
  데님: ["청자켓", "청바지", "청데님"],
  후디: ["후드"],
  가디건: ["카디건"],
  카디건: ["가디건"],
  스웻셔츠: ["스웨트", "맨투맨"],
  볼캡: ["캡"],
  수트: ["슈트"],
};

/**
 * caption_item 을 옷 하나씩의 절로 나누고, 상품명 토큰이 한 절 안에 몇 개 들어 있는지로 점수 매겨
 * 카테고리별 1위만 남긴다. 마지막 토큰(옷 종류)이 그 절에 없으면 0점. 0점 카테고리는 비운다. 동점은 이름순.
 */
// ponytail: 부분 문자열 겹침 + 고정 동의어 표, v3 외 어휘가 들어오면 표 확장
export function matchLook(caption: string, products: Product[]): Product[] {
  const clauses = caption.split(/,|에 |랑 |하고 |입고 |쓰고 /);
  const best = new Map<string, { p: Product; s: number }>();
  for (const p of [...products].sort((a, b) => a.name.localeCompare(b.name))) {
    const tokens = p.name.split(/\s+/);
    let s = 0;
    for (const c of clauses) {
      const has = (t: string) => [t, ...(CAPTION_ALIASES[t] ?? [])].some((a) => c.includes(a));
      if (has(tokens[tokens.length - 1])) s = Math.max(s, tokens.filter(has).length);
    }
    if (s > (best.get(p.category)?.s ?? 0)) best.set(p.category, { p, s });
  }
  return [...best.values()].map((x) => x.p);
}

/** linked = 사진에 연결된 상품, matched = 캡션으로 무드 상품에서 고른 한 벌 */
export type PhotoProductsSource = "linked" | "matched";

/** 사진 연결 상품 있으면 그것, 없으면 무드 상품(→ 로컬 더미)에서 캡션 매칭 */
export async function getProductsForPhoto(
  imageUrl: string,
  moodKey: MoodKey,
  caption: string,
): Promise<{ products: Product[]; source: PhotoProductsSource }> {
  const linked = await fetchProductsByPhoto(imageUrl);
  if (linked.length > 0) return { products: linked, source: "linked" };
  return { products: matchLook(caption, await getProductsForMood(moodKey)), source: "matched" };
}

/**
 * 사진 1건 조회(사진 전용 상품 뷰용) — slug(clean-001) 로, 확장자 무관(.jpg/.png 모두).
 * 버킷을 고정하지 않는다 — 시드는 moods/, 업로드는 uploads/ 라 접두사가 다르다(FEAT-013).
 */
export async function fetchPhotoBySlug(slug: string): Promise<Photo | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("photos")
    .select("*")
    .ilike("image_url", `%/${slug}.%`)
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
