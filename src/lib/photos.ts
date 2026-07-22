import { getSupabase } from "./supabase";

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
