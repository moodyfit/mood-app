# FEAT-025: 검색 결과 카드 — 제목 상시 노출, 헤더 문구 정리

## Problem

사용자 테스트(search 결과 화면 스크린샷 기반):
- 헤더 "'q' — 대충 쳐도 돼"의 "대충 쳐도 돼"가 제품 검색에는 안 어울림(자연어 검색 전용 톤).
- 첫 카드(히어로/hint)만 캡션(제목+부가설명)이 보이고 나머지는 롱프레스해야만 보여서
  비일관적 — 가독성을 위해 모든 카드에 제목만 상시 노출하는 게 낫다는 피드백.

## Scope

- `PhotoCard.tsx`: `hint` prop 제거, 모든 카드(`hero` 여부 무관)에 `caption_item`(제목)을
  상시 노출. 부가설명(`caption_why`)은 상시 노출에서 빼고 롱프레스 전문 오버레이에만 유지.
  제목 글자 크기를 12.5px → 13.5px로 키움.
- `PhotoGrid.tsx`, `ResultsGrid.tsx`: 헤더에서 "— 대충 쳐도 돼" 제거, 검색어만 표시.
- `HomeGallery.tsx`: `PhotoCard`의 `hint` prop 제거(타입 변경에 맞춤) — 홈 피드도 이제 모든
  카드에 제목이 보임(일관성, 범위 자연 확장).

## Verification

- 로컬 Playwright로 `/results?q=와이드+슬랙스` 스크린샷 확인 — 헤더가 `'와이드 슬랙스'`로
  단순화, 모든 카드에 제목 상시 노출됨.
- `tsc --noEmit`, `npm run build` 통과.
- **PR 미생성 — 로컬 확인 단계(사용자 지시)**.
