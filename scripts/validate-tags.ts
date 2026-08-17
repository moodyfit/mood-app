/**
 * 태깅 계약 게이트 — tagging/*.json 이 mood_vector 계약·어휘·캡션 규약을 지키는지 검사.
 * 위반 있으면 exit 1 (DB 입고 전 필수 통과). 루브릭은 tagging/rubric.ts 단일 소스.
 * 사용:
 *   npx tsx scripts/validate-tags.ts               # tagging/{axis}-NNN.json 전부
 *   npx tsx scripts/validate-tags.ts clean-016      # 특정 파일만
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AXES, validateTag } from "../tagging/rubric.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TAG = path.join(ROOT, "tagging");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--")).map((s) => s.replace(/\.json$/, ""));

async function run() {
  let targets: string[] = [];
  if (only.length) targets = only;
  else for (const ax of AXES) for (let i = 1; i <= 15; i++) targets.push(`${ax}-${String(i).padStart(3, "0")}`);

  let ok = 0; const fails: string[] = [];
  for (const f of targets) {
    let o: any;
    try { o = JSON.parse(await fs.readFile(path.join(TAG, `${f}.json`), "utf8")); }
    catch { fails.push(`${f}: JSON 없음/파싱실패`); continue; }
    const v = validateTag(o);
    // 이미지 실제 존재 확인
    try { await fs.access(path.join(ROOT, "images", "post", `${f}.jpg`)); }
    catch { v.push("이미지 파일 없음(images/post)"); }
    if (v.length) fails.push(`${f}: ${v.join(" / ")}`);
    else ok++;
  }
  console.log(`검증: 통과 ${ok} · 실패 ${fails.length} / ${targets.length}`);
  for (const f of fails) console.error(`  ✗ ${f}`);
  if (fails.length) process.exit(1);
  console.log("계약 통과 ✓ — apply-photos.ts 로 DB 반영 가능.");
}
run().catch((e) => { console.error(e); process.exit(1); });
