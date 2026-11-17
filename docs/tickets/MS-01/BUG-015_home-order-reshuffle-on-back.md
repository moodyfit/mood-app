# BUG-015: 사진 클릭→뒤로가기 시 카드 배열이 바뀜

## Problem

사용자 피드백: "코디 눌렀다가 뒤로가기 하면, 스크롤 위치는 예전이랑 똑같이 유지되는데 카드
배열 자체가 바뀌어서 예전에 봤던 카드가 안 보인다 — 취향 반영을 위한 장치 때문인 것 같은데
어색하다."

## 원인

`PhotoCard.tsx`의 `up()`이 사진 상세로 이동할 때마다 `recordView(photo.mood_vector)`로
`affinity`(취향 점수)를 갱신한다. `HomeGallery.tsx`의 피드 순서(`ordered`)는 `affinity`가
바뀔 때마다 `useMemo`로 다시 랭킹된다 — 그래서 사진 한 장만 눌러도 그 직후 뒤로가기로 돌아오면
전체 피드 순서가 새로 계산된다. 스크롤 위치(px)는 BUG-004/008/011로 복원되지만, 그 위치에
있던 "카드"는 이미 달라져 있다.

## Fix

같은 탭 세션 안에서 한 번 보여준 피드 순서를 `sessionStorage`(`moodfit:home-order`)에
스냅샷으로 남기고, 검색 모드가 아니면 그 순서를 그대로 재사용한다. 새로 추가된 사진(스냅샷에
없는 id)은 뒤에 덧붙이고, 없어진 사진(현재 `photos`에 없는 id)은 건너뛴다. 취향 반영 자체는
막지 않는다 — 다음 세션(새 탭, `sessionStorage`가 비는 새로고침 뒤 첫 방문)부터는 최신
`affinity`로 다시 랭킹된다.

## Verification

- Playwright로 재현: 홈 로드 → 카드 배경이미지 URL 순서 기록 → 첫 카드 클릭(상세 이동,
  `recordView` 발생) → 뒤로가기 → 카드 순서 다시 기록 → 12/12 일치 확인.
- `tsc --noEmit`, `npm run build` 통과.
