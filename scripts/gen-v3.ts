/**
 * v3 생성 — 남녀 × 6축 × count. 파일명 {g}-{axis}-NNN.jpg (예: m-clean-001, w-soft-010).
 * IG 캔디드·한국 배경·다양화 프롬프트(prompts.ts v3). fal 동기 엔드포인트 우회. 기존 파일 skip.
 * 사용: npx tsx scripts/gen-v3.ts <count>   (파일럿=1 → 12장, 풀=10 → 120장)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { buildPrompt, ALL_AXES, GENDERS, RATIO_PLAN, NEGATIVE } from "./prompts.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POST = path.join(ROOT, "images", "post");
const LOG = path.join(ROOT, "images", "gen_log_v3.json");
const MODEL = "fal-ai/flux/dev";
const I2I = "fal-ai/flux/dev/image-to-image";
const COUNT = Math.max(1, Math.min(10, Number(process.argv[2] || 1)));
// 선택 필터: count 뒤 인자로 "m-street w-cityboy" 처럼 {gender}-{axis} 지정 시 그것만 생성.
const ONLY = process.argv.slice(3).filter((a) => !a.startsWith("--"));

const SIZES: Record<string, { width: number; height: number }> = {
  "4:5": { width: 896, height: 1120 }, "3:4": { width: 864, height: 1152 }, "9:16": { width: 768, height: 1344 },
};
const sizeFor = (l: string) => { const s = SIZES[l] ?? SIZES["4:5"]; return { ...s, ratio: +(s.width / s.height).toFixed(3), label: l }; };

async function loadEnv() {
  for (const p of [path.join(ROOT, ".env.local"), path.join(ROOT, ".env")]) {
    try { for (const l of (await fs.readFile(p, "utf8")).split("\n")) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, ""); } } catch { /* none */ }
  }
}
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
  for (let a = 0; a < 3; a++) { try { return await fn(); } catch (e) { console.log(`  retry ${label} (${a + 1}): ${(e as Error).message}`); await new Promise((r) => setTimeout(r, 3000 * (a + 1))); } }
  return null;
}
async function falRun(model: string, input: Record<string, unknown>): Promise<any> {
  const r = await fetch(`https://fal.run/${model}`, { method: "POST", headers: { Authorization: `Key ${process.env.FAL_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(input) });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}
async function txt2img(prompt: string, w: number, h: number): Promise<Buffer | null> {
  const res: any = await falRun(MODEL, { prompt, image_size: { width: w, height: h }, num_images: 1, num_inference_steps: 28, guidance_scale: 3.0, negative_prompt: NEGATIVE, enable_safety_checker: true });
  const url = res?.images?.[0]?.url; return url ? Buffer.from(await (await fetch(url)).arrayBuffer()) : null;
}
async function realismPass(init: Buffer, prompt: string): Promise<Buffer | null> {
  const dataUri = `data:image/png;base64,${init.toString("base64")}`;
  const realism = prompt + ", hyper-realistic candid smartphone photo, realistic skin and fabric, true-to-life, looks like a real instagram photo";
  const res: any = await falRun(I2I, { image_url: dataUri, prompt: realism, strength: 0.5, num_inference_steps: 30, guidance_scale: 3.0, negative_prompt: NEGATIVE, enable_safety_checker: true });
  const url = res?.images?.[0]?.url; return url ? Buffer.from(await (await fetch(url)).arrayBuffer()) : null;
}

async function main() {
  await loadEnv();
  if (!process.env.FAL_KEY) { console.error("FAL_KEY 없음"); process.exit(1); }
  await fs.mkdir(POST, { recursive: true });
  let log: unknown[] = []; try { log = JSON.parse(await fs.readFile(LOG, "utf8")); } catch { /* new */ }
  const total = GENDERS.length * ALL_AXES.length * COUNT;
  console.log(`v3 생성: ${total}장 (남녀 × ${ALL_AXES.length}축 × ${COUNT})`);
  let done = 0, skip = 0, fail = 0;
  for (const gender of GENDERS) for (const axis of ALL_AXES) {
    if (ONLY.length && !ONLY.includes(`${gender}-${axis}`)) continue;
    for (let k = 1; k <= COUNT; k++) {
    const num = String(k).padStart(3, "0");
    const base = `${gender}-${axis}-${num}`;
    const out = path.join(POST, `${base}.jpg`);
    try { await fs.access(out); skip++; continue; } catch { /* gen */ }
    const idx = k - 1;
    const size = sizeFor(RATIO_PLAN[idx % RATIO_PLAN.length]);
    let { prompt, meta } = buildPrompt(gender, axis, idx);
    // STRICT_BG=1: 글자·크롭 재발 리롤용 — 플레인 벽·무텍스트·전신 강제.
    if (process.env.STRICT_BG) prompt += " Behind the subject is a plain clean solid wall with absolutely no signs, no storefront, no awning, no text or lettering anywhere in the whole image; the clothing is completely plain and blank with no print or lettering; full body shown from head all the way to the feet with both shoes visible.";
    const t = await withRetry(() => txt2img(prompt, size.width, size.height), `${base} txt`);
    if (!t) { console.log(`FAIL txt ${base}`); fail++; continue; }
    const r = (await withRetry(() => realismPass(t, prompt), `${base} i2i`)) ?? t;
    await fs.writeFile(out, await sharp(r).jpeg({ quality: 90 }).toBuffer());
    log.push({ file: `images/post/${base}.jpg`, aspect_ratio: size.ratio, size: size.label, ...meta });
    await fs.writeFile(LOG, JSON.stringify(log, null, 2));
    done++; console.log(`✓ ${base} (${size.label}) · done ${done} skip ${skip} fail ${fail}`);
    }
  }
  console.log(`\n완료: 생성 ${done} · skip ${skip} · fail ${fail} · 로그 ${path.relative(ROOT, LOG)}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
