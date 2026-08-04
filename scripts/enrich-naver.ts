/**
 * 네이버 쇼핑 API로 상품 실데이터 연결 — 각 아이템명을 실검색 → 실가격·실링크·판매몰을 products에 기록.
 * 큐레이션한 이름(스타일 서술)은 유지하고, price/affiliate_url/source/verified만 실데이터로 교체.
 * (photo,name) 그룹 내 여러 소스행에는 서로 다른 판매몰을 배정 → 실제 가격비교 유지.
 *
 * 필요 env: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, (NEXT_PUBLIC_)SUPABASE_URL, SUPABASE_SERVICE_KEY
 * 실행: npx tsx scripts/enrich-naver.ts            (전체)
 *      npx tsx scripts/enrich-naver.ts --dry       (미리보기, 쓰기 안 함)
 *      npx tsx scripts/enrich-naver.ts --flagship  (flagship 사진 상품만)
 */
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry");
const FLAGSHIP_ONLY = process.argv.includes("--flagship");

async function loadEnv() {
  for (const p of [path.join(ROOT, ".env.local"), path.join(ROOT, ".env")]) {
    try {
      const txt = await fs.readFile(p, "utf8");
      for (const line of txt.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch {
      /* none */
    }
  }
}

interface NaverItem {
  title: string;
  link: string;
  image: string;
  lprice: string;
  mallName: string;
}
const stripTags = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&[a-z]+;/g, " ").trim();

async function naverSearch(query: string, id: string, secret: string): Promise<NaverItem[]> {
  const url = `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=3&sort=sim`;
  const res = await fetch(url, { headers: { "X-Naver-Client-Id": id, "X-Naver-Client-Secret": secret } });
  if (!res.ok) return [];
  const data = (await res.json()) as { items?: NaverItem[] };
  return data.items ?? [];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function run() {
  await loadEnv();
  const NID = process.env.NAVER_CLIENT_ID;
  const NSECRET = process.env.NAVER_CLIENT_SECRET;
  const URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SK = process.env.SUPABASE_SERVICE_KEY;
  if (!NID || !NSECRET) { console.error("NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 필요(.env.local)"); process.exit(1); }
  if (!URL || !SK) { console.error("SUPABASE_URL / SUPABASE_SERVICE_KEY 필요"); process.exit(1); }
  const sb = createClient(URL, SK);

  // 대상 상품행
  let q = sb.from("products").select("id,name,category,photo_image_url").not("photo_image_url", "is", null);
  if (FLAGSHIP_ONLY) {
    const { data: flags } = await sb.from("photos").select("image_url").eq("is_flagship", true);
    const urls = (flags ?? []).map((f) => f.image_url as string);
    q = q.in("photo_image_url", urls);
  }
  const { data: rows, error } = await q;
  if (error || !rows) { console.error("products 조회 실패:", error?.message); process.exit(1); }
  console.log(`대상 상품행: ${rows.length}${FLAGSHIP_ONLY ? " (flagship)" : ""}${DRY ? " · DRY RUN" : ""}`);

  // 이름별 네이버 결과 캐시(동일 이름 1회만 검색)
  const names = [...new Set(rows.map((r) => r.name as string))];
  const cache = new Map<string, NaverItem[]>();
  let matched = 0;
  for (const name of names) {
    const items = await naverSearch(name, NID, NSECRET);
    cache.set(name, items);
    if (items.length > 0) matched++;
    process.stderr.write(`  검색 ${cache.size}/${names.length} · "${name}" → ${items.length}건\r`);
    await sleep(120); // 레이트리밋 여유
  }
  process.stderr.write("\n");
  console.log(`이름 매칭: ${matched}/${names.length}`);

  // (photo,name) 그룹 내 소스행에 서로 다른 판매몰 배정
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const k = `${r.photo_image_url}|${r.name}`;
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(r);
  }

  let updated = 0, skipped = 0, sample: string[] = [];
  for (const group of groups.values()) {
    const items = cache.get(group[0].name as string) ?? [];
    if (items.length === 0) { skipped += group.length; continue; }
    for (let i = 0; i < group.length; i++) {
      const it = items[i % items.length];
      const price = parseInt(it.lprice, 10);
      if (!price || !it.link) { skipped++; continue; }
      const patch = { price, affiliate_url: it.link, source: stripTags(it.mallName) || "네이버쇼핑", verified: true };
      if (sample.length < 6) sample.push(`${group[i].name} → ${patch.source} ${price.toLocaleString()}원`);
      if (!DRY) {
        const { error: ue } = await sb.from("products").update(patch).eq("id", group[i].id);
        if (ue) { skipped++; continue; }
      }
      updated++;
    }
  }
  console.log(`\n${DRY ? "[DRY] 갱신 예정" : "갱신 완료"}: ${updated}행 · 스킵(미매칭/무가격): ${skipped}행`);
  console.log("샘플:");
  for (const s of sample) console.log("  " + s);
  if (DRY) console.log("\n실제 반영하려면 --dry 빼고 다시 실행.");
}
run().catch((e) => { console.error(e); process.exit(1); });
