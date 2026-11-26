# FEAT-041: 홈 필터 칩 — 스타일·TPO·무드 (한 번에 축 1개)

회의록(2026-11-16/11-20) 에린 담당 "홈 필터·검색 구조개편" 중 필터 칩 부분만 먼저 구현. 검색창 통합(상품명+무드+TPO를 입력창 하나로)은 성격이 다른 작업이라 별도 티켓으로 분리.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Backlog |
| 우선순위 | P1 |
| Layer | Component |
| Milestone | MS-01 |
| Depends | #53(FEAT-032) 머지 |
| Related | FEAT-032, FEAT-022(PromiseMode AI 번역 통일) |

---

## Problem

- **현재 동작**: 홈 상단에 FEAT-032로 만든 "스타일" 축 탭(전체+6개)만 있음. TPO·무드로 둘러볼 방법은 `/promise`(약속 모드)로 페이지 이동해야만 가능.
- **기대 동작**: 홈에서 스타일뿐 아니라 TPO·무드 축으로도 그 자리에서 필터링(페이지 이동 없이).
- **영향 범위**: `src/app/page.tsx`(탭 UI 확장), `src/components/HomeGallery.tsx`는 FEAT-032와 동일한 `moodKeys` 메커니즘을 그대로 씀(코드 변경 없을 가능성 높음).

### 비즈니스 근거

취향(무드) 탐색 진입점을 홈 하나로 모아서, "약속 잡혔어?" 카드까지 타지 않아도 상황·무드 기반 둘러보기가 즉시 가능하게 — 체류 시간·탐색 깊이 개선.

---

## Context

### 현재 상태

- **스타일 축**(FEAT-032): `page.tsx`의 `CATEGORIES`(라벨+캐논무드 1:1), `?mood=`에 선택 상태, `dominantMood(photo) === cat.mood`로 하드 필터. 라벨 1개 = 축 1개라 구조가 단순함.
- **TPO/무드 축 재료**: `PromiseMode.tsx`의 `OCCASIONS`(6개: 첫 소개팅·퇴근 후 술약속·친구 결혼식·주말 카페·면접 가는 날·갑자기 모임), `VIBE_CHIPS`(4개: 꾸안꾸 그거 뭐냐·테토남 그 느낌·느좋 그 자체·남친룩). 둘 다 라벨 1개가 축 1개가 아니라, `/api/search/translate`(AI 번역)에 보내서 **moodKeys 배열(최대 3개)**을 돌려받는 구조(스타일 축과 메커니즘이 다름).
- **데이터 볼륨 실측**(2026-11-26): 남성 사진 59장, dominantMood 기준 축당 약 10장(amekaji 10 / cityboy 10 / classic 10 / clean 10 / soft 9 / street 10)으로 거의 균등 분배. 스타일+TPO 두 축만 동시에 걸어도 교집합이 0장에 가까워질 수 있음 — 무신사 스냅(참고 사례, 결과 132만장) 같은 "여러 축 동시선택" UX는 지금 볼륨으로는 못 씀.

### 결정 (2026-11-26, 에린)

- **축 조합 방식**: 한 번에 축 1개만 선택(스타일/TPO/무드 중 하나를 고르면 다른 축 선택은 전체로 리셋) — 데이터 볼륨 문제를 원천적으로 피함. 사진 볼륨이 충분히 늘면(케빈 "상세페이지 사진 보강" 등으로) 동시선택 교집합 방식 재검토.
- **TPO/무드 필터링 방식**: 선택 라벨을 `/api/search/translate`로 보내 moodKeys(최대 3개)를 받고, `dominantMood(photo) ∈ moodKeys`로 하드 필터(스타일 축의 "필터가 맞다"는 Q-1 결정과 동일 원칙 — 정렬이 아니라 실제로 걸러냄). AI 실패 시 `resolveMoods` 룰베이스로 폴백(PromiseMode와 동일 패턴).
- **칩 목록**: TPO=`OCCASIONS`, 무드=`VIBE_CHIPS`를 그대로 재사용(새로 디자인하지 않음) — 회의록 예시("꾸안꾸", "테토남")와도 일치.
- **범위**: 필터 칩만. 검색창 통합·`/promise`·`/search` 역할 변경은 이번 티켓에서 안 건드림(그대로 유지).

### 관련 파일

```
교체/수정 대상:
- src/app/page.tsx            CATEGORIES 탭 로우 아래/옆에 TPO·무드 로우 추가, 선택 상태를 URL로(?style=|?tpo=|?vibe=, 상호 배타)
- src/lib/moods.ts             OCCASIONS/VIBE_CHIPS를 PromiseMode.tsx 밖으로 꺼내 공용화(두 군데서 씀)

참고(수정 없음):
- src/components/HomeGallery.tsx   moodKeys 받아서 searching 처리 — FEAT-032에서 이미 됨
- src/components/PromiseMode.tsx   AI 번역 호출·폴백 패턴 그대로 참고
- src/app/api/search/translate/route.ts
```

### 관련 티켓

```
선행: FEAT-032(#53) — 스타일 탭 패턴·moodKeys 메커니즘
후행: 검색창 통합 티켓(별도, 이번 범위 아님)
```

---

## Scope

### 포함

- `page.tsx` 상단에 축 선택 UI 3세트(스타일/TPO/무드), 전체 포함 "전체" 선택지는 스타일 로우에만(TPO·무드는 "선택 없음" 상태가 곧 전체).
- 한 로우에서 선택하면 다른 두 로우는 자동으로 선택 해제(URL 파라미터 상호 배타 — `?style=`|`?tpo=`|`?vibe=` 중 최대 1개만 존재).
- TPO/무드 선택 시 AI 번역 호출(로딩 중 표시 필요 — 클릭 즉시 결과가 안 옴), 응답 moodKeys로 `dominantMood ∈ moodKeys` 필터.
- URL 파라미터로 상태 유지(뒤로가기 복원, FEAT-032 P1-2와 동일 원칙) — TPO/무드는 라벨을 URL에 두고 마운트 시 AI 번역을 다시 호출(재호출 1회, 캐시 안 함 — PromiseMode도 캐시 없음).
- 탭 클릭 이벤트는 `view`가 아닌 별도 이벤트로 기록(FEAT-032 Q-2와 동일 원칙 — `category_select` 재사용 또는 동등한 처리).

### 제외

- 검색창 통합(상품명+무드+TPO 한 입구) — 별도 티켓.
- 스타일·TPO·무드 동시선택(교집합/합집합) — 데이터 볼륨 부족으로 이번엔 안 함.
- `/promise`, `/search` 페이지 자체의 역할 변경.

---

## Acceptance Criteria

- [ ] 스타일(7, 전체 포함)·TPO(6)·무드(4) 로우가 홈 상단에 보임
- [ ] TPO/무드 선택 시 로딩 표시 → 필터된 사진만 노출, 헤더·히어로 생략(FEAT-032와 동일)
- [ ] 한 로우 선택 시 다른 로우 선택이 풀림(URL에 파라미터 1개만 남음)
- [ ] 상세 → 뒤로가기 시 선택 상태·URL 유지
- [ ] AI 번역 실패(네트워크 등)해도 룰베이스 폴백으로 결과가 빔
- [ ] `tsc --noEmit`, `npm run build` 통과

---

## Verification

1. Playwright: TPO "첫 소개팅" 클릭 → URL `?tpo=...`, 필터된 사진만, 헤더·히어로 없음.
2. 스타일 선택 중 TPO 클릭 → `?style=` 사라지고 `?tpo=`만 남음(교차 선택 안 됨 확인).
3. 네트워크 차단 상태로 TPO 클릭 → 빈 화면 아니라 폴백 결과로 채워짐.
4. 뒤로가기로 선택 상태 유지 확인.
