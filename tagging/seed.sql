-- MOODFIT 무드 사진 시드 (사람 검수 승인분만 누적)
-- 배치 #1 (2026-07-22 승인): clean/cityboy/street/amekaji 001
-- 스키마: photos (mood_vector jsonb, situations/seasons text[], body_spec jsonb, caption_*, is_flagship)

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, is_flagship)
values (
  'moods/clean-001.png',
  '{"clean":1.0}'::jsonb,
  array['출근','소개팅'],
  array['spring','summer'],
  '{"height":"178","build":"regular"}'::jsonb,
  '화이트 라운드 반팔에 차콜 슬랙스',
  '색을 흰색·차콜 둘로만 끊어서 군더더기가 없어 — 그래서 대충 입어도 정돈돼 보여',
  true
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, is_flagship)
values (
  'moods/cityboy-001.png',
  '{"cityboy":0.7,"classic":0.3}'::jsonb,
  array['출근','데이트'],
  array['spring','fall'],
  '{"height":"178","build":"regular"}'::jsonb,
  '어깨에 걸친 베이지 셋업 재킷에 네이비 토트백',
  '위아래 베이지로 톤 맞추고 흰 티로 가운데를 끊었어 — 셋업인데 안 딱딱하고 데일리로 풀려',
  true
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, is_flagship)
values (
  'moods/street-001.png',
  '{"street":1.0}'::jsonb,
  array['동네','여행'],
  array['spring','fall'],
  '{"height":"178","build":"regular"}'::jsonb,
  '오버핏 아치로고 후디에 와이드 팬츠, 지갑체인',
  '위아래 다 크게 놀아서 힘이 안 들어가 보여 — 대신 발만 밝은 스니커즈로 띄우면 안 처져',
  false
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, is_flagship)
values (
  'moods/amekaji-001.png',
  '{"amekaji":0.8,"classic":0.2}'::jsonb,
  array['주말카페','여행'],
  array['spring','fall'],
  '{"height":"177","build":"regular"}'::jsonb,
  '올리브 밀리터리 코트에 청청 데님',
  '위아래 청으로 깔고 카키 코트 하나 얹었어 — 흙색 톤으로 붙어서 낡은 느낌이 멋으로 읽혀',
  true
);
