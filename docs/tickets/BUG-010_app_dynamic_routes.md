# BUG-010: 앱에서 사진 상세·옷 상세로 들어갈 수 없다

Capacitor 앱 빌드에서 `/photo/[slug]`·`/closet/[id]` 가 빠져 있어, 사진·옷을 눌러도 주소만 바뀌고 홈이 그대로 뜬다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | BUG |
| Status | Done |
| 우선순위 | P0 (앱스토어 제출 전) |
| Layer | Build / Routing |
| Related | CAP-001, CAP-002, FEAT-015 |

---

## Problem

- **현재 동작**: Android 앱(에뮬레이터 API 35)에서 홈 사진을 누르면 `location.pathname` 은 `/photo/w-classic-002` 인데 화면은 홈이다. 사진 상세의 상품 연결(FEAT-015)·인앱 브라우저 흐름을 앱에서 쓸 수 없다
- **기대 동작**: 앱에서도 사진 상세·옷 상세가 웹과 같이 열린다
- **영향 범위**: 사진 상세(홈·결과 `PhotoCard`, 업로드 직후 이동), 옷 상세(나의 공간·옷장 목록, 같은 구조라 같은 문제로 추정 — 앱에서 미확인). 웹(Vercel)은 정상

---

## Context

```
관련 파일:
- package.json:10                       build:cap — api·closet/[id]·photo/[slug] 를 옮겨 두고 정적 빌드
- src/app/photo/[slug]/page.tsx:4-8     generateStaticParams [] + "SPA 폴백(CAP-002)으로 처리" 주석
- src/app/closet/[id]/page.tsx:4        같은 주석
- src/components/PhotoCard.tsx:56       router.push(`/photo/${slug}`)
- src/components/upload/UploadForm.tsx:72  router.push(`/photo/${slug}?uploaded=1`)
- src/app/space/page.tsx:52, src/components/Closet.tsx:40  `/closet/${id}` 링크
```

### 원인

`output: 'export'` 는 빌드 때 경로를 열거해야 하는데, 사진 slug 와 옷 id 는 DB·유저 데이터라 열거할 수 없다. CAP-001 에서 두 라우트를 `build:cap` 에서 빼고 "SPA 폴백 라우팅 필요"를 알려진 제한사항으로 남겼지만(CAP-001 티켓 230행), CAP-002 에도 코드에도 폴백이 없다. 앱 WebView 는 모르는 경로에 `index.html` 을 돌려줘 홈이 렌더된다.

### 방법 비교

| 방법 | 장점 | 단점 |
|------|------|------|
| A. 쿼리 라우트 `/photo?slug=`·`/closet/item?id=` | 정적 export 그대로 동작, 업로드 사진·옷 상세도 됨 | 웹 URL 이 바뀜, 링크 생성 4곳 수정 |
| B. 빌드 때 사진 120장 경로 생성 | 웹 URL 유지 | 업로드 사진·옷 상세는 여전히 안 됨, 사진 추가마다 앱 재빌드 |
| C. 앱 셸 폴백(모르는 경로 → 클라이언트에서 경로 해석) | URL 유지 | 홈 `index.html` 에 라우팅 분기 추가, Next 라우터와 이중 관리 |

### 결정 — A (쿼리 라우트)

사진·업로드 사진·옷 상세가 한 번에 풀리고, 사진이 늘어도 앱 재배포가 필요 없다. 옛 `/photo/[slug]`·`/closet/[id]` 는 웹에 그대로 둬 공유 링크가 깨지지 않으므로 리다이렉트는 만들지 않는다. 옷 상세는 `/closet` 이 이미 옷장 목록이라 `/closet/item?id=` 로 둔다.

---

## Scope

### Step 1 — 쿼리 라우트 추가 ✅
1. `src/app/photo/page.tsx` — `?slug=` 로 `PhotoDetail` 렌더, `Suspense` 경계(BUG-005)
2. `src/app/closet/item/page.tsx` — `?id=` 로 `ClosetItem` 렌더, `Suspense` 경계
3. `src/app/photo/[slug]/PhotoDetail.tsx` → `src/app/photo/PhotoDetail.tsx` 이동 — `build:cap` 이 `[slug]` 폴더를 빼므로 그 안에 두면 앱 빌드가 깨진다

### Step 2 — 링크 4곳 교체 ✅
1. `src/components/PhotoCard.tsx:56,73` — `/photo?slug=`
2. `src/components/upload/UploadForm.tsx:72` — `/photo?slug=…&uploaded=1`
3. `src/app/space/page.tsx:52`, `src/components/Closet.tsx:40` — `/closet/item?id=`

### Step 3 — 옛 라우트 주석 정정 ✅
1. `src/app/photo/[slug]/page.tsx:5`, `src/app/closet/[id]/page.tsx:4` — "SPA 폴백(CAP-002)" → "웹 옛 링크용, 앱은 쿼리 라우트"

### Step 4 — 검증 ✅
아래 Verification

### Step 5 — 티켓 Done · PR ✅

---

## Verification

- `tsc` · `build` · `build:cap` 통과. 앱 빌드에 `out/photo.html`·`out/closet/item.html` 생성
- Android 에뮬레이터(API 35) — 홈 사진 탭 → 사진 상세(`/photo?slug=`) 열림, 상품 탭 → 인앱 브라우저(무신사 상품 페이지) → 닫고 복귀, "담을래?" 인라인 표시
- Android — 담은 옷 → 나의 공간 → 옷 상세(`/closet/item?id=`) 열림
- Android — 업로드 직후 이동: 확인 불가. 앱 빌드에서 `/api/photos/tag` 가 빠져 업로드 자체가 안 된다(CAP-001 제한사항, 이 티켓 범위 밖). 링크 교체만 코드로 확인
- 웹(dev) — 옛 `/photo/m-street-010`, 새 `/photo?slug=m-street-010` 둘 다 같은 화면
- iOS 시뮬레이터 (대기, Xcode 필요)

---

## Notes

- 재현: scratch 사본에서 `build:cap` → `npx cap add android` → `assembleDebug`, Node 22 필요(Capacitor CLI 요구)
- FEAT-015 PR #29 검증 항목에서 발견
