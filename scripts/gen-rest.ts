/**
 * 6단계(B) 확장 — 비-flagship 72장 상품 연결 batch3 생성기.
 * 캡션(caption_item, "A에 B·C" 패턴)을 파싱해 슬롯 상품으로 변환 → 26.2만 더미 교체.
 * 어필리에이트=공개링크(무신사 통합검색), verified=false. 완성가=슬롯 가격 합.
 * flagship 18장은 batch1/2에서 큐레이션됨 → 여기선 제외(중복 방지).
 *
 * 실행: npx tsx scripts/gen-rest.ts > supabase/photo-products-batch3.sql
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadEnv() {
  for (const p of [path.join(ROOT, ".env.local"), path.join(ROOT, ".env")]) {
    try {
      const txt = await fs.readFile(p, "utf8");
      for (const line of txt.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    } catch { /* none */ }
  }
}

const G: Record<string, string> = {
  light: "#f2f0ea,#d9d4cc", beige: "#e6ddcb,#b8a888", black: "#3a3a3a,#141414",
  charcoal: "#4a4d55,#17181c", gray: "#8f8a82,#5a5650", navy: "#2a3550,#141b2e",
  brown: "#8a6b4a,#3d2f22", olive: "#6b6a3a,#3a3a1c", denim: "#3d5a80,#1d2d44",
  wine: "#5a2331,#2e1119", green: "#3e5a3a,#1c2e1a",
};
// 색어 → 그라디언트 키 (긴 것 먼저 매칭)
const COLOR: [RegExp, string][] = [
  [/차콜/, "charcoal"], [/그레이|회색/, "gray"], [/네이비/, "navy"], [/인디고/, "denim"],
  [/데님|블루|하늘/, "denim"], [/블랙|먹|검정/, "black"], [/카키|올리브/, "olive"],
  [/브라운|카멜|탄|초코/, "brown"], [/버건디|와인|레드/, "wine"], [/그린|카키그린/, "green"],
  [/베이지|샌드|모카/, "beige"], [/화이트|아이보리|크림|오트밀|에크루|오프화이트/, "light"],
];
function gradFor(name: string, i: number): string {
  const dir = [150, 30, 210, 300, 90][i % 5];
  const hit = COLOR.find(([re]) => re.test(name));
  return `linear-gradient(${dir}deg,${G[hit ? hit[1] : "gray"]})`;
}

// 카테고리 추론 — 신발>가방>모자>아우터>상의(탑명사)>하의>상의(기본).
// 상의 명사를 하의보다 먼저: "데님 셔츠"가 '데님' 때문에 하의로 새는 것 방지.
function categoryOf(name: string): string {
  if (/부츠|로퍼|스니커|더비|구두|첼시|샌들|슈즈/.test(name)) return "신발";
  if (/백팩|토트|크로스|숄더|가방|백$|백 /.test(name)) return "가방";
  if (/캡|비니|버킷|햇|모자/.test(name)) return "모자";
  if (/코트|블레이저|자켓|재킷|트러커|블루종|가디건|카디건|플리스|점퍼|패딩|아노락|셔츠자켓|코치/.test(name)) return "아우터";
  // 탑 명사(셔츠/티/니트/후디/폴로/터틀넥…) — '데님/블루' 색어가 있어도 상의로 확정
  if (/셔츠|티셔츠|반팔|긴팔|니트|후디|후드|맨투맨|스웨트|폴로|터틀넥|헨리넥|나시|피케|탑|카라/.test(name)) return "상의";
  if (/슬랙스|팬츠|진|데님|카고|치노|조거|숏|반바지|와이드|트라우저|버뮤다|스트레이트/.test(name)) return "하의";
  return "상의";
}

// 가격(원). 카테고리·키워드 기반 대표가 1개.
function priceOf(cat: string, name: string): number {
  if (cat === "신발") return /부츠|로퍼|더비|구두|첼시/.test(name) ? 139000 : /스니커|슈즈/.test(name) ? 89000 : 79000;
  if (cat === "아우터") return /코트/.test(name) ? 149000 : /블레이저/.test(name) ? 129000 : /패딩/.test(name) ? 159000 : 59000;
  if (cat === "하의") return /진|데님/.test(name) ? 49000 : 34900;
  if (cat === "가방") return 49000;
  if (cat === "모자") return 19900;
  // 상의
  return /니트|맨투맨|스웨트|후디|후드|폴로|터틀넥|가디건|카디건/.test(name) ? 45000 : 22000;
}
function tierOf(price: number): "로우" | "미드" | "하이" {
  return price <= 39900 ? "로우" : price <= 99000 ? "미드" : "하이";
}

// 캡션 → 아이템명 배열. "에 "(위치격)··(그리고)·, 로 분해. "에크루" 오분해 방지 위해 \s+ 요구.
function parseItems(caption: string): string[] {
  return caption
    .split(/에\s+|·|、|,\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);
}

function esc(s: string) { return s.replace(/'/g, "''"); }
function link(name: string) { return `https://www.musinsa.com/search/musinsa/integration?q=${encodeURIComponent(name)}`; }

async function run() {
  await loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) { console.error("SUPABASE env 필요"); process.exit(1); }
  const res = await fetch(
    `${url}/rest/v1/photos?select=image_url,mood_vector,caption_item,is_flagship&order=image_url.asc`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  const all = (await res.json()) as Array<{ image_url: string; mood_vector: Record<string, number>; caption_item: string; is_flagship: boolean }>;
  const nf = all.filter((p) => !p.is_flagship && p.caption_item);

  const out: string[] = [];
  out.push("-- 6단계(B) 확장 — 비-flagship 72장 상품 연결 (자동 생성: scripts/gen-rest.ts)");
  out.push("-- 캡션 파싱 기반. 공개링크(무신사 통합검색), verified=false, 완성가=슬롯 합. flagship 제외.");
  out.push("-- products 스키마는 batch1에서 정규화됨. 사진별 멱등 삭제 후 삽입.");
  out.push("");

  let rowCount = 0;
  for (const p of nf) {
    const slug = p.image_url.split("/").pop()!.replace(/\.\w+$/, "");
    const jpg = `moods/${slug}.jpg`;
    const mood = Object.entries(p.mood_vector ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "clean";
    const names = parseItems(p.caption_item);
    if (names.length === 0) continue;
    let completion = 0;
    const rows = names.map((name, i) => {
      const cat = categoryOf(name);
      const price = priceOf(cat, name);
      completion += price;
      return `('${mood}','${jpg}','${esc(name)}','${cat}','${tierOf(price)}',${price},'무신사 스탠다드','${gradFor(name, i)}','${link(name)}',true,false)`;
    });
    rowCount += rows.length;
    const won = (completion / 10000).toFixed(1).replace(/\.0$/, "");
    out.push(`-- ${slug} (${mood}) — ${names.length}슬롯 · "${p.caption_item}" · 완성가 ≈ ${completion.toLocaleString()} → "${won}만"`);
    out.push(`delete from products where photo_image_url = '${jpg}';`);
    out.push("insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values");
    out.push(rows.join(",\n") + ";");
    out.push("");
  }
  process.stderr.write(`비-flagship ${nf.length}장 · 총 ${rowCount}행 생성\n`);
  process.stdout.write(out.join("\n"));
}
run().catch((e) => { console.error(e); process.exit(1); });
