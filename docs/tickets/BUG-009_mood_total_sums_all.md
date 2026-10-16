# BUG-009: 무드 상세 완성가가 100만 원대로 나오고, 예산 다이얼이 두 개씩 선택된다

무드 상세의 완성가·통째로 사기·상품 목록을 같은 기본템(미드) 4칸으로 맞추고, 예산 다이얼(`같은 느낌, 다른 완성`)은 삭제한다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | BUG |
| Status | Done |
| 우선순위 | P1 |
| Layer | Lib / Page / Component |
| Related | BUG-007, FEAT-015 |

---

## Problem

- **현재 동작**: 완성가가 무드 DB 상품 24~31개 합계(96만~227만)인데 아래 목록은 4벌(약 26만)이다. 예산 다이얼에서 `20만`·`상관없음` 중 하나를 누르면 둘 다 선택 상태이고, `5만` 을 누르면 합계 10.6만이 나온다
- **기대 동작**: 완성가·`WholeLook`·아래 목록이 같은 기본템 4칸이다. 다이얼은 없앤다
- **영향 범위**: `/mood/[key]` 완성가(`MoodHero`), `WholeLook`, 예산 다이얼(`같은 느낌, 다른 완성`). 진입 경로 5곳(아래 표) 모두

---

## Context

```
관련 파일:
- src/app/mood/[key]/MoodDetail.tsx:16  useProductsForMood → DB products 무드 전체
- src/components/ProductSection.tsx:29   buildLook — 로컬 4칸
- src/components/ProductSection.tsx:61   active = tierForBudget(b.won) === tier
- src/lib/products.ts:65                 tierForBudget — 20만·상관없음 모두 하이
- src/lib/products.ts:155                BUDGETS — 약속 화면의 룩 전체 예산 목록
- src/lib/photos.ts:87-121               fetchProductsByMood / getProductsForMood
```

### 원인 1 — 완성가

완성가와 목록이 다른 소스를 읽는다. DB `products` 는 사진별 상품이라 무드로 묶으면 사진 수만큼 쌓인다. `fetchProductsByMood` 는 `mood_key` 로만 걸러 사진 연결 여부를 보지 않으므로, 사진별 행이 들어간 7/23 batch2·3(`837002e`·`0517368`)부터 있던 문제다. FEAT-015 큐레이션 행도 `mood_key` 가 NOT NULL 이라 같은 문제가 이어진다.

### 원인 2 — 다이얼 이중 선택

선택 상태를 버튼이 아니라 티어로 비교한다. 버튼 4개가 티어 3개에 매핑돼 `20만`·`상관없음` 이 같은 `하이` 를 가리킨다.

### 원인 3 — 금액 라벨

다이얼이 약속 화면의 `BUDGETS`(룩 전체 예산)를 빌려 쓴다. 무드 상세에선 티어 스위치라 `5만` 이 로우(합계 10.6만)를 뜻한다. 상품 1개 가격으로 읽어도 미드에 4.2만·3.3만이 섞여 맞지 않는다.

### 결정 — 다이얼 삭제

결 라벨 3개(`가볍게`·`기본`·`제대로`)로 원인 2·3을 고친 뒤, 10/16 회의에서 `같은 느낌, 다른 완성` 섹션을 없애기로 했다. 무드 상세 상품이 6무드 공통 더미라 티어를 바꿔도 무드와 무관한 같은 옷만 나온다. 원인 2·3은 섹션 삭제로 해소된다.

### 진입 경로

| 화면 | 누르는 곳 | 코드 |
|------|-----------|------|
| 홈 | 상단 `산 {아이템}, 오늘 입어볼까 ›` 줄 (내 옷 있는 유저만) | `HomeCloset.tsx:22` |
| 홈 → `약속 잡혔어? 3분 안에 결정 끝` | 상황·예산 고른 뒤 `‘{상황}’ — 이 조합이면 돼` 아래 무드 카드 | `PromiseMode.tsx:124` |
| 상단 검색 아이콘 | `무드별` 섹션의 무드 카드 | `search/page.tsx:165` |
| 검색 → 스크린샷 올리기 | `이 스샷, 이 느낌에 가까워?` 에서 무드 선택 | `ShotFinder.tsx:77` |
| 나의 공간 → 내 옷 아이템 | 하단 `더하면 완성 — {아이템} ›` 줄 | `ClosetItem.tsx:109` |

지금 프로덕션에서 보이지 않는 경로:

- 사진 DB가 비었을 때만 — 홈 6무드 커버, 검색 결과의 무드 카드·`지난번 ‘…’ 때 담은 룩 N개` (`MoodCard`, `SearchMemory`)
- `/scan` — 이동 링크 없음, 주소 직접 입력만 (`ScanDeck` → `MoodCard`)
- `Discovered`·`Room` — 어디서도 import 하지 않음

---

## Scope

### 포함

1. `MoodDetail.tsx` — `useProductsForMood` 대신 `productsFor(mood.key)`(기본템 4칸)를 완성가·`WholeLook`·`ProductSection` 에 같이 넘김
2. `useProductsForMood` 삭제 — 소비자가 `MoodDetail` 뿐
3. `ProductSection.tsx` — 예산 다이얼 섹션(`같은 느낌, 다른 완성`·다이얼 아래 금액 줄)과 `이 슬롯은 그대로가 최선` 안내 삭제. 받은 4칸만 그린다
4. `products.ts` — 소비자가 없어진 `tierForBudget`·`hasDial`·`slotHasTier`·`DIAL_SLOT_COUNT` 삭제
5. `MoodDetail.tsx` — 하단 여백 `pb-32` → `pb-8`. `main` 의 `pb-24` 와 합쳐 고정 탭바·통째로 사기(112px)를 덮는다

### 제외

- `getProductsForMood`·`fetchProductsByMood` — 사진 상세 폴백(`photos.ts:246`)이 아직 쓴다. FEAT-015 에서 삭제
- 약속 화면 예산 버튼(`PromiseMode.tsx:103`) — 원 단위로 비교해 해당 없음
- 무드 상세 상품이 6무드 공통 로컬 더미인 것 — 후속 티켓. 대표 사진의 `왜 멋있냐면` 문구 속 아이템(6무드 14개)을 FEAT-015 방식으로 큐레이션해 로컬 시드로 교체. 문구·사진 불일치(amekaji 문구 `밀리터리 코트` ↔ 사진 트러커 재킷) 점검 선행
- 사진 상세(`PhotoProductView.tsx`) 하단 여백 `pb-32` — 같은 구조, 별도로 맞춤
- `SLOTS` 로우·하이 변형 — `slotPieces`(내 옷 `더하면 완성` 가격 범위)가 로우 가격을 써서 위 후속 티켓에서 함께 정리

---

## Acceptance Criteria

- [x] 무드 6개 모두 진입 시 완성가 = 아래 목록 미드 티어 합계
- [x] 무드 상세에 예산 다이얼과 `이 슬롯은 그대로가 최선` 안내가 없다
- [x] 스크롤 끝에서 마지막 상품이 통째로 사기 버튼에 가리지 않는다
- [x] `npx tsc --noEmit`, `npm run build`, `npm run build:cap` 통과

---

## Verification

- 완성가: 수정 전 프로덕션 amekaji 상단·하단 141.5만(다이얼 아래 47.2만) → 수정 후 6무드 진입 시 상단·하단 22.6만
- 다이얼 삭제: 6무드 모두 다이얼·안내 문구 0건, 상품 4칸, 상단·하단 22.6만 (삭제 전 결 라벨 단계에서 가볍게 10.6만 · 기본 22.6만 · 제대로 47.2만, 누른 버튼만 선택 확인)
- 하단 여백: 마지막 상품과 통째로 사기 사이 `pb-32` 113px / 없음 -15px(가림) / `pb-8` 17px
- 빌드: 다이얼 삭제 후 `tsc` 통과, `build` 통과, `build:cap` 통과(정적 페이지 21개, `out/mood` 6개)
- 캡처: `~/Downloads/BUG-009_before_prod_amekaji.png`, `~/Downloads/BUG-009_after_amekaji_no-dial.png`
