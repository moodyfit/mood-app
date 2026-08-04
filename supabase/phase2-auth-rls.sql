-- Phase 2 — 로그인 유저용 RLS 정책(익명 정책에 추가). 로그인 시 supabase 클라이언트가
-- authenticated 롤로 동작하므로, 인증 유저의 적재·조회가 되려면 이 정책들이 필요.

-- events: 로그인 유저는 자기 것만 insert / 조회
drop policy if exists events_auth_insert on events;
create policy events_auth_insert on events for insert to authenticated
  with check (user_id = auth.uid()::text);
drop policy if exists events_auth_select_own on events;
create policy events_auth_select_own on events for select to authenticated
  using (user_id = auth.uid()::text);

-- user_taste: 로그인 유저는 자기 행 전체(select/insert/update)
drop policy if exists taste_auth_all on user_taste;
create policy taste_auth_all on user_taste for all to authenticated
  using (user_id = auth.uid()::text)
  with check (user_id = auth.uid()::text);
