# FEAT-024: 검색 결과 "모두의 결과/너의 결과" 토글 제거

## Problem

10/28 회의록: "검색 이후 보이는 '모두의 결과/너의 결과' 토글 제거". `PhotoGrid`(DB)·`ResultsGrid`
(로컬 폴백) 둘 다 수동 토글(`ResultToggle`)로 개인화 여부를 전환할 수 있었다.

## Scope

- `PhotoGrid.tsx`, `ResultsGrid.tsx`: `ResultToggle` 렌더·`override` state(+ `PhotoGrid`의
  sessionStorage 복원 로직, BUG-008 P1-1)·`onToggle`·`changedCount` 계산 제거.
- `personal`을 `you`로 고정 — 검색 결과(`you=false`)는 저장량과 상관없이 항상 검색 순서,
  `/results?you=1`(홈 "내 취향 코디 보기")만 항상 개인화(코드리뷰 P0-1 — 처음엔
  `you || formed`로 고정했다가, 저장 3장 이상이면 검색어와 무관하게 결과가 거의 똑같아지는
  버그를 소피 코드리뷰에서 발견해 수정함).
- `ResultToggle.tsx` — 다른 소비자 없음(grep 확인) 삭제.

## Verification

- 로컬에서 `/results?q=소개팅` 렌더 텍스트에 "모두의 결과"/"너의 결과" 문구 둘 다 없음 확인.
- `tsc --noEmit`, `npm run build` 통과. PR #42.

## 참고

히어로 카드·스크롤 복원(BUG-008)·메이슨리 레이아웃은 그대로 — 토글 UI와 수동 전환 경로만
제거했다. "저장 쌓이면 자동 개인화"는 `/results?you=1`에서만 의미 있고, 검색 결과에선 저장량이
검색 순서를 덮지 않는다(코드리뷰 P0-1).
