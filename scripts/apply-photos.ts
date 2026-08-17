/**
 * 재태깅 결과를 photos 테이블에 in-place UPDATE (image_url 기준). delete 없음 → id·FK 보존.
 * 소스: tagging/{axis}-NNN.json (재태깅) + images/gen_log_v2.json(aspect_ratio).
 * 인증: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_KEY. 실행: npx tsx scripts/apply-photos.ts
 */
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TAG = path.join(ROOT, "tagging");
const AXES = ["clean", "cityboy", "street", "amekaji", "classic", "soft"];

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

async function run() {
  await loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) { console.error("SUPABASE URL/SERVICE_KEY 필요"); process.exit(1); }
  const sb = createClient(url, key);

  // aspect_ratio 매핑
  const ratio: Record<string, number> = {};
  try {
    for (const e of JSON.parse(await fs.readFile(path.join(ROOT, "images", "gen_log_v2.json"), "utf8"))) {
      const b = String(e.file).replace(/.*\//, "").replace(/\.(jpg|png)$/i, "");
      if (typeof e.aspect_ratio === "number") ratio[b] = e.aspect_ratio;
    }
  } catch { /* 기본 0.8 */ }

  // tagging/ 동적 순회: {axis}-{숫자}.json 전부(신규 추가분 자동 포함). --only 로 특정 파일만.
  const only = process.argv.slice(2).filter((a) => !a.startsWith("--")).map((s) => s.replace(/\.json$/, ""));
  const axRe = new RegExp(`^(${AXES.join("|")})-\\d+$`);
  const files = only.length
    ? only
    : (await fs.readdir(TAG)).filter((n) => n.endsWith(".json")).map((n) => n.replace(/\.json$/, "")).filter((b) => axRe.test(b)).sort();

  let ok = 0, fail = 0;
  {
    for (const f of files) {
      const o = JSON.parse(await fs.readFile(path.join(TAG, `${f}.json`), "utf8"));
      const img = `moods/${f}.jpg`;
      const fields = {
        mood_vector: o.mood_vector,
        situations: o.situations,
        seasons: o.seasons,
        body_spec: o.body_spec,
        caption_item: o.caption_item,
        caption_why: o.caption_why,
        caption_how: o.caption_how ?? "",
        is_flagship: !!o.is_flagship,
        aspect_ratio: ratio[f] ?? 0.8,
      };
      // 기존 행 UPDATE(id·FK 보존). 매칭 0 = 신규 → INSERT (upsert).
      const upd = await sb.from("photos").update(fields, { count: "exact" }).eq("image_url", img);
      if (upd.error) { fail++; console.error(`✗ ${img}: ${upd.error.message}`); continue; }
      if (upd.count) { ok++; continue; }
      const ins = await sb.from("photos").insert({ image_url: img, ...fields });
      if (ins.error) { fail++; console.error(`✗ ${img} INSERT: ${ins.error.message}`); }
      else { ok++; console.log(`+ 신규 INSERT: ${img}`); }
    }
  }
  console.log(`upsert 완료: ${ok}/${files.length} (실패 ${fail})`);
}
run().catch((e) => { console.error(e); process.exit(1); });
