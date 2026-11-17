# FEAT-034: 비밀번호 재설정

로그인 화면에서 재설정 메일을 요청하고, 메일 링크로 들어온 `/reset-password`에서 새 비밀번호를 정한다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Todo |
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
2. `src/app/login/page.tsx` — 로그인 모드에 "비밀번호를 잊었어? >" → 같은 화면에서 이메일 입력 · 발송 안내
3. `src/app/reset-password/page.tsx` — 새 비밀번호 · 확인 입력, 링크 만료 시 안내

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
 비밀번호를 잊었어? >               → 성공: "비밀번호를 바꿨어" + [로그인하러 가기]
   ↓                               → 링크 만료 · 세션 없음:
 이메일 [____]                        "링크가 만료됐어. 다시 요청해줘" + [로그인으로]
 [ 재설정 메일 보내기 ]
 → "메일을 보냈어. 메일함을 확인해줘"
```

---

## 결정

- 가입되지 않은 이메일에도 같은 "메일을 보냈어" 안내를 띄운다. 가입 여부를 드러내지 않는다
- 새 비밀번호 규칙은 회원가입과 같다(6자 이상)
- 변경 후 자동 로그인 상태는 유지한다(복구 세션이 그대로 로그인 세션)

---

## Strategy

1. 서영님: Gmail 계정 · 앱 비밀번호 → Supabase SMTP 설정, Redirect URLs에 `/reset-password` 등록
2. store 함수 추가
3. 로그인 화면 요청 흐름
4. `/reset-password` 페이지
5. 검증 · 커밋 · PR

---

## Acceptance Criteria

- [ ] 로그인 모드에서 "비밀번호를 잊었어? >"가 보이고, 회원가입 모드에서는 보이지 않는다
- [ ] 이메일을 넣고 요청하면 메일이 오고, 링크가 `/reset-password`로 연다
- [ ] 새 비밀번호와 확인이 다르거나 6자 미만이면 변경 버튼이 막힌다
- [ ] 변경 후 새 비밀번호로 로그인되고 이전 비밀번호는 거부된다
- [ ] 세션 없이 `/reset-password`에 들어오면 만료 안내가 보인다

---

## Verification

1. `tsc --noEmit`: (대기)
2. `npm run build` · `npm run build:cap`: (대기)
3. 팀원 외 주소로 재설정 메일 수신: (대기)
4. 재설정 → 새 비밀번호 로그인: (대기)

---

## Implementation Notes
