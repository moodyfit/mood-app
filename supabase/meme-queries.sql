-- 밈·일상어 검색어 매핑 (#5) — query_mappings 테이블에 등록.
-- 뼈(mood_vector 축)는 불변, 유저가 보는 표면 언어만 밈. 번역은 뒤에서만(화면 노출 금지).
-- 변형 검색어('테토남 그 느낌','테토' 등)는 앱 정규화/부분매칭에서 동일 매핑으로 폴백.
-- 앱 로컬 폴백(lib/moods.ts QUERY_MAP)에도 동일 매핑이 있으니, DB 미적용이어도 검색은 동작.

insert into query_mappings (query_text, mood_vector) values
  ('테토남',   '{"street":0.5,"amekaji":0.3,"cityboy":0.2}'),
  ('에겐남',   '{"soft":0.5,"clean":0.3,"cityboy":0.2}'),
  ('느좋',     '{"cityboy":0.4,"soft":0.3,"clean":0.3}'),
  ('남친룩',   '{"soft":0.4,"clean":0.3,"cityboy":0.3}'),
  ('힙하게',   '{"street":0.6,"amekaji":0.2,"cityboy":0.2}'),
  ('꾸안꾸',   '{"cityboy":0.5,"soft":0.3,"clean":0.2}'),
  ('만찢남',   '{"clean":0.4,"classic":0.3,"cityboy":0.3}'),
  ('댄디하게', '{"classic":0.5,"clean":0.3,"soft":0.2}'),
  ('올드머니', '{"classic":0.5,"clean":0.3,"soft":0.2}'),
  ('시크하게', '{"clean":0.5,"street":0.3,"classic":0.2}')
on conflict (query_text) do update set mood_vector = excluded.mood_vector;
