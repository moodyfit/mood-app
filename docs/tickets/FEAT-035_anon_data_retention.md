# FEAT-035: 비회원 이용 기록 1년 파기

개인정보 처리방침(FEAT-033) 제3조의 "비회원 기록은 마지막 이용 후 1년이 지나면 파기"를 실제로 지킨다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Done |
| 우선순위 | P1 |
| Layer | DB |
| Related | FEAT-033 |

---

## Problem

- **현재 동작**: 익명 UUID로 쌓인 `events` · `user_taste` 행을 지우는 작업이 없다. 기록이 무기한 남는다
- **기대 동작**: 회원이 아닌 user_id의 기록이 마지막 이용 후 1년이 지나면 자동으로 삭제된다
- **영향 범위**: Supabase `events` · `user_taste` 테이블. 앱 코드는 바뀌지 않는다

---

## Context

```
관련 파일:
- supabase/phase1-personalization.sql   events(user_id text, created_at) · user_taste(user_id text pk, updated_at)
- src/lib/store.tsx:204                 익명 UUID 발급(localStorage mood.uid.v1)
- src/app/privacy/page.tsx              제3조 보유 기간
```

### 비회원 판별

`user_id`가 `auth.users.id`에 없으면 비회원이다. 로그인하면 익명 기록이 계정으로 병합되므로, 병합 뒤 남은 익명 행도 같은 기준으로 지워진다.

### 마지막 이용 시점

user_id별 `events.created_at` 최댓값과 `user_taste.updated_at` 중 늦은 쪽을 마지막 이용으로 본다.

---

## Scope

### 포함

1. 삭제 SQL — 1년 넘게 이용이 없는 비회원 user_id의 `events` · `user_taste` 행 삭제
2. 주기 실행 — Supabase `pg_cron` 일 1회(대시보드에서 서영 실행)
3. `supabase/` 밖에 SQL 원문 보관(`supabase/`는 수정 금지)

### 제외

- 회원 데이터 삭제 → FEAT-036(회원 탈퇴)
- 익명 `user_taste` 조회가 anon에게 열려 있는 RLS(`taste_anon_select using (true)`) — 별도 점검

---

## 결정

- `pg_cron`(Supabase Cron)으로 매일 03:00 KST 실행한다. Free 플랜에서 대시보드 Integrations로 켤 수 있고, DB 안에서 끝나 외부 키가 필요 없다
- 삭제는 `security definer` 함수 `purge_stale_anon()`에 두고, anon·authenticated의 실행 권한을 막는다

---

## Acceptance Criteria

- [x] 마지막 이용이 1년 넘은 비회원 행만 삭제되고, 회원 행과 1년 이내 비회원 행은 남는다
- [ ] 스케줄이 매일 실행된다

---

## Verification

1. 테스트 행(1년 전 비회원 · 최근 비회원 · 회원) 삭제 결과: 통과 — 400일 전 비회원(events 2 · user_taste 1) 삭제, 300일 전 비회원 유지, 회원 events 761행 유지, 반환값 1. anon 키 호출은 `permission denied`. 테스트 행 정리 후 events 3,390 · user_taste 398로 원복
2. 스케줄 실행 기록: 잡 `purge-stale-anon` 등록 확인(`0 18 * * *`, 다음 실행 2026-11-21 03:00 KST). 첫 실행 기록 (대기)

---

## Implementation Notes
