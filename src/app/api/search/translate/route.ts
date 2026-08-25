// FEAT-005 — GET /api/search/translate?q=검색어
// 자연어 검색어를 Claude로 6축 무드에 매핑. src/lib/tagging-rubric.ts(케빈의 사진 태깅 SSOT,
// 원래 tagging/rubric.ts였으나 .vercelignore가 tagging/를 빌드 제외해서 이 파일이 src/lib로 이동시킴)를
// 그대로 재사용해서 "사진이 채점되는 언어"와 "검색어가 해석되는 언어"를 일치시킨다.
// 키 없음/실패/타임아웃 → resolveMoods() 폴백(실패 없는 검색 원칙 유지).
import { AXES, AXIS_RUBRIC, CONTRACT, normalizeMoodVector } from "@/lib/tagging-rubric";
import { resolveMoods } from "@/lib/moods";

export const dynamic = "force-dynamic";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

function translationPrompt(query: string): string {
  const rub = AXES.map((a) => `- ${a}: ${AXIS_RUBRIC[a]}`).join("\n");
  return [
    "너는 무드핏(한국 남성복 취향 앱)의 검색어 해석 담당이다. 아래 6축 루브릭으로 사용자의 자연어 검색어가 어떤 무드에 해당하는지 판단한다.",
    "",
    "[6축 루브릭]",
    rub,
    "",
    `[mood_vector 계약] 유의미한 축만 포함. 주축(최고값) ≥ ${CONTRACT.primaryMin}. ${CONTRACT.dropBelow} 미만은 버림. 최대 ${CONTRACT.maxAxes}축. 합 = 1.0. 혼합이면 분포로(예 {"classic":0.6,"street":0.4}).`,
    `검색어: "${query}"`,
    "",
    '출력: 오직 JSON 1개 객체(코드펜스·설명 금지): {"mood_vector":{...}}',
  ].join("\n");
}

async function translateWithClaude(query: string): Promise<Record<string, number> | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 256,
        messages: [{ role: "user", content: translationPrompt(query) }],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { content?: { text?: string }[] };
    const text = j?.content?.[0]?.text ?? "";
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = JSON.parse(m[0]) as { mood_vector?: Record<string, number> };
    return normalizeMoodVector(parsed.mood_vector ?? {});
  } catch {
    return null; // 타임아웃/네트워크/파싱 실패 — 전부 폴백으로
  }
}

/** 가중치 벡터 → rankPhotos()가 바로 쓰는 내림차순 MoodKey[] */
function vectorToMoodKeys(vector: Record<string, number>): string[] {
  return Object.entries(vector)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  if (!query) return Response.json({ error: "검색어 필요" }, { status: 400 });

  const aiVector = await translateWithClaude(query);
  if (aiVector) {
    return Response.json({ moodKeys: vectorToMoodKeys(aiVector), source: "ai" });
  }

  return Response.json({ moodKeys: resolveMoods(query), source: "fallback" });
}
