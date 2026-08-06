-- Phase 2-A: 개인화 파라미터 실시간 튜닝 — 단일 행 config. 클라이언트가 읽어 랭킹에 반영.
-- 쓰기는 서버(서비스키·관리자 게이트)만. 읽기는 모두 허용(랭킹에 필요).
create table if not exists app_config (
  id int primary key default 1,
  w_save numeric not null default 2,     -- 저장/좋아요/내옷담기 가중
  w_view numeric not null default 1,     -- 조회/클릭/검색 가중
  saturate numeric not null default 12,  -- α 포화(신호 총량 이만큼이면 개인화 최대)
  diversity numeric not null default 0.6,-- 다양성(쏠림 억제) 강도
  updated_at timestamptz default now(),
  constraint app_config_singleton check (id = 1)
);
insert into app_config (id) values (1) on conflict (id) do nothing;

alter table app_config enable row level security;
drop policy if exists config_read_all on app_config;
create policy config_read_all on app_config for select using (true); -- anon+authed 읽기
-- 쓰기 정책 없음 → RLS로 클라이언트 쓰기 차단(서버 서비스키만 우회)
