/**
 * 6단계 (B) 사진 레벨 상품 연결 — batch2 (나머지 flagship 17장) SQL 생성기.
 * 캡션(caption_item)에 실제로 보이는 아이템만 슬롯화 — 없는 아이템 지어내지 않음(clean-001 원칙).
 * 어필리에이트 = 공개 링크(무신사 통합검색 딥링크, q=아이템명), verified=false interim.
 * 완성가 = 슬롯별 최저가 합.
 *
 * 실행: npx tsx scripts/gen-batch2.ts > supabase/photo-products-batch2.sql
 */

type Src = { source: string; price: number };
type Item = { name: string; category: string; tier: "로우" | "미드" | "하이"; grad: string; sources: Src[] };
type PhotoSpec = { slug: string; mood: string; items: Item[] };

// 색 → 그라디언트(2색). 슬롯 방향은 index로 회전(150/30/210/300).
const G = {
  light: "#f2f0ea,#d9d4cc",
  beige: "#e6ddcb,#b8a888",
  black: "#3a3a3a,#141414",
  charcoal: "#4a4d55,#17181c",
  gray: "#8f8a82,#5a5650",
  navy: "#2a3550,#141b2e",
  brown: "#8a6b4a,#3d2f22",
  olive: "#6b6a3a,#3a3a1c",
  denim: "#3d5a80,#1d2d44",
} as const;
function grad(colors: string, i: number): string {
  const dir = [150, 30, 210, 300][i % 4];
  return `linear-gradient(${dir}deg,${colors})`;
}

const S = (source: string, price: number): Src => ({ source, price });

const SPECS: PhotoSpec[] = [
  { slug: "amekaji-002", mood: "amekaji", items: [
    { name: "인디고 데님 트러커 자켓", category: "아우터", tier: "미드", grad: G.denim, sources: [S("무신사 스탠다드", 59000), S("리", 69000)] },
    { name: "다크 그레이 크루넥 반팔 티", category: "상의", tier: "로우", grad: G.charcoal, sources: [S("무신사 스탠다드", 12900)] },
    { name: "미드워시 스트레이트 데님 팬츠", category: "하의", tier: "미드", grad: G.denim, sources: [S("무신사 스탠다드", 49000), S("리바이스", 79000)] },
    { name: "브라운 레더 워크부츠", category: "신발", tier: "하이", grad: G.brown, sources: [S("크림", 159000), S("닥터마틴", 189000)] },
  ]},
  { slug: "amekaji-013", mood: "amekaji", items: [
    { name: "셰르파 데님 자켓", category: "아우터", tier: "미드", grad: G.denim, sources: [S("무신사 스탠다드", 79000), S("칼하트", 129000)] },
    { name: "크림 케이블 니트", category: "상의", tier: "미드", grad: G.light, sources: [S("무신사 스탠다드", 49000)] },
    { name: "미드워시 스트레이트 데님 팬츠", category: "하의", tier: "미드", grad: G.denim, sources: [S("무신사 스탠다드", 49000), S("리바이스", 79000)] },
  ]},
  { slug: "amekaji-014", mood: "amekaji", items: [
    { name: "에크루 헨리넥 반팔 티", category: "상의", tier: "로우", grad: G.light, sources: [S("무신사 스탠다드", 19900)] },
    { name: "올리브 워크 팬츠", category: "하의", tier: "미드", grad: G.olive, sources: [S("무신사 스탠다드", 39900), S("칼하트", 89000)] },
    { name: "브라운 레더 워크부츠", category: "신발", tier: "하이", grad: G.brown, sources: [S("크림", 159000)] },
  ]},
  { slug: "cityboy-001", mood: "cityboy", items: [
    { name: "베이지 오버핏 오픈 셔츠", category: "아우터", tier: "로우", grad: G.beige, sources: [S("무신사 스탠다드", 29900), S("유니클로", 39900)] },
    { name: "화이트 크루넥 반팔 티", category: "상의", tier: "로우", grad: G.light, sources: [S("무신사 스탠다드", 9900)] },
    { name: "카키 와이드 치노 팬츠", category: "하의", tier: "로우", grad: G.beige, sources: [S("무신사 스탠다드", 34900)] },
  ]},
  { slug: "cityboy-008", mood: "cityboy", items: [
    { name: "네이비 코치 자켓", category: "아우터", tier: "미드", grad: G.navy, sources: [S("무신사 스탠다드", 59000)] },
    { name: "화이트 크루넥 반팔 티", category: "상의", tier: "로우", grad: G.light, sources: [S("무신사 스탠다드", 9900)] },
    { name: "브라운 와이드 슬랙스", category: "하의", tier: "로우", grad: G.brown, sources: [S("무신사 스탠다드", 34900)] },
    { name: "블랙 레더 토트백", category: "가방", tier: "미드", grad: G.black, sources: [S("29CM", 49000)] },
  ]},
  { slug: "cityboy-013", mood: "cityboy", items: [
    { name: "올리브 하프 셔츠", category: "아우터", tier: "로우", grad: G.olive, sources: [S("무신사 스탠다드", 32900)] },
    { name: "화이트 크루넥 반팔 티", category: "상의", tier: "로우", grad: G.light, sources: [S("무신사 스탠다드", 9900)] },
    { name: "블랙 와이드 슬랙스", category: "하의", tier: "로우", grad: G.black, sources: [S("무신사 스탠다드", 34900)] },
    { name: "블랙 레더 토트백", category: "가방", tier: "미드", grad: G.black, sources: [S("29CM", 49000)] },
  ]},
  { slug: "classic-001", mood: "classic", items: [
    { name: "차콜 울 오버코트", category: "아우터", tier: "하이", grad: G.charcoal, sources: [S("무신사 스탠다드", 159000), S("29CM", 189000)] },
    { name: "블랙 메리노 터틀넥", category: "상의", tier: "미드", grad: G.black, sources: [S("무신사 스탠다드", 39000), S("유니클로", 49900)] },
    { name: "차콜 울 슬랙스", category: "하의", tier: "미드", grad: G.charcoal, sources: [S("무신사 스탠다드", 49000)] },
  ]},
  { slug: "classic-012", mood: "classic", items: [
    { name: "네이비 니트 폴로", category: "상의", tier: "미드", grad: G.navy, sources: [S("무신사 스탠다드", 49000)] },
    { name: "그레이 울 슬랙스", category: "하의", tier: "미드", grad: G.gray, sources: [S("무신사 스탠다드", 49000)] },
    { name: "브라운 페니 로퍼", category: "신발", tier: "하이", grad: G.brown, sources: [S("29CM", 129000)] },
  ]},
  { slug: "classic-014", mood: "classic", items: [
    { name: "그레이 울 블레이저", category: "아우터", tier: "하이", grad: G.gray, sources: [S("무신사 스탠다드", 129000)] },
    { name: "블랙 메리노 터틀넥", category: "상의", tier: "미드", grad: G.black, sources: [S("무신사 스탠다드", 39000), S("유니클로", 49900)] },
    { name: "브라운 울 슬랙스", category: "하의", tier: "미드", grad: G.brown, sources: [S("무신사 스탠다드", 49000)] },
  ]},
  { slug: "clean-008", mood: "clean", items: [
    { name: "크림 카 코트", category: "아우터", tier: "하이", grad: G.light, sources: [S("무신사 스탠다드", 139000)] },
    { name: "오트밀 크루넥 니트", category: "상의", tier: "미드", grad: G.beige, sources: [S("무신사 스탠다드", 49000)] },
    { name: "블랙 슬랙스", category: "하의", tier: "로우", grad: G.black, sources: [S("무신사 스탠다드", 34900)] },
  ]},
  { slug: "clean-012", mood: "clean", items: [
    { name: "아이보리 크루넥 니트", category: "상의", tier: "미드", grad: G.light, sources: [S("무신사 스탠다드", 49000)] },
    { name: "차콜 슬랙스", category: "하의", tier: "로우", grad: G.charcoal, sources: [S("무신사 스탠다드", 34900)] },
    { name: "블랙 미니 크로스백", category: "가방", tier: "미드", grad: G.black, sources: [S("29CM", 59000)] },
  ]},
  { slug: "soft-002", mood: "soft", items: [
    { name: "크림 플리스 블루종", category: "아우터", tier: "미드", grad: G.light, sources: [S("무신사 스탠다드", 59000)] },
    { name: "베이지 치노 팬츠", category: "하의", tier: "로우", grad: G.beige, sources: [S("무신사 스탠다드", 29900), S("유니클로", 39900)] },
  ]},
  { slug: "soft-005", mood: "soft", items: [
    { name: "크림 가디건", category: "아우터", tier: "미드", grad: G.light, sources: [S("무신사 스탠다드", 49000)] },
    { name: "오트밀 니트 티", category: "상의", tier: "로우", grad: G.beige, sources: [S("무신사 스탠다드", 29900)] },
    { name: "카키 치노 팬츠", category: "하의", tier: "로우", grad: G.beige, sources: [S("무신사 스탠다드", 29900), S("유니클로", 39900)] },
  ]},
  { slug: "soft-010", mood: "soft", items: [
    { name: "크림 반팔 니트 티", category: "상의", tier: "로우", grad: G.light, sources: [S("무신사 스탠다드", 29900)] },
    { name: "베이지 린넨 와이드 팬츠", category: "하의", tier: "로우", grad: G.beige, sources: [S("무신사 스탠다드", 39900), S("유니클로", 39900)] },
  ]},
  { slug: "street-001", mood: "street", items: [
    { name: "블랙 오버핏 후디", category: "상의", tier: "미드", grad: G.black, sources: [S("무신사 스탠다드", 49000)] },
    { name: "올리브 카고 팬츠", category: "하의", tier: "로우", grad: G.olive, sources: [S("무신사 스탠다드", 39900)] },
    { name: "블랙 볼캡", category: "모자", tier: "로우", grad: G.black, sources: [S("무신사 스탠다드", 19900)] },
  ]},
  { slug: "street-010", mood: "street", items: [
    { name: "올리브 오버핏 후디", category: "상의", tier: "미드", grad: G.olive, sources: [S("무신사 스탠다드", 49000)] },
    { name: "브라운 카고 팬츠", category: "하의", tier: "로우", grad: G.brown, sources: [S("무신사 스탠다드", 39900)] },
  ]},
  { slug: "street-011", mood: "street", items: [
    { name: "화이트 오버핏 헤비코튼 티", category: "상의", tier: "로우", grad: G.light, sources: [S("무신사 스탠다드", 19900), S("유니클로", 19900)] },
    { name: "라이트워시 와이드 데님", category: "하의", tier: "미드", grad: G.denim, sources: [S("무신사 스탠다드", 49000)] },
  ]},
];

function esc(s: string): string {
  return s.replace(/'/g, "''");
}
function musinsaLink(name: string): string {
  return `https://www.musinsa.com/search/musinsa/integration?q=${encodeURIComponent(name)}`;
}

const out: string[] = [];
out.push("-- 6단계 (B) 사진 레벨 상품 연결 — batch2 (나머지 flagship 17장)");
out.push("-- 자동 생성: scripts/gen-batch2.ts. 어필리에이트=공개링크(무신사 통합검색), verified=false interim.");
out.push("-- products 스키마는 batch1 에서 정규화됨(재실행 안전, 사진별 멱등 삭제 후 삽입).");
out.push("");

for (const p of SPECS) {
  const jpg = `moods/${p.slug}.jpg`;
  let completion = 0;
  const lines: string[] = [];
  p.items.forEach((it, i) => {
    const link = musinsaLink(it.name);
    completion += Math.min(...it.sources.map((s) => s.price));
    for (const s of it.sources) {
      lines.push(
        `('${p.mood}','${jpg}','${esc(it.name)}','${it.category}','${it.tier}',${s.price},'${esc(s.source)}','${grad(it.grad, i)}','${link}',true,false)`
      );
    }
  });
  const won = (completion / 10000).toFixed(1).replace(/\.0$/, "");
  out.push(`-- ${p.slug} (${p.mood}) — ${p.items.length}슬롯 · 완성가 ≈ ${completion.toLocaleString()} → "${won}만"`);
  out.push(`delete from products where photo_image_url = '${jpg}';`);
  out.push(
    "insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values"
  );
  out.push(lines.join(",\n") + ";");
  out.push("");
}

process.stdout.write(out.join("\n"));
