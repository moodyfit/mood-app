-- MOODFIT 콘텐츠 시드 (자동 생성: scripts/gen-seed.ts) — 앱 로컬 시드와 동일
-- 실행 순서: schema.sql → seed.sql → tagging/seed.sql(photos)
-- 재실행 안전: 콘텐츠 테이블 초기화 후 삽입
truncate table products, query_map, moods restart identity cascade;

-- moods (Layer 1)
insert into moods (key, name, description, caption, image_url, gradient, sort_order) values ('clean', '클린 미니멀', '군더더기 없는 정제된 무드', '화이트 라운드 반팔에 차콜 슬랙스. 색을 둘로만 끊어서 대충 입어도 정돈돼 보여.', '/moods/clean.webp', 'linear-gradient(150deg,#d9d4cc,#8f8a82)', 0);
insert into moods (key, name, description, caption, image_url, gradient, sort_order) values ('cityboy', '시티보이', '재핑한 레이어드, 캐주얼과 단정 사이', '어깨에 걸친 셋업 재킷에 토트백. 톤 맞추고 티로 끊으면 셋업도 데일리로 풀려.', '/moods/cityboy.jpg', 'linear-gradient(150deg,#cbb79c,#7a6a52)', 1);
insert into moods (key, name, description, caption, image_url, gradient, sort_order) values ('street', '스트릿', '오버핏·볼륨, 도시적 날것', '오버핏 후디에 와이드 팬츠. 위아래 다 크게 놀면 힘 안 준 듯 멋 나.', '/moods/street.webp', 'linear-gradient(150deg,#4a4d55,#17181c)', 2);
insert into moods (key, name, description, caption, image_url, gradient, sort_order) values ('amekaji', '아메카지', '워크웨어·데님·밀리터리, 빈티지 손맛', '밀리터리 코트에 청청 데님. 흙색 톤으로 붙이면 낡은 느낌이 멋으로 읽혀.', '/moods/amekaji.webp', 'linear-gradient(150deg,#8a6b4a,#3d2f22)', 3);
insert into moods (key, name, description, caption, image_url, gradient, sort_order) values ('classic', '클래식', '셋업·코트·구두, 정돈된 실루엣', '차콜 수트에 화이트 셔츠. 타이 빼고 단추 풀면 각 잡혔는데 안 답답해.', '/moods/classic.jpg', 'linear-gradient(150deg,#3a4256,#171b26)', 4);
insert into moods (key, name, description, caption, image_url, gradient, sort_order) values ('soft', '소프트 캐주얼', '니트·가디건, 부드러운 톤', '오트밀 가디건에 크림 티. 톤을 아이보리로 붙이면 대충 입어도 포근하게 정리돼.', '/moods/soft.webp', 'linear-gradient(150deg,#e6c9c0,#b08a9a)', 5);

-- query_map (Layer 2)
insert into query_map (keyword, mood_keys) values ('첫 소개팅', array['clean','soft','cityboy','classic']);
insert into query_map (keyword, mood_keys) values ('퇴근 후 술약속', array['street','amekaji','clean','classic']);
insert into query_map (keyword, mood_keys) values ('친구 결혼식', array['classic','clean','cityboy']);
insert into query_map (keyword, mood_keys) values ('주말 카페', array['soft','amekaji','clean','cityboy']);
insert into query_map (keyword, mood_keys) values ('면접 가는 날', array['classic','clean','cityboy']);
insert into query_map (keyword, mood_keys) values ('동네 산책', array['amekaji','soft','street']);

-- products (아이템 × 판매처 = 1행)
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('clean', '셋업 자켓', '아우터', '미드', 72000, '번개장터', 'linear-gradient(150deg,#d9d4cc,#8f8a82)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('clean', '셋업 자켓', '아우터', '미드', 89000, '무신사', 'linear-gradient(150deg,#d9d4cc,#8f8a82)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('clean', '셋업 자켓', '아우터', '미드', 94000, '29CM', 'linear-gradient(150deg,#d9d4cc,#8f8a82)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('clean', '코튼 니트', '상의', '로우', 42000, '번개장터', 'linear-gradient(30deg,#d9d4cc,#8f8a82)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('clean', '코튼 니트', '상의', '로우', 49000, '무신사', 'linear-gradient(30deg,#d9d4cc,#8f8a82)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('clean', '와이드 슬랙스', '하의', '로우', 33000, '번개장터', 'linear-gradient(210deg,#d9d4cc,#8f8a82)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('clean', '와이드 슬랙스', '하의', '로우', 38000, '무신사', 'linear-gradient(210deg,#d9d4cc,#8f8a82)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('clean', '와이드 슬랙스', '하의', '로우', 41000, '29CM', 'linear-gradient(210deg,#d9d4cc,#8f8a82)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('clean', '레더 로퍼', '신발', '하이', 115000, '크림', 'linear-gradient(300deg,#d9d4cc,#8f8a82)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('clean', '레더 로퍼', '신발', '하이', 129000, '무신사', 'linear-gradient(300deg,#d9d4cc,#8f8a82)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('cityboy', '셋업 자켓', '아우터', '미드', 72000, '번개장터', 'linear-gradient(150deg,#cbb79c,#7a6a52)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('cityboy', '셋업 자켓', '아우터', '미드', 89000, '무신사', 'linear-gradient(150deg,#cbb79c,#7a6a52)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('cityboy', '셋업 자켓', '아우터', '미드', 94000, '29CM', 'linear-gradient(150deg,#cbb79c,#7a6a52)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('cityboy', '코튼 니트', '상의', '로우', 42000, '번개장터', 'linear-gradient(30deg,#cbb79c,#7a6a52)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('cityboy', '코튼 니트', '상의', '로우', 49000, '무신사', 'linear-gradient(30deg,#cbb79c,#7a6a52)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('cityboy', '와이드 슬랙스', '하의', '로우', 33000, '번개장터', 'linear-gradient(210deg,#cbb79c,#7a6a52)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('cityboy', '와이드 슬랙스', '하의', '로우', 38000, '무신사', 'linear-gradient(210deg,#cbb79c,#7a6a52)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('cityboy', '와이드 슬랙스', '하의', '로우', 41000, '29CM', 'linear-gradient(210deg,#cbb79c,#7a6a52)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('cityboy', '레더 로퍼', '신발', '하이', 115000, '크림', 'linear-gradient(300deg,#cbb79c,#7a6a52)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('cityboy', '레더 로퍼', '신발', '하이', 129000, '무신사', 'linear-gradient(300deg,#cbb79c,#7a6a52)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('street', '셋업 자켓', '아우터', '미드', 72000, '번개장터', 'linear-gradient(150deg,#4a4d55,#17181c)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('street', '셋업 자켓', '아우터', '미드', 89000, '무신사', 'linear-gradient(150deg,#4a4d55,#17181c)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('street', '셋업 자켓', '아우터', '미드', 94000, '29CM', 'linear-gradient(150deg,#4a4d55,#17181c)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('street', '코튼 니트', '상의', '로우', 42000, '번개장터', 'linear-gradient(30deg,#4a4d55,#17181c)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('street', '코튼 니트', '상의', '로우', 49000, '무신사', 'linear-gradient(30deg,#4a4d55,#17181c)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('street', '와이드 슬랙스', '하의', '로우', 33000, '번개장터', 'linear-gradient(210deg,#4a4d55,#17181c)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('street', '와이드 슬랙스', '하의', '로우', 38000, '무신사', 'linear-gradient(210deg,#4a4d55,#17181c)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('street', '와이드 슬랙스', '하의', '로우', 41000, '29CM', 'linear-gradient(210deg,#4a4d55,#17181c)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('street', '레더 로퍼', '신발', '하이', 115000, '크림', 'linear-gradient(300deg,#4a4d55,#17181c)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('street', '레더 로퍼', '신발', '하이', 129000, '무신사', 'linear-gradient(300deg,#4a4d55,#17181c)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('amekaji', '셋업 자켓', '아우터', '미드', 72000, '번개장터', 'linear-gradient(150deg,#8a6b4a,#3d2f22)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('amekaji', '셋업 자켓', '아우터', '미드', 89000, '무신사', 'linear-gradient(150deg,#8a6b4a,#3d2f22)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('amekaji', '셋업 자켓', '아우터', '미드', 94000, '29CM', 'linear-gradient(150deg,#8a6b4a,#3d2f22)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('amekaji', '코튼 니트', '상의', '로우', 42000, '번개장터', 'linear-gradient(30deg,#8a6b4a,#3d2f22)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('amekaji', '코튼 니트', '상의', '로우', 49000, '무신사', 'linear-gradient(30deg,#8a6b4a,#3d2f22)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('amekaji', '와이드 슬랙스', '하의', '로우', 33000, '번개장터', 'linear-gradient(210deg,#8a6b4a,#3d2f22)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('amekaji', '와이드 슬랙스', '하의', '로우', 38000, '무신사', 'linear-gradient(210deg,#8a6b4a,#3d2f22)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('amekaji', '와이드 슬랙스', '하의', '로우', 41000, '29CM', 'linear-gradient(210deg,#8a6b4a,#3d2f22)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('amekaji', '레더 로퍼', '신발', '하이', 115000, '크림', 'linear-gradient(300deg,#8a6b4a,#3d2f22)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('amekaji', '레더 로퍼', '신발', '하이', 129000, '무신사', 'linear-gradient(300deg,#8a6b4a,#3d2f22)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('classic', '셋업 자켓', '아우터', '미드', 72000, '번개장터', 'linear-gradient(150deg,#3a4256,#171b26)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('classic', '셋업 자켓', '아우터', '미드', 89000, '무신사', 'linear-gradient(150deg,#3a4256,#171b26)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('classic', '셋업 자켓', '아우터', '미드', 94000, '29CM', 'linear-gradient(150deg,#3a4256,#171b26)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('classic', '코튼 니트', '상의', '로우', 42000, '번개장터', 'linear-gradient(30deg,#3a4256,#171b26)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('classic', '코튼 니트', '상의', '로우', 49000, '무신사', 'linear-gradient(30deg,#3a4256,#171b26)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('classic', '와이드 슬랙스', '하의', '로우', 33000, '번개장터', 'linear-gradient(210deg,#3a4256,#171b26)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('classic', '와이드 슬랙스', '하의', '로우', 38000, '무신사', 'linear-gradient(210deg,#3a4256,#171b26)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('classic', '와이드 슬랙스', '하의', '로우', 41000, '29CM', 'linear-gradient(210deg,#3a4256,#171b26)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('classic', '레더 로퍼', '신발', '하이', 115000, '크림', 'linear-gradient(300deg,#3a4256,#171b26)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('classic', '레더 로퍼', '신발', '하이', 129000, '무신사', 'linear-gradient(300deg,#3a4256,#171b26)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('soft', '셋업 자켓', '아우터', '미드', 72000, '번개장터', 'linear-gradient(150deg,#e6c9c0,#b08a9a)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('soft', '셋업 자켓', '아우터', '미드', 89000, '무신사', 'linear-gradient(150deg,#e6c9c0,#b08a9a)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('soft', '셋업 자켓', '아우터', '미드', 94000, '29CM', 'linear-gradient(150deg,#e6c9c0,#b08a9a)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('soft', '코튼 니트', '상의', '로우', 42000, '번개장터', 'linear-gradient(30deg,#e6c9c0,#b08a9a)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('soft', '코튼 니트', '상의', '로우', 49000, '무신사', 'linear-gradient(30deg,#e6c9c0,#b08a9a)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('soft', '와이드 슬랙스', '하의', '로우', 33000, '번개장터', 'linear-gradient(210deg,#e6c9c0,#b08a9a)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('soft', '와이드 슬랙스', '하의', '로우', 38000, '무신사', 'linear-gradient(210deg,#e6c9c0,#b08a9a)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('soft', '와이드 슬랙스', '하의', '로우', 41000, '29CM', 'linear-gradient(210deg,#e6c9c0,#b08a9a)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('soft', '레더 로퍼', '신발', '하이', 115000, '크림', 'linear-gradient(300deg,#e6c9c0,#b08a9a)');
insert into products (mood_key, name, category, price_tier, price, source, gradient) values ('soft', '레더 로퍼', '신발', '하이', 129000, '무신사', 'linear-gradient(300deg,#e6c9c0,#b08a9a)');
