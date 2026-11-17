# FEAT-030: 성별 기능 전면 제거 — 20대 초반 남자 단일 타겟

## Problem

2026-11-16 회의록 〈에린〉: "남/녀 토글 및 기타기능 전부 제거 후 20대초 남자만 타겟". 현재
앱은 홈 화면에 성별 토글(전체/남자/여자)이 있고, 검색·무드 상세·업로드·자동 태깅까지 성별이
전 레이어에 걸쳐 있다 — 단순히 토글 UI 하나만 지우면 끝나는 작업이 아니라서, 구현 전에 전체
조사부터 했다.

## 조사 결과 — 성별이 걸려 있는 곳 전수

### 런타임 앱(프론트+API)

| 파일 | 내용 |
|---|---|
| `src/lib/store.tsx` | `GenderFilter` 타입, `genderFilter` 전역 상태, `K_GENDER_FILTER`(`mood.genderFilter.v1`) localStorage 키, `setGenderFilter`, context로 노출(2곳) |
| `src/app/page.tsx` | 홈의 성별 토글 UI(`OptionPicker`), `filterByGender`로 피드 필터링 |
| `src/app/results/page.tsx` | 검색 결과 필터링 + "제품 매칭은 됐는데 성별 필터로 0장이면 전체 성별로 넓혀서 보여주기"(P1-1) 로직 전체 |
| `src/lib/hooks/usePhotos.ts` | `useMoodLooks`/`useMoodPhotos`가 `genderFilter`로 무드 대표 코디·썸네일 줄을 거름 |
| `src/lib/photos.ts` | `filterByGender()`(필터 단일 소스), `Photo.gender` 필드, `pickFlagshipLook()`의 `gender` 파라미터 |
| `src/app/mood/[key]/MoodDetail.tsx` | 직접 로직은 없고 주석("고른 코디가 성별 필터로 빠지면 대표 사진으로")만 — 위 훅들을 통해 간접 영향 |
| `src/components/upload/UploadForm.tsx` | 업로드 화면의 성별 선택 UI(`OptionPicker`), `FEMALE_OPEN=false` 플래그, `gender` state |
| `src/lib/upload.ts` | `Gender` 타입, `UploadPayload.gender`, 업로드 API 호출 시 `gender` 전달 |
| `src/app/api/photos/tag/route.ts` | 요청 바디 `gender`, DB insert `gender` 컬럼, `scoringPrompt`에 `genderHint`(`"m"\|"w"`) 전달 |
| `src/lib/tagging-rubric.ts` | `scoringPrompt(axisHint, gender)`의 `gender` 파라미터 — 프롬프트에 "남성"/"여성" 호칭 삽입 |
| `src/components/ui/OptionPicker.tsx` | 성별 토글 2곳(`page.tsx`, `UploadForm.tsx`)에서만 쓰는 제네릭 컴포넌트 — 둘 다 없어지면 소비자 0, 삭제 대상 후보(그 전에 다른 용도로 재사용 계획 있는지 확인 필요) |

### DB/데이터 (실측, 2026-11-17)

- `photos` 테이블: `gender`(top-level, SSOT 컬럼) — **전체 120장 중 male 60 / female 60**,
  null 0. `body_spec.gender`(JSON 내부, 레거시 중복 필드, FEAT-011 이후 SSOT 아님)도 같이 있음.
- `products` 테이블엔 `gender` 컬럼 자체가 없음 — `photo_image_url`로 사진에 연결돼 있어
  성별은 사진을 통해서만 간접 결정됨.
- 스토리지 파일명 자체가 `m-{axis}-{번호}.jpg` / `w-{axis}-{번호}.jpg` 접두사로 성별을 인코딩.

### 오프라인 생성·태깅 파이프라인 (런타임과 분리, scripts/)

- `scripts/prompts.ts`: `Gender`/`GENDERS` 타입, 성별별 `BUILD`/`HAIR` 사전, `buildPrompt(gender, ...)`.
- `scripts/gen-v3.ts`: `GENDERS` 루프 돌며 이미지 생성, 파일명에 `{gender}` 삽입.
- `scripts/score-photos.ts`: 파일명 접두사(`m-`/`w-`)로 gender 파싱해 `body_spec.gender` 기록.
- `scripts/apply-photos.ts`: 채점 결과의 `gender`를 DB `gender` 컬럼에 insert.
- `scripts/curation/build-queue.mjs`, `extract-items.mjs`: 성별별 집계·엑셀 컬럼.

랭킹/개인화 로직(`src/lib/rank.ts`, `taste.ts`, `moods.ts`)엔 gender 의존성이 전혀 없음(확인
완료) — 취향 학습 자체는 건드릴 필요 없음.

## 범위 확정 전에 결정 필요한 것 (Q)

- **Q1. 기존 female 60장을 어떻게 할지.** ①DB에서 완전히 삭제(되돌리기 어려움, 상품 연결도
  같이 정리 필요) ②삭제하지 않고 앱에서 male만 보이게 숨기기만(데이터는 보존, 나중에 필요하면
  복구 가능) — 되돌리기 어려운 작업이라 먼저 확인받고 진행.
- **Q2. 업로드 화면의 성별 선택 UI·API 파라미터까지 없앨지.** 남자 전용이면 필드 자체가 불필요해
  보이는데, 지금 당장 없애는 게 맞는지 아니면 나중에 다시 열 가능성을 보고 당분간 숨기기만
  할지.
- **Q3. `scripts/`(생성·태깅 파이프라인)도 이번 범위에 포함할지.** 회의록의 "상세페이지 사진
  보강"(담당 미정, 다음주) 티켓과 맞닿아 있어서 — 거기서 "20~30대 한국 남성만 생성"으로 자연히
  정리될 수도 있어 겹칠 수 있음.

## Scope(Q1~Q3 답 들어오면 확정)

- (가안) `GenderFilter`·`filterByGender`·토글 UI·업로드 성별 필드·태깅 `genderHint` 제거.
- (가안) `photos.gender`/`body_spec.gender` 컬럼은 Q1 답에 따라 삭제 또는 유지.
- `OptionPicker.tsx`는 소비자 0 되면 다른 쓰임 없는지 확인 후 삭제.

## Verification 기준(가안)

- 홈·검색·무드 상세·업로드 어디에도 성별 UI가 안 보임.
- `grep -rn "gender\|Gender" src/`가 0건(스코프에서 scripts/ 제외하기로 하면 scripts/는 남음).
- `tsc --noEmit`, `npm run build` 통과.
