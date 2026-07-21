# 무드핏 (MOODFIT) — 내 추구미만 모아두는 곳

> 꾸미고 싶은데 꾸밀 줄 모르는 남자를 위한 · "설명 못 해도 눈에만 있으면, 사게 해준다."

옷 검색 앱이 아니라 **내 추구미만 모아두는 곳**(장소화, 제0조). 취향은 유저의 것, 실행은 무드핏의 것 —
무엇이든 적으면 무드 사진을 펼쳐주고, 고른 사진으로 취향에 이름을 붙이고(추구미 카드),
**내 예산 안에서 그 느낌을 실행 가능하게** 재구성해준다(자연 번역기).
자책이 아니라 복구 — "너는 취향이 없는 게 아니라 이름을 몰랐던 거다"(원칙 7).

전략 v2.1 반영 노트: [`docs/strategy-v2.1.md`](docs/strategy-v2.1.md)
전략 v1.9 반영 노트: [`docs/strategy-v1.9.md`](docs/strategy-v1.9.md)
전략 v1.8 반영 노트: [`docs/strategy-v1.8.md`](docs/strategy-v1.8.md)
전략 v1.5 반영 노트: [`docs/strategy-v1.5.md`](docs/strategy-v1.5.md)
전략 v1.4 반영 노트: [`docs/strategy-v1.4.md`](docs/strategy-v1.4.md)
이미지 소싱 전략 v1.4: [`docs/image-sourcing-v1.4.md`](docs/image-sourcing-v1.4.md)
UI/UX 가이드라인: [`../mood-fashion-prototype/UI-UX-guideline.md`](../mood-fashion-prototype/UI-UX-guideline.md)

## 시그니처 모먼트 3종 (체감 차별화 본체)

1. **아무말 검색 → "알아먹는다"** — 미매핑·빈 입력도 최근접 무드로 응답 (실패 없는 검색)
2. **무드 완성가 → "이 살 수 있다"** — 상세에 "이 룩 완성 · N만" (연결 상품 최저가 합산)
3. **[모두의 결과 ↔ 너의 결과] 토글** — 취향 학습을 유저가 직접 조작 (추구미 카드 발급 후)

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
    space/page.tsx       나의 공간 (추구미 프로필 + 무드 지도 + 내 방)
  components/            SearchScreen · ResultsGrid(토글) · SearchMemory(검색기억) · MoodCard
                         · MoodHero(완성가) · ProductSection(추천 이유) · ProductRow(판매처 병기)
                         · TasteCardModal · TasteProfile · MoodMap(별자리) · Room(내 방) · ...
  lib/
    types.ts             데이터 모델 (Supabase 테이블과 1:1) + Affinity
    moods.ts             Layer 1 무드 축 + Layer 2 검색어 매핑 + resolveMoods()
    products.ts          무드별 상품 시드
    taste.ts             추구미/개인화 정렬 (affinity 프로필 벡터 기반, 규칙)
    store.tsx            클라이언트 상태 (저장·프로필 벡터·검색기억·카드) + localStorage
    supabase.ts          Supabase 클라이언트 (환경변수 있으면 활성화)
    schema.sql           Supabase 스키마
```

## 핵심 플로우 (전략 §4)

(진입: 검색 / **3초 취향 스캔** / **스샷으로 찾기**) → 무드 그리드(사진만, **길게 누르면 해설**) → 사진 저장(취향 데이터)
→ 상품 뷰(+ **자연 번역기**: 내 예산으로 이 느낌) → 3회 누적 시 추구미 카드
→ **나의 공간**(추구미 프로필·무드 지도·내 방·상시 취향 스캔) = N3 재방문 엔진

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

- [x] 무드 이미지 = AI 생성 스트릿샷 (gradient → 실사진 교체 완료, 무드당 1장 시드)
- [ ] AI 스트릿샷 무드당 15~20장으로 증량 → 파일럿 100장 (docs/image-sourcing-v1.4.md)
- [ ] 무드 축 규모 수동 태깅 + 실상품 3~5개 매칭
- [ ] 검색어 매핑 테이블 30~50개 확장 + LLM 번역 연동
- [ ] 익명 세션 기반 저장/검색 로그 → 검증 지표 수집
