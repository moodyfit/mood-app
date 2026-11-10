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
- `tsc --noEmit`, `npm run build` 통과. PR #40.

## 참고

`/api/search/translate`가 thinking 블록 파싱 버그(BUG-012, PR #38)로 간헐적으로 AI 대신
폴백(`resolveMoods`)으로 떨어지는 문제가 아직 main에 남아있음 — #38이 머지되면 이 화면도 같이
안정화됨. 이번 작업 범위 밖이라 손 안 댐.

Capacitor 앱 빌드(`output: "export"`)엔 이 API 라우트 자체가 없어서 catch가 매번 실행되는
문제는 PromiseMode만의 문제가 아니라 프로젝트 전역 구조 문제 — 별도 BUG-013 티켓으로 분리
(코드리뷰 P0-1). 이 PR엔 catch에서 `resolveMoods`로 폴백하는 안전망만 추가했다.

코드리뷰 P0-2(늦게 온 응답이 최신 요청을 덮어씀)는 `requestRef` 토큰으로, P1-1(blur 중복
요청)은 "이미 처리한 값이면 건너뜀"으로 반영했다. P1-2(검색에서 뺀 칩 옮기기)는 대응 칩 없는
것만 "이런 느낌도 돼" 섹션으로 옮기고, '오늘의 추천'(날짜 로테이션)은 별도 로직이라 범위 밖으로
남겼다.
