/**
 * 무드핏 태깅 루브릭 — 단일 소스(SSOT). TAXONOMY.md 규약을 코드로 고정.
 * score-photos.ts(채점기)와 validate-tags.ts(검증기)가 여기서만 import → 회차·사람 간 드리프트 제거.
 * 축/어휘/계약을 바꾸려면 여기 한 곳만. (에린과의 mood_vector 계약 = §2 TAXONOMY)
 */
export const AXES = ["clean", "cityboy", "street", "amekaji", "classic", "soft"] as const;
export type Axis = (typeof AXES)[number];

// 상황·계절 통제 어휘 (캡션/필터 일관성)
export const SITUATIONS = ["데이트", "소개팅", "주말카페", "동네", "출근", "캠퍼스", "나들이", "저녁약속", "여행"] as const;
export const SEASONS = ["spring", "summer", "fall", "winter"] as const;
export const BUILDS = ["slim", "regular"] as const;

// 6축 한 줄 본질 + 시각 신호 (TAXONOMY §3 요약)
export const AXIS_RUBRIC: Record<Axis, string> = {
  clean: "매끈·정제·미니멀. 색 2개 이하, 무채+뉴트럴, 로고/패턴 최소, 과하지 않은 정핏. 대표템: 화이트 티/셔츠·슬랙스·미니멀 로퍼/스니커.",
  cityboy: "재핑한 레이어드(일본 시티보이). 오픈셔츠/셋업/카디건 걸침, 층·소품, 밝은/따뜻 뉴트럴. 도시적으로 정돈.",
  street: "오버핏·볼륨, 도시적 날것. 오버사이즈 후디/카고/와이드, 캡/비니, 청키 스니커, 워시드 다크. (카고 OK, 밀리터리 필드자켓은 amekaji)",
  amekaji: "워크웨어·데님·밀리터리 빈티지 손맛. 트러커/쵸어/M-65, 샴브레이/플란넬, 워크부츠, 인디고·올리브·탄·브라운 흙톤.",
  classic: "정돈된 테일러링. 블레이저/코트 걸침, 니트폴로/셔츠, 플리츠 슬랙스, 레더 구두, 차콜·네이비·그린·카멜 딥톤. (댄디·포멀·프레피 흡수)",
  soft: "니트·가디건 질감이 히어로. 청키 케이블/와플 니트, 크림·오트밀·세이지·파우더블루·라일락 파스텔, 편안한 실루엣, 포근.",
};

// mood_vector 계약(TAXONOMY §2)
export const CONTRACT = { primaryMin: 0.5, dropBelow: 0.1, maxAxes: 3, sumTo: 1 };

/** <0.1 컷 → 합=1 정규화 → 반올림 오차는 최대축에 흡수. 결정적. */
export function normalizeMoodVector(mvIn: Record<string, number>): Record<string, number> {
  let mv: Record<string, number> = {};
  for (const [k, v] of Object.entries(mvIn)) if ((AXES as readonly string[]).includes(k) && v >= CONTRACT.dropBelow) mv[k] = v;
  if (Object.keys(mv).length === 0) throw new Error(`mood_vector 유효 축 없음: ${JSON.stringify(mvIn)}`);
  // 최대 3축(작은 것부터 컷)
  const sorted = Object.entries(mv).sort((a, b) => b[1] - a[1]).slice(0, CONTRACT.maxAxes);
  mv = Object.fromEntries(sorted);
  const s = Object.values(mv).reduce((a, b) => a + b, 0);
  mv = Object.fromEntries(Object.entries(mv).map(([k, v]) => [k, Math.round((v / s) * 100) / 100]));
  const d = Math.round((1 - Object.values(mv).reduce((a, b) => a + b, 0)) * 100) / 100;
  if (d !== 0) { const top = Object.entries(mv).sort((a, b) => b[1] - a[1])[0][0]; mv[top] = Math.round((mv[top] + d) * 100) / 100; }
  return mv;
}

export interface Tag {
  file: string; mood_vector: Record<string, number>; situations: string[]; seasons: string[];
  body_spec: { height: string; build: string };
  caption_item: string; caption_why: string; caption_how: string;
  is_flagship: boolean; flagship_reason?: string; confidence?: number;
}

/** 계약·어휘 위반 목록 반환(빈 배열 = 통과). DB 입고 전 게이트. */
export function validateTag(o: any): string[] {
  const e: string[] = [];
  const mv = o?.mood_vector;
  if (!mv || typeof mv !== "object") { e.push("mood_vector 없음"); return e; }
  const keys = Object.keys(mv);
  if (keys.some((k) => !(AXES as readonly string[]).includes(k))) e.push(`알 수 없는 축: ${keys.join(",")}`);
  if (keys.length > CONTRACT.maxAxes) e.push(`축 ${keys.length}개 > ${CONTRACT.maxAxes}`);
  if (keys.some((k) => mv[k] < CONTRACT.dropBelow)) e.push("0.1 미만 노이즈 축 존재");
  const sum = Object.values(mv).reduce((a: number, b: any) => a + b, 0);
  if (Math.abs(sum - CONTRACT.sumTo) > 0.02) e.push(`합 ${sum.toFixed(2)} ≠ 1`);
  const prim = Math.max(...(Object.values(mv) as number[]));
  if (prim < CONTRACT.primaryMin) e.push(`주축 ${prim} < ${CONTRACT.primaryMin}`);
  for (const s of o.situations ?? []) if (!(SITUATIONS as readonly string[]).includes(s)) e.push(`상황 어휘 밖: ${s}`);
  for (const s of o.seasons ?? []) if (!(SEASONS as readonly string[]).includes(s)) e.push(`계절 어휘 밖: ${s}`);
  if (o.body_spec && !(BUILDS as readonly string[]).includes(o.body_spec.build)) e.push(`build 어휘 밖: ${o.body_spec.build}`);
  for (const c of ["caption_item", "caption_why", "caption_how"]) if (!o[c] || !String(o[c]).trim()) e.push(`${c} 비어있음`);
  return e;
}

/** 이미지 1장 채점 지시문(비전 모델용). axisHint = 파일명 접두사(있으면 소프트 힌트). */
export function scoringPrompt(axisHint?: string): string {
  const rub = (AXES as readonly Axis[]).map((a) => `- ${a}: ${AXIS_RUBRIC[a]}`).join("\n");
  return [
    "너는 무드핏(한국 남성복 취향 앱)의 태깅 담당이다. 첨부한 사진 1장을 보고 아래 6축 루브릭으로 채점한다.",
    "",
    "[6축 루브릭] (사진에 실제로 보이는 것으로 채점 — 폴더/파일명 아님)",
    rub,
    "",
    `[mood_vector 계약] 유의미한 축만. 주축(최고) ≥ ${CONTRACT.primaryMin}. ${CONTRACT.dropBelow} 미만은 버림. 최대 ${CONTRACT.maxAxes}축. 합 = 1.0. 혼합이면 분포로(예 {"classic":0.6,"street":0.4}).`,
    axisHint ? `[힌트] 이 사진은 '${axisHint}' 의도로 생성됨(참고만, 실제로 보이는 대로 채점).` : "",
    `[situations] 다음에서 1~2개만: ${SITUATIONS.join(", ")}`,
    `[seasons] 옷차림 보고 1개: ${SEASONS.join(", ")} (반팔/린넨=summer, 코트/두꺼운 니트=winter 등)`,
    `[body_spec.build] ${BUILDS.join(" 또는 ")} 중 하나(실루엣 기준).`,
    "[caption 3행] 한국어 반말, 사진과 사실 일치(색·아이템 실제 보이는 대로), 브랜드 언급 금지:",
    "  caption_item=무엇 입었나(아이템+색), caption_why=왜 이 무드/느낌(조합 강조), caption_how=입는 팁 한 줄.",
    "[is_flagship] 이 축 대표로 내세울 만하면 true(전신·얼굴·기본템 재현 쉬움) + flagship_reason. 애매하면 false.",
    "[confidence] 0~1, 애매하면 낮게.",
    "",
    "출력: 오직 JSON 1개 객체(코드펜스·설명 금지):",
    '{"mood_vector":{...},"situations":[...],"seasons":["..."],"body_spec":{"height":"180","build":"slim"},"caption_item":"...","caption_why":"...","caption_how":"...","is_flagship":false,"flagship_reason":"","confidence":0.9}',
  ].filter(Boolean).join("\n");
}
