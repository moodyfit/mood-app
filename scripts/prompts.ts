// GENERATION.md §2 — 프롬프트 구조: [스타일 앵커] + [인물 변주] + [의상 블록] + [배경] + [구도]
// 스타일 앵커/의상 블록은 임의 변경 금지(§5). 변주 축만 조합한다.

// 품질 앵커(전 축 공통) — 색보정·배경은 축별로 뺐다(LOOK-BRIEF: 수렴 방지). 여기엔 '진짜 찍힌 사람' 결만.
export const STYLE_ANCHOR =
  "candid street style photograph shot on 35mm film, kodak portra 400, " +
  "visible film grain, subject caught mid-moment NOT posing, looking away from camera, " +
  "off-center composition, photorealistic, real person, editorial menswear lookbook";

// §2.1 Negative — flux/schnell 은 negative_prompt 미지원 → 핵심 회피는 positive에도 접어 넣음.
// (flux/dev 사용 시 negative_prompt로 전달)
export const NEGATIVE =
  "posing, looking at camera, centered composition, crosswalk, HDR, oversaturated, " +
  "smooth skin, studio quality, palm trees, bodybuilder, muscular flex, watermark, text, " +
  "brand logo, wordmark, nike swoosh, adidas stripes, identifiable graphic print";

// 체험 원칙: "데깽은 최대로, 이유는 옷" — 몸이 주인공 금지. (face visible 제거 = 캔디드로 시선 밖 허용)
// 로고 무관용(§5): 식별 가능한 브랜드 로고·워드마크 금지, 무지 신발·의류.
export const BODY_GUARD =
  "full body from head to below knee, ordinary build, not muscular, no flexing, " +
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
export const AXIS_LOOK: Record<string, AxisLook> = {
  clean: {
    clothes: "monochrome minimal outfit, white or ivory crewneck knit or tee, light pressed slacks, minimal white sneakers or loafers, no patterns",
    palette: "high-key clean color grading, crisp cool whites and light greys, low saturation, bright and airy",
    locations: ["bright white concrete wall", "sunlit glass building facade", "clean minimal plaza"],
    light: "bright midday direct sunlight with sharp clean shadows",
    energy: "calm and composed",
  },
  cityboy: {
    clothes: "relaxed layered look, open shirt or coach jacket worn over a tee, wide chinos, canvas tote bag, retro runner sneakers",
    palette: "warm neutral color grading, beige camel navy and off-white, gentle natural tones",
    locations: ["cafe exterior with passersby", "lively shopping street", "tree-lined city sidewalk"],
    light: "soft overcast to golden-hour daylight",
    energy: "casual but put-together, mid-stroll",
  },
  street: {
    clothes: "heavily oversized hoodie or heavyweight tee, wide cargo pants or baggy washed denim, ball cap, chunky sneakers, strong voluminous silhouette",
    palette: "dark low-key color grading, deep blacks charcoal and washed olive, moody high contrast",
    locations: ["narrow dark backstreet", "metal shutter alley", "dim underpass at dusk"],
    light: "overcast or low evening light with deep shadows",
    energy: "nonchalant and cool, edgy",
  },
  amekaji: {
    clothes: "vintage workwear, denim trucker or sherpa or work jacket, straight raw or washed denim, leather work boots or derby shoes, worn-in rugged texture",
    palette: "warm earthy color grading, indigo ecru olive brown and tan, nostalgic, heavy film grain",
    locations: ["old market street", "weathered wooden storefront", "rusty iron shutters"],
    light: "warm low afternoon sunlight, nostalgic haze",
    energy: "understated and rugged, vintage",
  },
  classic: {
    clothes: "tailored wool overcoat or unstructured blazer, turtleneck or knit polo, tailored wool trousers, leather derby or penny loafers, long vertical elegant line",
    palette: "deep muted refined color grading, charcoal navy grey and brown, low saturation, elegant",
    locations: ["stone building facade", "quiet boulevard in the evening", "grand hotel entrance"],
    light: "soft refined evening light",
    energy: "poised and dignified",
  },
  soft: {
    clothes: "chunky knit cardigan or fleece, cream and oatmeal palette, soft rounded silhouette, relaxed chinos, loafers or clean sneakers, cozy texture",
    palette: "warm soft high-key color grading, cream oatmeal and pastel, gentle and airy",
    locations: ["sunny quiet neighborhood", "shop window with warm light", "golden-hour lane"],
    light: "soft warm golden-hour light, cozy glow",
    energy: "relaxed and gentle",
  },
};

// §2.2 인물 변주 (같은 인물 반복 금지). athletic 과장 금지 → slim/regular만.
const HAIR = ["short textured hair", "medium wavy hair", "buzz cut", "permed hair"];
const BUILD = ["slim build", "regular build"];

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

  const person = `east asian man in his mid-to-late 20s, ${hair}, ${build}, ${gaze}`;
  const clothes = `${look.clothes}, ${SEASON[season]}${accent}`;
  // 축별 팔레트/장소/조명/에너지를 프롬프트에 직접 주입 → 축 간 시각 대비 확보(수렴 방지).
  const prompt =
    `${STYLE_ANCHOR}, ${look.palette}. ${person}, positioned off-center, ${look.energy}. ` +
    `wearing ${clothes}. ${location} in seoul, not a crosswalk. ${look.light}. ` +
    `${BODY_GUARD}. fictional person, not resembling any real celebrity.`;

  return { prompt, meta: { axis, season, background: location, hair, build } };
}

// §1 감성 호환 테스트 축 (문서 명시: 5개, classic 제외)
export const TEST_AXES = ["clean", "cityboy", "street", "amekaji", "soft"];
export const ALL_AXES = ["clean", "cityboy", "street", "amekaji", "classic", "soft"];
