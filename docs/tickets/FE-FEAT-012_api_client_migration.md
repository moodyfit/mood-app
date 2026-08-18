# FE-FEAT-012: Supabase 직접 호출 → API 클라이언트 전환

Supabase 클라이언트 직접 호출을 axios 기반 API 클라이언트로 전환하여 BE API를 경유하도록 변경.

---

## Metadata

| Key | Value |
|-----|-------|
| Prefix | FE |
| Type | FEAT |
| Severity | Critical |
| Layer | lib / components |
| Milestone | MS-01 |
| Status | Backlog |
| 예상h | 5h |
| 주차 | W2-후반 |
| 우선순위 | P0 |

---

## Problem

현재 FE가 Supabase를 직접 호출하고 있어 BE를 우회하는 구조다. BE API가 완성되어도 FE가 이를 사용하지 않으면 인증·캐싱·Rate Limiting 등 서버 기능이 무력화된다.

- `src/lib/photos.ts` — Supabase `photos`, `products` 테이블 직접 select (5개 함수)
- `src/lib/supabase.ts` — `@supabase/supabase-js` 클라이언트 싱글톤
- 환경변수 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 FE에 노출
- BE를 거치지 않으므로 인증 토큰 검증, 요청 로깅, 캐시 등 서버 사이드 로직 적용 불가

### 비즈니스 근거

> BE가 있는 이유는 보안(API 키 은닉)과 확장성(캐시, 로깅, AI). FE→Supabase 직접 연결은 BE의 존재 이유를 부정한다. 전환하지 않으면 인증·AI 검색·Rate Limiting 등 모든 BE 기능이 사실상 무용.

---

## Context

### 현재 Supabase 직접 호출 (교체 대상)

| 함수 | 파일 | 테이블 | 쿼리 | 호출처 |
|------|------|--------|------|--------|
| `fetchPhotos()` | photos.ts | photos | `select("*")` | results/page.tsx, HomeGallery |
| `fetchProductsByMood(moodKey)` | photos.ts | products | `select(6cols).eq("mood_key")` | mood/[key]/page.tsx |
| `fetchProductsByPhoto(imageUrl)` | photos.ts | products | `select(7cols).eq("photo_image_url")` | PhotoProductView |
| `fetchPhotoBySlug(slug)` | photos.ts | photos | `select("*").ilike().limit(1)` | photo/[slug]/page.tsx |
| `getProductsForMood(moodKey)` | photos.ts | (래퍼) | DB → 로컬 시드 폴백 | ProductSection |
| `getProductsForPhoto(url, key)` | photos.ts | (래퍼) | 사진→무드→로컬 폴백 | PhotoProductView |

### 로컬 시드 폴백 패턴

```
현재: Supabase 환경변수 미설정 → getSupabase() = null → 빈 배열 반환 → 로컬 시드 사용
전환 후: BE API 장애 시에도 동일 폴백 유지 필요
```

### ISR 캐시 패턴 (유지)

```typescript
// results/page.tsx — Next.js ISR
export const revalidate = 60;  // 60초 캐시
// 서버 컴포넌트에서 fetchPhotos() 호출 → 이 패턴 유지하되 BE API 경유로 변경
```

### 관련 파일

```
교체 대상:
  src/lib/supabase.ts       — getSupabase() 싱글톤 (삭제 or 폐기)
  src/lib/photos.ts         — fetchPhotos/fetchProducts 5개 함수 (axios로 교체)

신규 생성:
  src/lib/api.ts            — axios 인스턴스 + 인터셉터
  src/lib/api/photos.ts     — 사진 API 호출 함수
  src/lib/api/products.ts   — 상품 API 호출 함수

수정 필요:
  src/app/results/page.tsx  — fetchPhotos() → api.getPhotos()
  src/app/mood/[key]/page.tsx — fetchProductsByMood() → api.getProductsByMood()
  src/app/photo/[slug]/page.tsx — fetchPhotoBySlug() → api.getPhotoBySlug()
  src/components/PhotoProductView.tsx — fetchProductsByPhoto() → api.getProductsByPhoto()
  src/components/ProductSection.tsx — getProductsForMood() → api.getProductsByMood()
```

### 관련 티켓

```
선행: BE-FEAT-001 (Prisma 스키마 — BE에 동일 테이블 존재해야)
      BE-FEAT-002 (시드 데이터 마이그레이션)
      BE-FEAT-009 (검색 결과 API — 사진 조회 엔드포인트)
후행: FE-FEAT-013 (인증 플로우 연결 — 인터셉터에 토큰 포함)
      FE-FEAT-014 (저장 데이터 서버 동기화)
      FE-FEAT-015 (AI 검색 연동)
```

---

## Scope

### 포함

- `src/lib/api.ts` — axios 인스턴스 생성 (baseURL, timeout, 인터셉터)
- `src/lib/api/photos.ts` — `getPhotos()`, `getPhotoBySlug()` BE API 호출
- `src/lib/api/products.ts` — `getProductsByMood()`, `getProductsByPhoto()` BE API 호출
- 기존 `photos.ts`의 Supabase 직접 호출을 API 클라이언트로 교체
- 로컬 시드 폴백 유지 (BE API 장애 대비)
- ISR 캐시 패턴 유지 (서버 컴포넌트에서 서버→서버 호출)
- 에러 인터셉터 (401 → 리프레시 시도, 5xx → 토스트)

### 제외

- 인증 토큰 자동 첨부 (→ FE-FEAT-013에서 인터셉터 확장)
- localStorage 데이터 동기화 (→ FE-FEAT-014)
- 검색 API 연동 (→ FE-FEAT-015)
- Supabase SDK 완전 제거 (스토리지 직접 접근이 남아있을 수 있어 점진적 제거)

---

## Strategy

### Step 1: axios 인스턴스 생성

```
src/lib/api.ts
  - baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  - timeout: 10000 (10초)
  - withCredentials: true (httpOnly cookie 전송)
  - 응답 인터셉터: 에러 코드별 처리
```

### Step 2: API 호출 함수 분리

```
src/lib/api/
├── index.ts         — apiClient re-export
├── photos.ts        — getPhotos(), getPhotoBySlug(slug)
└── products.ts      — getProductsByMood(moodKey), getProductsByPhoto(imageUrl)
```

각 함수는 기존 photos.ts와 동일한 반환 타입 유지 → 호출처 변경 최소화.

### Step 3: 폴백 래퍼

```typescript
// 기존 패턴 유지
async function getPhotosWithFallback(): Promise<Photo[]> {
  try {
    return await api.getPhotos();       // BE API 시도
  } catch {
    return localPhotoSeed;              // 로컬 시드 폴백
  }
}
```

### Step 4: 호출처 일괄 교체

```
변경 파일 6개:
  results/page.tsx        — fetchPhotos → getPhotosWithFallback
  mood/[key]/page.tsx     — fetchProductsByMood → api.getProductsByMood
  photo/[slug]/page.tsx   — fetchPhotoBySlug → api.getPhotoBySlug
  PhotoProductView.tsx    — fetchProductsByPhoto → api.getProductsByPhoto
  ProductSection.tsx      — getProductsForMood → api.getProductsByMood (+ 폴백)
  HomeGallery.tsx         — fetchPhotos → getPhotosWithFallback (확인 필요)
```

### Step 5: supabase.ts 폐기

```
- getSupabase() export 제거
- 파일에 @deprecated 주석 + 경고 로그 추가
- package.json에서 @supabase/supabase-js는 아직 제거하지 않음 (Storage 사용 가능성)
```

---

## Acceptance Criteria

- [ ] `src/lib/api.ts` — axios 인스턴스가 `NEXT_PUBLIC_API_URL` 기반으로 생성됨
- [ ] `withCredentials: true` 설정으로 httpOnly 쿠키 자동 전송
- [ ] 기존 6개 호출처가 모두 API 클라이언트를 사용하도록 전환됨
- [ ] Supabase 직접 호출 코드가 photos.ts에서 제거됨
- [ ] BE API 장애 시 로컬 시드 폴백이 정상 동작 (기존과 동일 UX)
- [ ] ISR 캐시 (`revalidate = 60`) 패턴이 유지됨
- [ ] `npm run build` 정상 완료 (타입 에러 없음)

---

## Testing Rules

- [ ] API 클라이언트 인스턴스 설정 확인 (baseURL, timeout, withCredentials)
- [ ] 각 API 함수 단위 테스트 (mock axios — 정상/에러/타임아웃)
- [ ] 폴백 래퍼 테스트 — API 실패 시 로컬 시드 반환 확인
- [ ] `npm run build` 통과
- [ ] `npm run lint` 통과

---

## Verification

1. BE 서버 기동 상태에서 `npm run dev` 실행
2. 홈 → 갤러리 사진 정상 로드 확인 (getPhotos via BE)
3. 무드 페이지 → 상품 목록 정상 로드 확인 (getProductsByMood via BE)
4. 사진 상세 → 관련 상품 정상 로드 확인 (getProductsByPhoto via BE)
5. BE 서버 중지 → 동일 페이지 → 로컬 시드 폴백 동작 확인
6. Network 탭에서 Supabase 직접 호출 없음 확인 (*.supabase.co 요청 0건)

---

## Implementation Notes

_(구현 후 기록)_
