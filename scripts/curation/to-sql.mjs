/**
 * items.csv + candidates.csv → insert.sql (FEAT-015 Step 3). 사진의 옷마다 products 1행(photo_image_url 연결).
 * 후보가 정해진 줄만 넣는다. 같은 사진의 기존 연결 행은 먼저 지워 재실행해도 중복되지 않는다.
 * 실행: node scripts/curation/to-sql.mjs [--test]   (--test: BEGIN … ROLLBACK 으로 감싸 시험 실행용)
 */
import { readFileSync, writeFileSync } from "node:fs";

const DIR = "scripts/curation";
const TEST = process.argv.includes("--test");

for (const f of [".env.local", ".env"]) {
  try {
    for (const l of readFileSync(f, "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* none */ }
}

// 따옴표 안 쉼표를 지키는 최소 CSV 파서
function parse(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}
const table = (file) => {
  const [head, ...body] = parse(readFileSync(`${DIR}/${file}`, "utf8").replace(/^﻿/, ""));
  return body.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
};

const items = table("items.csv").filter((r) => !r["제외"]);
const picks = new Map(
  table("candidates.csv").filter((r) => r["상품번호"]).map((r) => [`${r["표현"]}|${r["사진 성별"]}`, r]),
);

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL, KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const photos = await (await fetch(`${URL}/rest/v1/photos?select=image_url,mood_vector`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
})).json();
const bySlug = new Map(photos.map((p) => [p.image_url.split("/").pop().replace(/\.\w+$/, ""), p]));
const dominant = (v) => Object.entries(v ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

const lit = (s) => (s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`);
const values = [], covered = new Set(), seen = new Set();
let missing = 0;
for (const it of items) {
  const name = it["정리 표현"] || it["추출 표현"];
  const g = it["성별"] === "female" ? "여" : "남";
  const pick = picks.get(`${name}|${g}`);
  const photo = bySlug.get(it["사진"]);
  if (!pick || !photo) { missing++; continue; }
  const key = `${photo.image_url}|${name}`;
  if (seen.has(key)) continue; // 한 사진 캡션에 같은 옷이 두 번 나오면 1행
  seen.add(key);
  covered.add(photo.image_url);
  values.push(`(${[
    lit(dominant(photo.mood_vector)), lit(photo.image_url), lit(name), lit(it["카테고리"]),
    Number(pick["판매가"]), lit("무신사"), lit(pick["URL"]), "true",
  ].join(", ")})`);
}

const paths = [...covered].map(lit).join(", ");
const sql = [
  `-- FEAT-015 큐레이션 상품 ${values.length}행 · 사진 ${covered.size}장 · 생성 ${new Date().toISOString().slice(0, 10)}`,
  TEST ? "begin;" : "",
  `delete from products where photo_image_url in (${paths});`,
  "insert into products (mood_key, photo_image_url, name, category, price, source, affiliate_url, verified) values",
  values.join(",\n") + ";",
  `select count(*) as inserted, count(*) filter (where affiliate_url like '%/search%') as search_urls from products where photo_image_url in (${paths});`,
  TEST ? "rollback;" : "",
].filter(Boolean).join("\n");
writeFileSync(`${DIR}/${TEST ? "insert.test.sql" : "insert.sql"}`, sql + "\n");
console.error(`행 ${values.length} · 사진 ${covered.size}장 · 후보 없는 옷 ${missing}개${TEST ? " · BEGIN/ROLLBACK" : ""}`);
