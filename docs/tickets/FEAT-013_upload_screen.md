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

### 2026-09-11: 구현 완료 (검증은 선행 조건 대기)

**구조** — `components/`가 30개 평면이라 이번 건은 `ui/`(도메인 무관 원자)와 `upload/`(기능)로 나눴다.
Supabase 접근은 전부 `lib/upload.ts`에 모아 컴포넌트가 직접 부르지 않게 했다(CLAUDE.md lib 경유 규칙).

**설계 판단**

- 화면 레이아웃은 3안(한 화면 / 사진 먼저 시트 / 2단계) 중 **한 화면**을 택했다. 항목이 5개라
  단계를 나눌 만큼 무겁지 않고, 사진 고르기 전 상태에서도 뭘 입력해야 하는지 보이는 게 낫다고 봤다.
- `user_description`은 `caption_*`과 **별도 컬럼·별도 블록**으로 갔다. 업로드 사진도 `validateTag`가
  3행을 필수로 막아 AI 해설을 반드시 갖게 되므로, 같은 자리를 쓰면 둘 중 하나를 버려야 한다.
  라벨(`작성자가 추천하는 이유`)을 붙인 건 통제 없는 유저 문장이 AI 보증 해설로 읽히면 안 되기 때문.
- 여성 옵션은 `UploadForm`의 `FEMALE_OPEN = false`로 닫아뒀다(FEAT-011 결정 = 출시엔 남성만).
  필드 자체는 보내므로 루브릭 티켓 후 상수만 뒤집으면 열린다.
- 파일명을 UUID로 새로 짓는다. slug가 폴더를 무시하고 파일명만 쓰기 때문에 `IMG_1234.jpg` 같은
  이름은 유저 간 충돌한다.

**선행 조건 (아직 미완)**

1. `photos` 컬럼 6개 + 인덱스 — 없으면 rate limit 쿼리(`uploaded_by`)에서 먼저 500
2. `storage.objects`에 `uploads` 버킷 INSERT 정책 — 없으면 `new row violates row-level security policy`
3. FEAT-011(#18) 머지 — 라우트가 main에 없음

버킷(`uploads`, public, 5MB, jpeg/png/webp)은 생성 완료. 1·2는 DDL이라 service key로는 불가하고
DB 비밀번호 또는 관리 토큰이 필요하다.

**검증 상태 (2026-09-15 E2E 완료)**

선행 조건 3개가 모두 해소되어(라우트 머지 · 컬럼 6개 · Storage INSERT 정책) 전 구간을 실행했다.

| 구간 | 상태 |
|---|---|
| 로그인 게이트 · 탭 · 폼 · 미리보기 · 비율 측정 · 5MB 차단 | 확인 |
| Storage 업로드 (유저 JWT) | 확인 — 로그인 200 / 비로그인 차단 |
| 태깅 API 왕복 → `photos` INSERT | 확인 — 7.3초, 400×500 사진 `classic 0.5·soft 0.3·cityboy 0.2` |
| 저장값 계약 | 확인 — `image_url` 상대 경로 · `is_flagship` false · `aspect_ratio` 실측 일치 |
| `user_description` / `photo_type` / `gender` / `uploaded_by` | 확인 — 전부 저장됨 |
| 상세 페이지 (`uploads/` 경로) | 확인 — `moods/` 하드코딩 제거가 실제로 동작 |
| 거부 케이스 | 확인 — 토큰 없음 401 · `moods/` 400 · `../` 400 |
| 하루 10장 제한(429) | 미실측 — Claude 10회 호출이 필요해 생략. 채점 전 count 쿼리로 코드 확인 |

**E2E에서 드러난 후속 2건 (FEAT-011 라우트, 출시 비차단)**

- 옷이 안 보이는 사진이면 Claude가 JSON 대신 거절문을 반환 → `AI 응답 파싱 실패`(502)가 유저에게 그대로 노출된다. 422 + 사람이 읽을 문구로 바꿔야 함
- 채점 실패 시 이미 올라간 파일이 버킷에 고아로 남는다. 유저는 삭제 권한이 없어 `service_role`인 라우트가 정리해야 함

화면 쪽에서는 짧은 변 `MIN_IMAGE_PX`(200) 미만을 업로드 전에 거절해, 위 두 경우 중 "너무 작은 이미지"는 채점 호출과 고아 파일이 모두 발생하지 않게 했다.
