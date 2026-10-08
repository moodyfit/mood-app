// 무드핏 전시 이미지 프롬프트 v3 — IG 일상 캔디드 · 한국 배경(깔끔) · 남녀 · 체형/헤어/포즈 다양.
// 케빈 방향(2026-08): ①한국 배경+깔끔 ②체형·헤어·포즈 다양(주머니 손 등) ③IG 셀카/친구가 찍어준 일상 느낌. 남녀 각각.

// 품질 앵커(전 축 공통) — 에디토리얼/필름 룩 폐기, "진짜 인스타 게시물" 결로.
export const STYLE_ANCHOR =
  "a real korean street-style outfit snap like a musinsa snap, a candid photo taken by a friend on a phone from a natural distance in a real everyday korean place, " +
  "an attractive stylish young korean with good flattering proportions and long legs, " +
  "a relaxed natural unposed moment, authentic daytime phone-photo look with a little natural grain, " +
  "trendy refined 2025 korean styling";

// Negative — 광고/에디토리얼·로고·행인·지저분한 배경 억제.
export const NEGATIVE =
  "professional studio lighting, fashion editorial, magazine cover, posed catalog shot, glossy advertisement, " +
  "watermark, brand logo, wordmark, nike swoosh, adidas stripes, printed brand name, garbled text, illegible letters, " +
  "other people, second person, bystanders, crowd, background people, " +
  "extra limbs, distorted hands, deformed face, extra fingers, disproportionate body, short stubby legs, oversized head, " +
  "empty studio room, seamless photo backdrop, floating wood-framed mirror in an empty room, awkward staged background, " +
  "any readable or garbled text, signboard text, storefront sign text, chalkboard menu text, window lettering, lettering on clothing, printed slogan on tee, " +
  "cap logo, cap emblem, hat patch, embroidered logo on cap, other customers, barista, staff in frame, person behind subject, " +
  "cropped at the thigh, cut off above the knee, missing lower legs, " +
  "messy trashy cluttered background, trash, tangled wires, western vintage interior, heavy orange amber sepia cast";

// 전신·무지·솔로·깔끔 배경 가드. (체형은 다양화하므로 '모델 비율' 문구 제거)
export const BODY_GUARD =
  "natural flattering instagram framing — full-body or a high three-quarter shot cropped no higher than mid-shin, or a relaxed seated shot, " +
  "the body has good flattering proportions with long legs and a visible high waistline so oversized tops do not look boxy, " +
  "solo subject alone in the frame with no other people, an authentic candid phone-photo feel, " +
  "plain clothing with no visible brand logos, no wordmarks, no printed brand names, " +
  "a believable real korean setting with natural depth, tidy and not messy, not an empty studio";

export const GENDERS = ["m", "w"] as const;
export type Gender = (typeof GENDERS)[number];

// 체형 다양화(성별별). '키 크고 마른 모델' 고정 탈피.
const BUILD: Record<Gender, string[]> = {
  m: ["tall slim build with long legs", "lean athletic build with good proportions", "slender build with long legs", "average-slim build with long legs", "tall lean build"],
  w: ["tall slim build with long legs", "slender build with good proportions", "petite but well-proportioned with long legs", "lean build with long legs", "tall willowy build"],
};
// 헤어 다양화(성별별).
const HAIR: Record<Gender, string[]> = {
  m: ["short cropped hair", "medium wavy hair", "korean two-block cut", "slightly long messy hair", "neat side-parted hair"],
  w: ["long straight hair", "shoulder-length wavy hair", "short bob", "hair tied in a ponytail", "medium layered hair"],
};
// 포즈 다양화(주머니 손·셀카·걷기 등, IG 결).
// 3자(친구)가 찍어준 캔디드 위주. 미러셀카는 1개만(1/6). idx0 = 대표 친구컷.
const POSE = [
  "photographed by a friend a few steps away, standing naturally with one hand in a pocket, glancing off to the side",
  "photographed by a friend, walking candid caught mid-step down the street, looking away",
  "photographed by a friend, holding an iced americano and glancing to the side, relaxed",
  "photographed by a friend, sitting on a cafe chair with legs crossed, relaxed and candid",
  "photographed by a friend, leaning on a railing or wall, one hand adjusting hair, looking off",
  "a casual full-body mirror selfie holding a phone in a real cafe or fitting-room mirror",
];

// 구도/앵글 다양화 — 비율 유지하되 컷마다 다르게.
const ANGLE = [
  "straight-on eye-level framing",
  "a slightly low angle so the legs look long",
  "shot from a few steps back showing the surroundings",
  "a natural three-quarter side angle",
  "a casual slightly-high angle looking down a bit",
];
// 소품 다양화(빈 값 포함 → 매 컷 소품 강제 안 함). 브랜드 로고 없는 일반 소품.
const PROP = [
  "", "holding an iced coffee", "a casual tote bag on the shoulder", "small sunglasses on",
  "a crossbody sling bag", "a bucket hat", "a paper shopping bag in hand", "", "a shoulder bag", "earphones in",
];
// 날씨·시간대 다양화(밤/낮·맑음/흐림/비 후). 조명은 이걸로 구동(look.light 대체).
const TIME_WEATHER = [
  "bright sunny midday light", "soft overcast afternoon light", "warm golden-hour light", "clear blue-sky morning light",
  "cool cloudy daylight", "late afternoon side light", "evening with warm city lights", "night with soft neon street glow",
  "just after rain with damp glossy pavement", "hazy soft daylight",
];

// 계절 라벨(의상에 반영)
const SEASON: Record<string, string> = {
  spring: "spring light layering", summer: "summer, short sleeves or light fabric",
  fall: "fall layering", winter: "winter, with a coat or knit",
};

interface GenderLook { clothes: string; colorways: string[] }
interface AxisLook { palette: string; locations: string[]; light: string; energy: string; m: GenderLook; w: GenderLook }

// 6축 유지 — 무드는 공유(palette/장소/조명/에너지), 의상·색조합만 성별로 분기. 장소는 전부 '한국·깔끔'.
export const AXIS_LOOK: Record<string, AxisLook> = {
  clean: {
    palette: "cool crisp neutral color palette, airy and clean",
    locations: ["a clean bright korean cafe interior with minimal decor", "a quiet tidy seoul street with a pale clean wall", "a modern korean building entrance with glass and a plain wall"],
    light: "bright even daylight", energy: "effortless and neat",
    m: { clothes: "clean minimal outfit, plain tee or fine knit or crisp shirt, straight or wide trousers, minimal white sneakers or loafers, neat and trim",
         colorways: ["crisp white shirt with light grey trousers", "pale blue shirt with off-white trousers", "light grey knit with ecru trousers", "white tee with beige trousers", "navy tee with cream trousers"] },
    w: { clothes: "clean minimal outfit, plain fitted tee or fine knit or crisp shirt, straight wide trousers or a simple midi skirt, minimal flats or white sneakers or loafers, neat and polished",
         colorways: ["white shirt with light grey wide trousers", "ivory knit with a beige midi skirt", "pale blue shirt with white trousers", "grey fine knit with ecru trousers", "black slim top with cream trousers"] },
  },
  cityboy: {
    palette: "mixed mid-tone color palette with clear variety, moderate saturation",
    locations: ["in front of a trendy seongsu-dong korean cafe with plants and greenery", "a brick-walled seoul cafe street, tidy", "a leafy quiet seoul side street"],
    light: "candid daytime street-snap light", energy: "laid-back casual, everyday ease",
    m: { clothes: "laid-back korean casual layering, open overshirt or cardigan over a tee, wide pleated chinos or relaxed jeans, retro sneakers or loafers, soft comfortable volume",
         colorways: ["navy overshirt over white tee with olive chinos", "brown cardigan over cream tee with grey trousers", "mustard knit over a white collar with navy chinos", "burnt-orange overshirt over ecru tee with faded-blue jeans", "beige overshirt over stripe tee with khaki chinos"] },
    w: { clothes: "laid-back korean casual layering, open cardigan or overshirt over a tee, wide trousers or a relaxed denim skirt, retro sneakers or loafers or ballet flats, easy casual volume",
         colorways: ["navy cardigan over white tee with wide beige trousers", "brown knit vest over cream shirt with denim skirt", "mustard cardigan over white tee with navy trousers", "sage overshirt over ecru tee with faded jeans", "cream cardigan over stripe tee with khaki trousers"] },
  },
  street: {
    palette: "dark washed neutral color palette, casual urban contrast",
    locations: ["against a weathered concrete wall in a seoul alley", "a quiet hongdae seoul backstreet with a plain wall", "a parking-garage railing in seoul"],
    light: "cool daylight, casual snapshot", energy: "relaxed and cool",
    m: { clothes: "oversized baggy korean streetwear, solid blank boxy hoodie or heavy tee, very wide cargo or washed denim or sweatpants, a completely plain blank cap with no logo emblem or patch or a plain beanie, plain chunky sneakers with no logo, exaggerated relaxed volume",
         colorways: ["all-black hoodie with black wide pants", "washed grey hoodie with faded black denim", "charcoal hoodie with washed indigo wide jeans", "slate-blue hoodie with black cargo", "cream hoodie with washed grey cargo"] },
    w: { clothes: "oversized baggy korean streetwear, boxy blank hoodie or crop hoodie, very wide cargo or baggy jeans or sweatpants, a completely plain blank cap with no logo emblem or patch or a plain beanie, chunky sneakers with no logo, relaxed oversized volume",
         colorways: ["black crop hoodie with baggy black cargo", "grey oversized hoodie with washed denim", "charcoal hoodie with wide indigo jeans", "cream hoodie with grey wide cargo", "washed pink hoodie with black baggy jeans"] },
  },
  amekaji: {
    palette: "rich warm earth-tone color palette, cozy",
    locations: ["by a plain brick wall in an old seoul neighborhood", "a brick wall in an old seoul neighborhood", "a tree-lined seoul park path"],
    light: "warm daylight, nostalgic", energy: "easygoing vintage warmth",
    m: { clothes: "rugged korean americana workwear, denim trucker or chore jacket or olive field jacket over a chambray or flannel or tee, straight raw denim or khaki chino, leather work boots or moc-toe shoes, lived-in vintage",
         colorways: ["indigo denim jacket over ecru tee with tan chino", "olive field jacket over blue chambray with raw denim", "brown chore jacket over rust flannel with khaki", "tan work jacket over cream tee with brown corduroy", "washed denim trucker over white tee with olive chino"] },
    w: { clothes: "rugged korean americana workwear, denim trucker or chore jacket or olive field jacket over a chambray or knit or tee, straight denim or khaki chino or a corduroy skirt, leather boots or loafers, lived-in vintage",
         colorways: ["indigo denim jacket over cream knit with tan trousers", "olive field jacket over white tee with raw denim", "brown corduroy jacket over ecru knit with khaki skirt", "washed denim jacket over stripe tee with brown cord", "tan chore jacket over white tee with olive chino"] },
  },
  classic: {
    palette: "rich deep sophisticated color palette, refined",
    locations: ["a modern seoul hotel or gallery entrance", "a clean stone-walled gangnam seoul street", "a minimal upscale seoul building lobby"],
    light: "soft refined daylight", energy: "polished and composed",
    m: { clothes: "refined korean tailoring, soft blazer or sport coat or coat worn open over a fine knit or shirt, pleated wide trousers, leather loafers or derbies, clean drape",
         colorways: ["charcoal blazer over cream knit with grey trousers", "navy blazer over white shirt with charcoal trousers", "deep-green blazer over ivory shirt with brown trousers", "camel coat over navy knit with grey trousers", "grey blazer over white shirt with navy trousers"] },
    w: { clothes: "refined korean tailoring, soft blazer or tailored coat worn open over a fine knit or blouse, tailored trousers or a pencil or midi skirt, leather loafers or heels or flats, elegant clean drape",
         colorways: ["charcoal blazer over cream knit with grey trousers", "navy blazer over white blouse with a charcoal skirt", "deep-green blazer over ivory knit with brown trousers", "camel coat over navy knit with grey skirt", "beige blazer over white blouse with black trousers"] },
  },
  soft: {
    palette: "gentle pastel color palette, soft and dreamy",
    locations: ["a warm sunny korean cafe by a window", "a bright cozy seoul cafe patio", "a soft-lit korean park path with flowers"],
    light: "soft hazy light, cozy", energy: "relaxed and gentle",
    m: { clothes: "cozy soft knitwear, chunky cable or waffle knit sweater or cardigan as the hero piece, wide tapered trousers, loafers or clean sneakers, warm and soft",
         colorways: ["cream chunky knit with oatmeal trousers", "sage cardigan with cream trousers", "powder-blue knit with light-grey trousers", "dusty-lilac knit with oatmeal trousers", "beige waffle knit with white trousers"] },
    w: { clothes: "cozy soft knitwear, chunky cable or waffle knit sweater or cardigan as the hero piece, wide trousers or a soft midi skirt, loafers or ballet flats or clean sneakers, warm and soft",
         colorways: ["cream chunky knit with oatmeal wide trousers", "sage cardigan with a cream skirt", "powder-blue knit with light-grey trousers", "dusty-lilac knit with oatmeal skirt", "butter-yellow waffle knit with white trousers"] },
  },
};

// 계절 배분(축당 10) — 성별 공통. 여름3·봄3·가을3·겨울1 정도로 골고루.
export const SEASON_PLAN: Record<string, string[]> = {
  clean:   ["summer","summer","summer","spring","spring","fall","fall","winter","spring","fall"],
  cityboy: ["summer","summer","spring","spring","fall","fall","winter","summer","spring","fall"],
  street:  ["winter","winter","summer","summer","spring","spring","fall","fall","spring","fall"],
  amekaji: ["winter","winter","spring","spring","spring","fall","fall","fall","summer","winter"],
  classic: ["winter","winter","fall","fall","fall","spring","spring","summer","winter","spring"],
  soft:    ["winter","winter","summer","spring","spring","spring","fall","fall","fall","winter"],
};

// 비율(축당 10): IG 세로 위주 — 4:5 ×7 / 3:4 ×2 / 9:16 ×1
export const RATIO_PLAN: string[] = ["4:5","4:5","3:4","4:5","9:16","4:5","4:5","3:4","4:5","4:5"];

export interface PromptMeta { gender: Gender; axis: string; season: string; background: string; hair: string; build: string; pose: string; colorway: string; angle: string; prop: string; time: string }

// 차원마다 서로소에 가까운 주기(5·6·7·8·10)로 돌려 축당 10장이 최대한 안 겹치게.
export function buildPrompt(gender: Gender, axis: string, i: number): { prompt: string; meta: PromptMeta } {
  const look = AXIS_LOOK[axis] ?? AXIS_LOOK.clean;
  const g = look[gender];
  const plan = SEASON_PLAN[axis] ?? ["spring", "fall"];
  const season = plan[i % plan.length];
  const build = BUILD[gender][i % BUILD[gender].length];
  const hair = HAIR[gender][(i + 1) % HAIR[gender].length];
  const pose = POSE[i % POSE.length];
  const angle = ANGLE[i % ANGLE.length];
  const prop = PROP[(i * 3) % PROP.length];
  const time = TIME_WEATHER[i % TIME_WEATHER.length];
  const location = look.locations[i % look.locations.length];
  const colorway = g.colorways[i % g.colorways.length];
  const who = gender === "m" ? "man" : "woman";
  const person = `a good-looking ordinary korean ${who} in their mid-20s, ${build}, ${hair}, natural relaxed expression, ${pose}, ${angle}`;
  const clothes = `${g.clothes}, ${SEASON[season]}`;
  const propClause = prop ? `, styled with ${prop} (no brand logos)` : "";
  const prompt =
    `${STYLE_ANCHOR}, ${look.palette}. ${person}. ` +
    `wearing ${clothes}. the specific outfit colors are exactly: ${colorway}${propClause}. ` +
    `${location}, in korea, a tidy real setting, ${time}. ` +
    `${BODY_GUARD}. fictional person, not resembling any real celebrity.`;
  return { prompt, meta: { gender, axis, season, background: location, hair, build, pose, colorway, angle, prop, time } };
}

export const ALL_AXES = ["clean", "cityboy", "street", "amekaji", "classic", "soft"];
export const TEST_AXES = ["clean", "cityboy", "street", "amekaji", "soft"];
