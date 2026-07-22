/**
 * 앱 로컬 시드(moods.ts / products.ts)를 Supabase seed.sql 로 그대로 방출.
 * DB == 앱 데이터 보장. 실행: npx tsx gen-seed.ts  → ../supabase/seed.sql
 * (photos 는 태깅 파이프라인이 tagging/seed.sql 로 별도 관리)
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MOODS, ALL_MOOD_KEYS, QUERY_MAP } from "../src/lib/moods.ts";
import { productsFor, tierOf } from "../src/lib/products.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../supabase/seed.sql");

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const arr = (xs: string[]) => `array[${xs.map(q).join(",")}]`;

const out: string[] = [
  "-- MOODFIT 콘텐츠 시드 (자동 생성: scripts/gen-seed.ts) — 앱 로컬 시드와 동일",
  "-- 실행 순서: schema.sql → seed.sql → tagging/seed.sql(photos)",
  "-- 재실행 안전: 콘텐츠 테이블 초기화 후 삽입",
  "truncate table products, query_map, moods restart identity cascade;",
  "",
  "-- moods (Layer 1)",
];

ALL_MOOD_KEYS.forEach((key, i) => {
  const m = MOODS[key];
  out.push(
    `insert into moods (key, name, description, caption, image_url, gradient, sort_order) values (` +
      `${q(m.key)}, ${q(m.name)}, ${q(m.description)}, ${q(m.caption)}, ${q(m.imageUrl ?? "")}, ${q(m.gradient)}, ${i});`
  );
});

out.push("", "-- query_map (Layer 2)");
for (const qm of QUERY_MAP) {
  out.push(
    `insert into query_map (keyword, mood_keys) values (${q(qm.keyword)}, ${arr(qm.moodKeys)});`
  );
}

out.push("", "-- products (아이템 × 판매처 = 1행)");
for (const key of ALL_MOOD_KEYS) {
  for (const p of productsFor(key)) {
    for (const s of p.sources) {
      out.push(
        `insert into products (mood_key, name, category, price_tier, price, source, gradient) values (` +
          `${q(p.moodKey)}, ${q(p.name)}, ${q(p.category)}, ${q(tierOf(s.price))}, ${s.price}, ${q(s.name)}, ${q(p.gradient)});`
      );
    }
  }
}

await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, out.join("\n") + "\n");
console.log(`seed.sql 생성: ${path.relative(process.cwd(), OUT)}  (${out.length} lines)`);
