/**
 * 90장 태깅 JSON → supabase/photos-seed.sql (최종 입고본).
 * 마이그레이션(caption_how·worn) + DELETE FROM photos + 90 INSERT. image_url=.jpg(후처리본).
 * seed_exclude 플래그분은 이미 재생성 신규 태깅으로 대체됨(0건) — 전량 입고.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const TAG = path.join(ROOT, "tagging");
const OUT = path.join(ROOT, "supabase", "photos-seed.sql");
const AXES = ["clean", "cityboy", "street", "amekaji", "classic", "soft"];

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const arr = (a: string[]) => `array[${a.map(q).join(",")}]`;

async function run() {
  // gen_log에서 파일별 실측 비율 매핑(마스터리 세로 리듬)
  const ratio: Record<string, number> = {};
  try {
    const log = JSON.parse(await fs.readFile(path.join(ROOT, "images", "gen_log_v2.json"), "utf8"));
    for (const e of log) {
      const base = String(e.file).replace(/.*\//, "").replace(/\.(jpg|png)$/i, "");
      if (typeof e.aspect_ratio === "number") ratio[base] = e.aspect_ratio;
    }
  } catch { /* 없으면 기본값 */ }

  const rows: string[] = [];
  let n = 0;
  let flag = 0;
  const excl: string[] = [];
  for (const ax of AXES) {
    for (let i = 1; i <= 15; i++) {
      const f = `${ax}-${String(i).padStart(3, "0")}`;
      const o = JSON.parse(await fs.readFile(path.join(TAG, `${f}.json`), "utf8"));
      if (o.seed_exclude) { excl.push(f); continue; }
      n++;
      if (o.is_flagship) flag++;
      const img = `moods/${f}.jpg`;
      const ar = ratio[f] ?? 0.8;
      rows.push(
        `insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (\n` +
        `  ${q(img)}, ${q(JSON.stringify(o.mood_vector))}::jsonb, ${arr(o.situations)}, ${arr(o.seasons)}, ${q(JSON.stringify(o.body_spec))}::jsonb,\n` +
        `  ${q(o.caption_item)}, ${q(o.caption_why)}, ${q(o.caption_how ?? "")}, ${o.is_flagship ? "true" : "false"}, ${ar}\n);`
      );
    }
  }
  const sql =
    `-- MOODFIT 최종 photos 입고본 (자동 생성: scripts/gen-seed9.ts) — 검수 승인 90장\n` +
    `-- 마이그레이션\n` +
    `alter table photos add column if not exists caption_how text;\n` +
    `alter table photos add column if not exists aspect_ratio real default 0.8;\n` +
    `alter table user_actions drop constraint if exists user_actions_action_check;\n` +
    `alter table user_actions add constraint user_actions_action_check\n` +
    `  check (action in ('view','save','search','scan_like','buy_out','worn','discover','new_feel'));\n\n` +
    `-- 옛 힉스필드 태깅 행 제거 후 신규 전량 대체\n` +
    `delete from photos;\n\n` +
    rows.join("\n\n") + "\n";
  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, sql);
  console.log(`photos-seed.sql 생성: INSERT ${n}행, flagship ${flag}건, seed_exclude(제외) ${excl.length}건 [${excl.join(",") || "-"}]`);
}
run().catch((e) => { console.error(e); process.exit(1); });
