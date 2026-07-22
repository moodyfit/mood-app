import type { Affinity, MoodKey, TasteResult } from "./types";
import { MOODS } from "./moods";

/** 추구미 카드 발급 기준 저장 수 (전략 문서 §4: 2~3회 누적) */
export const TASTE_CARD_THRESHOLD = 3;

/** "너의 결과" 토글 노출 기준: 프로필이 특정 축에 이만큼 쏠렸을 때 (7.6) */
export const SKEW_THRESHOLD = 0.34;

function ranked(affinity: Affinity): [MoodKey, number][] {
  return Object.entries(affinity)
    .filter(([, w]) => w > 0)
    .sort((a, b) => b[1] - a[1]);
}

/**
 * 프로필 무드 벡터 → 추구미. 규칙 기반(문서 §8), ML 불필요.
 * affinity = 저장·클릭 누적 가중치(7.6).
 */
export function computeTaste(affinity: Affinity): TasteResult {
  const r = ranked(affinity);
  const total = r.reduce((s, [, w]) => s + w, 0) || 1;

  const bars = r.slice(0, 4).map(([key, w]) => ({
    name: MOODS[key]?.name ?? key,
    pct: Math.round((w / total) * 100),
  }));

  const top = r.slice(0, 2).map(([key]) => MOODS[key]?.name ?? key);
  const title = top.length >= 2 ? `${top[0]} × ${top[1]}` : top[0] ?? "";

  return { title, bars, rarityPct: rarityFor(title) };
}

/**
 * 별칭 레이어 (#5) — 표면 언어. 축 조합을 사람 말 한마디로.
 * 단일 지배(상위축 0.7+) → 1축 별칭, 아니면 상위 2축 조합 별칭(순서 무관).
 * ⚠ 밈→축 번역 수식은 절대 노출 금지 — 여기서 나오는 건 오직 별칭 문자열.
 */
// 별칭 core(어미 '타입'/'쪽' 없는 알맹이). 표면별 어형은 아래 함수가 붙인다.
const SINGLE_ALIAS: Record<MoodKey, string> = {
  clean: "군더더기 없는",
  cityboy: "힘 뺀 게 멋인",
  street: "크게 입는",
  amekaji: "빈티지가 체질인",
  classic: "각 잡힌 게 편한",
  soft: "순한 인상이 무기인",
};

// 키 = 두 축을 알파벳 정렬해 조인(순서 무관 조회)
const COMBO_ALIAS: Record<string, string> = {
  "cityboy|clean": "힘 뺐는데 정돈된",
  "clean|street": "깔끔한데 심심하진 않은",
  "amekaji|clean": "단정한데 낡은 멋 아는",
  "classic|clean": "각 잡을 줄 아는",
  "clean|soft": "순한맛인데 정돈된",
  "cityboy|street": "여유롭게 노는",
  "amekaji|cityboy": "꾸민 듯 안 꾸민",
  "cityboy|classic": "셋업도 청바지처럼 입는",
  "cityboy|soft": "동네에서 제일 편해 보이는",
  "amekaji|street": "낡고 큰 게 멋인",
  "classic|street": "정장에 스니커 신는",
  "soft|street": "부드러운데 힘 있는",
  "amekaji|classic": "오래된 게 잘 어울리는",
  "amekaji|soft": "니트에 데님이 국룰인",
  "classic|soft": "코트가 잘 어울리는",
};

/** 유저 추구미 별칭 core. 단일 지배(0.7+) → 1축, 아니면 상위 2축 조합. */
export function aliasCore(affinity: Affinity): string {
  const r = ranked(affinity);
  if (r.length === 0) return "";
  const total = r.reduce((s, [, w]) => s + w, 0) || 1;
  const k1 = r[0][0];
  const share1 = r[0][1] / total;
  if (r.length === 1 || share1 >= 0.7) return SINGLE_ALIAS[k1] ?? "";
  const k2 = r[1][0];
  const key = [k1, k2].sort().join("|");
  return COMBO_ALIAS[key] ?? SINGLE_ALIAS[k1] ?? "";
}

// ── 표면별 표기(공용) — 화면은 이 함수만 호출, 어형 하드코딩 금지 ──
/** 카드·문패·공유: "…타입" */
export function aliasType(affinity: Affinity): string {
  const c = aliasCore(affinity);
  return c ? `${c} 타입` : "";
}
/** 나의 공간 방 제목: "…타입의 방" */
export function aliasRoomTitle(affinity: Affinity): string {
  const c = aliasCore(affinity);
  return c ? `${c} 타입의 방` : "나의 방";
}
/** 스캔 결과 헤드라인: "너는 지금 … 쪽" */
export function aliasScanHeadline(affinity: Affinity): string {
  const c = aliasCore(affinity);
  return c ? `너는 지금 ${c} 쪽` : "";
}
/** 단일 무드(룩) 별칭 — 약속 모드·스샷 후보 등 낱개 무드 표기용 */
export function moodAliasCore(key: MoodKey): string {
  return SINGLE_ALIAS[key] ?? "";
}
export function moodAliasType(key: MoodKey): string {
  const c = SINGLE_ALIAS[key];
  return c ? `${c} 타입` : "";
}

/**
 * 포용성 수치 (2.5장): "이 무드를 가진 사람, 전체의 X.X%".
 * MVP는 조합 문자열 기반 결정적 의사값(1.2~9.6%). 실서비스는 실제 분포로 대체.
 * 동경(특별함)이 아니라 소속감(같은 X%의 존재)을 겨냥.
 */
function rarityFor(title: string): number {
  const seed = [...title].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Math.round((((seed % 85) + 12) / 10) * 10) / 10;
}

/** 프로필이 특정 축에 의미있게 쏠렸는가 = 상위 축 점유율 (7.6 토글 게이트) */
export function topShare(affinity: Affinity): number {
  const r = ranked(affinity);
  if (r.length === 0) return 0;
  const total = r.reduce((s, [, w]) => s + w, 0) || 1;
  return r[0][1] / total;
}

/** affinity 내림차순 무드 키 (7.7 방 레이아웃 정렬용) */
export function moodsByAffinity(affinity: Affinity): MoodKey[] {
  return ranked(affinity).map(([k]) => k);
}

/**
 * 7.6 "너의 결과" 정렬: 일치도(원순서) × (1 + 프로필 가중치) 재정렬.
 * 후보군은 그대로, 순서만 교체. 프로필 가중치가 큰 무드가 앞으로.
 */
export function personalizeOrder(
  moodKeys: MoodKey[],
  affinity: Affinity
): MoodKey[] {
  const n = moodKeys.length || 1;
  return moodKeys
    .map((key, i) => {
      const base = (n - i) / n; // 원순서 일치도 (앞일수록 큼)
      const w = affinity[key] ?? 0;
      return { key, i, score: base * (1 + w) };
    })
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map((x) => x.key);
}
