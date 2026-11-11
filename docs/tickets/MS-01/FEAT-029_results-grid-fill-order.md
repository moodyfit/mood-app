# FEAT-029: 결과 그리드 2열 채움 순서 — CSS 멀티컬럼 → 좌우 교대

## Problem

사용자가 /results를 직접 보다가, 2열 그리드가 "왼쪽 열을 먼저 끝까지 채운 뒤 오른쪽으로 넘어가는"
순서로 쌓이는 걸 확인했다(CSS `columnCount`의 기본 동작). 반면 홈(`HomeGallery.tsx`)은 이미
인덱스를 좌우에 번갈아 배분하는 방식이라 왼-오-왼-오 순서로 쌓인다. 두 화면이 서로 다른 채움
순서를 쓰고 있었고, 사용자는 홈 쪽 방식(왼-오-왼-오)으로 통일하길 원함.

## Scope

- `PhotoGrid.tsx`(DB photos), `ResultsGrid.tsx`(로컬 폴백 무드 커버) — `columnCount:2` CSS
  멀티컬럼을 걷어내고, `HomeGallery.tsx`와 동일한 기술(배열을 `i%2`로 좌/우에 배분 → 두 개의
  `flex flex-col` 컬럼)로 교체.
- 히어로 카드, 무한스크롤, 검색/개인화 순서(`rankPhotos`/`rankPersonalized` 등) 로직은 그대로 —
  "어떤 순서로 보여줄지"가 아니라 "그 순서를 화면에 어떻게 배치할지"만 바꾼다.
- `HomeGallery.tsx`는 이미 이 방식이라 변경 없음.

## Verification

- `/results?q=와이드+슬랙스` 로컬에서 카드 순서가 왼-오-왼-오로 쌓이는지 확인.
- `tsc --noEmit`, `npm run build` 통과.

## 참고

PhotoGrid.tsx/ResultsGrid.tsx는 #42(FEAT-024)·#43(FEAT-025)이 이미 수정 중이라, 이 브랜치는
FEAT-025(#43) 위에 스택한다. 머지 순서: #42 → #43 → 이 PR.
