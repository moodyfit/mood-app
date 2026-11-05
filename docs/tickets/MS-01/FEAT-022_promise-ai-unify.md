# FEAT-022: 약속 모드 — 언제/예산 삭제, 검색 AI 엔진 통일

## Problem

10/28 회의록: "약속 기능 중복제거 (검색창으로 통일) <에린>". `/promise`(PromiseMode)와
`/search`가 둘 다 "상황→무드 추천"을 하는데, `/promise`는 `resolveMoods`(로컬 키워드 매칭) 룰베이스,
`/search`→`/results`는 Claude AI(`/api/search/translate`)로 서로 다른 엔진을 쓰고 있었다.
"언제"(WHEN)·"예산"(BUDGETS) 단계도 삭제 대상으로 명시됨.

역할 자체는 유지 — `/promise`는 상황 기반 코디 추천, `/search`는 제품 검색 포함 범용 검색(사용자
확인).

## Scope

- `PromiseMode.tsx`: "언제야"(WHEN) · "예산은"(BUDGETS) 섹션·state 삭제.
- 자유 입력·OCCASIONS 칩 클릭 둘 다 `resolveMoods` 대신 `/api/search/translate`(search와 동일
  엔진) 호출로 교체. 비동기라 `loading` 상태·스켈레톤 추가.
- 완성가 계산을 `fitLookToBudget(products, budget)` → `products.reduce(... primaryPrice ...)`로
  단순화(budget 없어졌으니).
- `src/lib/products.ts`의 `BUDGETS`·`fitLookToBudget`·`FitResult` — 다른 소비자 없음(grep 확인)
  확인 후 삭제(데드코드 방지).

## Verification

- Playwright로 자유 입력 "비오는날 재즈바"/"우아한 데이트하고싶어" 테스트 — `/api/search/translate`
  네트워크 호출 실제 발생 확인(네트워크 레벨로 검증, 룰베이스가 아니라 AI 경로 탄다는 증거).
- 화면에서 "언제야"/"예산은" 섹션 완전히 사라짐, 완성가·카드 클릭(→ `/mood/[key]`) 정상.
- `tsc --noEmit`, `npm run build` 통과.
- **PR 미생성 — 로컬 확인 단계(사용자 지시)**.

## 참고

`/api/search/translate`가 thinking 블록 파싱 버그(BUG-012, PR #38)로 간헐적으로 AI 대신
폴백(`resolveMoods`)으로 떨어지는 문제가 아직 main에 남아있음 — #38이 머지되면 이 화면도 같이
안정화됨. 이번 작업 범위 밖이라 손 안 댐.
