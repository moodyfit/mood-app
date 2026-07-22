// GENERATION.md §2 — 프롬프트 구조: [스타일 앵커] + [인물 변주] + [의상 블록] + [배경] + [구도]
// 스타일 앵커/의상 블록은 임의 변경 금지(§5). 변주 축만 조합한다.

export const STYLE_ANCHOR =
  "candid street style photograph, 35mm film photography, natural daylight, " +
  "muted color grading, subtle film grain, unposed moment, photorealistic, " +
  "korean street fashion editorial";

// §2.1 Negative — 단, fal의 flux 엔드포인트는 negative_prompt를 받지 않음.
// 따라서 몸 과장 방지는 positive(BODY_GUARD)로 접어 넣고, 로고/텍스트 회피도 명시.
export const NEGATIVE =
  "bodybuilder, muscular flex, gym physique, watermark, text, logo focus, studio lighting, oversaturated";

// 체험 원칙: "데깽은 최대로, 이유는 옷" — 몸이 주인공이 되는 묘사 금지
export const BODY_GUARD =
  "full body from head to below knee, face visible, ordinary build, not muscular, no flexing, " +
  "the clothing and styling are the focus, no brand logos, no text";

// §2.3 의상 블록 (축별)
export const AXIS_BLOCKS: Record<string, string> = {
  clean: "white/grey/black tones, crewneck knit, pressed slacks, minimal sneakers or loafers, no patterns",
  cityboy: "relaxed fit layering, open shirt over tee, wide chinos, tote bag, new balance style sneakers",
  street: "oversized hoodie or coach jacket, wide cargo or parachute pants, chunky sneakers, ball cap",
  amekaji: "denim jacket or military coat, straight raw denim, work boots or leather shoes, vintage texture",
  classic: "unstructured blazer or wool coat, turtleneck or oxford shirt, tailored trousers, derby shoes",
  soft: "warm-tone knit or cardigan, cream/beige palette, soft silhouette, clean sneakers",
};

// §2.2 인물 변주 (같은 인물 반복 금지). athletic 과장 금지 → slim/regular만.
const HAIR = ["short textured hair", "medium wavy hair", "buzz cut", "permed hair"];
const BUILD = ["slim build", "regular build"];
const MOOD = ["calm expression", "cheerful expression", "relaxed expression"];

// §2.4 배경 변주
const BACKGROUND = [
  "city crosswalk",
  "quiet alley",
  "cafe exterior",
  "riverside path",
  "residential street",
  "evening street",
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
  const seasons = AXIS_SEASONS[axis] ?? ["spring", "fall"];
  const season = seasons[i % seasons.length];
  const background = BACKGROUND[(i * 1) % BACKGROUND.length];
  const hair = HAIR[(i * 1) % HAIR.length];
  const build = BUILD[(i * 1) % BUILD.length];
  const mood = MOOD[(i * 1) % MOOD.length];

  const person = `east asian man in his mid-to-late 20s, ${hair}, ${build}, ${mood}`;
  const clothes = `${AXIS_BLOCKS[axis]}, ${SEASON[season]}`;
  const prompt =
    `${STYLE_ANCHOR}. ${person}. wearing ${clothes}. ${background} background. ` +
    `${BODY_GUARD}. fictional person, not resembling any real celebrity.`;

  return { prompt, meta: { axis, season, background, hair, build } };
}

// §1 감성 호환 테스트 축 (문서 명시: 5개, classic 제외)
export const TEST_AXES = ["clean", "cityboy", "street", "amekaji", "soft"];
export const ALL_AXES = ["clean", "cityboy", "street", "amekaji", "classic", "soft"];
