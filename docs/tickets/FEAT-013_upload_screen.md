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

### 입력 계약 (FEAT-011 `ead87fc` 기준)

```
POST /api/photos/tag
Authorization: Bearer <세션 토큰>
{ "storage_path": "uploads/<uuid>.jpg", "aspect_ratio": 0.5625, "gender": "male" | "female",
  "user_description": "...", "photo_type": "real" | "ai" }   ← 뒤 두 개는 아직 미수용
```

라우트가 현재 받는 건 앞의 세 개뿐이다. `source`는 라우트가 `"upload"`로 서버 고정(= 출처)이라
회의록의 `실제|AI`와 축이 달라 `photo_type`으로 분리해 요청해둔 상태.

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
- 너무 작은 이미지(짧은 변 `MIN_IMAGE_PX` 미만) 업로드 전 차단
- 진행 상태 표시(미리보기 위 오버레이) + 완료 토스트

### 제외

- 자동 태깅 로직 자체 (FEAT-011 담당)
- 필터 UI — 8/25 회의 `<후순위>`
- 여성 사진 오픈 여부 — 루브릭 티켓 결론 대기 (기본은 남성만)
- Capacitor 앱 대응 — `output: 'export'`에서 API Route가 빠져 앱에서는 동작하지 않는다. BE 이관 시 처리
- 업로드 취소·삭제·수정 — 후속
- 상품 섹션 문구 — 사진에 연결된 상품이 없으면 무드 폴백이 나오는데 제목이 `이 사진 그대로`라 사실과 다르다. 업로드분만의 문제가 아니라 시드에도 해당(122장 중 90장만 연결)하므로 별도 티켓

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

- [x] 비로그인 상태로 `/upload` 접근 시 로그인 유도 화면이 뜬다
- [x] 이미지를 고르면 미리보기가 뜨고, 실제 비율이 계산된다
- [x] 업로드된 파일이 `uploads/<uuid>.<ext>` 경로에 저장된다 (원본 파일명 사용 안 함)
- [x] 태깅 API에 `storage_path`(상대 경로)·`aspect_ratio`·`gender`·`photo_type`·`user_description`이 전달된다
- [x] `Authorization: Bearer` 헤더에 세션 토큰이 실린다
- [x] 짧은 변 `MIN_IMAGE_PX` 미만 사진은 업로드 전에 거절된다
- [x] 업로드 중·채점 중 상태가 **사진 위에** 보이고, 완료 시 토스트가 뜬다
- [x] 업로드 성공 후 홈 피드에서 해당 사진이 **잘리지 않은 비율로** 보인다 — 9:16 사진으로 확인. `cardRatio()`가 저장값 `0.5625`를 그대로 반환(0.5 미만은 클램프돼 잘림)
- [x] 탭바에서 업로드 화면으로 들어갈 수 있다
- [x] 업로드한 사진 카드를 눌렀을 때 상세 페이지가 정상으로 열린다
- [x] 업로드 사진 상세에 「작성자가 추천하는 이유」가 AI 해설과 분리돼 보인다
- [x] 태깅 실패(계약 위반·API 오류) 시 사용자에게 이유가 안내되고, 재시도할 수 있다

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

### 2026-09-15: 구현 완료 · E2E 통과

`components/ui`(도메인 무관) + `components/upload`(기능)로 나누고 Supabase 접근은 `lib/upload.ts`에 모았다.
레이아웃은 3안 중 한 화면(항목 5개라 단계 분리가 과함). `user_description`은 `caption_*`과 별도 컬럼·별도
블록 — `validateTag`가 caption 3행을 필수로 막아 업로드 사진도 AI 해설을 반드시 갖기 때문. 파일명은 UUID
(slug가 폴더를 무시하고 파일명만 써서 충돌). 여성 옵션은 `FEMALE_OPEN = false`로 닫음.

선행 조건(컬럼 6개 · `uploads` INSERT 정책 · #18 머지) 해소 후 전 구간 실행 — 업로드 → 채점 7.3초 →
저장 → 상세, 거부 401/400 확인. 429는 Claude 10회 호출이 필요해 미실측(코드로만 확인).

### 2026-09-18: 실사용에서 나온 것

남성복 전신 컷은 정상 채점(`classic 0.6 / clean 0.4`), 여성복·플랫레이는 `AXIS_RUBRIC`이 남성복 어휘뿐이라
추정에 가깝다. `body_spec.height`도 사진으로 알 수 없는데 두 건 모두 `"180"`으로 지어낸다. 진행 상태가
안 보이던 문제는 미리보기 오버레이 + 완료 토스트로 해결했고, 토스트는 도착한 상세에서 띄운다(업로드
화면에서 띄우면 전환에 묻힌다). 9:16 사진의 `cardRatio()`가 `0.5625`를 그대로 반환하는 것도 확인했다.

범위 밖 4건 — 여성복 루브릭·`body_spec.height`(루브릭 티켓), 상품 섹션 문구(별도 티켓), 채점 거절 시
502 노출과 고아 파일 정리(FEAT-011 라우트). `gender` 저장 위치도 갈린다 — PR #20은 `body_spec.gender`,
이 티켓·FEAT-011은 `photos.gender` 컬럼.
