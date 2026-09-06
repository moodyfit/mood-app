import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 클라이언트 (선택적).
 * v1 MVP는 로컬 시드(lib/moods.ts, lib/products.ts)로 동작한다.
 * 환경변수가 설정되면 이 클라이언트로 데이터 소스를 교체한다 (schema.sql 참고).
 */
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null; // 미설정 → 로컬 시드 사용
  if (!cached)
    cached = createClient(url, key);
  return cached;
}

export const isSupabaseEnabled = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

/**
 * 서버 전용 관리자 클라이언트 (SUPABASE_SERVICE_KEY, RLS 우회).
 * API route 등 서버 코드에서만 호출할 것 — 절대 클라이언트 번들에 노출 금지.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}
