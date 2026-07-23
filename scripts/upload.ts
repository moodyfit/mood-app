/**
 * Storage 업로드 — images/post/*.jpg (승인 90장)만 moods 버킷에 업로드.
 * 옛 힉스필드 원본(images/_prebatch_backup)·재생성 격리본은 대상 아님(사고 방지).
 * 인증: SUPABASE_URL + SUPABASE_SERVICE_KEY (env, .env). 파일명 = seed image_url 경로 일치.
 * 실행: npx tsx scripts/upload.ts   (mood-app 루트에서 — @supabase/supabase-js는 앱 의존성)
 */
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POST = path.join(ROOT, "images", "post");
const AXES = ["clean", "cityboy", "street", "amekaji", "classic", "soft"];

async function loadEnv() {
  for (const p of [path.join(ROOT, ".env"), path.join(ROOT, ".env.local"), path.join(__dirname, ".env")]) {
    try {
      const txt = await fs.readFile(p, "utf8");
      for (const line of txt.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch { /* none */ }
  }
}

async function run() {
  await loadEnv();
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) { console.error("SUPABASE_URL / SUPABASE_SERVICE_KEY 필요(.env)"); process.exit(1); }
  const sb = createClient(url, key);

  // 업로드 대상 = 승인 90장(축×15)만 명시 화이트리스트
  const files: string[] = [];
  for (const ax of AXES) for (let i = 1; i <= 15; i++) files.push(`${ax}-${String(i).padStart(3, "0")}.jpg`);

  let ok = 0, fail = 0;
  for (const f of files) {
    try {
      const buf = await fs.readFile(path.join(POST, f));
      const { error } = await sb.storage.from("moods").upload(`moods/${f}`, buf, {
        contentType: "image/jpeg", upsert: true,
      });
      if (error) throw error;
      ok++;
    } catch (e) {
      fail++; console.error(`✗ ${f}: ${(e as Error).message}`);
    }
  }
  console.log(`업로드 완료: ${ok}/${files.length} (실패 ${fail}). 대상=승인 90장만(_prebatch_backup 제외).`);
}
run().catch((e) => { console.error(e); process.exit(1); });
