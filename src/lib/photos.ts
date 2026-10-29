import { getSupabase } from "./supabase";
import type { MoodKey, Product } from "./types";
import { tierOf } from "./products";

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
  // top-level 컬럼(#20/#21 합의 — body_spec.gender가 아니라 여기가 정답). null = 미태깅(과거 90장 등).
  gender?: "male" | "female" | null;
  is_flagship: boolean | null;
  // 메이슨리(전시 문법)용 세로 비율 = width/height. null이면 기본값.
  // 실값은 생성 단계(GENERATION)에서 부여(4:5 기본 + 3:4/9:16 일부) — 크롭으로 위조 금지.
  aspect_ratio?: number | null;
}

/**
 * 성별 필터(FEAT-014) — "null은 전체에서만 보임" 규칙의 단일 소스. 홈·검색결과 두 곳에서
 * 복붙되던 같은 식을 여기로 모았다(코드리뷰 P2-1). GenderFilter 타입은 store.tsx에 있지만
 * 여기서 import하면 store↔photos 순환 참조가 생겨 리터럴 타입으로 직접 받는다.
 */
export function filterByGender<T extends { gender?: "male" | "female" | null }>(
  items: T[],
  gender: "all" | "male" | "female"
): T[] {
  return gender === "all" ? items : items.filter((p) => p.gender === gender);
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
  affiliate_url: string | null;
  image_url: string | null;
  mood_key: string;
}

const PRODUCT_COLUMNS = "name,category,price,source,affiliate_url,mood_key,image_url";
const CATEGORY_ORDER = ["아우터", "상의", "하의", "신발"];

/** 사진 1장의 상품 행 → 상품(같은 이름은 판매처로 묶음) */
function toProducts(rows: ProductRow[], imageUrl: string): Product[] {
  const byName = new Map<string, Product>();
  for (const r of rows) {
    let p = byName.get(r.name);
    if (!p) {
      p = {
        // 슬래시 금지 — 이 id가 /closet/[id] 라우트 세그먼트로 쓰여서 'moods/xxx'는 다중 세그먼트로 깨짐
        id: `${imageUrl.split("/").pop()?.replace(/\.\w+$/, "") ?? imageUrl}-${r.name}`,
        moodKey: r.mood_key as MoodKey,
        name: r.name,
        category: r.category as Product["category"],
        tier: tierOf(r.price),
        // 코디 사진에서 아이템 부위를 크롭한 실사진(10/16 회의록 "썸네일 크롭"). 없으면 미표시.
        imageUrl: r.image_url ?? undefined,
        sources: [],
        photo: imageUrl,
      };
      byName.set(r.name, p);
    }
    p.sources.push({ name: r.source, price: r.price, affiliateUrl: r.affiliate_url ?? undefined });
  }
  const list = [...byName.values()];
  for (const p of list) p.sources.sort((a, b) => a.price - b.price);
  return list.sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));
}

/** (B) 사진 레벨 — 특정 사진에 연결된 상품(photo_products = products.photo_image_url) */
export async function fetchProductsByPhoto(imageUrl: string): Promise<Product[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb.from("products").select(PRODUCT_COLUMNS).eq("photo_image_url", imageUrl);
  if (error || !data) return []; // 컬럼 미존재/미연결 → 빈 배열, 화면은 빈 상태
  return toProducts(data as ProductRow[], imageUrl);
}

/** (C) 무드 레벨 — 대표 사진(is_flagship)과 그 상품 */
export interface FlagshipLook {
  photo: Photo;
  products: Product[];
}

let flagshipPromise: Promise<FlagshipLook[]> | null = null;

/** 무드 카드 여러 장이 요청 1번을 나눠 쓴다. 실패하면 캐시를 비워 다음 화면에서 다시 시도 */
export function fetchFlagshipLooks(): Promise<FlagshipLook[]> {
  flagshipPromise ??= (async () => {
    const sb = getSupabase();
    if (!sb) return [];
    const photos = await sb.from("photos").select("*").eq("is_flagship", true);
    const urls = ((photos.data ?? []) as Photo[]).map((p) => p.image_url);
    const products = await sb
      .from("products")
      .select(`${PRODUCT_COLUMNS},photo_image_url`)
      .in("photo_image_url", urls);
    if (photos.error || products.error || !products.data) {
      flagshipPromise = null;
      return [];
    }
    const rows = products.data as (ProductRow & { photo_image_url: string })[];
    return (photos.data as Photo[]).map((photo) => ({
      photo,
      products: toProducts(
        rows.filter((r) => r.photo_image_url === photo.image_url),
        photo.image_url
      ),
    }));
  })();
  return flagshipPromise;
}

let photoProductsPromise: Promise<Map<string, Product[]>> | null = null;

/** 사진별 상품 전체(사진 경로 → 상품). 무드 상세에서 코디를 바꿀 때 조회 없이 바로 보여준다 */
export function fetchPhotoProducts(): Promise<Map<string, Product[]>> {
  photoProductsPromise ??= (async () => {
    const sb = getSupabase();
    if (!sb) return new Map();
    const { data, error } = await sb.from("products").select(`${PRODUCT_COLUMNS},photo_image_url`);
    if (error || !data) {
      photoProductsPromise = null;
      return new Map();
    }
    const byPhoto = new Map<string, ProductRow[]>();
    for (const r of data as (ProductRow & { photo_image_url: string })[]) {
      byPhoto.set(r.photo_image_url, [...(byPhoto.get(r.photo_image_url) ?? []), r]);
    }
    return new Map([...byPhoto].map(([url, rows]) => [url, toProducts(rows, url)]));
  })();
  return photoProductsPromise;
}

/** 무드 대표 코디 — 성별 필터에 맞는 대표 사진 중 상품이 많은 것, 같으면 파일명 순 */
export function pickFlagshipLook(
  looks: FlagshipLook[],
  moodKey: string,
  gender: "all" | "male" | "female"
): FlagshipLook | null {
  const shown = new Set(filterByGender(looks.map((l) => l.photo), gender));
  return (
    looks
      .filter((l) => shown.has(l.photo) && l.products.length > 0 && dominantMood(l.photo.mood_vector) === moodKey)
      .sort(
        (a, b) => b.products.length - a.products.length || a.photo.image_url.localeCompare(b.photo.image_url)
      )[0] ?? null
  );
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
