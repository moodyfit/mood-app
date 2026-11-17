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

## 결정 (2026-11-17, 에린)

- **Q1. 기존 female 60장** → 삭제하지 않고 숨기기만. 데이터·DB 컬럼 그대로 보존.
- **Q2. 업로드 화면 성별 선택 UI** → 숨기기만. `Gender` 타입·API 파라미터·태깅 `genderHint`
  로직은 그대로 두고 화면에서만 뺀다.
- **Q3. `scripts/`(생성·태깅 파이프라인)** → 이번 범위 밖, 추후("상세페이지 사진 보강" 티켓
  쪽에서 다룰 가능성).
- 방향: 몇 달간 남자만 하다가 추후 여자 확장 가능성 있음 — **데이터·타입·API는 그대로 두고
  "항상 male로 고정"만 해서, 나중에 되돌리기 쉽게** 만든다(토글 UI만 지우는 게 아니라).

## "숨기기만"으로는 안 새는지 — 실제로는 샐 위험 2곳 발견, 같이 막음

1. **localStorage 복원 경합**: `genderFilter` 기본값이 `"all"`이고, 예전에 사용자가 "여자"나
   "전체"를 선택한 적 있으면 그 값이 `mood.genderFilter.v1`에 남아 있어서, 토글 UI만 지워도
   마운트 시 그 값을 그대로 복원해 쓴다 — 기존 유저는 계속 여자 사진을 볼 수 있음.
2. **"성별 0장이면 전체로 넓히기" 폴백**(`results/page.tsx` P1-1): 제품 검색어가 여자
   사진에만 매칭되면 "여자 코디가 없어서 전체로 보여줄게"로 그 사진을 그대로 보여준다 — 토글이
   없어진 지금은 이 폴백 자체가 여자 사진 노출 경로가 된다.

## Scope(확정)

- `store.tsx`: `GenderFilter` 타입·`filterByGender`·DB 컬럼·태깅 API는 전부 유지. 단,
  `genderFilter`의 **초기값을 `"male"`로 고정하고 localStorage 복원을 멈춰서**(단일 소스에서
  항상 male) 위 1번 레이스를 막는다. `setGenderFilter`/저장 로직 자체는 코드에 남겨두되(향후
  재활성화용) 호출하는 UI가 없어지므로 자연히 안 쓰임.
- `page.tsx`: 홈의 성별 토글(`OptionPicker`) 제거.
- `UploadForm.tsx`: 성별 선택 `OptionPicker` 제거, `gender`는 항상 `"male"`로 고정 전송
  (`FEMALE_OPEN` 플래그·`Gender` 타입은 유지).
- `results/page.tsx`: "성별 0장이면 전체로 넓히기" 폴백 제거 — 지금은 고정 정책이라 넓힐
  "다른 성별"이라는 개념 자체가 없어짐. 0장이면 그냥 매칭 없음(기존 무드 검색 폴백)으로.
- `OptionPicker.tsx`: 두 호출부 제거 후 소비자 0 — 다른 쓰임 없으면 삭제.
- `photos.gender`/`body_spec.gender` 컬럼, `scripts/`는 전부 유지(Q1/Q3 결정).

## Verification (완료, Playwright 실측)

- 홈·업로드 화면에 성별 선택 UI가 안 보임.
- `localStorage.setItem('mood.genderFilter.v1','female')`로 강제로 넣고 새로고침 — 값 자체는
  그대로 남아있지만(안 지움, 그냥 안 읽음) 홈 카드 12장 중 여자(`w-`) 사진 0장으로 확인.
- 여자 전용 상품("아이보리 롱 재킷", DB에 `w-cityboy-005.jpg`로만 연결)으로 검색 — 결과 12장
  전부 `m-`(남자) 사진, 여자 사진 0장. 폴백으로 무드 검색 결과(전부 남자)가 나옴.
- `tsc --noEmit`, `npm run build` 통과.
