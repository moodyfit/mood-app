// FEAT-011 — POST /api/photos/tag { image_url }
// 유저 업로드 사진(Storage 업로드는 소피 담당 화면 쪽)을 케빈의 scripts/score-photos.ts와
// 동일한 방식(Claude Vision + src/lib/tagging-rubric.ts SSOT)으로 자동 채점 → 계약 검증 →
// photos 테이블 upsert. 계약 위반 시 DB에 넣지 않고 에러 반환(나쁜 데이터 유입 방지, AC #3).
import { scoringPrompt, normalizeMoodVector, validateTag } from "@/lib/tagging-rubric";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`이미지 다운로드 실패: ${res.status}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf).toString("base64");
}

async function scoreWithClaude(imageB64: string): Promise<Record<string, unknown>> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("서버에 ANTHROPIC_API_KEY 미설정");
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
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageB64 } },
            // 업로드 사진은 축 힌트(파일명 접두사) 없음 — 사진에 보이는 대로만 채점.
            { type: "text", text: scoringPrompt() },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`AI 채점 실패: ${res.status} ${(await res.text()).slice(0, 200)}`);
  const j = (await res.json()) as { content?: { text?: string }[] };
  const text = j?.content?.[0]?.text ?? "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error(`AI 응답 파싱 실패: ${text.slice(0, 120)}`);
  return JSON.parse(m[0]);
}

export async function POST(req: Request) {
  let body: { image_url?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }
  const imageUrl = (body.image_url ?? "").trim();
  if (!imageUrl) return Response.json({ error: "image_url 필요" }, { status: 400 });

  const sb = getSupabaseAdmin();
  if (!sb) return Response.json({ error: "서버에 SUPABASE_SERVICE_KEY 미설정" }, { status: 500 });

  let scored: Record<string, unknown>;
  try {
    const b64 = await fetchImageAsBase64(imageUrl);
    scored = await scoreWithClaude(b64);
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
    mood_vector: moodVector,
    situations: (scored.situations as string[]) ?? [],
    seasons: (scored.seasons as string[]) ?? [],
    body_spec: (scored.body_spec as { height: string; build: string }) ?? { height: "", build: "regular" },
    caption_item: (scored.caption_item as string) ?? "",
    caption_why: (scored.caption_why as string) ?? "",
    caption_how: (scored.caption_how as string) ?? "",
    is_flagship: !!scored.is_flagship,
  };

  const violations = validateTag({ ...rec, file: imageUrl });
  if (violations.length) {
    return Response.json({ error: "태깅 계약 위반", violations }, { status: 422 });
  }

  // image_url 기준 upsert — apply-photos.ts와 동일 패턴(UPDATE 매칭 0건이면 INSERT).
  const upd = await sb.from("photos").update(rec, { count: "exact" }).eq("image_url", imageUrl);
  if (upd.error) return Response.json({ error: `DB 저장 실패: ${upd.error.message}` }, { status: 500 });

  if (!upd.count) {
    const ins = await sb.from("photos").insert({ image_url: imageUrl, ...rec }).select().single();
    if (ins.error) return Response.json({ error: `DB 저장 실패: ${ins.error.message}` }, { status: 500 });
    return Response.json({ photo: ins.data });
  }

  const { data } = await sb.from("photos").select("*").eq("image_url", imageUrl).single();
  return Response.json({ photo: data });
}
