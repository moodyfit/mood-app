# FEAT-040: 카카오 로그인 직접 연동 (ID 토큰)

Supabase 기본 카카오 연동(`signInWithOAuth`) 대신 카카오에 직접 로그인을 요청하고, 받은 ID 토큰을 `signInWithIdToken`으로 Supabase에 넘긴다. 요청 항목을 닉네임 · 이메일로 줄여 카카오 동의 화면이 가입 때 한 번만 뜨게 한다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Todo |
| 우선순위 | P2 |
| Layer | Page / Lib / 서버 함수 / 카카오 · Supabase 설정 |
| Related | FEAT-038, FEAT-039, FEAT-033 |

---

## Problem

- **현재 동작**: Supabase 기본 카카오 연동은 로그인마다 `account_email profile_image profile_nickname`을 고정으로 요청한다. 카카오는 요청 항목 중 동의하지 않은 항목이 있으면 동의 화면을 다시 띄워, 프로필 사진(선택)을 거부한 사용자는 로그인할 때마다 카카오 동의 화면을 본다. 카카오 콘솔에서 프로필 사진을 "사용 안 함"으로 바꾸면 KOE205 오류로 로그인이 막힌다(2026-11-22 확인)
- **기대 동작**: 카카오 동의 화면은 가입 때 한 번만 뜬다. 쓰지 않는 프로필 사진은 받지 않는다
- **영향 범위**: `/login` 카카오 버튼, 카카오 복귀 처리, 카카오 · Supabase 설정, 처리방침 수집 항목

---

## Context

```
관련 파일:
- src/lib/store.tsx        signInWithKakao (signInWithOAuth) — 교체 대상
- src/app/login/page.tsx   카카오 버튼, 복귀 시 오류 처리(K_KAKAO_PENDING)
```

- Supabase 문서: 카카오 OIDC를 켜고, 인가 코드를 카카오 토큰 엔드포인트에서 ID 토큰으로 바꾼 뒤 `signInWithIdToken({ provider: "kakao", token })`을 호출한다
- 코드 → 토큰 교환에는 Client Secret이 필요해 브라우저에서 할 수 없다. 앱 빌드(`output: 'export'`)는 Next API Route가 빠진다
- RN 전환 시 카카오 네이티브 SDK가 ID 토큰을 바로 주므로 같은 `signInWithIdToken`을 쓴다(토큰 교환 불필요)

---

## Scope

### 포함

1. **카카오 콘솔** (서영) — OpenID Connect 켜기, Redirect URI에 무드핏 복귀 주소(운영 · localhost) 추가
2. **Supabase** (서영) — Kakao provider의 Client IDs에 REST API 키 등록(ID 토큰 `aud` 검증)
3. **토큰 교환 서버 함수** — 인가 코드 → ID 토큰. Client Secret은 함수 비밀값에만 둔다. 웹 · 앱 빌드 모두에서 부를 수 있는 위치(Supabase Edge Function 또는 BE)
4. **로그인 시작** — `kauth.kakao.com/oauth/authorize`로 직접 이동. `scope=openid account_email profile_nickname`, `state` · `nonce`를 sessionStorage에 두고 검증
5. **복귀 페이지** — 코드 받기 → 서버 함수 → `signInWithIdToken({ provider: "kakao", token, nonce })` → `/space`. 취소(`access_denied`) · 실패 안내는 지금과 같은 해요체
6. **기존 연동 정리** — `signInWithOAuth({ provider: "kakao" })` 제거, 기존 카카오 계정이 같은 사용자로 로그인되는지 확인
7. **카카오 콘솔 프로필 사진 "사용 안 함"** — 직접 연동 배포 후
8. **처리방침** — 카카오 선택 항목(프로필 사진) 삭제

### 제외

- 앱(Capacitor · RN) 카카오 로그인 — RN 전환 결정 후. 네이티브 SDK면 3번 서버 함수 없이 4 · 5번만 바뀐다
- 기존 이메일 계정과 카카오 계정 연결

---

## 결정

- (대기) 토큰 교환 위치 — Supabase Edge Function은 `supabase/` 디렉토리에 두어야 하는데 CLAUDE.md상 `supabase/`는 수정 금지다. BE(NestJS) 착수 후 BE에 둘지, 규칙 예외로 Edge Function을 둘지 서영 결정
- (대기) 착수 시점 — 앱 카카오 로그인(RN 결정)과 묶을지, 웹만 먼저 할지

---

## Acceptance Criteria

- [ ] 처음 쓰는 카카오 계정은 카카오 동의 화면(닉네임 · 이메일만)을 거쳐 가입된다
- [ ] 다시 로그인하면 카카오 동의 화면 없이 바로 로그인된다
- [ ] 기존 카카오 가입자(Supabase 기본 연동으로 가입)가 같은 사용자 ID로 로그인된다
- [ ] Client Secret이 브라우저 코드 · 번들에 없다
- [ ] `state` · `nonce`가 맞지 않으면 로그인되지 않는다
- [ ] 카카오 콘솔 프로필 사진 "사용 안 함"에서도 로그인된다

---

## Verification

(작업 후 작성)

---

## Implementation Notes

(작업 후 작성)
