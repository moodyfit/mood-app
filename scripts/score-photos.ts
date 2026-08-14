/**
 * 신규(또는 재)사진 자동 채점 — 이미지 → tagging/{base}.json (루브릭·계약 준수).
 * 비전: Claude Messages API(ANTHROPIC_API_KEY). 모델 override: ANTHROPIC_MODEL(기본 claude-sonnet-5).
 * 루브릭·검증은 tagging/rubric.ts 단일 소스에서.
 *
 * 사용:
 *   npx tsx scripts/score-photos.ts images/post/clean-016.jpg [more.jpg ...]
 *   npx tsx scripts/score-photos.ts images/post            # 폴더 내 *.jpg 중 태깅 없는 것만
 *   --force  : 이미 tagging/{base}.json 있어도 재채점
 * 채점 후 반드시 validate-tags.ts 통과 → apply-photos.ts 로 DB 반영.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AXES, scoringPrompt, normalizeMoodVector, validateTag } from "../tagging/rubric.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TAG = path.join(ROOT, "tagging");
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const inputs = args.filter((a) => !a.startsWith("--"));

async function loadEnv() {
  for (const p of [path.join(ROOT, ".env.local"), path.join(ROOT, ".env")]) {
    try {
      for (const l of (await fs.readFile(p, "utf8")).split("\n")) {
        const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch { /* none */ }
  }
}

// 입력 인자 → 채점할 jpg 경로 목록
async function resolveTargets(): Promise<string[]> {
  const out: string[] = [];
  for (const inp of inputs) {
    const abs = path.isAbsolute(inp) ? inp : path.join(ROOT, inp);
    const st = await fs.stat(abs).catch(() => null);
    if (st?.isDirectory()) {
      for (const f of await fs.readdir(abs)) if (f.endsWith(".jpg")) out.push(path.join(abs, f));
    } else if (st?.isFile()) out.push(abs);
    else console.error(`건너뜀(없음): ${inp}`);
  }
  return out;
}

async function scoreOne(imgPath: string): Promise<{ base: string; violations: string[]; conf: number } | null> {
  const base = path.basename(imgPath).replace(/\.jpg$/i, "");
  const outJson = path.join(TAG, `${base}.json`);
  if (!FORCE) { try { await fs.access(outJson); console.log(`skip(이미 있음): ${base}`); return null; } catch { /* score */ } }

  const b64 = (await fs.readFile(imgPath)).toString("base64");
  const axisHint = AXES.find((a) => base.startsWith(a));
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL, max_tokens: 1024,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } },
        { type: "text", text: scoringPrompt(axisHint) },
      ] }],
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 200)}`);
  const j: any = await res.json();
  const text: string = j?.content?.[0]?.text ?? "";
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error(`JSON 파싱 실패: ${text.slice(0, 120)}`);
  const o = JSON.parse(m[0]);
  o.mood_vector = normalizeMoodVector(o.mood_vector);
  if (!o.body_spec) o.body_spec = { height: "180", build: "slim" };
  const rec = {
    file: `${base}.jpg`,
    mood_vector: o.mood_vector,
    situations: o.situations ?? [],
    seasons: o.seasons ?? [],
    body_spec: o.body_spec,
    caption_item: o.caption_item ?? "",
    caption_why: o.caption_why ?? "",
    caption_how: o.caption_how ?? "",
    is_flagship: !!o.is_flagship,
    flagship_reason: o.flagship_reason ?? "",
    confidence: o.confidence ?? 0.8,
  };
  const violations = validateTag(rec);
  await fs.writeFile(outJson, JSON.stringify(rec, null, 2));
  return { base, violations, conf: rec.confidence };
}

async function run() {
  await loadEnv();
  if (!process.env.ANTHROPIC_API_KEY) { console.error("ANTHROPIC_API_KEY 필요 (.env.local 에 추가)"); process.exit(1); }
  const targets = await resolveTargets();
  if (!targets.length) { console.log("채점 대상 없음. 사용: score-photos.ts <img.jpg|dir> [--force]"); return; }
  console.log(`채점 ${targets.length}장 · ${MODEL}`);
  let done = 0, bad = 0; const review: string[] = [];
  for (const t of targets) {
    try {
      const r = await scoreOne(t);
      if (!r) continue;
      done++;
      if (r.violations.length) { bad++; console.error(`⚠ ${r.base}: ${r.violations.join(" / ")}`); }
      else console.log(`✓ ${r.base} (conf ${r.conf})`);
      if (r.conf < 0.85) review.push(r.base);
    } catch (e) { console.error(`✗ ${path.basename(t)}: ${(e as Error).message}`); }
  }
  console.log(`\n완료: ${done}장 채점 · 계약위반 ${bad}장${bad ? "(수정 필요)" : ""}`);
  if (review.length) console.log(`사람 검수 권장(conf<0.85): ${review.join(", ")}`);
  console.log("다음: npx tsx scripts/validate-tags.ts  →  npx tsx scripts/apply-photos.ts");
}
run().catch((e) => { console.error(e); process.exit(1); });
