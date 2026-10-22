/**
 * items.csv(확정) → queue.csv: 큐레이션할 표현 × 사진 성별 목록 (FEAT-015 Step 2 입력).
 * 제외 행을 빼고 `정리 표현 || 추출 표현` 기준으로 묶는다. 사진 수 많은 순, 표현 30개씩 묶음 번호.
 * 실행: node scripts/curation/build-queue.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const DIR = "scripts/curation";
const BATCH = 30;

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

const [head, ...body] = parse(readFileSync(`${DIR}/items.csv`, "utf8").replace(/^﻿/, ""));
const col = Object.fromEntries(head.map((h, i) => [h, i]));

const byName = new Map();
for (const r of body) {
  if (r[col["제외"]]) continue;
  const name = r[col["정리 표현"]] || r[col["추출 표현"]];
  const e = byName.get(name) ?? { name, category: r[col["카테고리"]], photos: new Set(), byGender: { male: new Set(), female: new Set() } };
  e.photos.add(r[col["사진"]]);
  e.byGender[r[col["성별"]]]?.add(r[col["사진"]]);
  byName.set(name, e);
}

// 묶음 번호는 표현 단위(사진 수 순)로 매기고, 그 안에서 사진 성별마다 한 줄 — 남성 줄은 gf=M(남+공용), 여성 줄은 gf=F(여+공용)
const list = [...byName.values()].sort((a, b) => b.photos.size - a.photos.size || a.name.localeCompare(b.name));
const q = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const lines = [["묶음", "표현", "사진 성별", "카테고리", "사진 수", "검색 필터"]];
list.forEach((e, i) => {
  for (const [g, label, gf] of [["male", "남", "gf=M"], ["female", "여", "gf=F"]]) {
    const n = e.byGender[g].size;
    if (n) lines.push([String(Math.floor(i / BATCH) + 1), e.name, label, e.category, String(n), gf]);
  }
});
writeFileSync(`${DIR}/queue.csv`, "﻿" + lines.map((l) => l.map(q).join(",")).join("\n") + "\n");
console.error(`고유 표현 ${list.length}개 · 표현×성별 ${lines.length - 1}줄 · 묶음 ${Math.ceil(list.length / BATCH)}개`);
