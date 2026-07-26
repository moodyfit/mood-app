// 픽어뷰 패션판 — 고민(자연어) 검색 → 관련 패션 유튜버 영상 + 핵심 요약.
// 기본: 큐레이션 시드(키 없이 즉시 동작). 라이브: YOUTUBE_API_KEY 있으면 실검색으로 승격.
// 정체성 주의: '취향 전시(홈)'와 다른 실용 축(7.7) — "이 고민 어떻게?"에 전문가 영상으로 직답.

export interface FashionVideo {
  id: string; // YouTube video id
  title: string;
  channel: string;
  topics: string[]; // 자연어 매칭용 태그
  summary: string[]; // 핵심 3줄 (시드는 제목·주제 기반, 라이브는 설명/자막 기반)
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

// 큐레이션 시드 — 전부 실제 영상(실검색으로 수집한 실 video id). 요약은 제목·주제 기반 핵심.
export const VIDEO_SEED: FashionVideo[] = [
  {
    id: "14UQ8qCvBOk",
    title: "요즘 입기 좋은 남자 여름 코디 30개",
    channel: "남자 패션 코디",
    topics: ["여름", "계절", "데일리", "코디아이디어", "린넨", "더위"],
    summary: [
      "여름에 바로 입을 수 있는 코디 30가지를 아이템 조합 단위로 훑어줘.",
      "톤 줄이고 시원한 소재(린넨·시어서커)로 더위에도 정돈돼 보이게.",
      "따라 사기 쉽게 아이템별로 끊어서 보여줌.",
    ],
  },
  {
    id: "hia93-3Ha0k",
    title: "따라만 입어도 호감 300% 남자 여름 코디",
    channel: "남자 패션 코디",
    topics: ["소개팅", "데이트", "호감", "첫인상", "여름", "깔끔"],
    summary: [
      "첫인상에서 호감 주는 여름 코디를 상황별로 제안.",
      "과하지 않게, 색을 줄여 단정하게 잡는 게 핵심.",
      "소개팅·데이트에 바로 쓰는 조합 위주.",
    ],
  },
  {
    id: "pjLruE5lzFQ",
    title: "남자 캐주얼무드 데일리룩 코디",
    channel: "데일리룩",
    topics: ["미니멀", "데일리", "캐주얼", "무드", "기본템", "꾸안꾸"],
    summary: [
      "힘 뺀 캐주얼 무드로 매일 입기 좋은 데일리룩.",
      "톤 맞추고 핏만 신경 써도 정돈돼 보이는 법.",
      "기본 아이템으로 무드 만드는 조합.",
    ],
  },
  {
    id: "e9MdY-OwHik",
    title: "뚱뚱한 남자 코디 노하우 다 뿌림",
    channel: "식스타일",
    topics: ["체형커버", "통통", "배", "살", "핏", "덩치"],
    summary: [
      "체형을 편하게 보이게 하는 핏·기장 노하우.",
      "너무 붙는 핏 피하고 세로 라인 살리기.",
      "짧고 굵게 핵심만.",
    ],
  },
  {
    id: "16puo9K3fog",
    title: "셔츠 하나로 멋쟁이 되기, 이 영상 하나로 끝",
    channel: "데일리룩",
    topics: ["셔츠", "데일리", "레이어드", "기본템", "봄", "가을"],
    summary: [
      "셔츠 한 장으로 인상 바꾸는 활용법.",
      "걸치기·레이어드로 층 만드는 팁.",
      "기본템 셔츠 200% 쓰기.",
    ],
  },
];

// 고민(자연어) → 주제 확장 사전. 변형어를 주제로 접어 매칭률↑ (검색 실패 없음 원칙).
const CONCERN_SYNONYMS: Record<string, string[]> = {
  체형커버: ["배", "뱃살", "통통", "뚱뚱", "살", "가리", "덩치", "체형", "커버"],
  소개팅: ["소개팅", "첫만남", "첫인상", "호감", "데이트", "썸"],
  여름: ["여름", "더위", "더울", "장마", "휴가"],
  겨울: ["겨울", "추울", "패딩", "코트"],
  미니멀: ["미니멀", "깔끔", "심플", "단정", "베이직"],
  데일리: ["데일리", "매일", "평소", "일상", "출근", "학교"],
  셔츠: ["셔츠", "남방"],
  오피스: ["오피스", "직장", "출근", "회사", "면접", "정장"],
  꾸안꾸: ["꾸안꾸", "꾸안못", "힘빼", "자연스럽"],
};

function expandQueryToTopics(q: string): string[] {
  const hits = new Set<string>();
  for (const [topic, syns] of Object.entries(CONCERN_SYNONYMS)) {
    if (syns.some((s) => q.includes(s))) hits.add(topic);
  }
  return [...hits];
}

/** 시드 대상 자연어 검색 — 주제 확장 + 제목/토픽 키워드 점수. 매칭 0이어도 전부 반환(실패 없는 검색). */
export function searchVideos(query: string): FashionVideo[] {
  const q = query.trim().toLowerCase();
  if (!q) return VIDEO_SEED;
  const topics = expandQueryToTopics(q);
  const tokens = q.split(/\s+/).filter(Boolean);

  const scored = VIDEO_SEED.map((v) => {
    let s = 0;
    for (const t of v.topics) {
      if (topics.includes(t)) s += 3;
      if (q.includes(t)) s += 2;
    }
    for (const tok of tokens) {
      if (v.title.toLowerCase().includes(tok)) s += 1;
      if (v.topics.some((t) => t.includes(tok))) s += 1;
    }
    return { v, s };
  });
  const anyHit = scored.some((x) => x.s > 0);
  if (!anyHit) return VIDEO_SEED; // 폴백: 전부 보여줌
  return scored.sort((a, b) => b.s - a.s).map((x) => x.v);
}

export const isVideoSearchLive = () => Boolean(process.env.YOUTUBE_API_KEY);

interface YtItem {
  id: { videoId?: string };
  snippet: { title: string; channelTitle: string; description: string };
}

/**
 * 라이브: YouTube Data API 검색(서버 전용). 키 없으면 시드 검색으로 폴백.
 * 요약은 설명(description) 기반 3줄 — 자막·LLM 요약은 후속(정직 표기: '설명 기반').
 */
export async function searchVideosLive(query: string): Promise<FashionVideo[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return searchVideos(query);
  try {
    const q = `${query} 남자 패션 코디`;
    const url =
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video` +
      `&maxResults=9&relevanceLanguage=ko&regionCode=KR&q=${encodeURIComponent(q)}&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return searchVideos(query);
    const data = (await res.json()) as { items?: YtItem[] };
    const items = (data.items ?? []).filter((it) => it.id?.videoId);
    if (items.length === 0) return searchVideos(query);
    return items.map((it) => ({
      id: it.id.videoId as string,
      title: it.snippet.title,
      channel: it.snippet.channelTitle,
      topics: expandQueryToTopics(query.toLowerCase()),
      summary: summarizeDescription(it.snippet.description),
    }));
  } catch {
    return searchVideos(query);
  }
}

// 설명 → 핵심 3줄(문장 분리 후 상위 3). 자막·LLM 요약 대체 전까지의 정직한 근사.
function summarizeDescription(desc: string): string[] {
  const clean = desc.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
  if (!clean) return ["영상 설명이 짧아 요약이 제한적이야 — 눌러서 직접 확인해봐."];
  const sentences = clean.split(/(?<=[.!?。])\s+|\n+|·/).map((s) => s.trim()).filter((s) => s.length > 6);
  return sentences.slice(0, 3);
}
