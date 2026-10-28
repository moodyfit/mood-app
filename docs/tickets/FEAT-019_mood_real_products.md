# FEAT-019: 무드 상세 실제 상품

무드 상세·무드 카드·약속 모드의 더미 상품과 금액을 그 무드 사진의 실제 상품으로 바꾸고 더미(`SLOTS`)를 지운다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Todo |
| 우선순위 | P1 |
| Layer | Lib / Component |
| Related | FEAT-015, FEAT-016 후속 1, 10/23 회의록 f |

---

## Problem

- **현재 동작**: 6무드 상세가 모두 같은 더미 4벌(셋업 자켓·코튼 니트·와이드 슬랙스·레더 스니커)과 가짜 판매처·가격을 보여준다. 무드 카드·약속 모드의 `이 느낌 완성` 금액, 더미 옷 상세의 `추천 조합` 4칸도 같은 더미다
- **기대 동작**: 무드 상세에 그 무드 사진에 가장 많이 나온 실제 상품이 카테고리마다 1벌씩 뜨고, 링크는 무신사로 열린다. 완성 금액은 그 합계다
- **영향 범위**: 무드 상세(`MoodDetail`·`MoodHero`), 무드 카드(`MoodCard`), 약속 모드(`PromiseMode`), 옷 상세(`ClosetItem`)

---

## Context

```
관련 파일:
- src/lib/products.ts:22-114            SLOTS 더미, buildLook·productsFor·slotPieces·lookTotal
- src/lib/photos.ts:100-128             fetchProductsByPhoto — 사진 1장 상품
- src/app/mood/[key]/MoodDetail.tsx:24  productsFor
- src/components/MoodHero.tsx:40-42     완성가 칩(0원 가드 없음)
- src/components/MoodCard.tsx:139-141   lookTotal
- src/components/PromiseMode.tsx:119    fitLookToBudget(productsFor)
- src/components/ClosetItem.tsx:67-75   더미 id → slotPieces 4칸
```

### 실제 데이터

products 336행, 무신사 URL 기준 실제 상품 131개. 같은 URL이 다른 이름으로 들어간 경우가 있어(`아이보리 와이드 슬랙스`/`아이보리 와이드 팬츠`) 이름이 아니라 URL로 묶는다. 판매처는 전부 무신사 1곳. cityboy 신발, clean·street 아우터가 0이라 무드에 따라 3~4벌이다. 모든 행에 `photo_image_url` 이 있고 사진 120장은 남녀 60:60.

---

## Scope

### 포함

1. `src/lib/photos.ts` — `fetchMoodProductRows()`: products + photos(`image_url,gender`) 조회, 행에 gender 부착, 모듈 Promise 캐시
2. `src/lib/products.ts` — `pickMoodLook(rows, moodKey, gender)`. 더미 `SLOTS`·`buildLook`·`productsFor`·`slotPieces`·`lookTotal` 삭제
3. `src/lib/hooks/usePhotos.ts` — `useMoodLooks()` → `{ lookFor, loading }`, store `genderFilter` 반영
4. `src/app/mood/[key]/MoodDetail.tsx`, `src/components/MoodHero.tsx` — 실제 상품, 0벌이면 상품 섹션·담기 버튼·완성가 칩 숨김
5. `src/components/MoodCard.tsx`, `src/components/PromiseMode.tsx` — 완성 금액을 실제 상품 합계로
6. `src/components/ClosetItem.tsx` — 더미 분기·`추천 조합` 라벨 삭제

### 제외

- 이미 담긴 더미 옷 저장 데이터 정리 — 그대로 둔다
- 상품 카드 크롭 썸네일(h) — 에린 작업 후 붙인다

---

## 결정

- 구성: 카테고리(아우터 → 상의 → 하의 → 신발)마다 등장한 사진 수가 가장 많은 URL 1개, 같으면 싼 것. 이름은 그 URL로 가장 많이 쓰인 이름, 가격은 최저가
- 성별: 홈 성별 필터를 따른다. `전체` 면 남녀 합산
- id: `musinsa-{URL 상품번호}`. 슬래시가 없고 더미 정규식과 겹치지 않는다. `photo` 는 비운다 — 특정 사진의 코디가 아니라 옷장에선 '옷' 섹션에 들어간다
- 이미 담긴 더미 옷(`{mood}-{i}-미드`): 옷장에 그대로 두고, 옷 상세 조합 섹션만 사라진다

### 알려진 한계

- 같은 상품을 사진 상세(id `{slug}-{name}`)와 무드 상세(id `musinsa-…`)에서 각각 담으면 옷장에 두 번 들어간다
- 판매처가 1곳이라 가격 비교 줄은 안 나온다

---

## Strategy

1. 티켓 발급
2. lib — 조회·고르기·훅, 더미 삭제
3. 무드 상세·완성가 칩
4. 무드 카드·약속 모드
5. 옷 상세 더미 분기 삭제
6. 검증

---

## Acceptance Criteria

- [ ] 무드 상세 6개 모두 그 무드의 실제 상품이 카테고리별 1벌씩(3~4벌) 뜨고, 탭하면 무신사 상품 페이지가 열린다
- [ ] 완성가 칩·무드 카드·약속 모드(예산 상관없음) 금액이 무드 상세 상품 합계와 같다
- [ ] 성별 필터를 바꾸면 무드 상세 상품이 그 성별 사진 기준으로 바뀐다
- [ ] 상품을 못 불러오면 상품 섹션·`코디 통째로 담기`·완성가 칩이 빈 칸 없이 숨는다
- [ ] 무드 상세에서 담은 옷이 옷장 '옷' 섹션에 들어가고 옷 상세가 열린다
- [ ] 이미 담긴 더미 옷의 상세가 열리고 조합 섹션이 없다

---

## Verification

- 고르기 결과 대조(6무드 × 성별 3) — (대기)
- `tsc --noEmit`·lint — (대기)
- 브라우저 확인 — (대기)
- `npm run build:cap` — (대기)
