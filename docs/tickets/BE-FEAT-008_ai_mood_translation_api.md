# BE-FEAT-008: 자연어→무드 벡터 번역 API

사용자의 자연어 검색어를 Claude API로 6축 무드 벡터(0~1)로 변환하고, Redis 캐시로 반복 호출을 절감하는 API.

---

## Metadata

| Key | Value |
|-----|-------|
| Prefix | BE |
| Type | FEAT |
| Severity | Critical |
| Layer | Module (search) |
| Milestone | MS-01 |
| Status | Backlog |
| 예상h | 5h |
| 주차 | W2-전반 |
| 우선순위 | P0 |

---

## Problem

현재 검색은 로컬 규칙 기반 매핑(QUERY_MAP)으로만 동작한다. 등록되지 않은 키워드는 검색 결과를 반환하지 못하고, 자연어 표현("첫 데이트에 입고 갈 옷", "비 오는 날 감성")을 이해하지 못한다.

- `src/lib/moods.ts` QUERY_MAP에 수동 등록된 키워드만 매칭 가능
- 밈·신조어·상황 묘사 등 자연어 검색 시 결과 없음
- DB `query_map` 테이블(keyword → mood_keys)과 `query_mappings` 테이블(query_text → mood_vector) 두 개가 혼재
- FE `results/page.tsx`의 `resolveMoods()` 함수가 로컬에서 직접 매핑 수행 중

### 비즈니스 근거

> 패션 검색의 핵심은 "느낌"을 말로 표현하는 것. "시티보이"라고 정확히 입력하는 사용자보다 "깔끔한데 너무 딱딱하지 않은"처럼 말하는 사용자가 훨씬 많다. LLM이 이 간극을 메운다.

---

## Context

### 현재 검색 흐름 (FE-only)

```
SearchScreen.tsx (입력)
  → router.push(/results?q=...)
  → results/page.tsx (서버 컴포넌트)
    → resolveMoods(query)         ← 로컬 QUERY_MAP 규칙 매칭
    → fetchPhotos()               ← Supabase 전체 조회
    → rankPhotos(photos, moodKeys) ← 벡터 스코어링
    → ResultsGrid 렌더
```

### 6축 무드 벡터 (캐논)

```json
{
  "clean": 0.0,     // 클린 미니멀 — 정제된 무드
  "cityboy": 0.0,   // 시티보이 — 캐주얼과 단정 사이
  "street": 0.0,    // 스트릿 — 오버핏/볼륨, 도시적
  "amekaji": 0.0,   // 아메카지 — 워크웨어/데님/빈티지
  "classic": 0.0,   // 클래식 — 셋업/코트/구두
  "soft": 0.0       // 소프트 캐주얼 — 니트/가디건, 부드러운 톤
}
// 합계 = 1.0, 각 값 0~1
```

### 관련 파일 (현재 FE)

```
src/lib/moods.ts       — QUERY_MAP (keyword → MoodKey[]) 정적 매핑
src/app/results/page.tsx — resolveMoods() 호출, rankPhotos() 벡터 스코어링
src/lib/photos.ts      — Photo.mood_vector (jsonb, 6축)
```

### DB 테이블 (캐시 후보)

```sql
-- query_map (기존, keyword → mood_keys 배열)
keyword TEXT PRIMARY KEY, mood_keys TEXT[]

-- query_mappings (밈 전용, query_text → mood_vector jsonb)
query_text TEXT PRIMARY KEY UNIQUE, mood_vector JSONB
```

### 관련 티켓

```
선행: (없음 — Redis는 Docker Compose TASK에서 구성)
후행: BE-FEAT-009 (검색 결과 API)
      BE-FEAT-011 (Rate Limiting — AI 호출 3/min)
      FE-FEAT-015 (AI 검색 연동)
```

---

## Scope

### 포함

- `POST /search/translate` API — 자연어 → 6축 mood_vector 변환
- Claude API 연동 (프롬프트 설계, JSON 응답 파싱)
- Redis 캐시 — 동일 쿼리 재요청 시 LLM 미호출 (TTL 24h)
- 프롬프트 엔지니어링 — 6축 무드 정의를 system prompt에 포함
- 에러 처리 — Claude API 타임아웃/실패 시 QUERY_MAP 폴백

### 제외

- 검색 결과 반환 (→ BE-FEAT-009)
- Rate Limiting (→ BE-FEAT-011)
- FE 검색 연동 (→ FE-FEAT-015)
- query_mappings DB 테이블 마이그레이션 (별도 TASK)

---

## Strategy

### Step 1: SearchModule 구조 생성

```
src/modules/search/
├── search.module.ts
├── search.controller.ts        — POST /search/translate
├── search.service.ts           — translateToMoodVector()
├── providers/
│   └── claude.provider.ts      — Claude API 래퍼 (Anthropic SDK)
├── cache/
│   └── search-cache.service.ts — Redis 캐시 (query → vector)
├── dto/
│   ├── translate-query.dto.ts  — { query: string }
│   └── mood-vector.dto.ts      — { vector: Record<MoodKey, number>, cached: boolean }
├── constants/
│   └── mood-system-prompt.ts   — 6축 무드 정의 프롬프트
└── test/
    ├── search.service.spec.ts
    └── claude.provider.spec.ts
```

### Step 2: Claude 프롬프트 설계

```
System: 당신은 한국 남성 패션 무드 분석 전문가입니다.
사용자의 자연어 입력을 아래 6개 무드 축으로 변환하세요.

[6축 정의 + 예시]

규칙:
- 합계는 정확히 1.0
- 0.05 미만은 0으로 처리
- JSON만 반환 (설명 금지)

User: "{query}"
```

응답 형식: `{"clean":0.1,"cityboy":0.5,"street":0.0,"amekaji":0.2,"classic":0.0,"soft":0.2}`

### Step 3: Redis 캐시 전략

```
키: search:translate:{sha256(query.trim().toLowerCase())}
값: JSON 직렬화된 mood_vector
TTL: 24시간 (86400초)

캐시 히트 → vector + cached: true 반환 (Claude API 미호출)
캐시 미스 → Claude API 호출 → 결과 캐시 저장 → vector + cached: false 반환
```

### Step 4: 폴백 체인

```
1. Redis 캐시 → 히트 시 즉시 반환
2. Claude API → 정상 응답 시 캐시 저장 + 반환
3. Claude API 실패 → DB query_mappings 테이블 조회
4. DB 미스 → 로컬 QUERY_MAP 규칙 매칭 (BE에 이식)
5. 모두 실패 → 균등 벡터 { clean:0.17, cityboy:0.17, ... } 반환
```

---

## Acceptance Criteria

- [ ] `POST /search/translate` — 자연어 입력 → 6축 mood_vector 반환
- [ ] 반환된 벡터의 각 값이 0~1 범위, 합계 = 1.0
- [ ] 동일 쿼리 2회 호출 시 두 번째는 `cached: true` + Claude API 미호출
- [ ] Claude API 타임아웃(5초) 시 폴백 체인 동작
- [ ] 빈 문자열 / 특수문자만 입력 시 400 에러
- [ ] 환경변수 `ANTHROPIC_API_KEY` 미설정 시 서버 기동 실패 아님 (폴백 모드)

---

## Testing Rules

- [ ] `search.service.spec.ts` — Claude 정상 응답 → 벡터 반환 + 캐시 저장
- [ ] `search.service.spec.ts` — Claude 실패 → 폴백 체인 동작
- [ ] `search.service.spec.ts` — 캐시 히트 → Claude 미호출
- [ ] `claude.provider.spec.ts` — JSON 파싱 실패 → 적절한 에러 반환
- [ ] `claude.provider.spec.ts` — 벡터 합계 ≠ 1.0 → 정규화 처리 확인
- [ ] `npm test` 전체 통과

---

## Verification

1. `npm run start:dev` 실행
2. `POST /search/translate` + body `{ "query": "첫 데이트에 입고 갈 옷" }` → mood_vector 반환
3. 동일 요청 재전송 → `cached: true` 확인
4. Redis CLI에서 `keys search:translate:*` → 캐시 키 존재 확인
5. `ANTHROPIC_API_KEY` 제거 후 재시작 → 동일 요청 → 폴백 벡터 반환 확인

---

## Implementation Notes

_(구현 후 기록)_
