# BUG-011: 홈 뒤로가기 스크롤 복원 — photos 로딩 레이스

## Problem

`mood-app-blond.vercel.app`에서 홈 사진 클릭 → 상세 → 뒤로가기 시 간헐적으로(프로덕션 관찰 약 6%)
예전 스크롤 위치가 아니라 엉뚱한 값으로 고정되는 버그가 PR #26(BUG-004/BUG-008 복원 로직)
머지 이후에도 재현됨.

## Root cause

두 가지 독립된 경합이 겹쳐 있었다.

1. **복원(restore) effect 레이스**: `usePhotos()`의 `photos` fetch가 끝나기 전, `HomeGallery`는
   6무드 로컬 폴백 UI(짧은 문서 높이)를 렌더한다. 뒤로가기로 리마운트된 직후 복원 effect가
   이 짧은 레이아웃을 "최종 상태"로 보고 스크롤 목표 높이에 못 미친 채 50ms×30회 재시도 끝에
   잘못된 값으로 `scrollTo`하고 완료 처리해버려, 이후 실제 photos가 도착해도 다시 복원을 안 함.
2. **저장(save) effect의 cleanup-vs-타이머 비결정적 레이스**: 카드 클릭(`router.push`) 시점,
   또는 그 직전 스크롤이 약간 움직이는 상황에서 **클릭 전 인스턴스**(아직 unmount 전 — Next.js
   App Router는 다음 페이지 데이터가 준비될 때까지 이전 페이지를 계속 마운트해둔다)의 `onScroll`
   핸들러가 걸려 200ms 디바운스 타이머가 예약된다. 보통은 이 타이머가 실제 unmount(effect
   cleanup의 `clearTimeout`)보다 먼저 취소되지만, unmount가 200ms보다 늦게 끝나면 죽어가는
   인스턴스의 타이머가 먼저 발화해 그 시점의 애매한 `scrollY`를 그대로 `sessionStorage`에
   써버린다. **이건 네트워크·렌더 속도에 좌우되는 비결정적 레이스라 고정된 재현 순서가 없다**
   (Playwright 반복 실측: 로컬 서버 콜드스타트 직후엔 재현, 워밍업 후 동일 시나리오는 거의
   재현 안 됨 — 코드리뷰 P2-1 대응, 아래 Verification 참고).

## Fix

- `useScrollRestore`에 `ready` 파라미터 추가 — `HomeGallery`가 `usePhotos()`의 `loading`을
  `!loading`으로 넘겨, photos 로딩 중엔 복원 effect 자체를 미룸(`src/lib/hooks/useScrollRestore.ts`,
  `src/components/HomeGallery.tsx`, `src/app/page.tsx`).
- `onScroll`의 200ms 디바운스 타이머 콜백 내부에서 `restoredRef.current`를 실행 시점에
  재확인하도록 추가(`src/lib/hooks/useScrollRestore.ts`) — 원인 2의 레이스가 실제로 발생했을
  때만 작동하는 안전망이라 평소엔 영향이 없다.

`PhotoGrid`(`/results`)는 `loading`을 가드한 뒤에만 마운트되는 구조라 1번 레이스 대상이 아니고,
`ready` 기본값(`true`)으로 영향 없음.

## Verification

- Playwright(webkit)로 `page.route()`를 사용해 `**/rest/v1/photos*`를 2초 인위 지연 후 뒤로가기.
- **대조 실험(코드리뷰 P2-1 대응)**: 동일 시나리오를 (a) 가드 포함, (b) 가드만 제거(ready는 유지)
  두 버전으로 프로덕션 빌드(`next build && next start`, StrictMode 無)에서 각각 반복 실행.
  - 서버 콜드스타트 직후: (b) 3/3 FAIL(`scrollY` 67 등으로 깨짐) vs (a) 3/3 PASS — 가드가
    실제로 막아주는 레이스가 독립적으로 존재함을 확인.
  - 서버 워밍업 후 동일 (b) 시나리오: 6/6 PASS — 위 "원인 2" 설명대로 cleanup과 타이머 발화
    순서에 좌우되는 비결정적 레이스라, 조건에 따라 재현 여부가 갈림(디버그 로그로 타임스탬프
    추적해 클릭 직전 onScroll → 구 인스턴스 cleanup 경쟁까지 확인).
  - 결론: 가드는 "매번 트리거되는 수정"이 아니라 레이스가 실제로 발생했을 때만 작동하는
    안전망이며, 해가 없고 독립적으로 유효하므로 유지.
- 지연 없는 일반 시나리오 10회 반복 — 전부 정상(회귀 없음).
- `tsc --noEmit`, `npm run build` 통과.
