# BUG-007: 사진 상세에 무관한 상품이 28개쯤 나온다

사진 상세의 상품 섹션이 `caption_item` 과 상품명을 맞춰 카테고리별 1개씩, 한 벌만 보여주게 한다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | BUG |
| Status | In Progress |
| 우선순위 | P0 |
| Layer | Lib / Component |
| Related | 9/10 회의, #20 v3 교체, FEAT-013 |

---

## Problem

- **현재 동작**: 사진 상세를 열면 그 사진과 무관한 같은 무드 상품 전체(24~31개)가 `이 사진 그대로`
  제목 아래 나온다. 120장 전부 해당
- **기대 동작**: 사진 속 착장과 맞는 상품이 카테고리(상의·하의·아우터·신발)별 최대 1개 나오고,
  제목이 상품 출처(사진 연결 / 캡션 매칭)를 사실대로 말한다
- **영향 범위**: `/photo/[slug]` 상품 섹션, 완성가 배지(`이 느낌 완성 · N만`), `WholeLook`

---

## Context

```
관련 파일:
- src/lib/photos.ts:157               getProductsForPhoto — 연결 없으면 getProductsForMood 로 폴백
- src/lib/photos.ts:119               getProductsForMood — DB 상품이 있으면 무드 전체 반환
- src/lib/hooks/usePhotos.ts:57       useProductsForPhoto
- src/components/PhotoProductView.tsx:71  제목 `이 사진 그대로` 고정
- src/lib/products.ts:76              buildLook — 4칸 × 1개 설계
```

### 원인 두 겹

1. **연결 90건이 전부 고아** — v3 교체로 사진 경로가 `moods/amekaji-001.jpg` →
   `moods/m-amekaji-005.jpg` 식으로 바뀌었고 `products.photo_image_url` 은 v2 경로 그대로다.
   가리키는 90개 경로 중 현재 `photos` 에 있는 것 0개 → `fetchProductsByPhoto()` 가 120장
   모두 빈 배열
2. **폴백이 무드 전체** — `getProductsForMood` 는 DB 에 상품이 있으면 전부 반환한다.
   `buildLook` 의 4칸 설계는 DB 가 비었을 때만 쓰여 사실상 호출되지 않는다

`getProductsForPhoto()` 는 반환값에 출처가 없어 화면이 폴백 여부를 모른다. 그래서 제목이 항상
`이 사진 그대로` 다.

### 매칭 재료

v3 태깅의 `caption_item` 이 착장을 적어두었고(120장 중 null 0) 상품명과 어휘가 겹친다.

```
m-amekaji-005  "블루 데님 트러커 자켓에 화이트 티, 올리브 와이드 팬츠, 브라운 워커 신었어"
아우터 인디고 데님 트러커 자켓 · 상의 화이트 티 · 하의 올리브 워크 팬츠 · 신발 브라운 레더 워크부츠
```

### 무드별 카테고리 분포 (고유 상품명 수)

```
         상의 하의 아우터 신발 기타
amekaji   13    5    8    1   가방 1
cityboy   13   13    4    0   가방 1
classic   11    8   10    1
clean     13   10    2    1   가방 1
soft       8   13    7    0
street     9    6    7    0   가방·모자 1
```

cityboy·soft·street 는 신발이 없어 최대 3개다.

---

## Scope

### 포함

1. `getProductsForPhoto` — 연결 상품이 없으면 같은 무드 상품을 `caption_item` 으로 점수 매겨
   카테고리별 1위만 반환. 반환값에 출처(`linked` / `matched`) 추가
2. `useProductsForPhoto` — `caption_item` 인자와 출처 전달
3. `PhotoProductView` — 출처에 따라 제목 분기. 매칭이면 `이 느낌으로 고른 옷`

### 제외

- `getProductsForMood` 변경 — 무드 상세(`MoodDetail.tsx:16`)가 전체 목록을 쓴다
- `products.photo_image_url` 을 v3 이름으로 재매핑 — v3 는 새로 그린 다른 사진이라 v2 기준
  상품을 붙이면 폴백보다 더 틀린 데이터가 된다
- 신발 없는 무드에 로컬 더미 채우기 — 가짜 상품을 사진 속 옷처럼 보이게 한다
- DB `가방`·`모자` 카테고리가 `ProductCategory` 타입 밖인 것 — 별도
- 상품 썸네일 단색 — 다음 티켓

---

## Strategy

### Step 1: 매칭 함수

상품명을 공백으로 나눈 토큰 중 `caption_item` 에 포함된 개수를 점수로 한다. 부분 문자열 비교라
조사(`자켓에`)를 따로 떼지 않아도 된다. 카테고리마다 최고점 1개, 0점이면 그 칸은 비운다.
동점은 이름순으로 결정적으로 고른다.

### Step 2: 출처 플래그 + 제목

`{ products, source }` 로 반환하고 훅·화면까지 전달한다.

### Step 3: 전수 결과표

120장 매칭 결과(사진·캡션·고른 상품·점수)를 뽑아 오매칭을 사람이 훑는다.

---

## Acceptance Criteria

- [ ] 사진 상세 상품이 카테고리별 최대 1개, 총 4개 이하다
- [ ] 고른 상품이 해당 사진 `caption_item` 과 토큰 1개 이상 겹친다
- [ ] 매칭 결과일 때 제목이 `이 사진 그대로` 가 아니다
- [ ] 완성가 배지가 고른 상품 합계와 같다
- [ ] 무드 상세(`/mood/[key]`) 상품 목록은 변경 전과 같다

---

## Testing Rules

- [ ] 매칭 함수 단위 확인 — `m-amekaji-005` 캡션으로 위 예시 4개가 나온다
- [ ] 신발 없는 무드 사진 1장(cityboy)에서 3개 이하로 나오는지 확인
- [ ] `npx tsc --noEmit`, `npm run build`, `npm run build:cap` 통과
- [ ] 상세 경로를 프로덕션 서버(`next start`)로 확인 — dev 서버만으로 BUG-005 를 놓쳤다

---

## Verification

1. 120장 전수 결과표에서 칸 수 분포와 0점 칸 수 집계
2. `/photo/m-amekaji-005` 를 `next start` 로 열어 상품 4개·제목·완성가 확인
3. `/mood/amekaji` 상품 목록 수가 변경 전과 같은지 확인

---

## Implementation Notes
