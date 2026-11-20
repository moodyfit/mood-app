# FEAT-034: 비밀번호 재설정

로그인 화면에서 재설정 메일을 요청하고, 메일 링크로 들어온 `/reset-password`에서 새 비밀번호를 정한다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Done |
| 우선순위 | P0 |
| Layer | Page / Lib |
| Related | FEAT-033 |

---

## Problem

- **현재 동작**: 비밀번호를 잊으면 로그인할 방법이 없다
- **기대 동작**: 이메일로 재설정 링크를 받아 새 비밀번호를 정하고 다시 로그인한다
- **영향 범위**: `/login` 로그인 모드, 신규 `/reset-password`

---

## Context

```
관련 파일:
- src/app/login/page.tsx    로그인 · 회원가입 한 화면 전환
- src/lib/store.tsx         signIn · signUp · signOut (Supabase Auth)
- src/lib/supabase.ts       클라이언트 생성(기본 옵션)
```

### 메일 발송

- Supabase 기본 SMTP는 프로젝트 팀원 주소로만 보내고 시간당 발송 수가 적다. 일반 사용자에게 재설정 메일이 가지 않는다
- Gmail SMTP(앱 비밀번호)를 Supabase Auth → SMTP Settings에 연결한다. 도메인이 필요 없다. 서영님이 대시보드에서 설정한다
- 메일 템플릿 문구(Reset Password)도 대시보드에서 한국어로 바꾼다

### 링크 흐름

- `resetPasswordForEmail(email, { redirectTo: '<웹 주소>/reset-password' })` → 메일 링크 → Supabase가 복구 세션을 붙여 `/reset-password`로 보낸다 → `updateUser({ password })`
- `redirectTo` 주소는 Supabase Auth → URL Configuration의 Redirect URLs에 등록돼 있어야 한다
- 앱 사용자도 메일 링크는 웹에서 열린다. 웹에서 바꾼 비밀번호로 앱에서 로그인한다

---

## Scope

### 포함

1. `src/lib/store.tsx` — `requestPasswordReset(email)` · `updatePassword(pw)` 추가
2. `src/app/login/page.tsx` — 로그인 모드에 "비밀번호를 잊었어?" → 같은 화면에서 이메일 입력 · 발송 안내
3. `src/app/reset-password/page.tsx` — 새 비밀번호 · 확인 입력, 링크 만료 시 안내
4. `src/components/ui/PasswordInput.tsx` — 비밀번호 칸 눈 아이콘 보기/숨기기. 로그인 · 회원가입 · 재설정 칸 3곳에 적용
5. `src/lib/store.tsx` — 인증 오류(로그인 · 회원가입 · 재설정 요청 · 비밀번호 변경)를 오류 코드별 한국어 해요체로. 모르는 코드는 영어 원문 대신 일반 안내
6. 로그인 · 재설정 화면을 `<form>` 제출로 바꿔 브라우저 비밀번호 저장 · 갱신 제안이 뜨게. 재설정 후 로그인 화면 이메일 칸 미리 채우기(sessionStorage, 1회용)

### 제외

- 앱 딥링크로 앱 안에서 재설정(웹으로 처리)
- 아이디 찾기 — 아이디가 이메일이다

---

## 화면

```
[/login 로그인 모드]              [/reset-password]
 이메일 [____]                     새 비밀번호 [____]
 비밀번호 [____]                   새 비밀번호 확인 [____]
 [ 로그인 ]                        [ 변경하기 ]
 비밀번호를 잊었어?                 → 성공: "비밀번호를 바꿨어" + [로그인하러 가기]
   ↓                               → 링크 만료 · 세션 없음:
 이메일 [____]                        "링크가 만료됐어. 다시 요청해줘" + [로그인으로]
 [ 재설정 메일 보내기 ]
 → "메일을 보냈어. 메일함을 확인해줘"
```

---

## 결정

- 가입되지 않은 이메일에도 같은 "메일을 보냈어" 안내를 띄운다. 가입 여부를 드러내지 않는다
- 새 비밀번호 규칙은 회원가입과 같다(6자 이상)
- 변경 후 로그아웃하고 로그인 화면으로 안내한다. 메일 링크로 들어온 복구 세션이 그대로 로그인 상태로 남지 않게 한다

---

## Strategy

1. 서영님: Gmail 계정 · 앱 비밀번호 → Supabase SMTP 설정, Redirect URLs에 `/reset-password` 등록
2. store 함수 추가
3. 로그인 화면 요청 흐름
4. `/reset-password` 페이지
5. 검증 · 커밋 · PR

---

## Acceptance Criteria

- [x] 로그인 모드에서 "비밀번호를 잊었어?"가 보이고, 회원가입 모드에서는 보이지 않는다
- [x] 이메일을 넣고 요청하면 메일이 오고, 링크가 `/reset-password`로 연다
- [x] 새 비밀번호와 확인이 다르거나 6자 미만이면 변경 버튼이 막힌다
- [x] 변경 후 새 비밀번호로 로그인되고 이전 비밀번호는 거부된다
- [x] 만료된 링크로 들어오거나 세션 없이 변경하면 만료 안내가 보인다

---

## Verification

1. `tsc --noEmit`: 통과
2. `npm run build` · `npm run build:cap`: 통과(사본에서 실행), `out/login.html` · `out/reset-password.html` 생성
3. 재설정 메일 수신: 보낸 사람 "무드핏 <moodfit.team@gmail.com>", 제목 "[무드핏] 비밀번호 재설정 안내", 링크 `/reset-password` 이동
4. 재설정 → 성공 화면 → 로그아웃 → 로그인 화면 이메일 미리 채움 → 새 비밀번호 로그인 성공, 이전 비밀번호 "이메일 또는 비밀번호가 맞지 않아요."
5. 60초 안에 재요청: "요청이 너무 잦아요. 잠시 후 다시 요청해 주세요."
6. 같은 비밀번호로 변경: "지금 쓰는 비밀번호와 다른 비밀번호를 입력해 주세요."
7. 만료 링크(`#error=...`) 진입 · 세션 없이 변경: 만료 안내
8. 크롬 비밀번호 저장: `password-manager-internals`에서 제출 감지(`XHR_SUCCEEDED`) → `Decision: ASK the user` 확인. 로컬 `localhost:3000`은 브라우저에 "저장 안 함"으로 등록돼 있어 팝업 미표시

---

## Implementation Notes

### Supabase 대시보드 설정

프로덕션 프로젝트의 Site URL이 `http://localhost:3000`이었고 Redirect URLs가 비어 있었다. Site URL을 `https://mood-app-blond.vercel.app`으로 바꾸고 Redirect URLs에 운영 주소와 `http://localhost:3000/**`를 등록했다. 로컬 dev 서버를 다른 포트로 띄우면 메일 링크가 운영 주소로 떨어진다. SMTP는 Gmail(`moodfit.team@gmail.com`, 포트 465)로 연결했고 발송 한도는 시간당 30통이 된다. "Confirm email"은 꺼져 있어 가입 확인 메일은 나가지 않는다 — 켤지는 가입 동의 티켓에서 다룬다.

### 메일 템플릿 반영 지연

Reset password 템플릿을 저장한 직후 보낸 메일은 기본 영어 템플릿으로 나갔고, 저장 7분 뒤 메일부터 한국어로 나갔다. Auth 서버가 템플릿을 일정 시간 캐시하는 것으로 보인다. 템플릿을 바꾼 뒤에는 몇 분 기다려 확인한다. 메일 문구는 합쇼체로 쓴다.

### 오류 문구

Supabase 오류 원문(영어)을 그대로 보여 주던 로그인 · 회원가입까지 포함해 `authError()`로 오류 코드별 한국어 해요체 문구를 보여 준다. 표에 없는 코드는 원문 대신 일반 안내를 보여 준다. 화면 안내 문구는 기존처럼 반말이다. 인증 화면 전체를 존댓말로 바꿀지는 팀 논의 후 별도 티켓으로 한다.

### 변경 후 로그아웃

처음에는 복구 세션을 그대로 로그인 상태로 두었으나, 로그인하지 않았는데 로그인된 상태가 어색해 변경 후 로그아웃하고 로그인 화면으로 보내도록 바꿨다. 로그아웃 직전 이메일을 sessionStorage에 넣어 로그인 칸을 미리 채운다. 주소 쿼리에 이메일을 싣지 않는다.

### 브라우저 비밀번호 저장

`<form>` 없이 버튼 `onClick`으로만 제출해 브라우저가 로그인 시도로 인식하지 못했다. 폼 제출로 바꾸고 이메일 칸을 `autoComplete="username"`으로 바꿨다. 재설정 화면에는 어느 계정의 비밀번호인지 알리는 숨은 아이디 칸을 둔다. 앱(Capacitor iOS)의 키체인 저장은 Associated Domains 설정이 필요해 범위 밖이다.
