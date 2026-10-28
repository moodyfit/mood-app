# FEAT-019: 무드 상세 실제 상품

무드 상세·무드 카드·약속 모드의 더미 상품과 금액을 그 무드 대표 사진의 실제 코디로 바꾸고 더미(`SLOTS`)를 지운다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | In Progress |
| 우선순위 | P1 |
| Layer | Lib / Component |
| Related | FEAT-015, FEAT-016 후속 1, 10/23 회의록 f, FEAT-017(#34), FEAT-020 |

---

## Problem

- **현재 동작**: 6무드 상세가 모두 같은 더미 4벌(셋업 자켓·코튼 니트·와이드 슬랙스·레더 스니커)과 가짜 판매처·가격을 보여준다. 무드 카드·약속 모드의 `이 느낌 완성` 금액, 더미 옷 상세의 `추천 조합` 4칸도 같은 더미다
- **기대 동작**: 무드 상세에 그 무드 대표 사진과 해설, 그 사진에 실제로 입힌 상품이 뜨고, 링크는 무신사로 열린다. 완성 금액은 그 합계다
- **영향 범위**: 무드 상세(`MoodDetail`·`MoodHero`·`ProductSection`), 무드 카드(`MoodCard`), 약속 모드(`PromiseMode`), 옷 상세(`ClosetItem`), 사진 상세 상품 순서

---

## Context

```
관련 파일:
- src/lib/products.ts:22-114            SLOTS 더미, buildLook·productsFor·slotPieces·lookTotal
- src/lib/photos.ts:100-128             fetchProductsByPhoto — 사진 1장 상품
- src/app/mood/[key]/MoodDetail.tsx:24  productsFor, 해설은 mood.caption
- src/components/MoodHero.tsx:40-42     완성가 칩(0원 가드 없음)
- src/components/MoodCard.tsx:139-141   lookTotal
- src/components/PromiseMode.tsx:119    fitLookToBudget(productsFor)
- src/components/ClosetItem.tsx:67-75   더미 id → slotPieces 4칸
```

### 왜 대표 사진인가

처음엔 무드 사진 전체에서 카테고리마다 가장 많이 나온 상품을 골랐다(무신사 URL 기준). 데이터가 이 방식과 맞지 않았다.

- 같은 상품이 여러 사진에 다시 연결되지 않는다. 여성 soft 는 사진 12장에 상의 12개가 전부 다른 상품이다. 여성 classic 신발은 사진 1장에만 연결돼 있다
- 서로 다른 사진의 상품을 모은 조합이라 맨 위 사진·해설과 상품이 어긋난다(clean 해설 "차콜 슬랙스" ↔ 상품 아이보리 슬랙스)
- 기본템(화이트 티·화이트 스니커즈)이 여러 무드에 반복된다. 무드 수로 점수를 나누는 규칙도 비교했지만 사진 1~2장 차이로 결과가 뒤집힌다

photos 에 이미 무드 × 성별마다 대표 사진(`is_flagship`) 2장씩, 24장이 있고 모두 상품·해설이 연결돼 있다. 한 사람이 실제로 입은 코디라 사진·해설·상품이 일치한다.

---

## Scope

### 포함

1. `src/lib/photos.ts:100-186` — 상품 묶기를 `toProducts` 로 분리(카테고리 순 정렬), `fetchFlagshipLooks`(대표 사진 + 상품, 모듈 캐시), `pickFlagshipLook`
2. `src/lib/products.ts` — 더미 `SLOTS`·`buildLook`·`productsFor`·`slotPieces`·`lookTotal` 삭제
3. `src/lib/hooks/usePhotos.ts:71` — `useMoodLooks()` → `{ lookFor, loading }`, store `genderFilter` 반영
4. `src/app/mood/[key]/MoodDetail.tsx`, `MoodHero.tsx`, `ProductSection.tsx` — 사진·해설·썸네일·상품·완성가를 대표 사진으로. 없으면 내장 이미지·`mood.caption`, 상품 섹션·담기·칩 숨김
5. `src/components/MoodCard.tsx`, `src/components/PromiseMode.tsx` — 완성 금액을 대표 사진 상품 합계로, 0원이면 숨김
6. `src/components/ClosetItem.tsx:56` — 더미 분기·`추천 조합` 라벨 삭제
7. `src/lib/photos.ts` — #34(FEAT-017) 머지 후 rebase, `toProducts`·조회 컬럼에 `image_url` 연결. 무드 상세 상품 카드에도 크롭 썸네일

### 제외

- 이미 담긴 더미 옷 저장 데이터 정리 — 그대로 둔다

---

## 결정

- 대표 사진 고르기: 그 무드(`mood_vector` 최상위 축) 대표 사진 중 성별 필터에 맞는 것 → 상품이 많은 것 → 파일명 순. `전체` 면 6무드 모두 남성 대표 사진이 골라진다
- 상품 id: 사진 상세와 같은 `{사진파일명}-{상품명}`, `photo` 는 대표 사진. 같은 상품을 두 화면에서 담아도 한 번만 들어가고, 옷장에선 '코디' 카드로 묶인다
- 상품 순서: 아우터 → 상의 → 하의 → 신발. 공용 `toProducts` 에서 정렬해 사진 상세도 같은 순서
- 이미 담긴 더미 옷(`{mood}-{i}-미드`): 옷장에 그대로 두고, 옷 상세 조합 섹션만 사라진다

### 알려진 한계

- 2~4벌이다. `m-street-001`·`w-clean-002` 같은 대표 사진은 2벌이라 상품이 더 많은 다른 대표 사진이 골라진다
- 대표 사진 지정·상품 연결이 바뀌면 무드 상세도 바로 바뀐다
- 판매처가 1곳(무신사)이라 가격 비교 줄은 안 나온다
- 무드 카드 금액은 사진이 없을 때만 쓰는 대체 화면에서 그려져, 실서비스에선 보이지 않는다

---

## Strategy

1. ✅ 티켓 발급
2. ✅ lib — 대표 사진 조회·고르기·훅, 더미 삭제
3. ✅ 무드 상세·완성가 칩
4. ✅ 무드 카드·약속 모드
5. ✅ 옷 상세 더미 분기 삭제
6. ✅ 검증
7. #34(FEAT-017) 머지 후 rebase·크롭 썸네일 연결

---

## Acceptance Criteria

- [x] 무드 상세 6개 모두 대표 사진·해설과 그 사진의 실제 상품이 뜨고, 탭하면 무신사 상품 페이지가 열린다
- [x] 완성가 칩·약속 모드(예산 상관없음) 금액이 무드 상세 상품 합계와 같다
- [x] 성별 필터를 바꾸면 그 성별 대표 사진 코디로 바뀐다
- [x] 상품을 못 불러오면 상품 섹션·`코디 통째로 담기`·완성가 칩이 빈 칸 없이 숨는다
- [x] 무드 상세에서 담은 옷이 옷장 '코디' 카드로 묶이고, 옷 상세에 `이 코디 구성` 이 뜬다
- [x] 이미 담긴 더미 옷의 상세가 열리고 조합 섹션이 없다
- [ ] 무드 상세 상품 카드에 크롭 썸네일이 뜬다

---

## Verification

- 대표 사진 고르기 6무드 × 성별 3 = 18조합: 사진·완성가·상품·해설이 DB 계산값과 18/18 일치 (`전체`·남성 = m- 대표 사진, 여성 = w- 대표 사진)
- 외부 링크: classic 첫 상품 탭 → `https://www.musinsa.com/products/4804620`
- 빈 상태: `*supabase.co*` 차단 → 내장 이미지·`mood.caption` 만, 칩·상품 섹션·담기 버튼 없음
- 코디 담기: clean `코디 통째로 담기` → 3벌 `photo: moods/m-clean-001.jpg`, 옷장 `코디 · 클린 미니멀`, 사진 상세 `/photo?slug=m-clean-001` 3벌 `✓ 담음`, 옷 상세 `이 코디 구성` 3벌 `담은 것 ✓`
- 더미 옷 `street-1-미드` 상세: 열림, 조합 섹션 없음
- 약속 모드 `첫 소개팅`: 무드 상세 금액과 같음
- 상품 순서: soft 무드 상세·사진 상세 모두 `크림색 케이블니트 · 베이지 팬츠 · 화이트 스니커즈`
- `tsc --noEmit` 통과. lint 는 저장소에 ESLint 설정이 없어 생략
- `npm run build:cap` 통과 — `/mood/[key]` 6경로·`/closet/item`·`/photo` 정적 생성
- 크롭 썸네일 — (대기)

---

## Implementation Notes

### 번호

FEAT-018 로 발급했지만 #35(PWA)가 같은 번호를 먼저 써서 FEAT-019 로 바꿨다. 썸네일 줄 후속은 FEAT-020.

---

## 후속 작업

1. 무드 상세 다른 코디 고르기(FEAT-020) — 큰 사진 아래 같은 무드 코디 썸네일 줄, 탭하면 사진·해설·상품·완성가가 바뀐다. 첫 칸은 대표 사진, 무드 카드·약속 모드 금액은 대표 사진 기준. 목업 `FEAT-020_thumbstrip-mockup.png`. 썸네일 순서·`전체` 필터의 남녀 혼합·뒤로가기 후 상태 결정 필요
2. "이 무드에 자주 나오는 아이템" 섹션 — 대표 사진 상품을 빼고 사진 2장 이상, 많이 나온 순. 지금은 비슷한 와이드 팬츠가 몰리고 여성 필터는 2개뿐이라 보류. 같은 상품을 여러 사진에 연결하는 큐레이션이 쌓이면 카테고리당 1개 조건으로 넣는다
3. 많이 나온 상품으로 코디 사진 생성 → 대표 사진 지정 — 코드 변경 없이 데이터만으로 반영된다. 생성 이미지가 실제 상품과 달라 보일 수 있고, 무신사 이미지를 생성 입력으로 쓸 수 없다(약관)
