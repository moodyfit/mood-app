# BUG-013: Capacitor 앱 빌드에서 API Route가 전부 안 닿음

## Problem

`npm run build:cap`(`BUILD_TARGET=capacitor`, `output: 'export'`)은 정적 HTML만 출력하고
Next.js API Route를 빌드에서 뺀다(CLAUDE.md에 이미 명시된 제약). 그런데 클라이언트 코드는
전부 상대경로로 `fetch("/api/...")`를 호출하고 있어서, 앱(Capacitor WebView)에서는 이 요청들이
구조적으로 전부 실패한다.

영향받는 호출(전수 grep, 2026-11-10 기준):
- `src/app/page.tsx`, `src/app/results/page.tsx`, `src/components/PromiseMode.tsx` —
  `/api/search/translate`
- `src/lib/upload.ts` — `/api/photos/tag`
- `src/app/admin/page.tsx` — `/api/admin/insights`

PromiseMode(#40 코드리뷰 P0-1)에서 처음 드러났지만 PromiseMode만의 문제가 아니다.

### 앱에서의 결과(코드리뷰 P2-4)

API가 안 닿으면 번역 호출 3곳(`page.tsx`/`results/page.tsx`/`PromiseMode.tsx`) 전부 키워드
매칭(`resolveMoods`)으로 대체된다. `QUERY_MAP`에 매칭 키워드가 있는 입력(정의된 상황어 등)은
룰베이스로도 맞는 결과가 나오지만, 매칭 키워드가 없는 입력(대부분의 직접 입력 — 예: "전 직장
동료 결혼식 2차")은 `fallbackMoods`가 글자 수로 무드를 고르기 때문에 뜻과 상관없는 결과가
나온다. 우선순위를 정할 때 이 체감 차이를 참고.

## 원인

1. `capacitor.config.ts`에 `server` 설정이 없어 절대 URL로 분기할 인프라가 없음.
2. Vercel 배포 URL로 절대경로 호출하게 바꿔도, Capacitor WebView 오리진(`capacitor://localhost`)
   에서 외부 도메인으로 요청하려면 서버 쪽 CORS 허용이 필요한데 현재 CORS 헤더 설정이 전혀 없음
   (`grep -rn "Access-Control|cors" src/app/api/ next.config.js` 0건).

## Scope(제안, 착수 전 범위 확정 필요)

- API Route 호출부를 `Capacitor.isNativePlatform()`(기존 `CapacitorInit.tsx` 패턴) 기준으로
  분기해 네이티브에서는 절대 URL(Vercel 배포 도메인)로 호출.
- 해당 API Route들에 CORS 헤더 추가(`capacitor://localhost` 오리진 허용).
- 각 호출부에 이미 있는 폴백(룰베이스 등)은 "API 실패 시 안전망"으로 유지 — 이 티켓의 목표는
  "앱에서도 API가 실제로 닿게" 만드는 것이고, 폴백 제거가 아님.

## Verification 기준

- `npm run build:cap` 산출물을 iOS 시뮬레이터(또는 정적 서버로 흉내)에서 띄워, 위 3개 API 호출이
  실제 응답을 받는지 확인(현재는 전부 실패 확정).
