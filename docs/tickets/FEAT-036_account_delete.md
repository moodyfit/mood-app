# FEAT-036: 회원 탈퇴

나의 공간에서 회원이 직접 탈퇴하고, 계정과 회원 데이터가 삭제되게 한다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Todo |
| 우선순위 | P1 |
| Layer | Page / DB |
| Related | FEAT-033 |

---

## Problem

- **현재 동작**: 앱 안에 탈퇴 기능이 없다. 처리방침 · 약관(FEAT-033)은 탈퇴를 이메일로 받는다고 적어 두었다
- **기대 동작**: 나의 공간에서 탈퇴하면 계정, 이용 기록, 취향, 올린 사진이 삭제된다
- **영향 범위**: 나의 공간 화면, Supabase Auth · `events` · `user_taste` · `photos` · Storage `uploads`

---

## Context

```
관련 파일:
- src/app/space/page.tsx            로그아웃 버튼 위치(탈퇴 진입점 후보)
- src/lib/store.tsx:501             signOut
- src/app/api/photos/tag/route.ts   photos.uploaded_by 기록
- src/app/privacy/page.tsx          제3조 · 제8조
- src/app/terms/page.tsx            제12조
```

### 서버 권한

Auth 사용자 삭제는 service role이 필요하다. API Route는 `build:cap`에서 빠지므로 앱에서도 쓰려면 API Route가 아닌 방법이 필요하다(CLAUDE.md Capacitor 주의).

---

## Scope

### 포함

1. 나의 공간 — 탈퇴 버튼 + 확인 단계
2. 삭제 — Auth 사용자, 해당 user_id의 `events` · `user_taste` · `user_actions` · `photos` 행, Storage `uploads` 파일
3. 탈퇴 후 로그아웃 · 익명 신원 복귀
4. 처리방침 제8조 · 약관 제12조 문구를 앱 내 탈퇴에 맞게 수정

### 제외

- 올린 사진 개별 삭제 — 별도 티켓

---

## 결정

- 삭제 실행 위치: `security definer` DB 함수(RPC). 앱 빌드에는 API Route가 없어 서버 대신 DB 함수가 본인 행만 지운다. FEAT-035와 같은 방식(서영이 대시보드에서 실행 · 티켓에 기록). BE(NestJS) 착수 후 탈퇴 API로 옮긴다
- 화면 구성: 나의 공간 맨 아래 작은 글자 한 줄 `이용약관 · 개인정보 처리방침 · 회원 탈퇴`(비회원은 탈퇴 없음). 계정 카드 옆보다 덜 눈에 띄되, 한 번 눌러 찾을 수 있게(개인정보보호법 제38조 제4항 — 탈퇴를 가입보다 어렵게 하지 않음). 이 줄은 FEAT-036이 만들고 FEAT-037이 약관 링크를 더한다
- 확인 창 · 토스트 문구는 해요체(FEAT-039 동의 화면과 맞춤)
- 삭제 순서: 앱이 Storage `uploads`의 본인 파일을 먼저 지우고(실패하면 중단) → DB 함수 `delete_my_account()`가 `events` · `user_taste` · `user_actions` · `photos` 행과 계정을 지운다. Storage는 `protect_objects_delete` 트리거로 SQL 직접 삭제가 막혀 있다

---

## Acceptance Criteria

- [ ] 탈퇴 후 같은 이메일로 로그인되지 않는다
- [ ] 탈퇴 즉시 그 user_id의 `events` · `user_taste` 행이 남지 않는다(1년 파기 크론이 비회원으로 다루지 않도록)
- [ ] 탈퇴한 회원의 사진이 홈 · 검색에 나오지 않는다
- [ ] 웹과 앱 빌드에서 모두 동작한다

---

## Verification

1. `tsc --noEmit`: (대기)
2. `npm run build` · `npm run build:cap`: (대기)
3. 테스트 계정 탈퇴 후 DB · Storage 잔존 행: (대기)
4. DDL 적용(2026-11-27, 서영 · 대시보드): `pg_policies`에 `uploads_owner_delete`(DELETE), `delete_my_account` 실행 권한은 `postgres` · `authenticated` · `service_role`(anon 없음)

---

## Implementation Notes

### 대시보드에서 실행한 DDL (2026-11-27)

`supabase/`는 참조 전용이라 실행한 SQL을 여기에 남긴다.

```sql
create policy uploads_owner_delete on storage.objects
for delete to authenticated
using (bucket_id = 'uploads' and owner_id = auth.uid()::text);
```

```sql
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  delete from public.events       where user_id = uid::text;
  delete from public.user_taste   where user_id = uid::text;
  delete from public.user_actions where user_id = uid;
  delete from public.photos       where uploaded_by = uid;
  delete from auth.users          where id = uid;
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
```

### 되돌리기

```sql
drop function if exists public.delete_my_account();
drop policy if exists uploads_owner_delete on storage.objects;
```
