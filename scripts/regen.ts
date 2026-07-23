/**
 * 재생성 배치 #9 (동결 레시피 flux/dev + 표준 후처리). 7슬롯 최종 사양 하드코딩.
 * 레시피 변경이므로 태깅 승계 포기, 신규 태깅 예정. 파일명 덮어쓰기 + _regen9/ 격리(후처리용).
 */
import { fal } from "@fal-ai/client";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STYLE_ANCHOR, BODY_GUARD, NEGATIVE } from "./prompts.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES = path.join(ROOT, "images");
const REGEN = path.join(IMAGES, "_regen9");
const LOG = path.join(IMAGES, "gen_log.json");
const MODEL = "fal-ai/flux/dev";

const S = { "4:5": { w: 896, h: 1120 }, "3:4": { w: 864, h: 1152 }, "9:16": { w: 768, h: 1344 } } as const;

// [file, ratio, season, person, garment, background]
const SPECS: [string, keyof typeof S, string, string, string, string][] = [
  ["soft-010", "3:4", "summer",
    "east asian man in his late 20s, medium wavy hair, slim build, glancing to the side",
    "short-sleeve cream ribbed knit tee, beige linen wide trousers, minimal cream sneakers, warm soft tone, summer, unbranded",
    "cafe exterior"],
  ["amekaji-014", "3:4", "summer",
    "east asian man in his mid 20s, short textured hair, regular build, walking mid-stride looking away",
    "heavyweight ecru cotton henley tee, olive cotton work pants, brown leather work boots, vintage americana, summer, unbranded",
    "quiet alley"],
  ["amekaji-015", "4:5", "summer",
    "east asian man in his late 20s, permed hair, slim build, head turned to the side",
    "open beige linen shirt over white tee, stone beige chino, tan leather shoes, vintage summer, unbranded",
    "shopfront sidewalk"],
  ["clean-011", "4:5", "summer",
    "east asian man in his mid 20s, short neat hair, slim build, looking off to the side",
    "crisp white short-sleeve knit polo, charcoal tailored shorts, minimal leather loafers, clean minimal two-tone, summer, refined date look, unbranded",
    "residential street"],
  ["street-011", "4:5", "summer",
    "east asian man in his early 20s, buzz cut, regular build, walking, body angled away",
    "plain oversized heavyweight cotton tee with no print, wide light denim, plain cap, chunky sneakers, street, summer, absolutely no logos or graphics, unbranded",
    "narrow backstreet"],
  ["classic-008", "3:4", "spring",
    "east asian man in his late 20s, side-part hair, regular build, glancing to the side",
    "light blue oxford shirt with oatmeal knit sweater vest, charcoal tailored trousers, brown derby shoes, classic, spring, unbranded",
    "residential street"],
  ["classic-012", "9:16", "summer",
    "east asian man in his mid 20s, medium hair, slim build, looking away, relaxed",
    "fine navy knit polo shirt, grey tailored trousers, brown leather loafers, classic refined, summer, meeting-appropriate, unbranded",
    "cafe exterior"],
];

async function loadEnv() {
  for (const p of [path.join(ROOT, ".env"), path.join(__dirname, ".env")]) {
    try {
      const txt = await fs.readFile(p, "utf8");
      for (const line of txt.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch { /* none */ }
  }
}

async function appendLog(entry: Record<string, unknown>) {
  let arr: unknown[] = [];
  try { arr = JSON.parse(await fs.readFile(LOG, "utf8")); } catch { /* new */ }
  // 같은 파일 기존 로그 제거 후 추가(덮어쓰기 반영)
  arr = (arr as any[]).filter((e) => e.file !== entry.file);
  arr.push(entry);
  await fs.writeFile(LOG, JSON.stringify(arr, null, 2));
}

async function gen(spec: typeof SPECS[number]) {
  const [file, ratio, season, person, garment, bg] = spec;
  const size = S[ratio];
  const prompt =
    `${STYLE_ANCHOR}. ${person}, positioned off-center in the frame. wearing ${garment}. ` +
    `${bg} background, not a crosswalk. ${BODY_GUARD}. fictional person, not resembling any real celebrity.`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res: any = await fal.subscribe(MODEL, {
        input: { prompt, image_size: { width: size.w, height: size.h }, num_images: 1,
          num_inference_steps: 28, guidance_scale: 3.0, negative_prompt: NEGATIVE, enable_safety_checker: true },
      });
      const url = res?.data?.images?.[0]?.url;
      if (!url) throw new Error("no url");
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
      if (buf.length < 3000) throw new Error("too small");
      await fs.mkdir(REGEN, { recursive: true });
      await fs.writeFile(path.join(IMAGES, `${file}.png`), buf);
      await fs.writeFile(path.join(REGEN, `${file}.png`), buf);
      await appendLog({ file: `images/${file}.png`, prompt, model: MODEL, aspect_ratio: +(size.w / size.h).toFixed(3), size: ratio, axis: file.split("-")[0], season, regen9: true });
      console.log(`saved ${file} (${ratio}, ${season})`);
      return;
    } catch (e) {
      if (attempt < 2) await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
      else console.error(`FAILED ${file}: ${(e as Error).message}`);
    }
  }
}

async function main() {
  await loadEnv();
  if (!process.env.FAL_KEY) { console.error("FAL_KEY 없음"); process.exit(1); }
  fal.config({ credentials: process.env.FAL_KEY });
  console.log(`재생성 #9 · ${SPECS.length}장 · ${MODEL} · 예상 $${(SPECS.length * 0.025).toFixed(3)}\n`);
  for (const s of SPECS) await gen(s);
  console.log("\n재생성 완료. 후처리 필요.");
}
main().catch((e) => { console.error(e); process.exit(1); });
