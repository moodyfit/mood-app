// 픽어뷰 패션판 — "유튜브를 룩북으로 재편집".
// 뷰티: 고민→방법 요약(텍스트). 패션: 상황→영상에서 룩만 뽑은 카드(프레임+아이템 분해+왜 맞는지).
// 핀터레스트엔 없는 '만든 사람의 설명', 유튜브엔 없는 '훑어보기' — 그 사이를 먹는 자리.
// 락인: 신체 프로필(체형·키·퍼컬)을 한 번 받아두면 이후 모든 검색이 필터링됨.

import type { BodyProfile } from "./store";

export interface LookItem {
  name: string;
  category: string; // 아우터/상의/하의/신발/가방 ...
}

export interface LookCard {
  id: string; // 카드 고유 id (videoId + 순번)
  videoId: string;
  timestamp?: number; // 룩 등장 지점(초) — 있으면 그 순간으로 딥링크
  title: string; // 룩 한 줄 이름
  channel: string;
  situations: string[]; // 상황 검색축(가변)
  items: LookItem[]; // 아이템 분해
  whyFits: string; // "왜 이 상황에 맞는지" 한 줄
  bodyType?: BodyProfile["bodyType"][]; // 이 룩이 특히 맞는 체형(있으면 프로필 부스트)
  personalColor?: BodyProfile["personalColor"][]; // 퍼스널컬러 적합
  lookImageUrl?: string; // 캡처 프레임(있으면 우선). 없으면 썸네일 폴백
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
export function youtubeWatchUrl(id: string, t?: number): string {
  return `https://www.youtube.com/watch?v=${id}${t ? `&t=${t}s` : ""}`;
}
export function lookImage(l: LookCard): string {
  return l.lookImageUrl ?? youtubeThumb(l.videoId);
}

// 큐레이션 시드 — 실제 영상에서 뽑은 룩 카드. (timestamp·캡처 프레임은 큐레이션/파이프라인으로 보강)
export const LOOK_SEED: LookCard[] = [
  {
    id: "14UQ8qCvBOk-1",
    videoId: "14UQ8qCvBOk",
    title: "린넨 셔츠 여름 데일리",
    channel: "남자 패션 코디",
    situations: ["여름", "데일리", "주말", "더위"],
    items: [
      { name: "린넨 오픈 셔츠", category: "상의" },
      { name: "코튼 이지 쇼츠", category: "하의" },
      { name: "스웨이드 로퍼", category: "신발" },
    ],
    whyFits: "린넨으로 더위에도 늘어지지 않고 단정해 보여.",
    personalColor: ["웜"],
  },
  {
    id: "hia93-3Ha0k-1",
    videoId: "hia93-3Ha0k",
    title: "소개팅 화이트 셔츠 룩",
    channel: "남자 패션 코디",
    situations: ["소개팅", "데이트", "첫인상", "여름"],
    items: [
      { name: "화이트 코튼 셔츠", category: "상의" },
      { name: "그레이 슬랙스", category: "하의" },
      { name: "미니멀 로퍼", category: "신발" },
    ],
    whyFits: "색을 둘로만 끊어 과하지 않게 — 첫인상에서 단정한 호감.",
    personalColor: ["쿨"],
  },
  {
    id: "pjLruE5lzFQ-1",
    videoId: "pjLruE5lzFQ",
    title: "톤온톤 캐주얼 데일리",
    channel: "데일리룩",
    situations: ["데일리", "미니멀", "주말", "카페"],
    items: [
      { name: "무지 크루넥 티", category: "상의" },
      { name: "와이드 코튼 팬츠", category: "하의" },
      { name: "레더 스니커즈", category: "신발" },
    ],
    whyFits: "힘 뺀 톤온톤이라 매일 입어도 정돈돼 보여.",
  },
  {
    id: "e9MdY-OwHik-1",
    videoId: "e9MdY-OwHik",
    title: "체형 커버 세미오버 룩",
    channel: "식스타일",
    situations: ["데일리", "체형커버", "출근"],
    items: [
      { name: "세미오버 셔츠", category: "상의" },
      { name: "스트레이트 슬랙스", category: "하의" },
    ],
    whyFits: "붙지 않는 핏 + 세로 라인으로 체형을 편하게 눌러줘.",
    bodyType: ["통통", "보통"],
  },
  {
    id: "16puo9K3fog-1",
    videoId: "16puo9K3fog",
    title: "셔츠 한 장 오피스·데일리",
    channel: "데일리룩",
    situations: ["오피스", "출근", "데일리", "면접"],
    items: [
      { name: "옥스포드 셔츠", category: "상의" },
      { name: "네이비 슬랙스", category: "하의" },
    ],
    whyFits: "셔츠 하나로 오피스도 데일리도 커버되는 기본 조합.",
    bodyType: ["마른", "보통"],
  },
];

// 상황(자연어) → 상황축 확장 사전. 신체 관련어는 프로필로 유도(검색축은 상황 고정).
const SITUATION_SYNONYMS: Record<string, string[]> = {
  소개팅: ["소개팅", "첫만남", "첫인상", "호감", "썸"],
  데이트: ["데이트", "여자친구", "여친"],
  여름: ["여름", "더위", "더울", "장마", "휴가"],
  겨울: ["겨울", "추울", "패딩", "코트"],
  미니멀: ["미니멀", "깔끔", "심플", "단정", "베이직"],
  데일리: ["데일리", "매일", "평소", "일상", "학교", "카페", "주말"],
  오피스: ["오피스", "직장", "출근", "회사", "면접", "정장", "첫출근"],
  체형커버: ["배", "뱃살", "통통", "뚱뚱", "살", "가리", "덩치", "체형", "커버"],
};

function expandToSituations(q: string): string[] {
  const hits = new Set<string>();
  for (const [topic, syns] of Object.entries(SITUATION_SYNONYMS)) {
    if (syns.some((s) => q.includes(s))) hits.add(topic);
  }
  return [...hits];
}

/** 상황 검색(시드). 매칭 0이어도 전부 반환(실패 없는 검색). */
export function searchLooks(query: string): LookCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return LOOK_SEED;
  const situ = expandToSituations(q);
  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = LOOK_SEED.map((l) => {
    let s = 0;
    for (const t of l.situations) {
      if (situ.includes(t)) s += 3;
      if (q.includes(t)) s += 2;
    }
    for (const tok of tokens) {
      if (l.title.toLowerCase().includes(tok)) s += 1;
      if (l.items.some((it) => it.name.toLowerCase().includes(tok))) s += 1;
    }
    return { l, s };
  });
  if (!scored.some((x) => x.s > 0)) return LOOK_SEED;
  return scored.sort((a, b) => b.s - a.s).map((x) => x.l);
}

/**
 * 락인 축 — 신체 프로필로 재정렬(필터). 프로필이 쌓일수록 결과가 '내 몸'에 맞춰짐.
 * 하드 필터가 아니라 부스트(콘텐츠 적을 때 빈 결과 방지). 콘텐츠 늘수록 강하게.
 */
export function applyProfile(looks: LookCard[], p: BodyProfile): LookCard[] {
  if (!p || (!p.bodyType && !p.personalColor)) return looks;
  return [...looks]
    .map((l, i) => {
      let boost = 0;
      if (p.bodyType && l.bodyType?.includes(p.bodyType)) boost += 5;
      if (p.personalColor && p.personalColor !== "모름" && l.personalColor?.includes(p.personalColor)) boost += 3;
      return { l, boost, i };
    })
    .sort((a, b) => b.boost - a.boost || a.i - b.i)
    .map((x) => x.l);
}

export const isVideoSearchLive = () => Boolean(process.env.YOUTUBE_API_KEY);

interface YtItem {
  id: { videoId?: string };
  snippet: { title: string; channelTitle: string; description: string };
}

/**
 * 라이브: YouTube Data API 검색(서버 전용) → 룩 카드로 매핑. 키 없으면 시드.
 * 아이템 분해·정확한 프레임 타임스탬프는 자막/비전 파이프라인의 몫(후속) — 지금은 근사.
 */
export async function searchLooksLive(query: string): Promise<LookCard[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return searchLooks(query);
  try {
    const q = `${query} 남자 코디 룩북`;
    const url =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video` +
      `&maxResults=9&relevanceLanguage=ko&regionCode=KR&q=${encodeURIComponent(q)}&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return searchLooks(query);
    const data = (await res.json()) as { items?: YtItem[] };
    const items = (data.items ?? []).filter((it) => it.id?.videoId);
    if (items.length === 0) return searchLooks(query);
    const situ = expandToSituations(query.toLowerCase());
    return items.map((it) => ({
      id: `${it.id.videoId}-1`,
      videoId: it.id.videoId as string,
      title: it.snippet.title,
      channel: it.snippet.channelTitle,
      situations: situ,
      items: [], // 라이브 아이템 분해는 자막/비전 파이프라인 연결 시 채움
      whyFits: firstSentence(it.snippet.description) || "영상에서 이 룩의 포인트를 확인해봐.",
    }));
  } catch {
    return searchLooks(query);
  }
}

function firstSentence(desc: string): string {
  const clean = desc.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
  const s = clean.split(/(?<=[.!?。])\s+|\n+|·/)[0]?.trim() ?? "";
  return s.length > 6 ? s : "";
}
