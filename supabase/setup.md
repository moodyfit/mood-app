# Supabase 연결 순서 (오늘 마일스톤: 그리드가 DB에서 뜸)

## 1. 스키마
- `src/lib/schema.sql`(콘텐츠 DDL) 실행 완료.
- 라이브 `photos`는 **태깅 스키마**(mood_vector jsonb, situations/seasons text[], body_spec jsonb, caption_item/why, is_flagship). ✅ 실전 검증됨(clean-001).

## 2. photos 나머지 INSERT
- `tagging/seed.sql`에 **4건 전부** 있음(street 상황 '놀거리'→**'동네'** 교정 반영).
- clean-001은 이미 넣었으니 **cityboy/street/amekaji-001 3건만** 실행(중복 방지).

## 3. Storage
- 버킷 `moods` 생성 후 **Public**으로.
- 파일명 = image_url 경로와 일치: `clean-001.png`, `cityboy-001.png`, `street-001.png`, `amekaji-001.png`.
  (앱은 `${SUPABASE_URL}/storage/v1/object/public/moods/xxx.png` 로 로드)
- Public 토글 대신 정책으로 열려면:
```sql
create policy "anon read moods bucket" on storage.objects
  for select using (bucket_id = 'moods');
```

## 4. RLS (Table Editor "RLS disabled" 경고 해소)
```sql
alter table photos enable row level security;
create policy "anon read photos" on photos for select using (true);
-- 나중에 moods/products/query_map 시딩하면 동일 패턴으로:
-- alter table moods enable row level security;
-- create policy "anon read moods" on moods for select using (true);
```

## 5. 앱 연결
- `cp .env.local.example .env.local` 후 채우기:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
- `npm run dev` → 검색하면 `/results` 그리드가 **DB photos**에서 뜬다.
  - 완성가 라벨 없음(products 비어 있음) · 롱프레스 해설(caption_item/why) · 하트 저장.
  - 키 없거나 photos 0건이면 자동으로 로컬 8무드 폴백(앱 안 깨짐).

## (나중) products/moods 시딩
- `scripts/gen-seed.ts`는 앱 로컬 시드(8무드+상품)를 `supabase/seed.sql`로 방출하는 도구.
  단, 태깅은 6축(clean/cityboy/street/amekaji/classic/soft)이라 **6축 정합 후** 사용 권장.
  products가 채워지면 완성가 라벨·자연 번역기가 DB로 살아난다.
