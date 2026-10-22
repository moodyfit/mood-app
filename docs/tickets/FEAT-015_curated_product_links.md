# FEAT-015: 사진 속 아이템을 실제 상품 1개 링크로 연결

사진 상세의 상품을 `caption_item` 에 적힌 아이템 그대로 보여주고, 몰 검색 링크 대신 실제 상품 페이지로 보낸다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Done |
| 우선순위 | P0 |
| Layer | Data / Lib / Component |
| Related | BUG-007, BUG-009 |

---

## Problem

- **현재 동작**: 상품명이 캡션과 다르고(캡션 `블루 데님 트러커 자켓` → 상품 `셰르파 데님 자켓`), 누르면 무신사 검색 결과로 간다
- **기대 동작**: 캡션의 아이템명이 그대로 보이고, 누르면 무신사의 실제 상품 페이지 1개로 간다
- **영향 범위**: `/photo/[slug]` 상품 섹션, 완성가 배지, `WholeLook`, `ProductRow`(무드 상세 포함)

---

## Context

```
관련 파일:
- src/lib/photos.ts:125      fetchProductsByPhoto — products.photo_image_url 로 조회
- src/lib/photos.ts:156-247  BUG-007 캡션 매칭(matchLook) + 무드 폴백
- src/lib/hooks/usePhotos.ts:57
- src/components/PhotoProductView.tsx:74-76
- scripts/enrich-naver.ts    네이버 쇼핑 검색 API 사용
```

### 왜 캡션과 상품이 어긋나나

v3 교체(`ddf985b`)로 사진 경로가 바뀌어 `products.photo_image_url` 267행이 모두 고아다. 사진 120장 전부 무드 상품 풀에서 캡션 매칭으로 고르고 있어, 이름이 캡션과 같을 수 없다. 링크도 267행 중 213행이 `musinsa.com/search` 검색 URL이다.

### 왜 몰 직접 검색인가

네이버 쇼핑 검색 API는 2026-07-31 종료, NAVER API HUB 이관 제외, 대체 API 없음(개발자센터 공지). 몰 내부 검색을 스크립트로 부르는 것은 robots 가 막는다 — 무신사 `User-agent: * Disallow: /`(허용 명단에 `Claude-User` 포함), 유니클로 `/*/*/search?q=` 차단. 그래서 무신사는 소피 브라우저에서 Claude in Chrome 이 검색·후보 제시하고 소피가 확정한다. 앱 런타임은 DB 에 저장된 URL 만 읽는다.

---

## 결정

- 표시명과 검색어 모두 캡션 표현 그대로(무드 키 없음)
- 무신사 추천순 상위 10개(없으면 20개, 맞는 게 비싸면 30개) 중 캡션과 맞는 단품만 남겨 최저가 1개. 묶음(PACK·세트)·캡션에 없는 특징(크롭·그래픽 등)·품절 제외. 사진 성별별로 찾는다 — 남성 사진은 남성 필터(남·공용), 여성 사진은 여성 필터(여·공용). 상품 성별은 상품 페이지 표기로 확인
- 캡션 표현 검색에 맞는 단품이 없거나 비싸면 "무신사 스탠다드 + 캡션 표현" 으로 한 번 더 검색해 비교(추천순 상위가 그래픽·팩 상품으로 채워지는 기본템 대비)
- 아이템 1개에 무신사 1행
- 연결 상품이 없으면 무드 폴백 없이 빈 상태 문구
- SQL은 소피가 대시보드에서 실행. DB 반영 후 코드 배포

---

## Scope

### 포함

1. `scripts/` — 캡션 → 아이템 CSV 추출(사진·성별·카테고리·아이템명)
2. `scripts/` — 후보 CSV(아이템·몰·상품명·가격·URL·확인일). Claude in Chrome 이 채우고 소피가 검수
3. `scripts/` — 확정 후보 CSV → INSERT SQL
4. `src/lib/photos.ts:156-247` — `matchLook`·표 3개·`PhotoProductsSource` 삭제, `getProductsForPhoto` 는 연결 상품만
5. `src/lib/photos.ts:87-121` — 폴백이 빠져 소비자가 없어지는 `fetchProductsByMood`·`getProductsForMood` 삭제
6. `src/lib/hooks/usePhotos.ts:57`, `src/app/photo/[slug]/PhotoDetail.tsx:25` — `source`·`moodKey`·`caption` 인자 제거
7. `src/components/PhotoProductView.tsx:74-76` — 제목 `이 사진 그대로` 고정, `가격·링크 확인 중` 문구 제거
8. `scripts/enrich-naver.ts` 삭제
9. `src/components/ProductRow.tsx:56-63` — 썸네일 박스 제거(10/8 회의 `사진 없애고 텍스트만`). 사진 상세·무드 상세 둘 다 적용

### 제외

- 무드 상세 완성가가 무드 전체 상품을 합산하는 문제 — BUG-009
- 사진 교체 시 상품 고아 방지(FK cascade 또는 prune 확장) — 별도
- 업로드 사진 큐레이션 · 품절·가격 변동 재점검 — 별도
- 유니클로·자라 링크 — 유니클로는 robots 가 검색을 막고 자라는 약관 미확인. 필요하면 기본템(화이트 티·셔츠·니트·슬랙스·청바지)부터 별도로
- 기존 고아 267행 삭제 — 이 티켓 뒤 앱에서 읽는 곳이 없다. 큐레이션 행이 자리 잡은 뒤 별도 정리

---

## Strategy

### Step 1: 아이템 CSV

`caption_item` 을 BUG-007 절 분리 규칙으로 쪼개 CSV로 낸다. 소피가 동사·합쳐진 조각·색 누락을 고쳐 확정한다.

### Step 2: 후보 CSV

`queue.csv` 묶음 순서대로 무신사 검색(추천순) 상위 10개 → 캡션과 맞는 단품 → 최저가를 후보 CSV 에 쌓고, 고른 이유를 한 줄 남긴다. 사람 속도로 진행하고 Cloudflare 확인 화면은 소피가 통과시킨다. 소피가 묶음마다 틀린 후보를 고치거나 지운다.

### Step 3: SQL → 코드

BUG-009 배포 후 INSERT 실행, 그다음 코드 PR 배포.

---

## Acceptance Criteria

- [ ] 사진 상세 상품명이 확정 아이템 CSV의 이름과 같다
- [ ] 상품을 누르면 상품 상세 페이지(`/products/`, `-p{id}.html` 등)가 열린다. 검색 URL 0건
- [ ] 연결 상품이 없는 사진(업로드 등)은 빈 상태 문구만 보인다
- [ ] 상품 행에 썸네일 없이 상품명·가격·판매처만 보인다(사진 상세·무드 상세)
- [ ] iOS·Android 앱에서 상품을 열면 인앱 브라우저로 뜨고, 닫으면 사진 상세로 돌아온다
- [ ] `npx tsc --noEmit`, `npm run build`, `npm run build:cap` 통과

---

## Verification

- 아이템 CSV: (대기)
- 후보 CSV 몰별 적중률: (대기)
- 반영 행 수 / 검색 URL 잔존: (대기)
