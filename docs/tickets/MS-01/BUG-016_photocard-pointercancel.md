# BUG-016: 히어로 카드가 간헐적으로 검정 화면(Safari)

## Problem

사용자 보고: 히어로 카드가 가끔 검정 화면으로 나옴, Safari에서만 발생. 로컬/배포 환경 문제가
아닌지 질문 → 코드 조사로 환경과 무관한 실제 버그로 확인.

## 원인

`PhotoCard.tsx`의 롱프레스 처리가 `onPointerDown`/`onPointerUp`/`onPointerLeave`만 처리하고
`onPointerCancel`이 없었다. 380ms 롱프레스 타이머가 끝나기 전에 제스처가 스크롤로 판정되면
브라우저는 `pointerup`이 아니라 `pointercancel`을 보내는데, 이게 안 잡혀서 타이머가 끝나
`caption=true`가 된 뒤 아무것도 되돌리지 못하고 영원히 고정됐다. `caption=true`면 전면을
덮는 `rgba(26,26,26,0.72)` 롱프레스 해설 오버레이가 화면에 남는데, 히어로 카드는 전면폭이라
"검정 화면"처럼 보인다. `pointerleave`만으론 못 잡는 이유 — 포인터가 같은 자리에서 들려서
leave가 발생하지 않는 경우가 있다.

Safari에서만 두드러지는 이유: 스크롤-vs-탭 제스처 판정과 `pointercancel` 발생 타이밍이
브라우저마다 달라서(Safari가 트랙패드/터치 제스처에서 더 잘 보냄).

## Fix

`up()`의 정리 로직(타이머 clear + `setCaption(false)`)을 `cancelPress()`로 분리해서
`onPointerLeave`·`onPointerCancel` 둘 다에서 재사용.

## Verification

- Playwright로 `pointerdown` → 380ms 대기(캡션 오버레이 opacity 1 확인) → `pointerup` 대신
  `pointercancel` 발생 → opacity 0으로 복귀 확인.
- `tsc --noEmit`, `npm run build` 통과.
