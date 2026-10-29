# BUG-012: Claude API 응답에서 thinking 블록 때문에 간헐적으로 폴백

## Problem

프로덕션에서 자연어 검색(`/search` → `/results`)이 검색어에 따라 LLM 처리가 되기도, 안 되기도
하는 게 확인됨(`/api/search/translate?q=...`의 응답 `source`가 `"ai"`/`"fallback"`을 오감).
업로드 자동 태깅(`/api/photos/tag`)도 같은 패턴이라 영향받을 가능성 있음.

## Root cause

`claude-sonnet-5`는 기본으로 extended thinking이 켜져 있어, 응답 `content` 배열에 `thinking`
타입 블록이 `text` 타입 블록보다 앞에 올 수 있다. 두 라우트 모두 `content[0].text`로 첫 번째
블록만 읽고 있었는데, 첫 블록이 `thinking`이면 `.text`가 `undefined`라 JSON 파싱 정규식이
매치 실패 → 조용히 폴백(검색은 `resolveMoods` 키워드 매칭, 태깅은 에러)으로 떨어진다.

thinking 블록 포함 여부가 검색어/이미지마다 달라서(모델 응답 특성) 간헐적으로만 재현됨 —
"비오는날 재즈바"는 3/3 fallback, "우아한 데이트하고싶어"는 ai로 실측 확인(수정 전).

## Fix

`content[0]` 대신 `content.find((b) => b.type === "text")`로 실제 텍스트 블록을 찾도록 수정.

- `src/app/api/search/translate/route.ts`
- `src/app/api/photos/tag/route.ts`

## Verification

- 로컬에서 "비오는날 재즈바"(수정 전 3/3 fallback) 재시도 — 수정 후 3/3 `source: "ai"`.
- 다른 검색어들("첫데이트...", "우아한 데이트...", "비즈니스 캐주얼", "힙한 스트릿룩") 전부 `ai`.
- `tsc --noEmit`, `npm run build` 통과.
