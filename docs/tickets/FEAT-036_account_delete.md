# FEAT-036: 회원 탈퇴

나의 공간에서 회원이 직접 탈퇴하고, 계정과 회원 데이터가 삭제되게 한다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | In Progress |
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
3. 탈퇴 후 로그아웃 · 기기에 남은 취향 · 옷장(`mood.*`) 삭제 · 새 익명 신원
4. 처리방침 제7조 · 제8조 · 약관 제12조 문구를 앱 내 탈퇴에 맞게 수정

### 제외

- 올린 사진 개별 삭제 — 별도 티켓

---

## 결정

- 삭제 실행 위치: `security definer` DB 함수(RPC). 앱 빌드에는 API Route가 없어 서버 대신 DB 함수가 본인 행만 지운다. FEAT-035와 같은 방식(서영이 대시보드에서 실행 · 티켓에 기록). BE(NestJS) 착수 후 탈퇴 API로 옮긴다
- 화면 구성: 나의 공간 맨 아래 작은 글자 한 줄 `이용약관 · 개인정보 처리방침 · 회원 탈퇴`(비회원은 탈퇴 없음). 계정 카드 옆보다 덜 눈에 띄되, 한 번 눌러 찾을 수 있게(개인정보보호법 제38조 제4항 — 탈퇴를 가입보다 어렵게 하지 않음). 이 줄은 FEAT-036이 만들고 FEAT-037이 약관 링크를 더한다
- 확인 창 · 토스트 문구는 해요체(FEAT-039 동의 화면과 맞춤)
- 삭제 순서: 앱이 Storage `uploads`의 본인 파일을 먼저 지우고(실패하면 중단) → DB 함수 `delete_my_account()`가 `events` · `user_taste` · `user_actions` · `photos` 행과 계정을 지운다. Storage는 `protect_objects_delete` 트리거로 SQL 직접 삭제가 막혀 있다. 끝나면 로그아웃하고 기기 저장소의 `mood.*`를 지운 뒤 홈을 새로 불러온다(옷장은 기기에만 있고, 남겨 두면 다시 가입할 때 로그인 병합으로 취향이 되살아난다)
- 문서 문구(Step 4)를 고치는 이유: 처리방침은 권리 행사 방법을 적어야 하는 공개 문서(개인정보보호법 제30조)라 실제 동작과 맞아야 한다. 이메일 요청만 안내하면 법이 인정하는 방법(시행령 제41조 제1항)이긴 하지만, 가입은 앱에서 바로 받으면서 탈퇴는 이메일로만 받아 수집보다 어려운 방법이 될 여지가 있다(제38조 제4항). 제7조 "보호책임자 승인 후 파기"는 탈퇴 즉시 자동 삭제와 맞지 않는다. 법률 판단이 아니라 조문 기준 판단이며, 출시 전 전문가 검토는 #54 리뷰 포인트에 남아 있다

---

## Strategy

### Step 1: 탈퇴 데이터 계층

`src/lib/account.ts` — 내 사진 경로 조회(`photos.uploaded_by`) → Storage `uploads` 파일 삭제(실패하면 중단) → `delete_my_account()` 호출. 컴포넌트는 이 함수만 부른다.

### Step 2: 확인 창

삭제되는 정보 목록 + [취소] [탈퇴하기]. 처리 중에는 버튼을 막고, 실패하면 창 안에 안내한다.

### Step 3: 나의 공간 진입 · 완료 처리

맨 아래 한 줄(회원만 "회원 탈퇴"). 탈퇴 뒤 로그아웃 · 비회원 신원 복귀 · 홈 이동 · 토스트.

### Step 4: 처리방침 · 약관 문구 (#54 머지 후)

처리방침 제7조 · 제8조 · 약관 제12조를 앱 안 탈퇴에 맞게 고친다. 이메일 요청 방법은 남긴다(앱을 쓸 수 없을 때도 탈퇴할 수 있게).

- 약관 제12조 1항: "회원은 언제든지 서비스의 "나의 공간 > 회원 탈퇴"에서 탈퇴할 수 있으며, 탈퇴하면 계정과 회원 정보는 즉시 삭제됩니다. 개인정보 보호책임자 이메일로 탈퇴를 요청할 수도 있으며, 이 경우 운영자는 지체 없이 처리합니다."
- 처리방침 제8조: "회원 탈퇴는 서비스의 "나의 공간 > 회원 탈퇴"에서 직접 할 수 있으며, 올린 사진의 삭제는 아래 방법으로 요청할 수 있습니다." 행사 방법에 "서비스 내 나의 공간 > 회원 탈퇴"를 이메일 앞에 추가
- 처리방침 제7조: 비회원 자동 파기 다음에 "회원이 탈퇴하면 그 회원의 개인정보는 즉시 자동으로 파기하며"를 추가(승인 후 파기 대상에서 뺌)

---

## Acceptance Criteria

- [x] 탈퇴 후 같은 이메일로 로그인되지 않는다
- [x] 탈퇴 즉시 그 user_id의 `events` · `user_taste` 행이 남지 않는다(1년 파기 크론이 비회원으로 다루지 않도록)
- [ ] 탈퇴한 회원의 사진이 홈 · 검색에 나오지 않는다
- [x] 웹과 앱 빌드에서 모두 동작한다

---

## Verification

1. `tsc --noEmit`: 통과
2. `npm run build` · `npm run build:cap`: 통과(`out/space.html` 생성). 앱 빌드 결과물(`out/`, API Route 없음)을 로컬 정적 서버로 띄워 테스트 계정(test01@gmail.com) 탈퇴 → `auth.users` · `events` · `user_taste` · `user_actions` · `photos` 모두 0(2026-11-27). iOS 시뮬레이터 실행은 미확인(Xcode 없음)
3. 테스트 계정(test@example.com) 탈퇴, 2026-11-27 로컬 웹: 탈퇴 전 `auth.users` 1 · `events` 53 · `user_taste` 1 · `user_actions` 0 · `photos` 0 → 탈퇴 후 모두 0. 올린 사진이 없는 계정이라 Storage 파일 · `photos` 행 삭제는 미확인
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
