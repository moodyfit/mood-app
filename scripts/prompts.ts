// GENERATION.md §2 — 프롬프트 구조: [스타일 앵커] + [인물 변주] + [의상 블록] + [배경] + [구도]
// 스타일 앵커/의상 블록은 임의 변경 금지(§5). 변주 축만 조합한다.

// 재시도 1/3 (사람 판정 반영): 필름 질감·방향광·캔디드 문법으로 "찍힌 사람" 복원.
export const STYLE_ANCHOR =
  "candid street style photograph shot on 35mm film, kodak portra 400, " +
  "visible film grain, directional natural sunlight with soft shadows, " +
  "muted warm color grading, slightly desaturated, " +
  "subject caught mid-moment NOT posing, looking away from camera, " +
  "seoul street background, photorealistic";

// §2.1 Negative — flux/schnell 은 negative_prompt 미지원 → 핵심 회피는 positive에도 접어 넣음.
// (flux/dev 사용 시 negative_prompt로 전달)
export const NEGATIVE =
  "posing, looking at camera, centered composition, crosswalk, HDR, oversaturated, " +
  "smooth skin, studio quality, palm trees, bodybuilder, muscular flex, watermark, text, logo";

// 체험 원칙: "데깽은 최대로, 이유는 옷" — 몸이 주인공 금지. (face visible 제거 = 캔디드로 시선 밖 허용)
export const BODY_GUARD =
  "full body from head to below knee, ordinary build, not muscular, no flexing, " +
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
  const background = BACKGROUND[i % BACKGROUND.length];
  const hair = HAIR[i % HAIR.length];
  const build = BUILD[i % BUILD.length];
  const gaze = GAZE[i % GAZE.length];

  const person = `east asian man in his mid-to-late 20s, ${hair}, ${build}, ${gaze}`;
  const clothes = `${AXIS_BLOCKS[axis]}, ${SEASON[season]}`;
  const prompt =
    `${STYLE_ANCHOR}. ${person}, positioned off-center in the frame. wearing ${clothes}. ` +
    `${background} background, not a crosswalk. ${BODY_GUARD}. ` +
    `fictional person, not resembling any real celebrity.`;

  return { prompt, meta: { axis, season, background, hair, build } };
}

// §1 감성 호환 테스트 축 (문서 명시: 5개, classic 제외)
export const TEST_AXES = ["clean", "cityboy", "street", "amekaji", "soft"];
export const ALL_AXES = ["clean", "cityboy", "street", "amekaji", "classic", "soft"];
