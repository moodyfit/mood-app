// 데이터 모델 — 향후 Supabase 테이블과 1:1 대응 (lib/schema.sql 참고)

/** 무드 키 = URL 슬러그 겸 DB 조인 키 */
export type MoodKey = string;

/** Layer 1: 무드 축 (moods 테이블) */
export interface Mood {
  key: MoodKey;
  name: string;
  description: string;
  /** 실제 룩북 이미지 URL. 없으면 gradient 자리표시자로 렌더 */
  imageUrl?: string;
  /** 프로토타입/폴백용 CSS 그라디언트 */
  gradient: string;
}

/** products 테이블 (무드에 매칭된 중고매 가능 아이템) */
export interface Product {
  id: string;
  moodKey: MoodKey;
  name: string;
  price: number; // 원 단위 정수
  source: string; // "무신사 · 새상품" 등
  imageUrl?: string;
  gradient: string;
  /** 제휴 아웃바운드 링크 (수익화 = 이탈률 기반 커미션) */
  affiliateUrl?: string;
}

/** Layer 2: 검색어 → 무드 매핑 (query_map 테이블). 상품과 무관, 이 테이블만 튜닝 */
export interface QueryMapping {
  keyword: string;
  moodKeys: MoodKey[];
}

/** 저장(찜) 로그 = 취향 데이터 (user_saves 테이블) */
export interface SaveRecord {
  moodKey: MoodKey;
  savedAt: number;
}

/** 추구미 카드 계산 결과 */
export interface TasteResult {
  title: string; // "클린 미니멀 × 웜톤 뉴트럴"
  bars: { name: string; pct: number }[];
}
