# MOODFIT

한국 남성을 위한 무드 기반 패션 발견 서비스 — "느낌"을 6축 벡터로 변환하여 스타일링 사진·상품 추천.

## 기술스택

| 계층 | 기술 | 비고 |
|------|------|------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS | Vercel 배포 (정적 빌드) |
| Mobile | Capacitor | 웹앱을 iOS/Android 네이티브 셸로 패키징 |
| Backend | NestJS (신규 구축 예정) | REST API, JWT 인증 |
| Database | PostgreSQL 15 (Prisma) | Supabase → 자체 DB 이관 |
| Cache | Redis 7 | 토큰 블랙리스트, 검색 캐시 |
| AI | Claude API (Anthropic) | 자연어→무드 벡터, 스크린샷 비전 |
| Infra | Vercel (FE) + Railway (BE) | Docker Compose 로컬 |

## 핵심 차별점

- **느낌 검색**: "첫 데이트 옷" 같은 자연어 → AI가 무드 벡터로 변환 → 유사도 기반 추천
- **스크린샷 분석**: 패션 사진 한 장 → Claude Vision → 무드 자동 분류
- **6축 무드 벡터 (캐논, 변경 금지)**: clean · cityboy · street · amekaji · classic · soft

## 팀 구성

사이드 프로젝트 — 인증·AI·인프라 실무 역량 증명 목적

| GitHub | 이름 | 역할 |
|--------|------|------|
| shionpark | 서영 | 프로젝트 오너, 인프라·Capacitor·BE 설계 |
| aaiap15 | 케빈 | 태깅 파이프라인, 코드 리뷰 |
| stacy-yein-kim | 에린 | affinity 모델, 유사도 API, 버그 수정 |

## 현재 상태

- FE(Next.js + Supabase 직접 연동) 프로토타입 완성 · Vercel 배포 중
- Capacitor 전환 완료 (PR #7) — iOS 시뮬레이터 검증 완료, 앱스토어 제출 준비 가능
- BE(NestJS) 신규 구축 대기 — 다음 착수 대상 (MS-01)

## Supabase → NestJS 전환 이유

현재 FE에서 Supabase를 직접 호출하는 구조의 한계:

1. **보안**: Claude API 키 등 외부 서비스 키는 서버에서만 다뤄야 함. Supabase anon key는 RLS로 보호되지만, AI API 키는 노출 시 과금·악용 위험이 있어 서버가 필요함
2. **비즈니스 로직**: DB를 프론트에서 직접 읽고 쓰는 구조라, 요청 검증·데이터 가공·캐싱 같은 로직을 넣기 어려움. 예: 자연어→무드 벡터 변환(Claude API) + 동일 검색어 캐시 반환
3. **AI 비용 관리**: Claude API 호출을 서버에서 캐싱 + Rate Limiting 가능

## Capacitor 빌드 구조

웹과 앱을 하나의 코드베이스에서 빌드한다. 환경변수로 분기:

- `npm run build` → Vercel 웹 배포 (API Route 포함, 서버 기능 정상)
- `npm run build:cap` → `BUILD_TARGET=capacitor` → `output: 'export'` → 정적 HTML만 출력

> **주의**: `output: 'export'` 빌드에서는 API Route가 제외된다.
> 새 API Route를 추가할 때 앱에서도 필요한 기능이면 클라이언트에서 직접 호출하거나 BE API로 분리해야 한다.

## 주요 참고 문서

| 문서 | 경로 | 역할 |
|------|------|------|
| SSOT | docs/SSOT.md | 최상위 권위 — 프로젝트 정의, 캐논 규칙 |
| 아키텍처 | docs/ARCHITECTURE.md | 시스템 구조, 데이터 흐름, 모듈 패턴 |
| AI 온보딩 | docs/AI_ENTRYPOINT.md | AI 도구 워크플로우 |
| AI 코딩 규칙 | docs/AI_AGENT_RULES.md | 코딩 컨벤션 |
| 퀵스타트 | docs/QUICK_START.md | 로컬 환경 셋업 |
| 개발 가이드 | docs/DEVELOPMENT_GUIDE.md | 개발 워크플로우 |
| QA·완료 기준 | docs/QA_AND_DONE.md | QA 체크리스트, Done 정의 |
| 테스트 전략 | docs/TEST_STRATEGY.md | 테스트 레벨별 전략 |
| 티켓 스펙 | docs/tickets/*.md | 개별 티켓 상세 (Problem + Scope) |

**AI Reading Order**: SSOT → AI_ENTRYPOINT → ARCHITECTURE → AI_AGENT_RULES → tickets/{대상} → QA_AND_DONE

## Notion WBS

- **WBS DB ID**: `3b352a5a-60c7-8084-8c66-c80e55552415`
- **QA DB ID**: `3b352a5a-60c7-8010-9886-f506c58d2dbb`
- **상위 페이지**: `3b352a5a-60c7-80ab-8ef4-fee60d4b790a`
- **토큰 위치**: `.env` → `NOTION_TOKEN` (인테그레이션: "서영의 연결")
- **API 버전**: `2022-06-28`

## 현재 작업 순서

### MS-00: Capacitor 전환 — 완료 (PR #7)

CAP-001~005 전체 완료. iOS 시뮬레이터 검증 완료.

> **Capacitor 영향 — 후속 티켓 작업 시 참고**
> - `FE-FEAT-012`: ISR 서버 컴포넌트 전제 삭제 → CAP-001에서 만든 클라이언트 훅 내부만 교체
> - `BE-FEAT-003`: Capacitor WebView 인증 방식(cookie vs Authorization 헤더) BE 착수 전 결정 필요
> - `FE-FEAT-005`: 카카오 OAuth 콜백 URL에 Capacitor 오리진(`capacitor://localhost`) 고려 필요
> - **API Route 신규 추가 시**: 앱 빌드에서 제외됨 — 앱에서도 필요하면 클라이언트 직접 호출 or BE API로 분리

### MS-01: W1-전반 — 인프라 + DB 기반 (P0)

| # | 티켓 | 제목 | 레이어 | 예상h |
|---|------|------|--------|-------|
| 1 | — | NestJS 프로젝트 초기화 (모듈 구조·ESLint·Prettier) | infra | 2 |
| 2 | — | Docker Compose 구성 (PostgreSQL 15 + Redis 7) | infra | 3 |
| 3 | BE-FEAT-001 | Prisma 스키마 설계 (Supabase 6테이블 → Prisma 이관 + User 모델 추가) | backend | 4 |
| 4 | BE-FEAT-002 | 시드 데이터 마이그레이션 (moods·photos·products·query_map) | backend | 2 |
| 5 | — | GitHub Actions CI (타입체크 + 린트 + 테스트·병렬) | infra | 3 |
| 6 | — | README + 환경변수 문서 + .env.example | docs | 1 |

### MS-01: W1-후반 — 인증 (P0 → P1)

| # | 티켓 | 제목 | 레이어 | 예상h |
|---|------|------|--------|-------|
| 7 | BE-FEAT-003 | JWT 인증 모듈 (httpOnly cookie·15분 액세스 + 7일 리프레시) | backend | 5 |
| 8 | BE-FEAT-004 | 회원가입/로그인 API (이메일+비밀번호·bcrypt) | backend | 4 |
| 9 | BE-FEAT-005 | 카카오 OAuth 소셜 로그인 (passport-kakao) | backend | 5 |
| 10 | FE-FEAT-004 | 로그인/회원가입 페이지 UI | frontend | 3 |
| 11 | FE-FEAT-005 | 카카오 로그인 버튼 + OAuth 콜백 처리 | frontend | 2 |
| 12 | BE-FEAT-006 | Redis 토큰 블랙리스트 (P1) | backend | 3 |
| 13 | BE-FEAT-007 | 사용자 프로필 API (P1) | backend | 2 |

### MS-01: W2-전반 — AI 검색 (P0 → P1)

| # | 티켓 | 제목 | 레이어 | 예상h |
|---|------|------|--------|-------|
| 14 | BE-FEAT-008 | 자연어→무드 벡터 번역 API (Claude API·캐싱) | backend | 5 |
| 15 | BE-FEAT-009 | 검색 결과 API (벡터 기반 정렬 + 페이지네이션) | backend | 4 |
| 16 | FE-FEAT-009 | 검색 결과 BE API 전환 | frontend | 2 |
| 17 | BE-FEAT-010 | 스크린샷 비전 분석 API (P1) | backend | 5 |
| 18 | BE-FEAT-011 | API 키 보안 + Rate Limiting (P1) | backend | 3 |

### MS-01: W2-후반 — FE 전환 + 배포 (P0 → P1)

| # | 티켓 | 제목 | 레이어 | 예상h |
|---|------|------|--------|-------|
| 19 | FE-FEAT-003 | AuthContext + 토큰 인터셉터 | frontend | 3 |
| 20 | FE-FEAT-012 | API 클라이언트 기반 구축 (axios) | frontend | 3 |
| 21 | FE-FEAT-007 | 저장/취향 데이터 서버 동기화 | frontend | 3 |
| 22 | FE-FEAT-008 | AI 검색 연동 (P1) | frontend | 3 |
| 23 | FE-FEAT-010 | 스크린샷 분석 연동 (P1) | frontend | 3 |
| 24 | — | Dockerfile 멀티스테이지 빌드 | infra | 3 |
| 25 | — | Railway/EC2 배포 | infra | 3 |
| 26 | — | API 문서 (Swagger UI) (P1) | docs | 2 |

### MS-02: W3 — 채팅 + 결제

| # | 티켓 | 제목 | 레이어 | 예상h |
|---|------|------|--------|-------|
| 27 | — | CS Chat 프로젝트 초기화 | infra | 2 |
| 28 | BE-FEAT-017 | WebSocket Gateway | backend | 4 |
| 29 | BE-FEAT-018 | 채팅방 관리 API | backend | 3 |
| 30 | BE-FEAT-019 | Redis Pub/Sub 메시지 브로드캐스트 (P1) | backend | 2 |
| 31 | FE-FEAT-020 | 채팅 위젯 UI | frontend | 4 |
| 32 | — | Billing 프로젝트 초기화 | infra | 2 |
| 33 | BE-FEAT-021 | Prisma 스키마 (결제 관련) | backend | 3 |
| 34 | BE-FEAT-022 | 토스페이먼츠 단건결제 | backend | 5 |
| 35 | BE-FEAT-023 | 정기결제 (빌링키·자동 갱신) | backend | 5 |
| 36 | BE-FEAT-024 | 크레딧 시스템 | backend | 4 |
| 37 | BE-FEAT-025 | 환불 처리 (P1) | backend | 3 |
| 38 | — | README + 결제 플로우 시퀀스 다이어그램 (P1) | docs | 1 |
| 39 | — | README + WebSocket 이벤트 명세 (P1) | docs | 1 |

## PR 넘버링 규칙

| 접두사 | 용도 | 예시 |
|--------|------|------|
| FEAT-NNN | 새 기능 | `feat(FEAT-002): 유사 사진 추천 API` |
| BUG-NNN | 버그 수정 | `fix(BUG-001): affinity 대칭 복원` |
| CHORE-NNN | 인프라/빌드/리팩터링 | `chore(CHORE-001): Capacitor 전환` |

PR 제목 형식: `타입(접두사-번호): 설명`. 번호는 기존 PR 확인 후 이어서 채번.

## BE 마이그레이션 전 FE 작업 가이드

NestJS BE가 만들어지기 전까지 FE에서 데이터를 다룰 때:

- 컴포넌트에서 Supabase를 직접 호출하지 않는다
- `lib/` 아래 함수(`fetchPhotos`, `fetchProducts` 등)를 거쳐서 호출한다
- 나중에 BE가 생기면 `lib/` 함수 내부만 바꾸면 된다 (Supabase 호출 → API 호출)

## 코드 규칙

- **1 티켓 = 1 브랜치 = 1 PR** — 여러 티켓을 하나의 PR에 묶지 않음
- **티켓 스펙 먼저** — 구현 전에 `docs/tickets/` 파일 작성 (최소 Problem + Scope)
- **SSOT 우선** — SSOT > ARCHITECTURE > 티켓 순 충돌 해소
- **과설계 금지** — 현재 요구사항에 필요한 만큼만 구현
- **캐논 6축 불변** — 무드 축 추가/제거/이름 변경 금지
- **supabase/ 디렉토리 수정 금지** — 참조 전용

## PR 리뷰 가이드라인

diff 안의 코드 품질뿐 아니라, **변경이 diff 밖 코드에 미치는 영향**을 반드시 추적한다.

### 핵심 질문 3개 (매 리뷰마다)

1. **"이 값을 누가 읽고 있지?"** — 타입·스키마·데이터 구조가 바뀌었으면 소비자 전부 grep
2. **"깨진 전제가 있나?"** — 기존 코드가 의존하던 전제(one-hot, non-null 등)가 이 PR로 무효화되는지
3. **"PR 본문의 '영향 없음' 주장을 직접 확인할 수 있나?"** — 주장을 코드로 검증

### 리뷰 절차

1. diff를 읽고 변경된 타입/인터페이스/데이터 구조를 목록으로 뽑는다
2. 각각에 대해 `git grep`으로 소비자를 찾는다
3. 소비자가 새로운 계약에서도 안전한지 판단한다
4. 안전하지 않으면 → 이 PR 범위인지, 별도 이슈로 분리할지 구분한다

### 판정 기준

- diff 범위 내 코드 품질 (정확성, 컨벤션, 성능)
- diff 범위 밖 영향 분석 (소비자 추적, 전제 검증)
- PR 본문의 주장에 대한 독립 검증

## 월 운영비 (DAU 100 기준)

| 항목 | 비용 |
|------|------|
| Vercel (FE) | 무료 |
| Railway (BE+DB+Redis) | ~$10 |
| Claude API (캐시 히트 80%) | ~$5 |
| AWS S3 | ~$1 |
| **합계** | **~$16 (≒22,000원)** |
