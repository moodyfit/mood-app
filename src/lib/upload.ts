import { getSupabase } from "./supabase";

/**
 * FEAT-013 업로드 데이터 계층 — Storage 저장과 태깅 API 호출.
 * 컴포넌트는 Supabase를 직접 부르지 않고 여기를 거친다(BE 이관 시 이 파일만 교체).
 */

export const UPLOAD_BUCKET = "uploads";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 라우트와 동일 상한 — 먼저 걸러 왕복을 줄인다
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type Gender = "male" | "female";
export type PhotoType = "real" | "ai";

export interface TagPayload {
  storagePath: string;
  aspectRatio: number;
  gender: Gender;
  photoType: PhotoType;
  userDescription: string | null;
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

/** 미리보기 URL + 실제 비율(width/height). 비율을 안 보내면 카드가 기본값으로 잡혀 세로 사진이 잘린다. */
export function readImage(file: File): Promise<Result<{ previewUrl: string; ratio: number }>> {
  return new Promise((resolve) => {
    if (file.size > MAX_UPLOAD_BYTES) {
      return resolve({ ok: false, error: "5MB 이하 사진만 올릴 수 있어." });
    }
    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      resolve({ ok: true, data: { previewUrl, ratio: img.naturalWidth / img.naturalHeight } });
    img.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      resolve({ ok: false, error: "이미지를 읽지 못했어. 다른 사진으로 해볼래?" });
    };
    img.src = previewUrl;
  });
}

/** Storage 업로드. 원본 파일명은 slug(파일명 기준)가 유저 간 충돌하므로 UUID로 새로 짓는다. */
export async function uploadPhotoFile(file: File): Promise<Result<{ storagePath: string }>> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "서버 설정이 안 돼 있어." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from(UPLOAD_BUCKET).upload(path, file, {
    contentType: file.type,
  });
  if (error) return { ok: false, error: `업로드 실패: ${error.message}` };
  return { ok: true, data: { storagePath: `${UPLOAD_BUCKET}/${path}` } };
}

/** 태깅 요청. 라우트가 Bearer 토큰을 요구한다(로그인 필수). */
export async function requestTagging(payload: TagPayload): Promise<Result<{ slug: string }>> {
  const sb = getSupabase();
  if (!sb) return { ok: false, error: "서버 설정이 안 돼 있어." };

  const { data: sess } = await sb.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) return { ok: false, error: "세션이 만료됐어. 다시 로그인해줘." };

  try {
    const res = await fetch("/api/photos/tag", {
      method: "POST",
      headers: { "content-type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        storage_path: payload.storagePath,
        aspect_ratio: payload.aspectRatio,
        gender: payload.gender,
        // 아래 둘은 라우트가 아직 안 받는다(FEAT-011에 요청함) — 받기 시작하면 그대로 저장된다
        photo_type: payload.photoType,
        user_description: payload.userDescription,
      }),
    });
    const body = (await res.json()) as { error?: string };
    if (!res.ok) return { ok: false, error: body.error ?? "태깅에 실패했어. 다시 해볼래?" };
    return { ok: true, data: { slug: slugFromPath(payload.storagePath) } };
  } catch {
    return { ok: false, error: "네트워크 오류야. 다시 해볼래?" };
  }
}

/** 상세 경로용 slug — PhotoCard 와 같은 규칙(폴더 무시, 확장자 제거). */
export function slugFromPath(storagePath: string): string {
  return storagePath.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
}
