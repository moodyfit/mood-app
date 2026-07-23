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
    cached = createClient(url, key, {
      // Next 가 supabase GET 을 fetch 캐시에 굳혀 옛 데이터를 반환하는 문제 방지 — 항상 최신.
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    });
  return cached;
}

export const isSupabaseEnabled = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
