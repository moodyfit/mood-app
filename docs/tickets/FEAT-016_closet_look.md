# FEAT-016: 코디 담기 + 옷장 '있는 것' 오표기

사진 상세에서 코디를 통째로 옷장에 담고, 옷 상세 "이거 들어간 룩"과 옷장 썸네일을 담은 사진 기준으로 보여준다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | In Progress |
| 우선순위 | P1 |
| Layer | Lib / Component |
| Related | FEAT-015, BUG-010, 10/16 회의록 c·e |

---

## Problem

- **현재 동작**: 사진 상세 하단 "이 느낌 통째로 사기"는 데모 구매 시트만 연다. '블랙 오버핏 후디'를 담으면 옷 상세 "이거 들어간 룩"에 상관없는 '코튼 니트'가 '있는 것 ✓'으로 뜬다. 옷장 썸네일은 담은 사진이 아니라 무드 대표 사진이다
- **기대 동작**: 하단 버튼으로 사진 속 옷 전부를 옷장에 담는다. "이거 들어간 룩"은 그 사진의 실제 상품이고, 담은 옷에만 ✓가 붙는다. 썸네일은 담은 사진이다
- **영향 범위**: 사진 상세(`PhotoProductView`·`ProductRow`·`WholeLook`), 옷 상세(`ClosetItem`), 옷장 목록(`Closet`), 나의 공간 미리보기, 공용 토스트

---

## Context

```
관련 파일:
- src/lib/types.ts:63-69              OwnedItem — 사진 출처 필드 없음
- src/lib/photos.ts:100-128           fetchProductsByPhoto — 상품 id `{사진파일명}-{상품명}`
- src/lib/store.tsx:330, 534-548      showToast(문자열만), toggleOwned
- src/components/Toast.tsx            pointer-events-none, 글자만
- src/components/WholeLook.tsx:35     "이 느낌 통째로 사기"
- src/components/ProductRow.tsx:93-120 '담기' + 복귀 인라인 버튼
- src/components/ClosetItem.tsx:40-41, 47-56, 93
- src/components/Closet.tsx:44-45, src/app/space/page.tsx:59-60  썸네일
```

### e 원인

`ClosetItem` 이 담은 옷과 무관하게 더미 `slotPieces()` 4칸(셋업 자켓·코튼 니트·와이드 슬랙스·레더 스니커)을 그리고, `ownedCats.has(p.category)` 카테고리로만 ✓를 붙인다. 후디(상의)를 담으면 같은 상의인 코튼 니트에 ✓가 붙는다. 옷이 어느 사진에서 왔는지 저장하지 않아 실제 상품을 찾을 방법이 없다.

### 왜 `photo` 필드인가

코디를 따로 저장하지 않고, 옷마다 출처 사진(`photo`)을 붙여 같은 `photo` 를 가진 옷들의 묶음을 코디로 본다. 저장 키 `mood.owned.v1` 과 기존 id 형식(더미 `{mood}-{i}-{tier}`, 사진 상품 `{사진파일명}-{상품명}`)을 그대로 두어 이미 담긴 옷이 깨지지 않는다.

### 담기 버튼 중복

FEAT-003(`e1345bf`) 용어 통일 때 복귀 인라인 질문 "샀어?"가 '담기'로 바뀌어, 인라인 버튼과 위 '담기' 버튼이 같은 `toggleOwned` 를 부른다.

### BUG-010 과의 관계

BUG-010(PR #31)은 `Closet.tsx`·`space/page.tsx` 의 `href` 한 줄씩만 바꾼다. 이 티켓은 그 줄을 건드리지 않고 썸네일 줄만 고친다. `git merge-file` 3-way 시뮬레이션에서 두 파일 충돌 0.

---

## 결정

| 필드 | 예 | 빈 값일 때 |
|---|---|---|
| `OwnedItem.photo?` | `moods/m-street-001.jpg` | 더미·이 티켓 전에 담은 옷 → 무드 대표 사진, "이거 들어간 룩"은 아래 규칙 |
| `Product.photo?` | 같음 | `fetchProductsByPhoto` 만 채움(담기 버튼이 있는 `ProductRow` 가 상품만 받아 사진을 상품에 실음). 무드 상세 더미는 없음 |

- "이거 들어간 룩": `photo` 있음 → 그 사진의 products, ✓는 id 일치. 더미 id → 4칸 유지, ✓는 슬롯 id(`{mood}-{i}-`) 일치. 그 밖·조회 0건 → 섹션 숨김
- 사진 상세 하단 버튼: 담기 전 `내 옷장에 담기` / 일부 `나머지 N벌 옷장에 담기` / 전부 `옷장에 담겨 있어 ✓`(비활성). 안 담은 것만 넣고 토스트·affinity 1회
- 토스트: 지금은 문자열만 받아 링크를 못 담는다 → `showToast(msg, link?)`. 담기(한 벌·코디)만 `옷장 보기 →` `/closet` 링크, 3초. 그 밖은 지금처럼 글자만 1.9초
- 복귀 인라인 버튼이 떠 있는 동안 '담기' 버튼은 숨긴다

---

## Scope

### 포함

1. `src/lib/types.ts` — `OwnedItem.photo?`, `Product.photo?`
2. `src/lib/photos.ts:100-128` — `fetchProductsByPhoto` 가 `photo` 를 채움
3. `src/lib/store.tsx` — `addOwnedMany`, `showToast(msg, link?)`, 담기 토스트에 옷장 링크
4. `src/components/Toast.tsx` — 링크가 있을 때만 탭 가능
5. `src/components/WholeLook.tsx` — 사진 상세에서 "내 옷장에 담기"(무드 상세는 "통째로 사기" 유지)
6. `src/components/ProductRow.tsx:93-120` — 담을 때 `photo` 저장, 인라인 버튼이 뜨면 '담기' 숨김
7. `src/components/ClosetItem.tsx:40-56, 93` — "이거 들어간 룩"을 사진 상품·id 비교로, 맨 위 사진을 담은 사진으로
8. `src/components/Closet.tsx:44-45`, `src/app/space/page.tsx:59-60` — 썸네일을 담은 사진으로(`href` 줄 미변경)

### 제외

- 옷장 목록을 코디별로 묶어 보기 — 후속
- 무드 상세 `WholeLook` 담기 전환 — 상품이 더미
- `photo` 없이 담긴 사진 상품의 사진 역산 — 업로드 사진 경로 형식이 달라 틀릴 수 있음
- 옷 상세로 가는 토스트 링크(`/closet/item?id=`) — BUG-010 머지 후

---

## Strategy

1. 데이터 — 타입·`fetchProductsByPhoto`·store
2. 토스트 링크
3. 담기 — `WholeLook`·`ProductRow`
4. 옷 상세 — `ClosetItem`
5. 목록 썸네일 — `Closet`·`space/page`

---

## Acceptance Criteria

- [ ] 사진 상세에서 '블랙 오버핏 후디'만 담으면 옷 상세 "이거 들어간 룩"에 그 사진 상품이 뜨고 후디에만 '있는 것 ✓'
- [ ] 하단 버튼으로 담으면 안 담은 옷만 들어가고 토스트는 1번, 전부 담기면 `옷장에 담겨 있어 ✓`
- [ ] 판매처에서 돌아와 인라인 버튼이 뜨면 '담기' 버튼이 안 보인다
- [ ] 담기 토스트의 `옷장 보기 →` 를 누르면 `/closet` 으로 간다. 다른 토스트는 글자만
- [ ] 사진에서 담은 옷은 옷장 목록·나의 공간·옷 상세에 그 사진이 보이고, 더미·예전 옷은 무드 대표 사진
- [ ] 이미 저장된 더미 id `{mood}-{i}-미드` 옷의 상세가 지금처럼 열린다
- [ ] `npx tsc --noEmit`, `npm run build`, `npm run build:cap` 통과

---

## Verification

- 후디 재현(수정 전/후): (대기)
- 빌드 3종: (대기)
- BUG-010 rebase 충돌: (대기)
