// FEAT-002 — 좋아요 누른 사진과 비슷한 사진 추천(아이템-아이템 유사도).
// 유저 개인화(rank.ts, affinity)와는 별개 — "이 사진" × "다른 사진들"의 스타일 형태 유사성만 본다.
import type { Photo } from "./photos";

/** 코사인 유사도 — 두 mood_vector의 "형태"가 얼마나 비슷한지(방향), 절대 크기는 무시.
 *  다축 벡터라 내적만 쓰면 축 개수·크기 차이에 민감해서, 취향 강도(rank.ts)와 달리
 *  스타일 유사성 목적엔 코사인이 더 적합. */
export function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const k of keys) {
    const av = a[k] ?? 0;
    const bv = b[k] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/** 기준 사진과 후보 사진들의 유사도 랭킹 — 자기 자신 제외, 유사도 내림차순 상위 limit개.
 *  90장 규모라 O(N²) 전량 스캔 문제없음(인덱스·캐싱 불필요). */
export function rankSimilarPhotos(target: Photo, candidates: Photo[], limit = 10): Photo[] {
  return candidates
    .filter((p) => p.id !== target.id)
    .map((p) => ({ p, sim: cosineSimilarity(target.mood_vector ?? {}, p.mood_vector ?? {}) }))
    .filter((x) => x.sim > 0)
    .sort((a, b) => b.sim - a.sim)
    .slice(0, limit)
    .map((x) => x.p);
}
