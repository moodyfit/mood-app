// 데이터 모델 — 향후 Supabase 테이블과 1:1 대응 (lib/schema.sql 참고)

/** 무드 키 = URL 슬러그 겸 DB 조인 키 */
export type MoodKey = string;

/** Layer 1: 무드 축 (moods 테이블) */
export interface Mood {
  key: MoodKey;
  name: string;
  description: string;
  /** 해설 (7.10 '길게 눌러 해줌'): 아이템 명명 + 좋아 보이는 이유 1줄.
   *  질문하는 필요 자체를 제거 — 물어보지 않고 답만 준다(제0조). */
  caption: string;
  /** 실제 룩북 이미지 URL. 없으면 gradient 자리표시자로 렌더 */
  imageUrl?: string;
  /** 프로토타입/폴백용 CSS 그라디언트 */
  gradient: string;
}

/** 판매처 (겹3② PCPartPicker식 횡단 가격 비교) */
export interface ProductSource {
  name: string; // "무신사", "번개장터", "29CM" ...
  price: number; // 원 단위 정수
  affiliateUrl?: string; // 제휴 아웃바운드 (수익화 = 이탈률 기반 커미션)
}

/** 상품 카테고리 (7.10 태깅 스키마 — 자연 번역기·통째로담기 전제) */
export type ProductCategory = "상의" | "하의" | "아우터" | "신발";
/** 가격 티어 (7.10 태깅 스키마) */
export type PriceTier = "로우" | "미드" | "하이";

/** products 테이블 (무드에 매칭된 중고매 가능 아이템) */
export interface Product {
  id: string;
  moodKey: MoodKey;
  name: string;
  category: ProductCategory;
  tier: PriceTier;
  imageUrl?: string;
  gradient: string;
  /** 2~3곳 판매처, price 오름차순. sources[0] = 최저가(primary) */
  sources: ProductSource[];
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
  /** 저장 당시 검색어 (7.8 검색 기억용) */
  query?: string;
}

/** 프로필 무드 벡터 (7.6) — 저장·클릭 누적. moodKey → 가중치 */
export type Affinity = Record<MoodKey, number>;

/** 추구미 카드 계산 결과 */
export interface TasteResult {
  title: string; // "클린 미니멀 × 웜톤 뉴트럴"
  bars: { name: string; pct: number }[];
  /** 포용성 수치 (2.5장): "이 무드 가진 사람, 전체의 X.X%" — 동경 아닌 소속감 */
  rarityPct: number;
}
