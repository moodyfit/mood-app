// GENERATION.md §2 — 프롬프트 구조: [스타일 앵커] + [인물 변주] + [의상 블록] + [배경] + [구도]
// 스타일 앵커/의상 블록은 임의 변경 금지(§5). 변주 축만 조합한다.

// 품질 앵커(전 축 공통) — 색보정·배경은 축별로 뺐다(LOOK-BRIEF: 수렴 방지). 여기엔 '진짜 찍힌 사람' 결만.
export const STYLE_ANCHOR =
  "candid street style photograph shot on 35mm film, kodak portra 400, " +
  "visible film grain, subject caught mid-moment NOT posing, looking away from camera, " +
  "off-center composition, photorealistic, real person, " +
  "high-fashion editorial menswear lookbook, modern refined contemporary 2025 styling, elevated and sophisticated, " +
  "intentional uncluttered styling with one or two focal points";

// §2.1 Negative — flux/schnell 은 negative_prompt 미지원 → 핵심 회피는 positive에도 접어 넣음.
// (flux/dev 사용 시 negative_prompt로 전달)
export const NEGATIVE =
  "posing, looking at camera, centered composition, crosswalk, HDR, oversaturated, " +
  "smooth skin, studio quality, palm trees, bodybuilder, muscular flex, watermark, text, " +
  "brand logo, wordmark, nike swoosh, adidas stripes, identifiable graphic print, " +
  "bag, tote bag, crossbody bag, shoulder bag, backpack, handbag";

// 체험 원칙: "데깽은 최대로, 이유는 옷" — 몸이 주인공 금지. (face visible 제거 = 캔디드로 시선 밖 허용)
// 로고 무관용(§5): 식별 가능한 브랜드 로고·워드마크 금지, 무지 신발·의류.
// 비율·피지컬 상향(케빈): 키 크고 다리 길고 잘빠진 모델 비율 — 단 근육 과시 아님(옷이 주인공, 헌법).
export const BODY_GUARD =
  "full-length full-body shot from head to toe, the entire outfit clearly visible including the top layer, " +
  "any jacket or coat worn open to reveal the shirt or knit underneath, nothing cropped out of frame, " +
  "tall with long legs and lean well-proportioned model physique, " +
  "small head-to-body ratio, broad straight shoulders, good posture, natural build not bulky, no muscle flexing, " +
  "the clothing and styling are the focus, plain unbranded clothing and footwear, " +
  "no visible brand logos, no wordmarks, no graphic prints, no text";

// §2.3 의상 블록 (레거시 — buildPrompt는 AXIS_LOOK 사용. 호환 위해 유지)
export const AXIS_BLOCKS: Record<string, string> = {
  clean: "white/grey/black tones, crewneck knit, pressed slacks, minimal sneakers or loafers, no patterns",
  cityboy: "relaxed fit layering, open shirt over tee, wide chinos, tote bag, new balance style sneakers",
  street: "oversized hoodie or coach jacket, wide cargo or parachute pants, chunky sneakers, ball cap",
  amekaji: "denim jacket or military coat, straight raw denim, work boots or leather shoes, vintage texture",
  classic: "unstructured blazer or wool coat, turtleneck or oxford shirt, tailored trousers, derby shoes",
  soft: "warm-tone knit or cardigan, cream/beige palette, soft silhouette, clean sneakers",
};

// LOOK-BRIEF v1 반영 — 축별 [의상·팔레트·장소·조명·에너지]. 각 축이 색·장소·에너지에서 확 갈리게(수렴 방지).
interface AxisLook { clothes: string; palette: string; locations: string[]; light: string; energy: string }
// 케빈 레퍼런스(ref/) 무드보드 분석 반영 — 실제 요즘 코디/분위기 기준.
export const AXIS_LOOK: Record<string, AxisLook> = {
  clean: {
    clothes: "relaxed-neat minimal outfit, plain white or cream tee or fine-gauge knit or crisp button-up shirt, optional light overshirt or harrington jacket worn open, half-tucked top, pleated or straight wide trousers with a slight break or light-wash relaxed denim, white leather sneakers or minimal loafers, cream/ivory/beige/grey/navy neutrals, deliberate and trim, no bag",
    palette: "bright even natural daylight, low-contrast warm neutrals, clean and airy",
    locations: ["european stone building facade", "old-town plaster wall and doorway", "bright quiet european street"],
    light: "bright even natural daylight",
    energy: "effortless and quietly confident",
  },
  cityboy: {
    clothes: "laid-back Tokyo urban casual, roomy oversized crewneck sweatshirt or boxy tee or polo with an open overshirt or cardigan layered, light knit over a collar, wide pleated chinos or relaxed jeans with slight stacking, retro runner sneakers or loafers, heather grey/navy/olive/brown, soft comfortable volume, no bag",
    palette: "natural daytime light, earthy urban neutrals grey navy olive brown",
    locations: ["tokyo city sidewalk with storefronts", "cafe and signage streetscape", "brick city corner"],
    light: "candid natural daytime street-snap light",
    energy: "laid-back and unpretentious, everyday ease",
  },
  street: {
    clothes: "heavily oversized baggy streetwear, boxy oversized hoodie or long-sleeve or denim/work jacket, very wide carpenter or cargo pants with long puddling hems, cap or beanie worn low, chunky sneakers or work boots with visible socks, washed denim blue/olive/black/grey, volume is the point, no bag",
    palette: "gritty urban daylight, washed faded earth tones and dark neutrals, high contrast",
    locations: ["concrete wall and alley", "parking structure", "gritty urban backstreet"],
    light: "harsh daylight, gritty snapshot look",
    energy: "rugged and rebellious, effortless",
  },
  amekaji: {
    clothes: "rugged japanese americana workwear, denim chore jacket or olive M-65 field jacket worn open over a chambray or flannel shirt or plain tee, straight raw denim or khaki chino or cargo, shirt tucked with a belt, leather work boots or moc-toe shoes, indigo/olive/khaki/tan/ecru/brown, lived-in vintage, no bag",
    palette: "warm natural daylight, vintage military-and-workwear earth tones, heavy film grain",
    locations: ["japanese autumn tree-lined sidewalk with fallen leaves", "canal-side old street", "weathered storefront lane"],
    light: "warm natural daylight, nostalgic",
    energy: "rugged nostalgic, heritage warmth",
  },
  classic: {
    clothes: "sophisticated old-money tailoring, soft-structured blazer or sport coat or leather blouson worn open over a fine knit polo or unbuttoned shirt, pleated wide high-waisted dress trousers with a clean break, leather loafers or derbies, cream/ivory/beige/navy/charcoal/brown, rolled sleeves and half-tuck, refined drape",
    palette: "warm golden-hour or soft daylight, sophisticated neutral tones, elegant",
    locations: ["historic european stone architecture with columns", "upscale old-town facade", "quiet elegant boulevard"],
    light: "warm golden-hour light",
    energy: "mature sprezzatura, old-money confidence",
  },
  soft: {
    clothes: "elevated soft knitwear, minimal zip or button cardigan or cashmere-blend crewneck layered over a tee, wide tapered trousers, leather loafers or clean sneakers, cream/oatmeal/grey tonal layering, refined cozy, no bag",
    palette: "soft warm daylight, cream oatmeal and pastel neutrals, gentle and airy",
    locations: ["sunny quiet neighborhood", "warm-lit shop window", "golden-hour lane"],
    light: "soft warm light, cozy",
    energy: "relaxed and gentle",
  },
};

// §2.2 인물 변주 (같은 인물 반복 금지). athletic 과장 금지 → slim/regular만.
const HAIR = ["short textured hair", "medium wavy hair", "buzz cut", "permed hair"];
const BUILD = ["tall lean model physique", "tall slim build with long legs"];

// 시선/동작 변주 — 측면 응시 3 : 걷는 중 2 분산(정면 응시·정자세 금지)
const GAZE = [
  "glancing to the side, looking away from camera", // 측면
  "walking mid-stride, looking down the street", // 걷는 중
  "head turned to the side, eyes off-camera", // 측면
  "caught walking past, body angled away", // 걷는 중
  "looking off to the side, unposed", // 측면
];

// §2.4 배경 변주 — 횡단보도 금지, 서울 거리 결로 분산
const BACKGROUND = [
  "quiet alley",
  "cafe exterior",
  "residential street",
  "narrow backstreet",
  "shopfront sidewalk",
  "riverside path",
];

// §2.5 계절 레이어 (의상 블록에 계절 반영)
const SEASON: Record<string, string> = {
  spring: "spring layering",
  summer: "summer, short sleeves or linen",
  fall: "fall layering",
  winter: "winter, with coat or knit",
};

// 축별 유효 계절 (커버리지 매트릭스 §3: 각 축 계절 2종 이상)
export const AXIS_SEASONS: Record<string, string[]> = {
  clean: ["spring", "summer", "fall"],
  cityboy: ["spring", "fall"],
  street: ["spring", "fall", "winter"],
  amekaji: ["spring", "fall", "winter"],
  classic: ["fall", "winter", "spring"],
  soft: ["spring", "fall", "winter"],
};

// 승인된 배치 계절 배분(축당 15) — clean·cityboy 겨울+3, classic 여름 리넨 1. 겨울24(27%)·여름19(21%)
export const SEASON_PLAN: Record<string, string[]> = {
  clean:   ["summer","summer","summer","summer","summer","summer","winter","winter","winter","spring","spring","spring","fall","fall","fall"],
  cityboy: ["summer","summer","summer","summer","summer","summer","winter","winter","winter","spring","spring","spring","fall","fall","fall"],
  street:  ["winter","winter","winter","winter","summer","summer","summer","spring","spring","spring","spring","fall","fall","fall","fall"],
  amekaji: ["winter","winter","winter","winter","winter","spring","spring","spring","spring","spring","fall","fall","fall","fall","fall"],
  classic: ["winter","winter","winter","winter","winter","summer","fall","fall","fall","fall","fall","spring","spring","spring","spring"],
  soft:    ["winter","winter","winter","winter","summer","summer","summer","spring","spring","spring","spring","fall","fall","fall","fall"],
};

// 비율 계획(축당 15): 4:5 ×9 / 3:4 ×4 / 9:16 ×2 → 90장 54/24/12
export const RATIO_PLAN: string[] = [
  "4:5","4:5","3:4","4:5","9:16","4:5","4:5","3:4","4:5","3:4","4:5","9:16","4:5","3:4","4:5",
];

// 유채(색 악센트) 인덱스 — 축당 4장(전체 24, 27%). 나머지는 웜 뮤티드
const COLOR_ACCENT_IDX = new Set([2, 7, 11, 14]);

export interface PromptMeta {
  axis: string;
  season: string;
  background: string;
  hair: string;
  build: string;
}

/**
 * 커버리지 분산: 인덱스로 계절×배경×인물을 서로 다른 주기로 돌려 동일 조합 반복을 피한다.
 * (계절 |S|, 배경 6, 헤어 4, 체형 2, 무드 3 → 최소공배수까지 중복 없음)
 */
export function buildPrompt(axis: string, i: number): { prompt: string; meta: PromptMeta } {
  const plan = SEASON_PLAN[axis];
  const season = plan ? plan[i % plan.length] : (AXIS_SEASONS[axis] ?? ["spring", "fall"])[i % 2];
  const look = AXIS_LOOK[axis] ?? AXIS_LOOK.clean;
  const location = look.locations[i % look.locations.length];
  const hair = HAIR[i % HAIR.length];
  const build = BUILD[i % BUILD.length];
  const gaze = GAZE[i % GAZE.length];
  const accent = COLOR_ACCENT_IDX.has(i % 15) ? ", one muted color-accent piece" : "";

  const person = `tall handsome east asian male fashion model in his mid-20s, ${build}, ${hair}, sharp refined features, ${gaze}`;
  const clothes = `${look.clothes}, ${SEASON[season]}${accent}`;
  // 축별 팔레트/장소/조명/에너지를 프롬프트에 직접 주입 → 축 간 시각 대비 확보(수렴 방지).
  const prompt =
    `${STYLE_ANCHOR}, ${look.palette}. ${person}, positioned off-center, ${look.energy}. ` +
    `wearing ${clothes}. ${location} background, not a crosswalk. ${look.light}. ` +
    `${BODY_GUARD}. fictional person, not resembling any real celebrity.`;

  return { prompt, meta: { axis, season, background: location, hair, build } };
}

// §1 감성 호환 테스트 축 (문서 명시: 5개, classic 제외)
export const TEST_AXES = ["clean", "cityboy", "street", "amekaji", "soft"];
export const ALL_AXES = ["clean", "cityboy", "street", "amekaji", "classic", "soft"];
