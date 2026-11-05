# FEAT-024: 검색 결과 "모두의 결과/너의 결과" 토글 제거

## Problem

10/28 회의록: "검색 이후 보이는 '모두의 결과/너의 결과' 토글 제거". `PhotoGrid`(DB)·`ResultsGrid`
(로컬 폴백) 둘 다 수동 토글(`ResultToggle`)로 개인화 여부를 전환할 수 있었다.

## Scope

- `PhotoGrid.tsx`, `ResultsGrid.tsx`: `ResultToggle` 렌더·`override` state(+ `PhotoGrid`의
  sessionStorage 복원 로직, BUG-008 P1-1)·`onToggle`·`changedCount` 계산 제거.
- `personal`을 `you || formed`로 고정 — 저장 3장 이상(`TASTE_CARD_THRESHOLD`)이면 자동 개인화,
  수동 전환 없음. `/results?you=1`(홈 "내 취향 코디 보기")은 항상 개인화 그대로.
- `ResultToggle.tsx` — 다른 소비자 없음(grep 확인) 삭제.

## Verification

- 로컬에서 `/results?q=소개팅` 렌더 텍스트에 "모두의 결과"/"너의 결과" 문구 둘 다 없음 확인.
- `tsc --noEmit`, `npm run build` 통과.
- **PR 미생성 — 로컬 확인 단계(사용자 지시)**.

## 참고

히어로 카드(개인화 결과에서만 최상위 매치를 전면폭으로)·스크롤 복원(BUG-008)·메이슨리 레이아웃은
그대로 — 토글 UI와 수동 전환 경로만 제거했고, "저장 쌓이면 자동으로 개인화된다"는 동작 자체는
유지된다.
