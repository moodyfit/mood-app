# FEAT-018: PWA — 홈 화면에 앱처럼 추가

## Problem

10/16 회의록: "릴스에서 앱 검색 대신, 홈화면에 앱처럼 추가하는 기능으로 PWA". 인스타 릴스 등으로
유입된 사용자가 앱스토어에서 검색·설치하는 과정 없이, 웹에서 바로 "홈 화면에 추가"해서 네이티브
앱처럼 쓸 수 있게 한다.

## Scope

- `src/app/manifest.ts` — Next.js App Router의 metadata API로 `manifest.webmanifest` 생성
  (name, short_name, icons, start_url, display: standalone, theme_color, background_color)
- 앱 아이콘 192×192 / 512×512 (최소 요건, maskable 포함)
- `layout.tsx`에 `theme-color`, `apple-mobile-web-app-*` 메타 추가(iOS 홈 화면 추가 시 아이콘·제목 반영)
- Capacitor 빌드(`output: 'export'`)와 공존 확인 — 네이티브 앱은 이미 설치된 상태라 PWA
  설치 유도가 불필요하지만, manifest 자체가 있다고 네이티브 앱 동작을 막지는 않음(그대로 둬도 무해)

## Scope 아님(이번 작업 범위 아님)

- Service worker(오프라인 캐싱) — 회의록 요구사항은 "홈 화면에 추가"이지 오프라인 지원이 아님.
  최신 Chrome은 manifest + https + 아이콘만으로 설치 가능해서 당장 불필요. 필요해지면 후속 티켓.
- 커스텀 설치 유도 배너(`beforeinstallprompt`) — 브라우저 기본 설치 메뉴로 충분한지 먼저 보고,
  전환율이 낮으면 후속으로 추가.

## Done 기준

- Chrome(Android)에서 주소창/메뉴에 "설치" 또는 "홈 화면에 추가" 옵션이 뜬다.
- iOS Safari에서 공유 메뉴 → "홈 화면에 추가" 시 올바른 아이콘·이름으로 추가된다.
- 추가된 앱 아이콘 탭 시 standalone(주소창 없는) 모드로 열린다.
- `npm run build`(Vercel용), `npm run build:cap`(Capacitor용) 둘 다 정상 빌드.
