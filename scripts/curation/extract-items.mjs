/**
 * photos.caption_item → 옷 단위 아이템 CSV (FEAT-015 Step 1). 소피가 `정리 표현`·`제외` 를 채워 확정한다.
 * 읽기 전용(anon). 실행: node scripts/curation/extract-items.mjs > scripts/curation/items.csv
 */
import { readFileSync } from "node:fs";

for (const f of [".env.local", ".env"]) {
  try {
    for (const l of readFileSync(f, "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch { /* none */ }
}
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL, KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL || !KEY) { console.error("NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 필요"); process.exit(1); }

// 옷 종류 단어 → 카테고리. 긴 단어를 먼저 본다(셔츠자켓 → 아우터, 셔츠 → 상의)
const KINDS = [
  ["셔츠자켓", "아우터"], ["필드자켓", "아우터"], ["워크자켓", "아우터"], ["자켓", "아우터"], ["재킷", "아우터"],
  ["코트", "아우터"], ["블레이저", "아우터"], ["가디건", "아우터"], ["카디건", "아우터"], ["조끼", "아우터"],
  ["후드티", "상의"], ["후드", "상의"], ["후디", "상의"], ["티셔츠", "상의"], ["셔츠", "상의"], ["니트", "상의"],
  ["터틀넥", "상의"], ["맨투맨", "상의"], ["스웨트", "상의"], ["톱", "상의"], ["이너", "상의"], ["티", "상의"],
  ["슬랙스", "하의"], ["청바지", "하의"], ["팬츠", "하의"], ["스커트", "하의"], ["치노", "하의"], ["카고", "하의"], ["데님", "하의"],
  ["부츠", "신발"], ["워커", "신발"], ["로퍼", "신발"], ["스니커", "신발"], ["슈즈", "신발"],
  ["볼캡", "모자"], ["버킷햇", "모자"], ["캡", "모자"], ["크로스백", "가방"], ["백", "가방"],
];
const TAIL = /\s*(으로|로)?\s*(신었어|입었어|매치했어|맞췄어|마무리했어|완성했어|멨어|맸어|썼어|눌러썼어|세팅했어|걸치고|매치하고|매치|까지|깔끔하게).*$/;

const res = await fetch(`${URL}/rest/v1/photos?select=image_url,gender,caption_item&order=image_url`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
const photos = await res.json();

const q = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const out = [["사진", "성별", "원문 절", "추출 표현", "카테고리", "검토", "정리 표현", "제외"]];
for (const p of photos) {
  const slug = p.image_url.split("/").pop().replace(/\.\w+$/, "");
  for (const clause of (p.caption_item ?? "").split(/,|에 |이랑 |랑 |하고 |입고 |쓰고 /)) {
    const item = clause.trim().replace(TAIL, "").trim();
    const kinds = KINDS.filter(([k]) => item.includes(k));
    if (!kinds.length) continue;
    // 한 표현에 옷이 둘 이상이거나 색이 다른 절을 가리키면 사람이 봐야 한다
    const review = [];
    if (/같은 톤|같은 색|톤온톤|세트업|올블랙/.test(clause)) review.push("색 참조");
    if (/걸치고/.test(clause)) review.push("두 벌");
    out.push([slug, p.gender ?? "", clause.trim(), item, kinds[0][1], review.join("·"), "", ""]);
  }
}
console.log("﻿" + out.map((r) => r.map(q).join(",")).join("\n"));
console.error(`사진 ${photos.length}장 · 아이템 ${out.length - 1}행 · 고유 표현 ${new Set(out.slice(1).map((r) => r[3])).size}개 · 검토 표시 ${out.filter((r) => r[5]).length}행`);
