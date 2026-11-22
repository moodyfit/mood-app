# FEAT-038: 카카오 로그인 (웹)

로그인 · 회원가입 화면에 카카오 로그인 버튼을 두고, Supabase Kakao provider로 가입과 로그인을 한 번에 처리한다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Done |
| 우선순위 | P0 |
| Layer | Page / Lib |
| Related | FEAT-033, FEAT-034, FEAT-037 |

---

## Problem

- **현재 동작**: 가입과 로그인이 이메일 · 비밀번호뿐이다
- **기대 동작**: 카카오 계정으로 버튼 한 번에 가입 · 로그인하고, 로그인 순간 익명 취향이 계정으로 합쳐진다
- **영향 범위**: `/login` 로그인 · 회원가입 모드

---

## Context

```
관련 파일:
- src/app/login/page.tsx    로그인 · 회원가입 · 재설정 한 화면 (FEAT-034)
- src/lib/store.tsx         signIn · signUp · authError, onAuthStateChange SIGNED_IN에서 취향 병합
- src/lib/supabase.ts       클라이언트 생성(기본 옵션, URL의 세션 자동 감지)
```

### 흐름

- `signInWithOAuth({ provider: "kakao", options: { redirectTo: <웹 주소>/login } })` → 카카오 동의 화면 → Supabase 콜백(`https://sjcslybbczaizmfosqge.supabase.co/auth/v1/callback`) → `/login`으로 세션(또는 오류)을 붙여 돌아온다 → 로그인됐으면 `/space`로 보낸다
- 돌아오면 Supabase 클라이언트가 주소의 세션을 읽고 `SIGNED_IN`이 나서, 이메일 로그인과 같은 취향 병합이 돈다
- 처음 오는 카카오 계정은 Supabase가 자동으로 가입시킨다. 가입 · 로그인 구분이 없다

### 외부 설정

- Kakao Developers: 무드핏 전용 앱 `moodfit`(ID 1658940). 카카오 로그인 활성화, Redirect URI(Supabase 콜백), 웹 플랫폼 도메인, 동의항목, Client Secret 설정 필요
- Supabase Auth → Providers → Kakao: REST API 키 · Client Secret 입력, 활성화
- 이메일 동의항목은 비즈 앱에서만 받을 수 있다. 비즈 앱이 아니면 Supabase의 "이메일 없는 사용자 허용"을 켜야 한다

---

## Scope

### 포함

1. Kakao Developers · Supabase 설정 (서영 · 대시보드)
2. `src/lib/store.tsx` — `signInWithKakao()`, 오류 코드 한국어 매핑 추가
3. `src/app/login/page.tsx` — 로그인 · 회원가입 모드에 카카오 버튼
4. `src/app/login/page.tsx` — 앱(Capacitor)에서는 카카오 버튼 · "또는" 구분선 숨김(코드리뷰 P1-1)

### 제외

- 앱 카카오 로그인 — RN 전환 여부를 정한 뒤 방식을 정한다(RN: 카카오 네이티브 SDK + 토큰 로그인, Capacitor 유지: 딥링크 콜백)
- 가입 동의 체크 — 가입 동의 티켓(후속). 그 전까지 카카오 가입자는 동의 기록이 없다
- 기존 이메일 계정과 카카오 계정 연결

---

## 화면

```
[/login 로그인 · 회원가입 모드]
 이메일 [____]
 비밀번호 [____]                 👁
 [ 로그인 ]
 비밀번호를 잊었어?               ← 로그인 모드만
 ──────── 또는 ────────
 [ 💬 카카오 로그인 ]            ← #FEE500 배경, 검정 심볼 · 글자 (카카오 디자인 가이드)
 계정이 없어? 회원가입

재설정 모드: 카카오 버튼 숨김
실패 · 취소로 돌아오면: 로그인 버튼 위 안내 자리에 오류 문구(해요체)
```

---

## 결정

- 버튼 문구는 로그인 · 회원가입 모드 모두 "카카오 로그인"이다. 카카오 가이드 문구이고, 카카오는 가입 · 로그인이 같은 동작이다
- 카카오에서 돌아오는 곳은 `/login`이다. 로그인됐으면 `/space`로 보내고, 취소 · 실패면 그 자리에서 한국어 안내를 보여 준다
- 비즈 앱으로 전환해 카카오계정(이메일)을 필수 동의항목으로 받는다. 이메일 가입자와 같은 방식으로 계정을 다루고, 처리방침(FEAT-033)의 수집 항목과 맞춘다
- 기존 `sairo-link-save` 앱을 쓰지 않는다. 동의 화면에 앱 이름이 보이고, 카카오 사용자 연결이 앱별이라 나중에 옮기면 가입자가 끊긴다

---

## Strategy

1. 서영: Kakao Developers 설정 확인 · Supabase Kakao provider 입력
2. store 함수
3. 로그인 화면 버튼
4. 검증 · 커밋 · PR

---

## Acceptance Criteria

- [x] 로그인 · 회원가입 모드에 카카오 버튼이 보이고, 재설정 모드에서는 보이지 않는다
- [x] 처음 쓰는 카카오 계정으로 누르면 가입되고 `/space`에 로그인 상태로 도착한다
- [x] 같은 카카오 계정으로 다시 누르면 같은 계정으로 로그인된다
- [x] 로그인 전에 쌓은 취향이 카카오 계정으로 합쳐진다
- [x] 카카오 동의 화면에서 취소하면 로그인 화면에 한국어 안내가 보인다

---

## Verification

1. `tsc --noEmit`: 통과
2. `npm run build` · `npm run build:cap`: 통과(사본에서 실행), `out/login.html` 생성
3. 카카오 첫 로그인(로컬 `localhost:3000`): 동의 → `/login` → `/space` 로그인 상태. Supabase에 provider `kakao`, 카카오계정 이메일로 계정 생성
4. 취향 병합: 로그인 전 브라우저의 무드 벡터 6축 · ♡ 코디 4개가 카카오 계정 `user_taste`로 저장
5. 재로그인: 로그아웃 후 같은 카카오 계정으로 바로 `/space`
6. 취소: 로그아웃 상태에서 `/login#error=access_denied`로 진입 → "카카오 로그인을 취소했어요.", 주소의 오류 정보 제거. 동의를 마친 계정이라 카카오 동의 화면의 취소 버튼은 직접 누르지 못했다
7. 모드: 로그인 · 회원가입에 버튼 보임, 재설정 모드에 없음
8. 실제 취소: 카카오 연결을 끊고 다시 로그인하면 웹 동의 화면에 취소 버튼이 없다("동의하고 계속하기"만). 동의하지 않고 나가면 오류 없이 로그인 화면
9. 취소 코드 우선: `?error=access_denied&error_code=bad_oauth_callback`(쿼리 · 해시) → "카카오 로그인을 취소했어요.", `error=server_error` → 일반 안내, 주소 오류 정보 제거
10. 연결 끊기 후 재연결: 같은 사용자 ID로 로그인, identities 1개(새 계정 없음)
11. 앱 빌드: `out/login.html`에 카카오 버튼 없음, 웹 빌드에는 있음

---

## Implementation Notes

### 카카오 · Supabase 설정

카카오 앱은 무드핏 전용 `moodfit`(1658940)을 새로 만들고 개인 개발자 비즈 앱으로 전환했다. 지금 콘솔은 Redirect URI를 [플랫폼 키] > REST API 키 설정에 넣고, 웹 도메인 등록은 JavaScript SDK용이라 리다이렉트 방식에는 필요 없다. 동의항목은 닉네임 · 이메일 필수, 프로필 사진 선택이다. Supabase가 기본으로 `account_email profile_image profile_nickname` 세 가지를 요청하므로 셋 다 설정해야 카카오 화면에서 오류가 나지 않는다. 이메일은 "값이 없으면 입력을 요청해 수집"을 켜서 이메일 없는 계정이 생기지 않게 했다. 키는 Supabase 대시보드에만 있고 `.env`에는 넣지 않는다.

### 돌아오는 곳과 깜빡임

돌아오는 곳을 `/login`으로 두고, 출발 전에 sessionStorage에 표시를 남겨 돌아온 뒤 세션이 생기면 `/space`로 보낸다. 처음에는 돌아온 순간 "이미 로그인됨" 안내가 잠깐 보였다. 카카오에서 막 돌아온 경우에는 안내를 그리지 않도록 바꿨다. 취소 · 실패 오류는 쿼리와 해시 양쪽에서 읽는다.

### 앱(Capacitor)

앱에서 카카오 버튼을 누르면 외부 브라우저에서 로그인되고 앱으로 돌아오지 못한다. 앱 URL 스킴, `@capacitor/app`의 `appUrlOpen`, Redirect URLs의 앱 주소 등록이 필요하다. RN 전환을 검토 중이라 앱 로그인 구현은 보류하고, 그 전까지 앱 빌드에서는 카카오 버튼을 뺀다. `next.config`의 `env`로 `BUILD_TARGET`을 넘겨 빌드 시점에 정하므로 앱 HTML에 버튼이 없다(실행 중 `Capacitor.isNativePlatform()`으로 숨기면 정적 HTML에 남아 앱에서 잠깐 보인다).

### 처리방침

FEAT-033 처리방침에 카카오 로그인과 카카오에서 받는 항목(식별자 · 닉네임 · 이메일 · 프로필 사진)이 없다. 배포 전에 추가해야 한다. 카카오 동의항목 화면의 개인정보 국외이전 설정도 처리방침과 맞춰야 한다.

### 같은 이메일 계정과 Confirm email

Supabase는 OAuth 로그인 때 같은 이메일의 확인된 계정이 있으면 자동으로 연결한다. Confirm email이 꺼져 있어 이메일 가입은 가입 즉시 Confirmed가 되므로, 남의 이메일로 먼저 가입해 두면 그 사람의 카카오 로그인이 그 계정에 합쳐진다(계정 선점). Confirm email은 가입 동의 티켓에서 켜고, 카카오 로그인 배포 전에 켜져 있어야 한다.

### 프로필 사진 거부 시 카카오 동의 화면 반복

Supabase 기본 카카오 연동은 로그인마다 `account_email profile_image profile_nickname`을 고정으로 요청한다. 프로필 사진(선택)을 거부한 사용자는 카카오가 미동의 항목을 다시 묻느라 로그인할 때마다 카카오 동의 화면을 본다. 카카오 콘솔에서 프로필 사진을 "사용 안 함"으로 바꾸면 KOE205로 로그인이 막힌다(2026-11-22 확인 후 선택 동의로 되돌림). 앱은 프로필 사진을 쓰지 않는다. 요청 항목을 직접 정하는 연동은 FEAT-040에서 다룬다.
