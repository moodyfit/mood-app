-- 10/16 회의록 "썸네일 사진을 코디 사진에서 크롭해서 보여주게 수정" <에린>.
-- products.image_url 에 코디 사진에서 아이템 부위를 크롭한 실사진 URL을 채운다.
-- 없으면 ProductRow가 gradient placeholder로 폴백(src/components/ProductRow.tsx).
--
-- 실행 전 준비(Storage 콘솔, 소피):
--   1) "moods" 버킷에 crops/ 폴더 생성(없으면)
--   2) 아래 로컬 크롭 파일을 crops/ 에 업로드(anon 키로는 RLS에 막혀 업로드 불가 — 콘솔/서비스롤 필요)
--      - m-clean-004-top.jpg    (화이트 반팔 티)
--      - m-clean-004-bottom.jpg (베이지 와이드 팬츠)
--   3) 아래 ALTER + UPDATE를 SQL 에디터에서 실행
--
-- 컬럼이 이미 있으면 ALTER는 그냥 통과한다(IF NOT EXISTS).
alter table products add column if not exists image_url text;

update products set image_url =
  'https://sjcslybbczaizmfosqge.supabase.co/storage/v1/object/public/moods/crops/m-clean-004-top.jpg'
where photo_image_url = 'moods/m-clean-004.jpg' and name = '화이트 반팔 티';

update products set image_url =
  'https://sjcslybbczaizmfosqge.supabase.co/storage/v1/object/public/moods/crops/m-clean-004-bottom.jpg'
where photo_image_url = 'moods/m-clean-004.jpg' and name = '베이지 와이드 팬츠';

-- 다음 사진 크롭을 추가할 땐 이 파일 맨 아래에 UPDATE 문을 이어 붙인다(새 파일 만들지 않음).
