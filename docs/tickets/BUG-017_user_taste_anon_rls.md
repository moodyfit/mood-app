# BUG-017: 공개 키로 회원 취향 데이터를 읽고 쓸 수 있던 RLS

`user_taste`의 anon 정책이 전체 읽기 · 쓰기를 허용해, 앱에 들어 있는 공개 키(anon key)만으로 회원 · 비회원 모든 취향 데이터를 읽고 바꿀 수 있었다. anon 정책을 지우고, 비회원은 취향을 서버에 저장하지 않는다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | BUG (보안) |
| Status | In Progress |
| 우선순위 | P0 |
| Layer | Supabase RLS / Lib |
| Related | FEAT-035(#56 리뷰 P1-1), FEAT-033, FEAT-036 |

---

## Problem

- **현재 동작(2026-11-23까지)**: `supabase/phase1-personalization.sql`의 `taste_anon_select using (true)` · `taste_anon_insert with check (true)` · `taste_anon_update using (true) with check (true)`. 공개 키로 `user_taste` 429행 전부 조회됐고, 회원 행(카카오 계정)도 조회됐다. 쓰기도 정책상 열려 있었다
- **기대 동작**: 공개 키로는 `user_taste`를 읽을 수도 쓸 수도 없다. 회원은 `taste_auth_all`(자기 행만)로 지금처럼 쓴다
- **영향 범위**: `user_taste`(무드 벡터 · ♡ 사진 번호). 이메일 · 이름은 없다. `events`는 anon 조회가 막혀 있어 해당 없음

---

## Context

```
관련 파일:
- supabase/phase1-personalization.sql   anon 정책 정의(참조 전용, 수정 금지)
- supabase/phase2-auth-rls.sql          회원 정책 taste_auth_all
- src/lib/store.tsx                     비회원도 기기 UUID로 fetchTaste · syncTaste 호출
- src/lib/track.ts                      syncTaste(upsert) · fetchTaste(select)
```

- **원인**: 비회원 취향을 기기 UUID로 서버에 저장하려고 anon 정책을 전체 허용으로 열었다(phase1). 로그인을 붙이며(phase2) 회원 정책을 추가했지만 anon 정책을 좁히지 않아, 회원 행까지 공개 키로 열렸다. RLS는 정책 중 하나만 통과해도 허용된다
- **발견 경로**: FEAT-033 처리방침의 "비회원 기록 1년 파기"를 지키려는 FEAT-035 작업 중 발견, 티켓에 "별도 점검"으로만 남김 → 에린 #56 리뷰 P1-1 → 2026-11-23 공개 키로 노출 확인
- 비회원은 로그인 정보가 없어 DB가 행의 주인을 가릴 수 없다. 비회원 행을 공개 키로 안전하게 다룰 방법이 없다

---

## Scope

### 포함

1. **anon 정책 삭제** (서영 · 대시보드, 2026-11-23 실행) — `taste_anon_select` · `taste_anon_insert` · `taste_anon_update`
2. **기존 비회원 행** — 지우지 않는다. anon 키로 읽을 수 없고 FEAT-035 1년 파기에 맡긴다
3. `src/lib/store.tsx` — 비회원일 때 `fetchTaste` · `syncTaste`를 부르지 않는다. 비회원 취향은 브라우저(localStorage)에만 두고, 로그인 순간 계정으로 합치는 흐름은 그대로

### 제외

- 비회원 로그인 권유(토스트 등) — 가입 유도 방식이라 팀 논의 후 별도 티켓
- `supabase/*.sql` 파일 수정 — CLAUDE.md상 참조 전용. 대시보드 변경은 이 티켓에 기록
- `events`의 anon insert 정책 — 조회는 막혀 있고 쓰기 전용 집계라 이번 범위 밖

---

## 결정

- anon 정책 세 개는 노출을 막으려고 먼저 지웠다(2026-11-23)
- 비회원 취향은 서버에 저장하지 않고 브라우저에만 둔다(A안). 비회원은 가입 동의를 하지 않은 사람이라 서버에 쌓는 것이 약관 · 가입 동의(FEAT-039) 방향과 맞지 않는다(에린, #56 답변). Supabase 익명 로그인(B안)은 택하지 않았다
- 기존 비회원 행은 지우지 않고 둔다(에린). anon 정책이 없어 아무도 읽을 수 없고, FEAT-035 1년 파기가 차례로 지운다

---

## Acceptance Criteria

- [x] 공개 키로 `user_taste` 조회 시 0행(회원 행 포함)
- [x] `pg_policies`에 `user_taste` 정책은 `taste_auth_all` 하나
- [x] 기존 비회원 행은 남되 anon 키로 읽을 수 없다
- [ ] 비회원 상태에서 `user_taste` 요청(조회 · 저장)이 나가지 않는다
- [ ] 회원 로그인 시 취향 복구 · 병합 · 저장이 지금처럼 된다

---

## Verification

1. 2026-11-23 정책 삭제 전: 공개 키 `GET /rest/v1/user_taste` → 429행, 회원(카카오) 행 1행 조회
2. 정책 삭제 후: 전체 0행, 회원 행 0행, PATCH(존재하지 않는 id) 0행. `pg_policies` → `taste_auth_all`(authenticated, ALL)만
3. 기존 비회원 행: 삭제하지 않음(에린 결정). 2번 확인으로 anon 조회 0행
4. (대기) 코드 — 비회원 네트워크 요청 · 회원 병합

---

## Implementation Notes

### 되돌리기

문제가 생기면 `supabase/phase1-personalization.sql` 34~39줄의 `create policy` 세 줄을 다시 실행하면 이전 상태로 돌아간다(권장하지 않음 — 노출이 다시 열린다).
