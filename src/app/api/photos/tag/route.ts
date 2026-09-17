// FEAT-011 — POST /api/photos/tag { storage_path, aspect_ratio?, gender?, photo_type?, user_description? }
// 유저가 Storage(uploads/ 버킷 경로)에 올린 사진을 케빈의 scripts/score-photos.ts와 동일한 방식
// (Claude Vision + src/lib/tagging-rubric.ts SSOT)으로 자동 채점 → 계약 검증 → photos INSERT.
//
// 코드리뷰(소피, 2026-09-10) 반영:
// - 입력을 절대 URL이 아니라 상대 storage_path로 받는다(image_url 컬럼 계약 = 상대 경로. SSRF도 함께 차단).
// - Bearer 토큰 인증 게이트(BE-FEAT-003 인증 방식 결정 = Authorization 헤더).
// - 유저당 하루 UPLOAD_DAILY_LIMIT장 rate limit.
// - is_flagship은 업로드 경로에서 강제 false(콜드스타트 가중치 오염 방지).
// - confidence 저장(자동 태깅 품질의 사후 필터 신호).
//
// ⚠️ 머지 전 photos 테이블 마이그레이션 필요(PR 본문 참고): confidence, gender, source, uploaded_by,
//    user_description, photo_type 컬럼 + photos_uploaded_by_created_idx 인덱스.
//
// gender를 scoringPrompt에 반영(2026-09-17): 케빈이 PR #20(v3 이미지)에서 tagging/rubric.ts에
// gender 파라미터를 추가해 여성 루브릭 힌트를 넣었음 — 회의록 "여성 루브릭 <케빈> → AI 계산
// 로직에 반영 <에린>" 항목으로 SSOT(src/lib/tagging-rubric.ts)에 동일 반영. 여자 옵션은 아직
// UploadForm에서 닫혀있지만(FEMALE_OPEN=false), 루브릭 티켓 열리면 라우트는 바로 준비됨.
import { createClient } from "@supabase/supabase-js";
import { scoringPrompt, normalizeMoodVector, validateTag } from "@/lib/tagging-rubric";
import { photoUrl } from "@/lib/photos";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const UPLOAD_PREFIX = "uploads/";
const UPLOAD_DAILY_LIMIT = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MEDIA = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function authUser(req: Request): Promise<{ id: string } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data } = await createClient(url, anon).auth.getUser(token);
  return data.user ? { id: data.user.id } : null;
}

async function fetchImage(storagePath: string): Promise<{ b64: string; mediaType: string }> {
  const res = await fetch(photoUrl(storagePath));
  if (!res.ok) throw new Error(`이미지 조회 실패: ${res.status}`);
  const mediaType = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!ACCEPTED_MEDIA.has(mediaType)) throw new Error(`지원하지 않는 이미지 형식: ${mediaType || "unknown"}`);
  const len = Number(res.headers.get("content-length") ?? 0);
  if (len && len > MAX_BYTES) throw new Error("이미지 용량 초과(최대 5MB)");
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_BYTES) throw new Error("이미지 용량 초과(최대 5MB)");
  return { b64: Buffer.from(buf).toString("base64"), mediaType };
}

async function scoreWithClaude(
  b64: string,
  mediaType: string,
  gender: "male" | "female" | null
): Promise<Record<string, unknown>> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("서버에 ANTHROPIC_API_KEY 미설정");
  // gender: "male"|"female"(업로드 화면 값) → "m"|"w"(rubric.ts 힌트 계약) 매핑.
  const genderHint = gender === "male" ? "m" : gender === "female" ? "w" : undefined;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
            { type: "text", text: scoringPrompt(undefined, genderHint) },
          ],
        },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });
  if (!res.ok) {
    console.error(`[photos/tag] Anthropic ${res.status}: ${(await res.text()).slice(0, 300)}`);
    throw new Error("AI 채점 실패");
  }
  const j = (await res.json()) as { content?: { text?: string }[] };
  const text = j?.content?.[0]?.text ?? "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) {
    console.error(`[photos/tag] JSON 파싱 실패: ${text.slice(0, 200)}`);
    throw new Error("AI 응답 파싱 실패");
  }
  return JSON.parse(m[0]);
}

export async function POST(req: Request) {
  const svcUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svcKey = process.env.SUPABASE_SERVICE_KEY;
  if (!svcUrl || !svcKey) return Response.json({ error: "서버 설정 누락" }, { status: 500 });

  const user = await authUser(req);
  if (!user) return Response.json({ error: "로그인이 필요해" }, { status: 401 });

  let body: {
    storage_path?: string;
    aspect_ratio?: number;
    gender?: string;
    photo_type?: string;
    user_description?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }
  const storagePath = (body.storage_path ?? "").trim();
  if (!storagePath.startsWith(UPLOAD_PREFIX) || storagePath.includes("..")) {
    return Response.json({ error: `storage_path는 ${UPLOAD_PREFIX} 하위 경로여야 함` }, { status: 400 });
  }
  const gender = body.gender === "male" || body.gender === "female" ? body.gender : null;
  const photoType = body.photo_type === "real" || body.photo_type === "ai" ? body.photo_type : null;
  const aspectRatio = typeof body.aspect_ratio === "number" && body.aspect_ratio > 0 ? body.aspect_ratio : null;
  // 작성자 코멘트 — 채점 프롬프트엔 절대 넣지 않는다(자기신고를 AI 채점처럼 오인시키면 안 됨).
  const userDescription = typeof body.user_description === "string" ? body.user_description.trim().slice(0, 500) : null;

  const sb = createClient(svcUrl, svcKey);

  // rate limit — 유저당 하루(UTC 00:00 기준) UPLOAD_DAILY_LIMIT장
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  const { count, error: countErr } = await sb
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("uploaded_by", user.id)
    .gte("created_at", since.toISOString());
  if (countErr) return Response.json({ error: "요청 처리 실패" }, { status: 500 });
  if ((count ?? 0) >= UPLOAD_DAILY_LIMIT) {
    return Response.json({ error: `하루 업로드 한도(${UPLOAD_DAILY_LIMIT}장)를 초과했어` }, { status: 429 });
  }

  let scored: Record<string, unknown>;
  try {
    const { b64, mediaType } = await fetchImage(storagePath);
    scored = await scoreWithClaude(b64, mediaType, gender);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }

  let moodVector: Record<string, number>;
  try {
    moodVector = normalizeMoodVector((scored.mood_vector as Record<string, number>) ?? {});
  } catch (e) {
    return Response.json({ error: `채점 결과 처리 실패: ${(e as Error).message}` }, { status: 422 });
  }

  const rec = {
    image_url: storagePath,
    mood_vector: moodVector,
    situations: (scored.situations as string[]) ?? [],
    seasons: (scored.seasons as string[]) ?? [],
    body_spec: (scored.body_spec as { height: string; build: string }) ?? { height: "", build: "regular" },
    caption_item: (scored.caption_item as string) ?? "",
    caption_why: (scored.caption_why as string) ?? "",
    caption_how: (scored.caption_how as string) ?? "",
    // 유저 업로드는 콜드스타트 상위 노출 가중치(rank.ts prominence)를 타면 안 됨 — AI 판단 무시하고 false 고정.
    is_flagship: false,
    confidence: typeof scored.confidence === "number" ? scored.confidence : null,
    aspect_ratio: aspectRatio,
    gender,
    photo_type: photoType,
    user_description: userDescription,
    source: "upload",
    uploaded_by: user.id,
  };

  const violations = validateTag({ ...rec, file: storagePath });
  if (violations.length) {
    return Response.json({ error: "태깅 계약 위반", violations }, { status: 422 });
  }

  const { data, error } = await sb.from("photos").insert(rec).select("*").single();
  if (error) {
    console.error(`[photos/tag] insert 실패: ${error.message}`);
    return Response.json({ error: "저장 실패" }, { status: 500 });
  }
  return Response.json({ photo: data });
}
