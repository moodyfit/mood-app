# FEAT-016: 코디 담기 + 옷장 '있는 것' 오표기

사진·무드 상세에서 코디를 통째로 옷장에 담고, 옷 상세 "이 코디 구성"과 옷장 목록을 담은 사진 기준으로 보여준다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | In Progress |
| 우선순위 | P1 |
| Layer | Lib / Component |
| Related | FEAT-015, BUG-010, 10/16 회의록 c·e, 10/23 회의록 c·d·f·g |

---

## Problem

- **현재 동작**: 사진 상세 하단 "이 느낌 통째로 사기"는 데모 구매 시트만 연다. '블랙 오버핏 후디'를 담으면 옷 상세 "이거 들어간 룩"에 상관없는 '코튼 니트'가 '있는 것 ✓'으로 뜬다. 옷장 썸네일은 담은 사진이 아니라 무드 대표 사진이다
- **기대 동작**: 상품 목록 아래 버튼으로 코디 속 옷 전부를 옷장에 담는다. 옷 상세 "이 코디 구성"은 그 사진의 실제 상품이고, 담은 옷에만 ✓가 붙는다. 썸네일은 담은 사진이다
- **영향 범위**: 사진·무드 상세(`PhotoProductView`·`MoodDetail`·`ProductRow`·`WholeLook`), 옷 상세(`ClosetItem`), 옷장 목록(`Closet`), 나의 공간 미리보기, 공용 토스트

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

BUG-010(PR #31)은 `Closet.tsx`·`space/page.tsx` 의 `href` 한 줄씩만 바꾼다. `space/page.tsx` 는 썸네일 줄만 고쳐 `git merge-file` 충돌 0. `Closet.tsx` 는 코디·옷 섹션으로 구조를 바꿔 충돌 1 — rebase 때 이쪽 코드를 두고 링크 3곳(옷 2 `/closet/item?id=`, 코디 1 `/photo?slug=`)만 BUG-010 형식으로 바꾼다.

---

## 결정

| 필드 | 예 | 빈 값일 때 |
|---|---|---|
| `OwnedItem.photo?` | `moods/m-street-001.jpg` | 더미·이 티켓 전에 담은 옷 → 무드 대표 사진·공통 해설, 옷 상세 조합은 아래 규칙 |
| `Product.photo?` | 같음 | `fetchProductsByPhoto` 만 채움(담기 버튼이 있는 `ProductRow` 가 상품만 받아 사진을 상품에 실음). 무드 상세 더미는 없음 |

- 옷 상세 조합: `photo` 있음 → "이 코디 구성", 그 사진의 products, ✓는 id 일치. 더미 id → "추천 조합", 4칸 유지, ✓는 슬롯 id(`{mood}-{i}-`) 일치. 그 밖·조회 0건 → 섹션 숨김
- 코디 담기 버튼(사진·무드 상세 공통, 상품 목록 아래 테두리 버튼): 담기 전 `코디 통째로 담기` / 일부 `나머지 N벌 담기` / 전부 숨김. 가격 없음. 안 담은 것만 넣고 토스트·affinity 1회
- 토스트: 지금은 문자열만 받아 링크를 못 담는다 → `showToast(msg, link?)`. 담기는 `담았어`(코디 2벌 이상 `N벌 담았어`) + `옷장 보기` `/closet` 링크, 3초. 그 밖은 지금처럼 글자만 1.9초
- 복귀 인라인 버튼(`옷장에 담기`)이 떠 있는 동안 '담기' 버튼은 숨긴다
- 옷장은 '내 무드 조합을 위해 모아 두는 곳'이다. 소유 표현을 담기 기준으로: `있는 것 ✓`→`담은 것 ✓`, `✓ 내 옷`→`✓ 담음`, 제목 `내 옷`→`내 옷장`, 홈 `산 ○○, 오늘 입어볼까`→`담은 ○○, 이 조합 다시 볼까`
- 옷 상세 조합 라벨: 10/23 회의는 `추천 조합`으로 정했지만, 수정 후 사진에서 담은 옷에는 추천이 아니라 그 코디의 실제 구성이 떠서 `이 코디 구성`으로 나눈다
- 문구는 ux-writing 원칙(반복 금지·버튼은 결과·확인 가능한 사실)으로 줄인다. 사진 상세 섹션 제목 `이 사진 그대로`→`사진 속 아이템`(FEAT-015 "고정" 결정을 덮어씀 — 행동은 버튼이 말하고 제목은 목록을 말한다), 안내 `가격은 판매처 기준`, 판매처 1곳이면 `최저` 생략
- 옷장 목록: 같은 `photo` 는 '코디' 섹션 카드(사진 보기 → 사진 상세, 옷 줄 → 옷 상세), `photo` 없는 옷은 '옷' 섹션. 코디는 최근 담은 순, 빈 섹션은 숨김
- 옷 상세 해설·입는 법: `photo` 있으면 그 사진의 `caption_item`·`caption_why`·`caption_how`, 없거나 조회 실패면 무드 공통
- `입었어` 제거(10/23 회의 d). 관리자 이벤트 라벨 `worn` 은 과거 데이터 표시용으로 유지

---

## Scope

### 포함

1. `src/lib/types.ts` — `OwnedItem.photo?`, `Product.photo?`
2. `src/lib/photos.ts:100-128` — `fetchProductsByPhoto` 가 `photo` 를 채움
3. `src/lib/store.tsx` — `addOwnedMany`, `showToast(msg, link?)`, 담기 토스트에 옷장 링크
4. `src/components/Toast.tsx` — 링크가 있을 때만 탭 가능
5. `src/components/WholeLook.tsx` — 코디 통째로 담기(사진·무드 상세 공통, 목록 아래). 데모 구매 시트·하단 고정 제거
6. `src/components/ProductRow.tsx:93-120` — 담을 때 `photo` 저장, 인라인 버튼이 뜨면 '담기' 숨김
7. `src/components/ClosetItem.tsx:40-56, 93` — 옷 상세 조합을 사진 상품·id 비교로("이 코디 구성"/"추천 조합"), 맨 위 사진을 담은 사진으로
8. `src/components/Closet.tsx`, `src/app/space/page.tsx:59-60` — 옷장 목록을 코디·옷 섹션으로(코디 카드는 담은 사진), 미리보기 썸네일을 담은 사진으로
9. `src/app/mood/[key]/MoodDetail.tsx` — 코디 담기 버튼을 상품 목록 아래로
10. `src/components/PhotoProductView.tsx:71-72` — 섹션 제목·안내 문구, 하단 여백
11. `src/lib/hooks/usePhotos.ts` — `usePhotoBySlug` 빈 slug 는 조회 안 함(`ilike '%/.%'` 로 아무 사진이나 잡힘)
12. `src/components/ClosetItem.tsx`, `Closet.tsx`, `src/lib/store.tsx` — `입었어` 버튼·착용 카운트·`worn` 상태 제거
13. `src/app/closet/page.tsx`, `src/app/space/page.tsx:35`, `src/components/HomeCloset.tsx:26` — 소유 표현 문구

### 제외

- `photo` 없이 담긴 사진 상품의 사진 역산 — 업로드 사진 경로 형식이 달라 틀릴 수 있음
- 옷 상세로 가는 토스트 링크(`/closet/item?id=`) — BUG-010 머지 후
- 상품 카드 배치 개편·크롭 썸네일 — 시험 후 되돌림. 크롭 데이터가 오면 후속에서
- 코디 담기 토스트 `되돌리기` — 넣었다 뺌. 한 벌씩은 `✓ 담음` 으로 뺄 수 있다
- 더미 상품 데이터(`products.ts` SLOTS) 제거 — 무드 카드 완성가·약속 모드·옷 상세 더미 경로가 함께 쓴다

### 후속 작업

1. 무드 상세 실제 상품 — 그 무드 사진들의 products 를 많이 나온 순으로. 무드 상세 가짜 판매처·가격, 무드 카드 `이 느낌 완성` 더미 금액, 더미 옷 상세의 `추천 조합` 4칸·무드 페이지 이동·가짜 가격 범위, 회의 f '실제 추천 상품인지' 검수가 함께 풀린다. 성별 필터·이미 담긴 더미 옷 처리 결정 필요
2. 상품 카드 크롭 썸네일(10/23 회의 h) — 에린 크롭 → `products` 이미지 경로 컬럼(DDL) → 카드 왼쪽 64px. 10/8 '텍스트만' 결정 재확정 필요. 목업 `~/Downloads/FEAT-016_step3_thumb.png`
3. 다판매처 표시 — 두 번째 몰 큐레이션 때. 대표 판매처 + 조용한 '다른 판매처'(가격·개수·최저 표시 없음). 목업 `~/Downloads/FEAT-016_multi-mall-quiet.png`
4. BUG-010 머지 뒤 — `Closet.tsx` 링크 3곳 새 주소로, 토스트 링크를 옷 상세로 보낼지
5. store 분리 — 토스트(`ToastProvider`)·인증·옷장. FE-FEAT-003·007 과 함께

---

## Strategy

1. 데이터·토스트 링크 — 타입·`fetchProductsByPhoto`·store·`Toast`
2. 담기 — `WholeLook`·`ProductRow`
3. 문구 — ux-writing 원칙 적용
4. 옷 상세 — `ClosetItem`
5. 옷장 목록 — `Closet`·`space/page`

---

## Acceptance Criteria

- [ ] 사진 상세에서 '블랙 오버핏 후디'만 담으면 옷 상세 "이 코디 구성"에 그 사진 상품이 뜨고 후디에만 '담은 것 ✓'
- [ ] 코디 담기 버튼으로 담으면 안 담은 옷만 들어가고 토스트는 1번, 전부 담기면 버튼이 숨는다
- [ ] 판매처에서 돌아와 인라인 버튼이 뜨면 '담기' 버튼이 안 보인다
- [ ] 담기 토스트의 `옷장 보기` 를 누르면 `/closet` 으로 간다. 다른 토스트는 글자만
- [ ] 사진에서 담은 옷은 옷장 목록(코디 카드)·나의 공간·옷 상세에 그 사진이 보이고, 더미·예전 옷은 무드 대표 사진
- [ ] 이미 저장된 더미 id `{mood}-{i}-미드` 옷의 상세가 지금처럼 열린다
- [ ] 무드 상세에서도 상품 목록 아래 `코디 통째로 담기` 가 보이고 하단 고정 버튼이 없다
- [ ] 사진에서 담은 옷의 상세 해설·입는 법이 그 사진 것이다
- [ ] 옷장 목록이 '코디'·'옷' 섹션으로 나뉘고, 코디 카드 `사진 보기` 는 사진 상세, 옷 줄은 옷 상세로 간다
- [ ] 옷장 목록·옷 상세에 `입었어`·착용 카운트가 없다
- [ ] 옷장 관련 화면에 `있는 것`·`내 옷`·`산 ○○` 소유 표현이 없다
- [ ] `npx tsc --noEmit`, `npm run build`, `npm run build:cap` 통과

---

## Verification

- 후디 재현(수정 전/후): (대기)
- 빌드 3종: (대기)
- BUG-010 rebase 충돌: (대기)
