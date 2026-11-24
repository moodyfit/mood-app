# FEAT-033: 이용약관 · 개인정보처리방침 페이지

korean-privacy-terms 스킬로 이용약관과 개인정보처리방침 초안을 만들고, `/terms` · `/privacy` 페이지로 띄운다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Done |
| 우선순위 | P0 |
| Layer | Page |
| Related | FEAT-034 |

---

## Problem

- **현재 동작**: 이용약관과 개인정보처리방침이 없다. 회원가입은 이메일과 비밀번호만 받는다
- **기대 동작**: `/terms` · `/privacy`에서 두 문서를 읽을 수 있고, 회원가입 동의와 카카오 로그인(후속 티켓)이 이 페이지를 가리킨다
- **영향 범위**: 신규 페이지 2개. 기존 화면은 바뀌지 않는다

---

## Context

```
관련 파일:
- src/lib/store.tsx    익명 UUID(localStorage) 발급, 로그인 시 취향 병합
- src/lib/track.ts     events 테이블 적재(검색어 · 저장 · 클릭 등)
- src/lib/upload.ts    사진 업로드(Supabase Storage)
- src/app/api/photos/tag/route.ts, src/app/api/search/translate/route.ts    Claude API 호출
```

### 문서에 넣을 처리 현황

- 수집 항목: 이메일, 비밀번호(Supabase Auth 해시 저장), 행동 로그(검색어 · 사진 열람 · 저장 · 상품 클릭), 취향 벡터, 업로드 사진과 설명. 카카오 로그인 시 카카오 회원번호 · 닉네임 · 카카오계정 이메일, 선택 항목 프로필 사진(FEAT-038, #57)
- **비회원도 수집한다**: 로그인하지 않아도 기기별 익명 UUID로 행동 로그와 취향을 서버에 쌓는다
- 처리위탁: Supabase(DB · 인증 · 파일), Vercel(호스팅), Google(Gmail SMTP — 인증 메일 발송)
- 국외 이전: Anthropic(미국). 업로드 사진과 검색어를 Claude API로 보낸다. Supabase · Vercel 리전도 확인 필요
- 수집하지 않는 것: 성별(11/16 회의에서 남/녀 토글 제거), 마케팅 수신 동의(발송 계획 없음)

### 스킬 사용 방식

- 스킬은 Next.js App Router에 MDX · shadcn/ui를 자동 설치해 페이지를 만든다. 이 레포에는 둘 다 없다
- 생성 문서는 "참고용 초안, 변호사 검토 필수"로 명시된다. 파일 상단의 검토 필요 주석은 지우지 않는다

---

## Scope

### 포함

1. `.claude/skills/` — 스킬을 프로젝트 로컬에만 설치(전역 설치 안 함)
2. 스킬 인터뷰 → 이용약관 · 개인정보처리방침 초안 생성
3. `src/app/terms/page.tsx`, `src/app/privacy/page.tsx` — 초안 본문을 TSX로 옮긴 정적 페이지

### 제외

- 동의 체크 UI · 동의 기록 → 가입 동의 티켓(후속)
- 쿠키 배너(`CookieBanner`) — 분석 · 광고 쿠키를 쓰지 않는다
- 영문 · 해외 관할 문서

---

## 결정

- MDX 대신 TSX로 옮긴다. 두 페이지 때문에 `@next/mdx`와 설정을 더하지 않는다. 정적 페이지라 `build:cap`에도 그대로 포함된다
- 스킬이 설치 명령을 제안하면 거절한다. 생성된 컴포넌트 중 `ConsentModal`은 가입 동의 티켓(후속)에서 참고만 한다
- 스킬의 Pretendard CDN 삽입(`layout.tsx`)은 따르지 않는다. 폰트는 CAP-004의 로컬 번들을 쓴다
- 스킬의 흑백 테마 변수 주입(`globals.css`)은 따르지 않는다. 페이지는 기존 디자인 토큰으로 꾸민다
- 14세 미만은 이용 불가로 둔다. 법정대리인 동의 절차를 만들지 않고, 가입 시 만 14세 이상 확인으로 막는다(가입 동의 티켓, 후속)

---

## 서영님 입력 필요

- 운영 주체 표기(개인 · 팀명)
- 개인정보 보호책임자 이름 · 연락처(이메일)
- 시행일

---

## Strategy

1. 스킬 설치(프로젝트 로컬)
2. 인터뷰 진행 — 위 처리 현황과 서영님 입력값으로 답한다
3. 초안 검토 — 처리 현황과 어긋나는 조항 정리
4. `/terms` · `/privacy` 페이지 작성
5. 검증 · 커밋 · PR

---

## Acceptance Criteria

- [x] `/terms` · `/privacy`가 웹과 앱 빌드에서 열린다
- [x] 문서의 수집 항목 · 위탁 · 국외 이전이 위 처리 현황과 일치한다
- [x] 파일 상단에 법률 검토 필요 주석이 남아 있다(화면에는 표시하지 않는다)
- [x] 320px 폭에서 가로 스크롤이 생기지 않는다

---

## Verification

1. `tsc --noEmit`: 통과
2. `npm run build` · `npm run build:cap`: 통과 — 두 빌드 모두 `/privacy` · `/terms` 정적 생성(`out/privacy.html` · `out/terms.html`)
3. 로컬 브라우저 `/terms` · `/privacy`: 정적 export 확인 — 320px 폭에서 scrollWidth = clientWidth(305), 가로 스크롤 없음

---

## Implementation Notes

### 카카오 로그인 수집 항목

FEAT-038(#57)에서 카카오 동의항목을 닉네임 · 이메일 필수, 프로필 사진 선택으로 정해 처리방침 제2조 · 제3조와 요약표에 반영했다. 카카오는 정보를 받는 곳이라 제3자 제공 · 위탁 · 국외 이전 표는 바꾸지 않았다.

### 접속 기록 보관 기간 출처

처리방침 제3조 "접속 기록(IP 주소 등) — Vercel 1시간, Supabase 1일"은 각 업체의 무료 플랜 로그 보관 기간이다(2026-11-24 확인, #54 리뷰 Q-1).

| 업체 | 플랜 | 보관 기간 | 출처 |
|---|---|---|---|
| Vercel | Hobby | 런타임 로그 1시간 | [Vercel Changelog](https://vercel.com/changelog/enhanced-logs-ui-to-search-inspect-and-share-application-logs), [Limits and Pricing](https://vercel.com/docs/observability/limits-and-pricing) |
| Supabase | Free | API · Database 로그 1일 | [Pricing](https://supabase.com/pricing), [Logs](https://supabase.com/docs/guides/observability/logs) |

유료 플랜으로 바꾸거나 업체가 보관 기간을 바꾸면 처리방침 제3조를 먼저 고친다.

