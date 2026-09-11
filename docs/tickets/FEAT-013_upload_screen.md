# FE-FEAT-013: 사진 업로드 화면

유저가 사진을 올려 Storage에 저장하고 자동 태깅 API(FEAT-011)를 호출하는 화면. 8/25 회의 "사진 업로드 > 화면 (소피)" 담당분.

---

## Metadata

| Key | Value |
|-----|-------|
| Prefix | FE |
| Type | FEAT |
| Severity | High |
| Layer | Page / Component |
| Milestone | Sprint 8/25 |
| Status | In Progress |
| 예상h | 4 |
| 우선순위 | P0 |
| Depends | FEAT-011(#18) — `gender`·`source` 필드 수용, 인증 게이트 |
| Related | #18 FEAT-011, FEAT-003(#13), BUG-003 |

---

## Problem

- **현재 동작**: 업로드 화면이 없다. `src/app/upload/` 자체가 부재하고, 탭바에도 진입점이 없다. 에린이 만든 `POST /api/photos/tag`(#18)는 호출자가 없어 동작을 검증할 수 없다.
- **기대 동작**: 유저가 사진을 고르면 Supabase Storage에 저장되고, 태깅 API가 6축 무드를 자동 부여해 피드에 반영된다.
- **영향 범위**: `TabBar`, `/upload`(신규), Supabase Storage `uploads/`, `photos` 테이블, `fetchPhotoBySlug`

### 비즈니스 근거

> 시드 90장만으로는 전시 볼륨이 부족하다. FEAT-010(#17)이 "다 보면 처음부터 순환 재생 + 216장 상한"이라는 임시방편을 쓰는 이유가 바로 이 볼륨 부족이다. 유저 업로드가 유일한 실질적 해법이고, 동시에 "내 추구미를 모아두는 장소"라는 제품 전제를 완성한다. 8/25 회의에서 출시 필수 기능으로 확정됐다.

---

## Context

### 현재 상태

```
src/app/upload/                     없음 (신규)
src/components/TabBar.tsx           홈 / 나의 공간 2탭 — 업로드 진입점 없음
src/lib/supabase.ts                 getSupabase() (anon) / getSupabaseAdmin() (service, 서버 전용)
src/lib/store.tsx:479               signIn 동작 — 세션 토큰 확보 가능
src/lib/photos.ts:167               fetchPhotoBySlug 가 `moods/${slug}.%` 하드코딩
supabase Storage                    moods/ 에 시드 90장. uploads/ 는 신규
photos 테이블                        owner/visibility 컬럼 없음 (전체 공개로 확정)
```

### 리뷰에서 확정된 입력 계약 (#18 코멘트)

```
POST /api/photos/tag
Authorization: Bearer <세션 토큰>
{ "storage_path": "uploads/<uuid>.jpg", "aspect_ratio": 0.5625,
  "gender": "male" | "female", "source": "real" | "ai", "description": "..." }
```

- `storage_path`는 **상대 경로**. 절대 URL이 아니다 (`photoUrl()`이 앞에 base를 덧붙이는 계약)
- 파일명은 **UUID** — slug가 폴더를 무시하고 파일명만 쓰기 때문에 `IMG_1234.jpg` 같은 이름은 유저 간 충돌한다
- `aspect_ratio`를 화면에서 재서 넘긴다. 안 넘기면 DB 기본값 `0.8`로 들어가 세로 긴 사진이 잘린다

### 관련 파일

```
신규 생성:
- src/app/upload/page.tsx
- src/components/UploadForm.tsx (분량에 따라 분리)

수정 대상:
- src/components/TabBar.tsx        업로드 진입점 추가
- src/lib/photos.ts:167            fetchPhotoBySlug 의 moods/ 하드코딩 제거
                                   (uploads/ 저장 시 상세 페이지가 안 열림 — #18 리뷰 P0-3)

참조:
- src/lib/supabase.ts              Storage 업로드
- src/lib/store.tsx                세션 토큰
- src/lib/photos.ts:54             photoUrl() — 경로 계약 확인용
```

### 관련 티켓

```
선행: FEAT-011(#18) — gender·source 필드 수용 + 인증 게이트. 컬럼이 없으면 값이 버려진다
후행: 필터(남자|여자, 실제|AI) — 8/25 회의 <후순위>
      여성 사진 루브릭 확장 — 별도 티켓 (#18 선택지 코멘트)
```

---

## Scope

### 포함

- 이미지 선택 + 미리보기
- Supabase Storage 업로드 (`uploads/<uuid>.<ext>`)
- `aspect_ratio` 측정 (`img.naturalWidth / img.naturalHeight`)
- 입력 폼: 설명 / `남자 | 여자` / `실제 사진 | AI로 생성`
- 세션 토큰 실어서 `POST /api/photos/tag` 호출
- 비로그인 시 `/login` 유도
- 탭바 진입점 추가
- `fetchPhotoBySlug` 의 `moods/` 하드코딩 제거

### 제외

- 자동 태깅 로직 자체 (FEAT-011 담당)
- 필터 UI — 8/25 회의 `<후순위>`
- 여성 사진 오픈 여부 — 루브릭 티켓 결론 대기 (기본은 남성만)
- Capacitor 앱 대응 — `output: 'export'`에서 API Route가 빠져 앱에서는 동작하지 않는다. BE 이관 시 처리
- 업로드 취소·삭제·수정 — 후속

---

## Strategy

### Step 1: 화면 골격 + 로그인 게이트

`/upload` 라우트와 폼 UI. 비로그인이면 안내 후 `/login`으로.

### Step 2: 파일 선택 → 미리보기 → `aspect_ratio` 측정

`URL.createObjectURL`로 미리보기, `Image` 로드 후 `naturalWidth / naturalHeight` 계산.

### Step 3: Storage 업로드

`crypto.randomUUID()` + 원본 확장자로 `uploads/` 에 업로드. 실패 시 재시도 안내.

### Step 4: 태깅 API 호출

세션 토큰을 `Authorization` 헤더에 실어 `POST`. 채점이 ~7초 걸리므로 진행 표시 필요.

### Step 5: 진입점 + slug 조회 수정

탭바에 업로드 추가, `fetchPhotoBySlug` 접두사 제거.

---

## Acceptance Criteria

- [ ] 비로그인 상태로 `/upload` 접근 시 로그인 유도 화면이 뜬다
- [ ] 이미지를 고르면 미리보기가 뜨고, 실제 비율이 계산된다
- [ ] 업로드된 파일이 `uploads/<uuid>.<ext>` 경로에 저장된다 (원본 파일명 사용 안 함)
- [ ] 태깅 API에 `storage_path`(상대 경로)·`aspect_ratio`·`gender`·`source`·`description`이 전달된다
- [ ] `Authorization: Bearer` 헤더에 세션 토큰이 실린다
- [ ] 채점 진행 중 로딩 상태가 보인다 (~7초)
- [ ] 업로드 성공 후 홈 피드에서 해당 사진이 **잘리지 않은 비율로** 보인다
- [ ] 업로드한 사진 카드를 눌렀을 때 상세 페이지가 정상으로 열린다
- [ ] 태깅 실패(계약 위반·API 오류) 시 사용자에게 이유가 안내되고, 재시도할 수 있다

---

## Testing Rules

- [ ] 세로로 긴 사진(9:16)과 가로 사진을 각각 올려 피드에서 잘림이 없는지 확인
- [ ] PNG·WebP 업로드 (#18 P1-3 `media_type` 하드코딩과 맞물림 — jpg 외 포맷 확인 필요)
- [ ] 같은 원본 파일명(`IMG_1234.jpg`)을 두 번 올려 slug 충돌이 없는지 확인
- [ ] 비로그인 / 토큰 만료 상태에서 호출 시 401 처리
- [ ] `npm run build` 통과, `npm run build:cap` 에서 앱 빌드가 깨지지 않는지 확인

---

## Verification

1. 로그인 → `/upload` → 세로 사진 업로드 → 홈 피드에서 비율 확인
2. 해당 카드 클릭 → 상세 페이지 정상 진입 확인
3. Supabase Storage `uploads/` 에 UUID 파일명으로 저장됐는지 확인
4. `photos` 행에 `image_url`이 **상대 경로**로 들어갔는지 확인
5. 로그아웃 상태에서 `curl`로 직접 API 호출 → 401 확인

---

## Implementation Notes

### 2026-09-10: 티켓 작성

_(구현 완료 후 작성)_
