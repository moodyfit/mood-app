-- 무드(MOOD) Supabase 스키마 v1
-- lib/types.ts 의 인터페이스와 1:1 대응. 로컬 시드 → Supabase 전환 시 이 스키마 사용.

-- Layer 1: 무드 축 (전략 문서 §5)
create table if not exists moods (
  key         text primary key,          -- URL 슬러그 겸 조인 키 (clean, amekaji ...)
  name        text not null,
  description text not null default '',
  image_url   text,                       -- 실 룩북 이미지. null이면 gradient 폴백
  gradient    text not null,              -- 자리표시자 CSS 그라디언트
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

-- 무드 사진 (MVP: 무드당 여러 장의 룩북 컷). v1 로컬 시드에선 무드=사진 1:1로 단순화
create table if not exists photos (
  id          uuid primary key default gen_random_uuid(),
  mood_key    text not null references moods(key) on delete cascade,
  image_url   text not null,
  body_type   text,                       -- 7.10 체형 변수 (생성 프롬프트 스펙 기록) → '내 체형으로 보기' 전제
  caption     text,                       -- 7.10 '길게 눌러 해줌': 아이템 명명 + 좋아 보이는 이유 1줄
  gen_prompt  text,                       -- 생성 프롬프트 전문 (images/gen_log.json 소스, 재현/감성 추적)
  aspect_ratio real default 0.8,          -- 메이슨리 세로 비율 = width/height (4:5=0.8·3:4=0.75·9:16=0.571). 생성 단계에서 부여
  created_at  timestamptz not null default now()
);
create index if not exists photos_mood_key_idx on photos(mood_key);
-- 기존 테이블 마이그레이션: alter table photos add column if not exists aspect_ratio real default 0.8;
-- 컬럼 추가 후 lib/photos.ts fetchPhotos select 에 aspect_ratio 를 넣으면 실비율이 그리드에 반영됨(없으면 0.8 폴백).

-- 상품 (무드에 매칭된 중고매 가능 아이템)
-- 판매처는 별도 정규화 가능하나 MVP는 products 다건(같은 이름 여러 소스)으로 단순화
create table if not exists products (
  id            uuid primary key default gen_random_uuid(),
  mood_key      text not null references moods(key) on delete cascade,
  name          text not null,
  category      text not null,            -- 7.10 태깅: 상의/하의/아우터/신발
  price_tier    text not null,            -- 7.10 태깅: 로우/미드/하이
  price         int  not null,            -- 원 단위 정수
  source        text not null,            -- "무신사 · 새상품"
  image_url     text,
  gradient      text not null,
  affiliate_url text,                     -- 제휴 아웃바운드 (수익화)
  created_at    timestamptz not null default now()
);
create index if not exists products_mood_key_idx on products(mood_key);
create index if not exists products_category_idx on products(category);

-- Layer 2: 검색어 → 무드 매핑 (LLM 번역 캐시/시드)
create table if not exists query_map (
  keyword    text primary key,
  mood_keys  text[] not null,
  updated_at timestamptz not null default now()
);

-- 저장(찜) 로그 = 취향 데이터 (익명 세션 or 로그인 유저)
create table if not exists user_saves (
  id         uuid primary key default gen_random_uuid(),
  user_id    text,                        -- 익명 세션 id 또는 auth uid
  mood_key   text not null references moods(key) on delete cascade,
  saved_at   timestamptz not null default now()
);
create index if not exists user_saves_user_idx on user_saves(user_id);

-- 검색 로그 (검색어 분포 검증 지표 — 전략 문서 §8: 일상어·상황어 비중)
create table if not exists search_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    text,
  query      text not null,
  created_at timestamptz not null default now()
);
