import { getSupabase } from "./supabase";
import { UPLOAD_BUCKET } from "./upload";

const FAIL = "탈퇴하지 못했어요. 잠시 뒤 다시 시도해 주세요.";

/**
 * FEAT-036 회원 탈퇴 데이터 계층. 컴포넌트는 이 함수만 부른다(BE 이관 시 이 파일만 교체).
 * Storage는 SQL 직접 삭제가 막혀 있어(protect_objects_delete) 파일을 먼저 지우고,
 * 행 · 계정은 DB 함수 delete_my_account()가 지운다.
 */
export async function deleteAccount(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: FAIL };

  const { data: rows, error: readErr } = await sb.from("photos").select("image_url").eq("uploaded_by", userId);
  if (readErr) return { ok: false, error: FAIL };

  const prefix = `${UPLOAD_BUCKET}/`;
  const paths = (rows ?? [])
    .map((r) => r.image_url as string)
    .filter((u) => u?.startsWith(prefix))
    .map((u) => u.slice(prefix.length));
  if (paths.length > 0) {
    // 정책에 막힌 파일은 오류 없이 결과에서만 빠진다 — 개수로 확인
    const { data: removed, error } = await sb.storage.from(UPLOAD_BUCKET).remove(paths);
    if (error || (removed?.length ?? 0) < paths.length) return { ok: false, error: FAIL };
  }

  const { error } = await sb.rpc("delete_my_account");
  if (error) return { ok: false, error: FAIL };
  return { ok: true };
}
