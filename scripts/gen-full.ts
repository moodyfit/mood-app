/**
 * 전량 생성 파이프라인 — 6축×15 = 90장. txt2img → img2img 실사화 패스 → jpg → images/post/.
 * 승인 룩: 레퍼 기반 프롬프트(raw) + i2i 실사화. 무거운 후처리 없음. 재실행 시 기존 파일 skip.
 * 실행: npx tsx scripts/gen-full.ts   (백그라운드 권장)
 */
import { fal } from "@fal-ai/client";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { buildPrompt, ALL_AXES, RATIO_PLAN, NEGATIVE } from "./prompts.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POST = path.join(ROOT, "images", "post");
const LOG = path.join(ROOT, "images", "gen_log_v2.json");
const MODEL = "fal-ai/flux/dev";
const I2I = "fal-ai/flux/dev/image-to-image";

const SIZES: Record<string, { width: number; height: number }> = {
  "4:5": { width: 896, height: 1120 },
  "3:4": { width: 864, height: 1152 },
  "9:16": { width: 768, height: 1344 },
};
function sizeFor(label: string) {
  const s = SIZES[label] ?? SIZES["4:5"];
  return { ...s, ratio: +(s.width / s.height).toFixed(3), label };
}

async function loadEnv() {
  for (const p of [path.join(ROOT, ".env.local"), path.join(ROOT, ".env")]) {
    try {
      const t = await fs.readFile(p, "utf8");
      for (const l of t.split("\n")) {
        const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch { /* none */ }
  }
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
  for (let a = 0; a < 3; a++) {
    try { return await fn(); }
    catch (e) { console.log(`  retry ${label} (${a + 1}): ${(e as Error).message}`); await new Promise((r) => setTimeout(r, 3000 * (a + 1))); }
  }
  return null;
}

// 큐(fal.subscribe)가 계정 stale-lock으로 403 → 동기 엔드포인트(fal.run)로 우회. 충전 반영됨.
async function falRun(model: string, input: Record<string, unknown>): Promise<any> {
  const r = await fetch(`https://fal.run/${model}`, {
    method: "POST",
    headers: { Authorization: `Key ${process.env.FAL_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

async function txt2img(prompt: string, w: number, h: number): Promise<Buffer | null> {
  const res: any = await falRun(MODEL, { prompt, image_size: { width: w, height: h }, num_images: 1, num_inference_steps: 28, guidance_scale: 3.0, negative_prompt: NEGATIVE, enable_safety_checker: true });
  const url = res?.images?.[0]?.url;
  return url ? Buffer.from(await (await fetch(url)).arrayBuffer()) : null;
}

async function realismPass(init: Buffer, prompt: string): Promise<Buffer | null> {
  const dataUri = `data:image/png;base64,${init.toString("base64")}`;
  const realism = prompt + ", hyper-realistic candid photograph, realistic skin texture and fabric, true-to-life, indistinguishable from a real photo";
  const res: any = await falRun(I2I, { image_url: dataUri, prompt: realism, strength: 0.5, num_inference_steps: 30, guidance_scale: 3.0, negative_prompt: NEGATIVE, enable_safety_checker: true });
  const url = res?.images?.[0]?.url;
  return url ? Buffer.from(await (await fetch(url)).arrayBuffer()) : null;
}

async function main() {
  await loadEnv();
  if (!process.env.FAL_KEY) { console.error("FAL_KEY 없음"); process.exit(1); }
  fal.config({ credentials: process.env.FAL_KEY });
  await fs.mkdir(POST, { recursive: true });

  let log: unknown[] = [];
  try { log = JSON.parse(await fs.readFile(LOG, "utf8")); } catch { /* new */ }

  let done = 0, skip = 0, fail = 0;
  for (const axis of ALL_AXES) {
    for (let k = 1; k <= 15; k++) {
      const num = String(k).padStart(3, "0");
      const out = path.join(POST, `${axis}-${num}.jpg`);
      try { await fs.access(out); skip++; continue; } catch { /* generate */ }

      const idx = k - 1;
      const size = sizeFor(RATIO_PLAN[idx % RATIO_PLAN.length]);
      const { prompt, meta } = buildPrompt(axis, idx);

      const t = await withRetry(() => txt2img(prompt, size.width, size.height), `${axis}-${num} txt`);
      if (!t) { console.log(`FAIL txt ${axis}-${num}`); fail++; continue; }
      const r = (await withRetry(() => realismPass(t, prompt), `${axis}-${num} i2i`)) ?? t; // i2i 실패 시 txt 사용
      const jpg = await sharp(r).jpeg({ quality: 90 }).toBuffer();
      await fs.writeFile(out, jpg);
      log.push({ file: `images/post/${axis}-${num}.jpg`, aspect_ratio: size.ratio, size: size.label, axis, season: meta.season, hair: meta.hair, build: meta.build, background: meta.background, colorway: meta.colorway });
      await fs.writeFile(LOG, JSON.stringify(log, null, 2));
      done++;
      console.log(`✓ ${axis}-${num} (${size.label}) · done ${done} skip ${skip} fail ${fail}`);
    }
  }
  console.log(`\n완료: 생성 ${done} · skip ${skip} · fail ${fail} · 로그 ${path.relative(ROOT, LOG)}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
