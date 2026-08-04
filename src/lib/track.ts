// Phase 1 — 개인화 기반. 취향 신호를 서버(Supabase)에 적재.
// localStorage(즉시 UX) + 서버(영속·집계·ML 발판) 이중화. 익명 userId 기준(로그인 도입 시 병합).
// 전부 fire-and-forget: 미설정/오프라인/실패 시 조용히 무시 → 앱 흐름 안 막음.

import { getSupabase } from "./supabase";
import type { Affinity } from "./types";

export type EventType =
  | "save"
  | "unsave"
  | "view"
  | "scan_like"
  | "search"
  | "photo_open"
  | "worn"
  | "profile_set";

interface EventPayload {
  photo_id?: string;
  mood_key?: string;
  query?: string;
  meta?: Record<string, unknown>;
}

/** 단일 이벤트 적재(분석·ML 원천 데이터). */
export function trackEvent(userId: string | null, type: EventType, payload: EventPayload = {}): void {
  const sb = getSupabase();
  if (!sb || !userId) return;
  void sb
    .from("events")
    .insert({ user_id: userId, type, ...payload })
    .then(undefined, () => {}); // 실패 무시
}

/** 취향 상태 스냅샷을 서버에 upsert(영속·크로스세션 복구·로그인 병합 대비). */
export function syncTaste(userId: string | null, moodVector: Affinity, savedPhotoIds: string[]): void {
  const sb = getSupabase();
  if (!sb || !userId) return;
  void sb
    .from("user_taste")
    .upsert(
      {
        user_id: userId,
        mood_vector: moodVector,
        saved_photo_ids: savedPhotoIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .then(undefined, () => {});
}

export interface ServerTaste {
  mood_vector: Affinity | null;
  saved_photo_ids: string[] | null;
}

/** 로드 시 서버 취향 복구용(로컬이 비었을 때 하이드레이트). */
export async function fetchTaste(userId: string | null): Promise<ServerTaste | null> {
  const sb = getSupabase();
  if (!sb || !userId) return null;
  try {
    const { data, error } = await sb
      .from("user_taste")
      .select("mood_vector,saved_photo_ids")
      .eq("user_id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return data as ServerTaste;
  } catch {
    return null;
  }
}
