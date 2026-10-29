# FEAT-020: 무드 상세 다른 코디 고르기

무드 상세 큰 사진 아래에 같은 무드 코디 썸네일 줄을 두고, 탭하면 사진·해설·상품·완성가가 그 코디로 바뀐다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Todo |
| 우선순위 | P1 |
| Layer | Lib / Component |
| Related | FEAT-019(#36) 후속 1 |

---

## Problem

- **현재 동작**: 무드 상세는 대표 사진 1장의 코디만 보여준다. 무드마다 사진이 17~22장(성별 필터 시 7~12장) 있지만 무드 상세에서 볼 방법이 없다
- **기대 동작**: 큰 사진 아래 "이 무드의 다른 코디" 썸네일 줄에서 다른 코디를 골라 같은 화면에서 사진·해설·상품·완성가를 본다
- **영향 범위**: 무드 상세(`MoodDetail`·`ProductSection`), 신규 `LookStrip`, `usePhotos` 훅

---

## Context

```
관련 파일:
- src/app/mood/[key]/MoodDetail.tsx   대표 사진 1장 고정(FEAT-019)
- src/lib/hooks/usePhotos.ts          usePhotos·useProductsForPhoto·useMoodLooks
- src/lib/photos.ts                   dominantMood·filterByGender·photoUrl
- src/lib/similarity.ts               rankSimilarPhotos — mood_vector 코사인 유사도
```

### 왜 썸네일 줄인가

스와이프와 썸네일 줄 목업을 비교했다(`FEAT-020_swipe-mockup.png`, `FEAT-020_thumbstrip-mockup.png`). 스와이프는 넘길 수 있다는 걸 알기 어렵고, 사진 영역이 iOS 화면 왼쪽 끝 뒤로가기 제스처와 겹친다. 썸네일 줄은 몇 장인지·어떤 코디인지 미리 보이고, 원하는 코디로 바로 간다.

---

## Scope

### 포함

1. `src/lib/hooks/usePhotos.ts` — `useMoodPhotos(moodKey, first)`: 무드·성별 필터, 대표 사진 첫 칸 + 나머지 비슷한 순
2. `src/components/LookStrip.tsx`(신규) — 제목·`n / N`·가로 스크롤 썸네일, 대표 배지, 선택 테두리, 오른쪽 끝 흐림
3. `src/app/mood/[key]/MoodDetail.tsx` — 선택 사진 state, 사진·칩·해설·상품·담기가 선택 사진을 따름
4. `src/components/ProductSection.tsx` 삭제 — "이게 뜬 이유" 박스를 빼면 상품 목록만 남아, 무드 상세에서 `ProductRow` 목록을 바로 그린다(사용처 무드 상세 1곳)

### 제외

- 무드 카드·약속 모드 금액 — 대표 사진 기준 유지
- 썸네일 탭 시 취향 신호(`recordView`) — 필요해지면 후속

---

## 결정

- 순서: 대표 사진 첫 칸 → 나머지는 대표 사진과 비슷한 순(`rankSimilarPhotos`)
- 성별 `전체`: 남녀 사진 모두
- 다른 화면에 갔다 오면 대표 사진으로 시작한다(저장 안 함). 무드 카드·약속 모드 금액과 늘 일치
- 사진 1장 이하·대표 사진 없음: 줄 숨김. 선택 사진 상품 로딩 중·0개: 상품 섹션·담기·칩 숨김
- 성별 필터를 바꿔 선택 사진이 목록에서 빠지면 대표 사진으로
- 목업대로 해설 바로 아래 상품 목록. "이게 뜬 이유" 박스는 뺀다 — 큰 사진·썸네일 줄과 같은 사진을 한 번 더 보여주는 자리였다

---

## Strategy

1. 티켓 발급
2. 훅 `useMoodPhotos`
3. `LookStrip` 컴포넌트
4. `MoodDetail` 선택 사진 연결, "이게 뜬 이유" 박스 삭제
5. 검증

---

## Acceptance Criteria

- [ ] 무드 상세에 썸네일 줄이 뜨고, 첫 칸은 대표 사진·`1 / N`
- [ ] 썸네일 개수가 성별 필터를 따른다(남 10 / 여 7~12 / 전체 17~22)
- [ ] 썸네일을 탭하면 사진·완성가·해설·상품이 그 사진 것으로 바뀌고 `n / N` 이 바뀐다
- [ ] 다른 코디에서 `코디 통째로 담기` → 담긴 옷의 출처가 그 사진이다
- [ ] 다른 화면에 갔다 오면 대표 사진으로 시작한다
- [ ] 상품 없는 사진은 상품 섹션·담기·칩 없이 사진·해설만 보인다
- [ ] 해설 바로 아래 상품 목록이 오고, "이게 뜬 이유" 박스가 없다

---

## Verification

- 6무드 × 성별 3 썸네일 개수·첫 칸 — (대기)
- 선택 사진 상품 DB 대조 — (대기)
- 코디 담기 출처 — (대기)
- `tsc --noEmit`·`npm run build:cap` — (대기)
