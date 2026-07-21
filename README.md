# 무드 (MOOD) — 취향 번역기

> "옷 이름은 몰라도 괜찮아요. 느낌만 적으면, 무드로 보여드려요."

옷을 검색하는 앱이 아니라 **취향을 번역해주는 앱**. 무엇이든(상황·감성·트렌드) 적으면
서로 다른 무드 사진을 펼쳐주고, 눈이 가는 사진을 고를수록 **추구미 카드**로 취향에 이름을 붙여준다.

전략 근거: [`../mood-fashion-strategy-v1.md`](../mood-fashion-strategy-v1.md)
UI/UX 가이드라인: [`../mood-fashion-prototype/UI-UX-guideline.md`](../mood-fashion-prototype/UI-UX-guideline.md)

## 스택

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Supabase(선택) · Vercel 배포
폰트: Wanted Sans(국문) + Space Grotesk(영문·숫자)

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
```

`.env.local` 없이도 **로컬 시드 데이터**로 완전히 동작한다.

## 구조

```
src/
  app/
    layout.tsx           전역 셸 (TopBar · Toast · 추구미 카드 모달 · 폰트)
    page.tsx             홈 = 검색 화면
    results/page.tsx     검색 결과 = 무드 그리드 (?q=)
    mood/[key]/page.tsx  무드 상세 = 사진 + 상품
    archive/page.tsx     내 아카이브 (저장한 무드)
  components/            MoodCard · MoodHero · ProductRow · TasteCardModal · ...
  lib/
    types.ts             데이터 모델 (Supabase 테이블과 1:1)
    moods.ts             Layer 1 무드 축 + Layer 2 검색어 매핑 + resolveMoods()
    products.ts          무드별 상품 시드
    taste.ts             추구미 카드 계산 (규칙 기반)
    store.tsx            클라이언트 상태 (저장/토스트/카드) + localStorage 영속화
    supabase.ts          Supabase 클라이언트 (환경변수 있으면 활성화)
    schema.sql           Supabase 스키마
```

## 핵심 플로우 (전략 §4)

검색(무엇이든) → 무드 그리드(사진만 전시) → 사진 저장(취향 데이터) → 상품 뷰 → 3회 누적 시 추구미 카드

## 설계 원칙 (UI 가이드라인)

- 순백 배경 + 순검정 무채색. 산세리프. 20~30대 남성 타겟.
- **금지: 인기순·트렌드·베스트 배지, 할인율·특가, 별점·판매량** (포지셔닝 방어).
- 브라우징 중엔 무드에 이름을 붙이지 않는다 — 사진에 반응만. 이름은 추구미 카드에서만.

## 로컬 시드 → Supabase 전환

1. Supabase 프로젝트 생성 → SQL Editor에 [`src/lib/schema.sql`](src/lib/schema.sql) 실행
2. `moods` / `products` / `query_map` 에 시드 데이터 삽입 (lib/moods.ts, products.ts 참고)
3. `.env.local` 에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정
4. `lib/moods.ts` / `products.ts` 의 시드 반환부를 `getSupabase()` 조회로 교체

## 다음 작업 (전략 §MVP)

- [ ] 이미지 사용권 확보 후 gradient → 실 룩북 이미지 교체 (최우선 실무 과제)
- [ ] 무드 축 300장 규모 수동 태깅
- [ ] 검색어 매핑 테이블 30~50개 확장 + LLM 번역 연동
- [ ] 익명 세션 기반 저장/검색 로그 → 검증 지표 수집
