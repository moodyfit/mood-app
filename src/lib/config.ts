// 개인화 파라미터 — 실시간 튜닝 가능(app_config). 클라이언트가 로드 시 fetch해 모듈에 캐시.
// rank.ts·store.tsx가 getConfig()로 읽음. 미설정/실패 시 기본값(코드와 동일).
import { getSupabase } from "./supabase";

export interface RankConfig {
  wSave: number; // 저장/좋아요/내옷담기 가중
  wView: number; // 조회/클릭/검색 가중
  saturate: number; // α 포화(신호 총량)
  diversity: number; // 다양성 강도
}

const DEFAULTS: RankConfig = { wSave: 2, wView: 1, saturate: 12, diversity: 0.6 };
let current: RankConfig = { ...DEFAULTS };

export function getConfig(): RankConfig {
  return current;
}
export function setConfig(c: Partial<RankConfig>): void {
  current = { ...current, ...c };
}
export const CONFIG_DEFAULTS = DEFAULTS;

/** 로드 시 서버 config 반영(클라이언트). */
export async function fetchConfig(): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  try {
    const { data, error } = await sb
      .from("app_config")
      .select("w_save,w_view,saturate,diversity")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return;
    setConfig({
      wSave: Number(data.w_save),
      wView: Number(data.w_view),
      saturate: Number(data.saturate),
      diversity: Number(data.diversity),
    });
  } catch {
    /* 기본값 유지 */
  }
}
