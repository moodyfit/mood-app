/**
 * MOODFIT 무드 사진 배치 생성 (GENERATION.md).
 * 스택: fal.ai · fal-ai/flux/schnell (기본) · 896x1152(4:5). 인증: env FAL_KEY (.env, 하드코딩 금지).
 *
 * 사용:
 *   npx tsx generate.ts test [--dry]                 §1 감성 테스트 5장 → images/_test/
 *   npx tsx generate.ts batch <axis> <count> [--dry] 특정 축 count장 (번호 이어서)
 *   npx tsx generate.ts batch-all <perAxis> [--dry]  6축 각 perAxis장
 *   --dry : fal 호출 없이 프롬프트/파일명/예상비용만 출력 (키 불필요)
 *   --dev : 모델을 fal-ai/flux/dev 로 (품질 재테스트용)
 */
import { fal } from "@fal-ai/client";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPrompt, TEST_AXES, ALL_AXES } from "./prompts.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES = path.join(ROOT, "images");
const TEST_DIR = path.join(IMAGES, "_test");
const LOG = path.join(IMAGES, "gen_log.json");

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const MODEL = args.includes("--dev") ? "fal-ai/flux/dev" : "fal-ai/flux/schnell";
const SIZE = { width: 896, height: 1152 };
const COST_PER_IMG = MODEL.endsWith("schnell") ? 0.003 : 0.025; // USD 대략치(미리보기용)

// 최소 .env 로더 (dotenv 무의존)
async function loadEnv() {
  for (const p of [path.join(ROOT, ".env"), path.join(__dirname, ".env")]) {
    try {
      const txt = await fs.readFile(p, "utf8");
      for (const line of txt.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {
      /* no .env */
    }
  }
}

async function nextNumber(axis: string): Promise<number> {
  let max = 0;
  try {
    for (const f of await fs.readdir(IMAGES)) {
      const m = f.match(new RegExp(`^${axis}-(\\d{3})\\.png$`));
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  } catch {
    /* dir may not exist */
  }
  return max + 1;
}

async function appendLog(entry: Record<string, unknown>) {
  let arr: unknown[] = [];
  try {
    arr = JSON.parse(await fs.readFile(LOG, "utf8"));
  } catch {
    /* new log */
  }
  arr.push(entry);
  await fs.writeFile(LOG, JSON.stringify(arr, null, 2));
}

async function genAndSave(prompt: string, outPath: string, meta: Record<string, unknown>) {
  const name = path.basename(outPath);
  if (DRY) {
    console.log(`[dry] ${name}\n      ${prompt}\n`);
    return;
  }
  const res: any = await fal.subscribe(MODEL, {
    input: {
      prompt,
      image_size: SIZE,
      num_images: 1,
      num_inference_steps: MODEL.endsWith("schnell") ? 4 : 28,
      enable_safety_checker: true,
    },
  });
  const url = res?.data?.images?.[0]?.url;
  if (!url) throw new Error(`no image url for ${name}`);
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buf);
  await appendLog({ file: path.relative(ROOT, outPath), prompt, model: MODEL, ...meta });
  console.log(`saved ${name}`);
}

async function runTest() {
  await fs.mkdir(TEST_DIR, { recursive: true });
  const jobs = TEST_AXES.map((axis) => {
    const { prompt, meta } = buildPrompt(axis, 0);
    return { prompt, meta, out: path.join(TEST_DIR, `${axis}-test.png`) };
  });
  console.log(`§1 감성 테스트 ${jobs.length}장 · ${MODEL} · 예상 $${(jobs.length * COST_PER_IMG).toFixed(3)}\n`);
  for (const j of jobs) await genAndSave(j.prompt, j.out, j.meta);
}

async function runBatch(axis: string, count: number) {
  const start = await nextNumber(axis);
  console.log(`batch ${axis} ${count}장 (${axis}-${String(start).padStart(3, "0")}~) · ${MODEL} · 예상 $${(count * COST_PER_IMG).toFixed(3)}\n`);
  for (let k = 0; k < count; k++) {
    const num = String(start + k).padStart(3, "0");
    const { prompt, meta } = buildPrompt(axis, start + k - 1);
    await genAndSave(prompt, path.join(IMAGES, `${axis}-${num}.png`), meta);
  }
}

async function main() {
  await loadEnv();
  const [cmd, a, b] = args.filter((x) => !x.startsWith("--"));

  const total =
    cmd === "test" ? TEST_AXES.length : cmd === "batch" ? Number(b || 0) : cmd === "batch-all" ? ALL_AXES.length * Number(a || 0) : 0;

  if (!DRY) {
    if (!process.env.FAL_KEY) {
      console.error("FAL_KEY 미설정 — scripts/.env 또는 프로젝트 .env 에 FAL_KEY=... 필요.\n(--dry 로 프롬프트/비용만 미리보기 가능)");
      process.exit(1);
    }
    fal.config({ credentials: process.env.FAL_KEY });
    console.log(`※ 실제 생성 · ${MODEL} · ${total}장 · 예상 $${(total * COST_PER_IMG).toFixed(3)} (승인된 계획인지 확인)\n`);
  }

  if (cmd === "test") await runTest();
  else if (cmd === "batch" && a) await runBatch(a, Number(b || 5));
  else if (cmd === "batch-all" && a) {
    for (const axis of ALL_AXES) await runBatch(axis, Number(a));
  } else {
    console.log("usage: test | batch <axis> <count> | batch-all <perAxis>  [--dry] [--dev]");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
