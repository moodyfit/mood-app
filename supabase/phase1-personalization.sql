-- Phase 1 개인화 기반 — 이벤트 로깅 + 서버 취향벡터.
-- 익명 userId 단계용 RLS(anon 롤 최소 권한). 로그인 도입 시 auth.uid() 기준으로 조일 것.

-- 1) 이벤트 원천 데이터(분석·ML)
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  type text not null,          -- save/unsave/view/scan_like/search/photo_open/worn/profile_set
  photo_id text,
  mood_key text,
  query text,
  meta jsonb,
  created_at timestamptz default now()
);
create index if not exists events_user_created_idx on events(user_id, created_at desc);
create index if not exists events_type_idx on events(type);

-- 2) 유저별 취향 스냅샷(영속·복구·로그인 병합 대비)
create table if not exists user_taste (
  user_id text primary key,
  mood_vector jsonb default '{}'::jsonb,
  saved_photo_ids text[] default '{}',
  updated_at timestamptz default now()
);

-- RLS 활성화
alter table events enable row level security;
alter table user_taste enable row level security;

-- 익명 단계 정책: anon 롤에 필요한 최소 동작만 허용(스푸핑 가능 — 로그인 후 조임)
drop policy if exists events_anon_insert on events;
create policy events_anon_insert on events for insert to anon with check (true);

drop policy if exists taste_anon_select on user_taste;
create policy taste_anon_select on user_taste for select to anon using (true);
drop policy if exists taste_anon_insert on user_taste;
create policy taste_anon_insert on user_taste for insert to anon with check (true);
drop policy if exists taste_anon_update on user_taste;
create policy taste_anon_update on user_taste for update to anon using (true) with check (true);
