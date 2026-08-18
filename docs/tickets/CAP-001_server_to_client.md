# CAP-001: 서버 컴포넌트 → 클라이언트 전환 + 정적 빌드

Capacitor 정적 빌드(`output: 'export'`)를 위해 서버 컴포넌트 5개를 클라이언트로 전환하고, 데이터 페칭을 커스텀 훅으로 추상화. API Route 비호환 처리 포함.

---

## Metadata

| Key | Value |
|-----|-------|
| Prefix | CAP |
| Type | FEAT |
| Severity | Critical |
| Layer | app / lib |
| Milestone | MS-00 |
| Status | In Progress |
| 예상h | 5 |
| 우선순위 | P0 |
| Depends | — |
| Related | CAP-002, FE-FEAT-012 |

---

## Problem

- **현재 동작**: 5개 페이지가 서버 컴포넌트로 Supabase/YouTube API를 직접 호출 (ISR 60초 캐시). Vercel 서버가 요청마다 HTML을 생성. API Route 1개(`/api/admin/insights`)가 서버 전용 환경변수 사용.
- **기대 동작**: 모든 페이지가 클라이언트에서 렌더링. `next build`가 정적 HTML을 출력하여 Capacitor WebView에서 서버 없이 동작. API Route는 앱 빌드에서 제외.
- **영향 범위**: `src/app/` 페이지 5개, `src/app/api/` 1개, `src/lib/supabase.ts`, `next.config.mjs`

### 비즈니스 근거

> Capacitor는 앱 안에 빌드된 HTML 파일을 넣고 WebView로 여는 구조. 서버가 없으므로 서버 컴포넌트(`async function`, `revalidate`, `notFound()`)가 실행될 수 없다. 정적 빌드 전환이 Capacitor 도입의 전제조건.

---

## Context

### 현재 서버 컴포넌트 (전환 대상)

| 파일 | 서버 의존성 | 전환 난이도 |
|------|-----------|-----------|
| `src/app/page.tsx` | `fetchPhotos()`, `revalidate = 60` | 중 |
| `src/app/results/page.tsx` | `fetchPhotos()`, `rankPhotos()`, `searchParams` 서버 접근, `revalidate = 60` | 상 |
| `src/app/mood/[key]/page.tsx` | `getProductsForMood()`, `notFound()`, `dynamic = "force-dynamic"` | 중 |
| `src/app/photo/[slug]/page.tsx` | `fetchPhotoBySlug()`, `getProductsForPhoto()`, `notFound()`, `revalidate = 60` | 중 |
| `src/app/watch/page.tsx` | `searchLooksLive()`, `isVideoSearchLive()`, `searchParams` 서버 접근, `revalidate = 60` | 중 |

### API Route (정적 빌드 비호환)

| 파일 | 문제 | 처리 방안 |
|------|------|----------|
| `src/app/api/admin/insights/route.ts` | `SUPABASE_SERVICE_KEY` 서버 전용 환경변수, `output: 'export'`에서 API Route 미지원 | 관리자 기능은 웹 전용 유지. 앱 빌드에서 제외 (별도 웹 배포 또는 BE 이관 시 처리) |

> **참고**: `admin/page.tsx`는 `"use client"`이지만 내부에서 `/api/admin/insights`를 fetch합니다. Capacitor 앱에서는 이 API가 없으므로 관리자 대시보드는 웹에서만 접근하는 것으로 결정. 앱 빌드 시 API Route 디렉토리를 제외하면 빌드 에러 없이 통과합니다.

### Supabase 클라이언트 현재 상태

```typescript
// src/lib/supabase.ts — ISR 캐시 옵션 (정적 빌드에서 무의미)
global: { fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60 } }) },
```

### 관련 파일

```
수정 대상:
  src/lib/supabase.ts           — ISR 캐시 옵션 제거
  src/app/page.tsx              — 서버 → 클라이언트
  src/app/results/page.tsx      — 서버 → 클라이언트 + useSearchParams
  src/app/mood/[key]/page.tsx   — 서버 → 클라이언트 + notFound 대체
  src/app/photo/[slug]/page.tsx — 서버 → 클라이언트 + notFound 대체
  src/app/watch/page.tsx        — 서버 → 클라이언트 + useSearchParams + searchLooks 로컬
  next.config.mjs               — output: 'export' 추가

제외 처리:
  src/app/api/admin/insights/route.ts — 정적 빌드에서 제외 (빌드 시 삭제 또는 별도 배포)

신규 생성:
  src/lib/hooks/usePhotos.ts    — 데이터 페칭 훅 (fetchPhotos, fetchPhotoBySlug 등 래핑)
  src/lib/hooks/useLooks.ts     — 룩 검색 훅 (searchLooks 래핑, 클라이언트 전용)
```

### 관련 티켓

```
선행: (없음 — MS-00의 시작점)
후행: CAP-002 (Capacitor 초기화 — 정적 빌드 출력 필요)
      FE-FEAT-012 (API 클라이언트 전환 — 이 티켓에서 만든 훅 내부를 교체)
```

---

## Scope

### 포함

- `supabase.ts`에서 `next: { revalidate: 60 }` ISR 캐시 옵션 제거
- 데이터 페칭 커스텀 훅 작성 (`usePhotos`, `usePhotoBySlug`, `useProductsForMood`, `useProductsForPhoto`, `useLooks`)
- 서버 페이지 5개를 `"use client"` + 훅 기반으로 전환
- `searchParams` 서버 접근 → `useSearchParams()` 전환 (results, watch)
- `notFound()` → 클라이언트 조건부 UI 전환 (mood, photo)
- `watch/page.tsx`의 `searchLooksLive()` → 클라이언트 전용 `searchLooks()`로 전환 (YouTube API는 서버 전용이므로 시드 기반)
- API Route(`api/admin/insights`) 정적 빌드에서 제외 처리
- `next.config.mjs`에 `output: 'export'` 추가
- `next build` 정적 빌드 성공 검증

### 제외

- Capacitor 설치/초기화 (→ CAP-002)
- 네이티브 플러그인 교체 (→ CAP-003)
- SWR/TanStack Query 도입 (과설계 — 단순 useState + useEffect로 충분)
- Supabase SDK 제거 (아직 데이터 소스로 사용 중)

---

## Strategy

### Step 1: supabase.ts ISR 캐시 제거

`next: { revalidate: 60 }` fetch 옵션 제거. Supabase SDK의 순수 fetch로 변경.

### Step 2: 데이터 페칭 훅 작성

`src/lib/hooks/usePhotos.ts`에 4개 훅 작성. 각 훅은 loading/data 상태를 관리하고, 기존 photos.ts 함수를 내부적으로 호출.

이 훅들이 나중에 FE-FEAT-012에서 BE API로 교체되는 지점.

### Step 3: 서버 페이지 5개 전환

1. `page.tsx` → `"use client"` + `usePhotos()`
2. `results/page.tsx` → `"use client"` + `useSearchParams()` + `usePhotos()`
3. `mood/[key]/page.tsx` → `"use client"` + `useParams()` + `useProductsForMood()`
4. `photo/[slug]/page.tsx` → `"use client"` + `useParams()` + `usePhotoBySlug()` + `useProductsForPhoto()`
5. `watch/page.tsx` → `"use client"` + `useSearchParams()` + `useLooks()`

### Step 3.5: API Route 제외 처리

`src/app/api/admin/insights/route.ts`를 정적 빌드에서 제외. 방법:
- 빌드 전 임시 이동 또는 `next.config.mjs`에서 exclude 처리
- 관리자 대시보드는 Vercel 웹 배포에서만 동작하도록 분리

### Step 4: next.config.mjs 수정

`output: 'export'` 추가.

### Step 5: 빌드 검증

`next build` 실행하여 `out/` 디렉토리에 정적 파일 생성 확인.

---

## Acceptance Criteria

- [ ] `supabase.ts`에서 `next: { revalidate }` 옵션이 제거됨
- [ ] 5개 커스텀 훅이 `src/lib/hooks/`에 존재 (`usePhotos.ts`, `useLooks.ts`)
- [ ] `src/app/` 서버 컴포넌트 5개가 모두 `"use client"` 선언
- [ ] `export const revalidate`, `export const dynamic` 선언 전부 제거
- [ ] `notFound()` import 제거, 조건부 UI로 대체
- [ ] `watch/page.tsx`의 `searchLooksLive` → 클라이언트 전용 `searchLooks`로 전환
- [ ] API Route(`api/admin/insights`)가 정적 빌드에서 에러를 발생시키지 않음
- [ ] `next.config.mjs`에 `output: 'export'` 설정
- [ ] `next build` 정상 완료 — `out/` 디렉토리 생성
- [ ] 브라우저에서 `npx serve out` 로 정적 빌드 결과 확인 가능

---

## Testing Rules

- [ ] `next build` 에러 없이 완료
- [ ] 정적 빌드 결과물로 홈/검색결과/무드상세/사진상세/영상탐색 페이지 모두 접근 가능
- [ ] Supabase 미연결 시 로컬 시드 폴백 동작 유지
- [ ] 영상탐색 페이지에서 시드 기반 검색 동작 확인

---

## Verification

1. `next build` 실행 → `out/` 디렉토리 생성 확인
2. `npx serve out` → 브라우저에서 `localhost:3000` 접속
3. 홈 → 사진 갤러리 로드 확인
4. 검색 → 결과 페이지 정상 동작 확인
5. 무드 상세 → 상품 목록 로드 확인
6. 사진 상세 → 관련 상품 로드 확인
7. 존재하지 않는 무드/사진 URL → 에러 대신 빈 상태 UI 표시 확인

---

## Implementation Notes

### 구현 결과 (2026-08-18)

**Status: In Progress** — 코드 전환 완료, 관리자 기능 앱 지원 대기(RLS 정책 추가 필요).

#### 변경 파일 목록

| 파일 | 변경 | 설명 |
|------|------|------|
| `src/lib/supabase.ts` | 수정 | ISR 캐시 옵션(`next: { revalidate: 60 }`) 제거 |
| `src/lib/hooks/usePhotos.ts` | 신규 | `usePhotos`, `usePhotoBySlug`, `useProductsForMood`, `useProductsForPhoto` 4개 훅 |
| `src/lib/hooks/useLooks.ts` | 신규 | `useLooks` — `searchLooks` 시드 기반 검색 래핑 (`useMemo`) |
| `src/app/page.tsx` | 수정 | `"use client"` + `usePhotos()`. `revalidate`, `async`, `isSupabaseEnabled` 제거 |
| `src/app/results/page.tsx` | 수정 | `"use client"` + `Suspense` 래핑 + `useSearchParams()` + `usePhotos()` |
| `src/app/watch/page.tsx` | 수정 | `"use client"` + `Suspense` 래핑 + `useSearchParams()` + `useLooks()` |
| `src/app/mood/[key]/page.tsx` | 수정 | 서버 래퍼로 축소 — `generateStaticParams`(6축) + `MoodDetail` 렌더 |
| `src/app/mood/[key]/MoodDetail.tsx` | 신규 | `"use client"` 클라이언트 컴포넌트 — `useProductsForMood` 훅 사용 |
| `src/app/photo/[slug]/page.tsx` | 수정 | 서버 래퍼로 축소 — `generateStaticParams`(빈 배열) + `PhotoDetail` 렌더 |
| `src/app/photo/[slug]/PhotoDetail.tsx` | 신규 | `"use client"` 클라이언트 컴포넌트 — `usePhotoBySlug` + `useProductsForPhoto` 훅 |
| `src/app/closet/[id]/page.tsx` | 수정 | 서버 래퍼로 축소 — `generateStaticParams`(빈 배열) + `ClosetItemView` 렌더 |
| `src/app/closet/[id]/ClosetItemView.tsx` | 신규 | `"use client"` 래퍼 — 기존 `ClosetItem` 컴포넌트를 감싸는 용도 |
| `next.config.mjs` | 수정 | `BUILD_TARGET=capacitor`일 때만 `output: 'export'` 적용 |
| `package.json` | 수정 | `build:cap` 스크립트 추가 |

#### 빌드 전략 — 듀얼 빌드

- `npm run build` — Vercel 배포용. API Route, 동적 라우트 모두 동작.
- `npm run build:cap` — Capacitor용. API Route + 열거 불가 동적 라우트(`photo/[slug]`, `closet/[id]`)를 임시 제외 후 정적 빌드, 빌드 후 자동 복원.

#### 구현 중 만난 문제와 해결

1. **`useSearchParams()` Suspense 필수**: Next.js 14에서 `useSearchParams()`를 쓰는 `"use client"` 페이지는 `<Suspense>` 래퍼가 필요. → `results/page.tsx`, `watch/page.tsx`를 Wrapper + Content 패턴으로 분리.

2. **`"use client"` + `generateStaticParams` 동시 사용 불가**: Next.js 14에서 `"use client"` 디렉티브와 `generateStaticParams`는 같은 파일에 공존할 수 없음. → 동적 라우트 3개(`mood`, `photo`, `closet`)를 서버 래퍼(page.tsx) + 클라이언트 컴포넌트(별도 파일)로 분리.

3. **`generateStaticParams` 빈 배열 = 미인식**: Next.js 14.2.35에서 `generateStaticParams()`가 빈 배열을 반환하면 "missing generateStaticParams" 에러 발생. `async` 키워드 추가·`dynamicParams = false` 조합으로도 해결 불가. → 빌드 스크립트에서 해당 라우트를 임시 제외하는 실용적 방법 채택.

4. **API Route `force-dynamic` 비호환**: `output: 'export'`에서 `dynamic = "force-dynamic"` API Route 불가. → 빌드 스크립트에서 `src/app/api` 디렉토리를 임시 이동, 빌드 후 복원.

#### 알려진 제한사항 (CAP-002에서 처리)

- `/photo/[slug]`, `/closet/[id]` — 정적 빌드에서 제외됨. Capacitor에서 이 라우트로 직접 진입하면 404. SPA 폴백 라우팅 설정 필요.
- `/api/admin/insights` — 정적 빌드에서 제외됨. 앱에서도 관리자 기능을 쓸 수 있어야 하므로, 관리자 이메일 확인 후 Supabase RLS 정책 추가 → 클라이언트 훅 전환 예정. `events` 테이블 SELECT, `app_config` 테이블 UPDATE 정책이 필요.
