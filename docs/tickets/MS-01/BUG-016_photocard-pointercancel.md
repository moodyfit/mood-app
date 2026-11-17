# BUG-016: 히어로 카드가 간헐적으로 검정 화면(Safari)

## Problem

사용자 보고: 히어로 카드가 가끔 검정 화면으로 나옴, Safari에서만 발생(Chrome 미재현). 로컬/
배포 환경 문제가 아닌지 질문 → 코드 조사로 환경과 무관한 실제 버그로 확인.

## 원인 1 — `pointercancel` 미처리(1차 수정, 재현 지속됨)

`PhotoCard.tsx`의 롱프레스 처리가 `onPointerDown`/`onPointerUp`/`onPointerLeave`만 처리하고
`onPointerCancel`이 없었다. 380ms 롱프레스 타이머가 끝나기 전에 제스처가 스크롤로 판정되면
브라우저는 `pointerup`이 아니라 `pointercancel`을 보내는데, 이게 안 잡혀서 타이머가 끝나
`caption=true`가 된 뒤 아무것도 되돌리지 못하고 영원히 고정됐다 — 전면을 덮는
`rgba(26,26,26,0.72)` 롱프레스 해설 오버레이가 화면에 남는 증상. `cancelPress()`로 분리해서
`onPointerLeave`·`onPointerCancel` 둘 다에서 재사용하도록 고쳤다.

**1차 수정 후에도 사용자가 재현 지속 보고** — 포인터 이벤트와 무관한 별개 원인이 더 있었음.

## 원인 2 — WebKit border-radius+overflow:hidden+transform 합성 버그

`PhotoCard` 루트 `div`가 `rounded-2xl overflow-hidden` + `transition active:scale-[0.98]`를
같이 쓰고, 부모 쪽에서 `.animate-rise`(마운트 시 `scale(0.985)→1` 애니메이션)로 감싸는 구조다.
Safari(WebKit)는 **border-radius + overflow:hidden인 요소에 transform이 겹치면 배경 레이어
합성이 깨져 검게 렌더되는 오래된 버그**가 있다(WebKit Bug
[77572](https://bugs.webkit.org/show_bug.cgi?id=77572), 다수 사례 보고:
[denisbouquet.com](https://www.denisbouquet.com/safari-bug-border-radius-with-overflow-hidden-and-image-scale-zoom-animation/),
[gist](https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0)). Chrome(Blink)은 이
버그가 없어 미재현. "가끔"인 이유 — GPU 레이어 승격/해제 타이밍에 좌우되는 비결정적 버그.

## Fix

`will-change: transform`으로 합성 레이어를 미리 고정하면 이 버그가 재현되지 않는다(널리
알려진 워크어라운드). 작은 카드는 무한스크롤로 최대 216장까지 떠 있을 수 있어서(FEAT-010)
전부에 강제하면 메모리 부담 — 보고된 증상이 히어로 카드(화면당 1장)뿐이라 `hero`일 때만
적용.

## Verification

- `tsc --noEmit`, `npm run build` 통과.
- Playwright(Chromium)로는 이 버그 자체가 WebKit 전용이라 재현/검증이 안 됨 — 실제 Safari에서
  수동 확인 필요(사용자).
