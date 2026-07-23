-- 6단계(B) 확장 — 비-flagship 72장 상품 연결 (자동 생성: scripts/gen-rest.ts)
-- 캡션 파싱 기반. 공개링크(무신사 통합검색), verified=false, 완성가=슬롯 합. flagship 제외.
-- products 스키마는 batch1에서 정규화됨. 사진별 멱등 삭제 후 삽입.

-- amekaji-001 (amekaji) — 3슬롯 · "데님 셔츠자켓에 블랙 티·블루 진" · 완성가 ≈ 130,000 → "13만"
delete from products where photo_image_url = 'moods/amekaji-001.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-001.jpg','데님 셔츠자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8D%B0%EB%8B%98%20%EC%85%94%EC%B8%A0%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-001.jpg','블랙 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%ED%8B%B0',true,false),
('amekaji','moods/amekaji-001.jpg','블루 진','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%20%EC%A7%84',true,false);

-- amekaji-003 (amekaji) — 3슬롯 · "데님 트러커에 오트밀 터틀넥·블루 진" · 완성가 ≈ 153,000 → "15.3만"
delete from products where photo_image_url = 'moods/amekaji-003.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-003.jpg','데님 트러커','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8D%B0%EB%8B%98%20%ED%8A%B8%EB%9F%AC%EC%BB%A4',true,false),
('amekaji','moods/amekaji-003.jpg','오트밀 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('amekaji','moods/amekaji-003.jpg','블루 진','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%20%EC%A7%84',true,false);

-- amekaji-004 (amekaji) — 3슬롯 · "롱 데님코트에 니트·블루 진" · 완성가 ≈ 243,000 → "24.3만"
delete from products where photo_image_url = 'moods/amekaji-004.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-004.jpg','롱 데님코트','아우터','하이',149000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%A1%B1%20%EB%8D%B0%EB%8B%98%EC%BD%94%ED%8A%B8',true,false),
('amekaji','moods/amekaji-004.jpg','니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8B%88%ED%8A%B8',true,false),
('amekaji','moods/amekaji-004.jpg','블루 진','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%20%EC%A7%84',true,false);

-- amekaji-005 (amekaji) — 3슬롯 · "데님 자켓에 버건디 니트·블루 진" · 완성가 ≈ 153,000 → "15.3만"
delete from products where photo_image_url = 'moods/amekaji-005.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-005.jpg','데님 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8D%B0%EB%8B%98%20%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-005.jpg','버건디 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#5a2331,#2e1119)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%84%EA%B1%B4%EB%94%94%20%EB%8B%88%ED%8A%B8',true,false),
('amekaji','moods/amekaji-005.jpg','블루 진','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%20%EC%A7%84',true,false);

-- amekaji-006 (amekaji) — 3슬롯 · "데님 자켓에 화이트 니트·블루 진" · 완성가 ≈ 153,000 → "15.3만"
delete from products where photo_image_url = 'moods/amekaji-006.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-006.jpg','데님 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8D%B0%EB%8B%98%20%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-006.jpg','화이트 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%EB%8B%88%ED%8A%B8',true,false),
('amekaji','moods/amekaji-006.jpg','블루 진','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%20%EC%A7%84',true,false);

-- amekaji-007 (amekaji) — 3슬롯 · "데님 셔츠에 그레이 셔츠·그레이 워크팬츠" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/amekaji-007.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-007.jpg','데님 셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8D%B0%EB%8B%98%20%EC%85%94%EC%B8%A0',true,false),
('amekaji','moods/amekaji-007.jpg','그레이 셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A0%88%EC%9D%B4%20%EC%85%94%EC%B8%A0',true,false),
('amekaji','moods/amekaji-007.jpg','그레이 워크팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A0%88%EC%9D%B4%20%EC%9B%8C%ED%81%AC%ED%8C%AC%EC%B8%A0',true,false);

-- amekaji-008 (amekaji) — 3슬롯 · "데님 트러커에 크림 니트·블루 진" · 완성가 ≈ 153,000 → "15.3만"
delete from products where photo_image_url = 'moods/amekaji-008.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-008.jpg','데님 트러커','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8D%B0%EB%8B%98%20%ED%8A%B8%EB%9F%AC%EC%BB%A4',true,false),
('amekaji','moods/amekaji-008.jpg','크림 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EB%8B%88%ED%8A%B8',true,false),
('amekaji','moods/amekaji-008.jpg','블루 진','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%20%EC%A7%84',true,false);

-- amekaji-009 (amekaji) — 3슬롯 · "데님 자켓에 그레이 셔츠·블루 진" · 완성가 ≈ 130,000 → "13만"
delete from products where photo_image_url = 'moods/amekaji-009.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-009.jpg','데님 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8D%B0%EB%8B%98%20%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-009.jpg','그레이 셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A0%88%EC%9D%B4%20%EC%85%94%EC%B8%A0',true,false),
('amekaji','moods/amekaji-009.jpg','블루 진','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%20%EC%A7%84',true,false);

-- amekaji-010 (amekaji) — 3슬롯 · "데님 자켓에 베이지 카디건·블루 진" · 완성가 ≈ 167,000 → "16.7만"
delete from products where photo_image_url = 'moods/amekaji-010.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-010.jpg','데님 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8D%B0%EB%8B%98%20%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-010.jpg','베이지 카디건','아우터','미드',59000,'무신사 스탠다드','linear-gradient(30deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%B9%B4%EB%94%94%EA%B1%B4',true,false),
('amekaji','moods/amekaji-010.jpg','블루 진','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%20%EC%A7%84',true,false);

-- amekaji-011 (amekaji) — 3슬롯 · "데님 자켓에 화이트 티·블루 진" · 완성가 ≈ 130,000 → "13만"
delete from products where photo_image_url = 'moods/amekaji-011.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-011.jpg','데님 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8D%B0%EB%8B%98%20%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-011.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('amekaji','moods/amekaji-011.jpg','블루 진','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%20%EC%A7%84',true,false);

-- amekaji-012 (amekaji) — 4슬롯 · "올리브 필드자켓에 그레이 셔츠·블루 진·백팩" · 완성가 ≈ 179,000 → "17.9만"
delete from products where photo_image_url = 'moods/amekaji-012.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-012.jpg','올리브 필드자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%ED%95%84%EB%93%9C%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-012.jpg','그레이 셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A0%88%EC%9D%B4%20%EC%85%94%EC%B8%A0',true,false),
('amekaji','moods/amekaji-012.jpg','블루 진','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%20%EC%A7%84',true,false),
('amekaji','moods/amekaji-012.jpg','백팩','가방','미드',49000,'무신사 스탠다드','linear-gradient(300deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B0%B1%ED%8C%A9',true,false);

-- amekaji-015 (amekaji) — 3슬롯 · "베이지 린넨 셔츠에 화이트 티·베이지 치노" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/amekaji-015.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-015.jpg','베이지 린넨 셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EB%A6%B0%EB%84%A8%20%EC%85%94%EC%B8%A0',true,false),
('amekaji','moods/amekaji-015.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('amekaji','moods/amekaji-015.jpg','베이지 치노','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%B9%98%EB%85%B8',true,false);

-- cityboy-002 (cityboy) — 3슬롯 · "카키 하프셔츠에 화이트 티·올리브 와이드" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/cityboy-002.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-002.jpg','카키 하프셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%ED%82%A4%20%ED%95%98%ED%94%84%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-002.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-002.jpg','올리브 와이드','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%99%80%EC%9D%B4%EB%93%9C',true,false);

-- cityboy-003 (cityboy) — 3슬롯 · "블루그레이 하프셔츠에 화이트 티·브라운 와이드" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/cityboy-003.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-003.jpg','블루그레이 하프셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%A3%A8%EA%B7%B8%EB%A0%88%EC%9D%B4%20%ED%95%98%ED%94%84%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-003.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-003.jpg','브라운 와이드','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%99%80%EC%9D%B4%EB%93%9C',true,false);

-- cityboy-004 (cityboy) — 3슬롯 · "베이지 셔츠에 화이트 티·카키 카고" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/cityboy-004.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-004.jpg','베이지 셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-004.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-004.jpg','카키 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%ED%82%A4%20%EC%B9%B4%EA%B3%A0',true,false);

-- cityboy-005 (cityboy) — 3슬롯 · "베이지 하프셔츠에 화이트 티·올리브 와이드" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/cityboy-005.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-005.jpg','베이지 하프셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%ED%95%98%ED%94%84%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-005.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-005.jpg','올리브 와이드','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%99%80%EC%9D%B4%EB%93%9C',true,false);

-- cityboy-006 (cityboy) — 3슬롯 · "올리브 하프 워크셔츠에 화이트 티·올리브 와이드" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/cityboy-006.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-006.jpg','올리브 하프 워크셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%ED%95%98%ED%94%84%20%EC%9B%8C%ED%81%AC%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-006.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-006.jpg','올리브 와이드','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%99%80%EC%9D%B4%EB%93%9C',true,false);

-- cityboy-007 (cityboy) — 3슬롯 · "올리브 코치 오버셔츠에 화이트 티·카키 팬츠" · 완성가 ≈ 115,900 → "11.6만"
delete from products where photo_image_url = 'moods/cityboy-007.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-007.jpg','올리브 코치 오버셔츠','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%BD%94%EC%B9%98%20%EC%98%A4%EB%B2%84%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-007.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-007.jpg','카키 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%ED%82%A4%20%ED%8C%AC%EC%B8%A0',true,false);

-- cityboy-009 (cityboy) — 3슬롯 · "카키 오버셔츠에 크림 티·베이지 팬츠" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/cityboy-009.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-009.jpg','카키 오버셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%ED%82%A4%20%EC%98%A4%EB%B2%84%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-009.jpg','크림 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-009.jpg','베이지 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%ED%8C%AC%EC%B8%A0',true,false);

-- cityboy-010 (cityboy) — 3슬롯 · "올리브 코치 오버셔츠에 화이트 티·카멜 치노" · 완성가 ≈ 115,900 → "11.6만"
delete from products where photo_image_url = 'moods/cityboy-010.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-010.jpg','올리브 코치 오버셔츠','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%BD%94%EC%B9%98%20%EC%98%A4%EB%B2%84%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-010.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-010.jpg','카멜 치노','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%EB%A9%9C%20%EC%B9%98%EB%85%B8',true,false);

-- cityboy-011 (cityboy) — 3슬롯 · "올리브 셔츠에 그린 티·올리브 카고" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/cityboy-011.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-011.jpg','올리브 셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-011.jpg','그린 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#3e5a3a,#1c2e1a)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A6%B0%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-011.jpg','올리브 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0',true,false);

-- cityboy-012 (cityboy) — 3슬롯 · "브라운 셔츠에 화이트 티·브라운 카고" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/cityboy-012.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-012.jpg','브라운 셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-012.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-012.jpg','브라운 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%B9%B4%EA%B3%A0',true,false);

-- cityboy-014 (cityboy) — 3슬롯 · "카키 오버셔츠에 화이트 티·올리브 팬츠" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/cityboy-014.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-014.jpg','카키 오버셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%ED%82%A4%20%EC%98%A4%EB%B2%84%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-014.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-014.jpg','올리브 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%ED%8C%AC%EC%B8%A0',true,false);

-- cityboy-015 (cityboy) — 3슬롯 · "베이지 오버셔츠에 화이트 티·베이지 와이드" · 완성가 ≈ 78,900 → "7.9만"
delete from products where photo_image_url = 'moods/cityboy-015.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-015.jpg','베이지 오버셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%98%A4%EB%B2%84%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-015.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-015.jpg','베이지 와이드','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%99%80%EC%9D%B4%EB%93%9C',true,false);

-- classic-002 (classic) — 3슬롯 · "브라운 셋업 블레이저에 카멜 터틀넥·브라운 슬랙스" · 완성가 ≈ 208,900 → "20.9만"
delete from products where photo_image_url = 'moods/classic-002.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-002.jpg','브라운 셋업 블레이저','아우터','하이',129000,'무신사 스탠다드','linear-gradient(150deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%85%8B%EC%97%85%20%EB%B8%94%EB%A0%88%EC%9D%B4%EC%A0%80',true,false),
('classic','moods/classic-002.jpg','카멜 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%EB%A9%9C%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-002.jpg','브라운 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-003 (classic) — 3슬롯 · "차콜 블레이저에 카멜 터틀넥·차콜 슬랙스" · 완성가 ≈ 208,900 → "20.9만"
delete from products where photo_image_url = 'moods/classic-003.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-003.jpg','차콜 블레이저','아우터','하이',129000,'무신사 스탠다드','linear-gradient(150deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EB%B8%94%EB%A0%88%EC%9D%B4%EC%A0%80',true,false),
('classic','moods/classic-003.jpg','카멜 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%EB%A9%9C%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-003.jpg','차콜 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-004 (classic) — 3슬롯 · "차콜 블레이저에 카멜 니트·네이비 슬랙스" · 완성가 ≈ 208,900 → "20.9만"
delete from products where photo_image_url = 'moods/classic-004.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-004.jpg','차콜 블레이저','아우터','하이',129000,'무신사 스탠다드','linear-gradient(150deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EB%B8%94%EB%A0%88%EC%9D%B4%EC%A0%80',true,false),
('classic','moods/classic-004.jpg','카멜 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%EB%A9%9C%20%EB%8B%88%ED%8A%B8',true,false),
('classic','moods/classic-004.jpg','네이비 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#2a3550,#141b2e)','https://www.musinsa.com/search/musinsa/integration?q=%EB%84%A4%EC%9D%B4%EB%B9%84%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-005 (classic) — 3슬롯 · "올리브 블레이저에 블랙 터틀넥·차콜 슬랙스" · 완성가 ≈ 208,900 → "20.9만"
delete from products where photo_image_url = 'moods/classic-005.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-005.jpg','올리브 블레이저','아우터','하이',129000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EB%B8%94%EB%A0%88%EC%9D%B4%EC%A0%80',true,false),
('classic','moods/classic-005.jpg','블랙 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-005.jpg','차콜 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-006 (classic) — 3슬롯 · "카멜 오버코트에 블랙 터틀넥·차콜 슬랙스" · 완성가 ≈ 228,900 → "22.9만"
delete from products where photo_image_url = 'moods/classic-006.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-006.jpg','카멜 오버코트','아우터','하이',149000,'무신사 스탠다드','linear-gradient(150deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%EB%A9%9C%20%EC%98%A4%EB%B2%84%EC%BD%94%ED%8A%B8',true,false),
('classic','moods/classic-006.jpg','블랙 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-006.jpg','차콜 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-007 (classic) — 3슬롯 · "차콜 블레이저에 브라운 터틀넥·차콜 슬랙스" · 완성가 ≈ 208,900 → "20.9만"
delete from products where photo_image_url = 'moods/classic-007.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-007.jpg','차콜 블레이저','아우터','하이',129000,'무신사 스탠다드','linear-gradient(150deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EB%B8%94%EB%A0%88%EC%9D%B4%EC%A0%80',true,false),
('classic','moods/classic-007.jpg','브라운 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-007.jpg','차콜 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-008 (classic) — 3슬롯 · "라이트블루 옥스퍼드에 오트밀 니트베스트·차콜 슬랙스" · 완성가 ≈ 101,900 → "10.2만"
delete from products where photo_image_url = 'moods/classic-008.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-008.jpg','라이트블루 옥스퍼드','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%9D%BC%EC%9D%B4%ED%8A%B8%EB%B8%94%EB%A3%A8%20%EC%98%A5%EC%8A%A4%ED%8D%BC%EB%93%9C',true,false),
('classic','moods/classic-008.jpg','오트밀 니트베스트','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%EB%8B%88%ED%8A%B8%EB%B2%A0%EC%8A%A4%ED%8A%B8',true,false),
('classic','moods/classic-008.jpg','차콜 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-009 (classic) — 3슬롯 · "브라운 오버코트에 블랙 터틀넥·차콜 슬랙스" · 완성가 ≈ 228,900 → "22.9만"
delete from products where photo_image_url = 'moods/classic-009.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-009.jpg','브라운 오버코트','아우터','하이',149000,'무신사 스탠다드','linear-gradient(150deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%98%A4%EB%B2%84%EC%BD%94%ED%8A%B8',true,false),
('classic','moods/classic-009.jpg','블랙 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-009.jpg','차콜 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-010 (classic) — 3슬롯 · "탄 블레이저에 블랙 터틀넥·올리브 슬랙스" · 완성가 ≈ 208,900 → "20.9만"
delete from products where photo_image_url = 'moods/classic-010.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-010.jpg','탄 블레이저','아우터','하이',129000,'무신사 스탠다드','linear-gradient(150deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%ED%83%84%20%EB%B8%94%EB%A0%88%EC%9D%B4%EC%A0%80',true,false),
('classic','moods/classic-010.jpg','블랙 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-010.jpg','올리브 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-011 (classic) — 3슬롯 · "올리브 오버코트에 그레이 터틀넥·차콜 슬랙스" · 완성가 ≈ 228,900 → "22.9만"
delete from products where photo_image_url = 'moods/classic-011.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-011.jpg','올리브 오버코트','아우터','하이',149000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%98%A4%EB%B2%84%EC%BD%94%ED%8A%B8',true,false),
('classic','moods/classic-011.jpg','그레이 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A0%88%EC%9D%B4%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-011.jpg','차콜 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-013 (classic) — 3슬롯 · "그레이 오버코트에 블랙 터틀넥·그레이 슬랙스" · 완성가 ≈ 228,900 → "22.9만"
delete from products where photo_image_url = 'moods/classic-013.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-013.jpg','그레이 오버코트','아우터','하이',149000,'무신사 스탠다드','linear-gradient(150deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A0%88%EC%9D%B4%20%EC%98%A4%EB%B2%84%EC%BD%94%ED%8A%B8',true,false),
('classic','moods/classic-013.jpg','블랙 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-013.jpg','그레이 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A0%88%EC%9D%B4%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-015 (classic) — 3슬롯 · "차콜 수트에 러스트 베스트·블랙 터틀넥" · 완성가 ≈ 89,000 → "8.9만"
delete from products where photo_image_url = 'moods/classic-015.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-015.jpg','차콜 수트','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%88%98%ED%8A%B8',true,false),
('classic','moods/classic-015.jpg','러스트 베스트','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EB%9F%AC%EC%8A%A4%ED%8A%B8%20%EB%B2%A0%EC%8A%A4%ED%8A%B8',true,false),
('classic','moods/classic-015.jpg','블랙 터틀넥','상의','미드',45000,'무신사 스탠다드','linear-gradient(210deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false);

-- clean-002 (clean) — 2슬롯 · "오버핏 크림 티에 아이보리 팬츠" · 완성가 ≈ 56,900 → "5.7만"
delete from products where photo_image_url = 'moods/clean-002.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-002.jpg','오버핏 크림 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%EB%B2%84%ED%95%8F%20%ED%81%AC%EB%A6%BC%20%ED%8B%B0',true,false),
('clean','moods/clean-002.jpg','아이보리 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%95%84%EC%9D%B4%EB%B3%B4%EB%A6%AC%20%ED%8C%AC%EC%B8%A0',true,false);

-- clean-003 (clean) — 2슬롯 · "크림 티에 블랙 와이드 슬랙스" · 완성가 ≈ 56,900 → "5.7만"
delete from products where photo_image_url = 'moods/clean-003.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-003.jpg','크림 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%ED%8B%B0',true,false),
('clean','moods/clean-003.jpg','블랙 와이드 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EC%99%80%EC%9D%B4%EB%93%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- clean-004 (clean) — 2슬롯 · "크림 와플 롱슬리브에 베이지 팬츠" · 완성가 ≈ 56,900 → "5.7만"
delete from products where photo_image_url = 'moods/clean-004.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-004.jpg','크림 와플 롱슬리브','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EC%99%80%ED%94%8C%20%EB%A1%B1%EC%8A%AC%EB%A6%AC%EB%B8%8C',true,false),
('clean','moods/clean-004.jpg','베이지 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%ED%8C%AC%EC%B8%A0',true,false);

-- clean-005 (clean) — 2슬롯 · "오버핏 크림 티에 아이보리 치노" · 완성가 ≈ 56,900 → "5.7만"
delete from products where photo_image_url = 'moods/clean-005.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-005.jpg','오버핏 크림 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%EB%B2%84%ED%95%8F%20%ED%81%AC%EB%A6%BC%20%ED%8B%B0',true,false),
('clean','moods/clean-005.jpg','아이보리 치노','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%95%84%EC%9D%B4%EB%B3%B4%EB%A6%AC%20%EC%B9%98%EB%85%B8',true,false);

-- clean-006 (clean) — 2슬롯 · "크림 니트 티에 블랙 와이드 슬랙스" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/clean-006.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-006.jpg','크림 니트 티','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EB%8B%88%ED%8A%B8%20%ED%8B%B0',true,false),
('clean','moods/clean-006.jpg','블랙 와이드 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EC%99%80%EC%9D%B4%EB%93%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- clean-007 (clean) — 3슬롯 · "그레이 울 코트에 크림 니트·차콜 슬랙스" · 완성가 ≈ 228,900 → "22.9만"
delete from products where photo_image_url = 'moods/clean-007.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-007.jpg','그레이 울 코트','아우터','하이',149000,'무신사 스탠다드','linear-gradient(150deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A0%88%EC%9D%B4%20%EC%9A%B8%20%EC%BD%94%ED%8A%B8',true,false),
('clean','moods/clean-007.jpg','크림 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EB%8B%88%ED%8A%B8',true,false),
('clean','moods/clean-007.jpg','차콜 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- clean-009 (clean) — 2슬롯 · "크림 크루넥 니트에 블랙 크롭 슬랙스" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/clean-009.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-009.jpg','크림 크루넥 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%8B%88%ED%8A%B8',true,false),
('clean','moods/clean-009.jpg','블랙 크롭 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%ED%81%AC%EB%A1%AD%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- clean-010 (clean) — 2슬롯 · "아이보리 니트에 차콜 슬랙스" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/clean-010.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-010.jpg','아이보리 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%95%84%EC%9D%B4%EB%B3%B4%EB%A6%AC%20%EB%8B%88%ED%8A%B8',true,false),
('clean','moods/clean-010.jpg','차콜 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- clean-011 (clean) — 2슬롯 · "화이트 니트 폴로에 차콜 테일러드 쇼츠" · 완성가 ≈ 67,000 → "6.7만"
delete from products where photo_image_url = 'moods/clean-011.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-011.jpg','화이트 니트 폴로','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%EB%8B%88%ED%8A%B8%20%ED%8F%B4%EB%A1%9C',true,false),
('clean','moods/clean-011.jpg','차콜 테일러드 쇼츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%ED%85%8C%EC%9D%BC%EB%9F%AC%EB%93%9C%20%EC%87%BC%EC%B8%A0',true,false);

-- clean-013 (clean) — 2슬롯 · "크림 니트에 블랙 슬랙스" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/clean-013.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-013.jpg','크림 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EB%8B%88%ED%8A%B8',true,false),
('clean','moods/clean-013.jpg','블랙 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- clean-014 (clean) — 2슬롯 · "크림 스웻셔츠에 다크브라운 슬랙스" · 완성가 ≈ 56,900 → "5.7만"
delete from products where photo_image_url = 'moods/clean-014.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-014.jpg','크림 스웻셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EC%8A%A4%EC%9B%BB%EC%85%94%EC%B8%A0',true,false),
('clean','moods/clean-014.jpg','다크브라운 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8B%A4%ED%81%AC%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- clean-015 (clean) — 2슬롯 · "크림 스웻셔츠에 딥그린 팬츠" · 완성가 ≈ 56,900 → "5.7만"
delete from products where photo_image_url = 'moods/clean-015.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-015.jpg','크림 스웻셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EC%8A%A4%EC%9B%BB%EC%85%94%EC%B8%A0',true,false),
('clean','moods/clean-015.jpg','딥그린 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#3e5a3a,#1c2e1a)','https://www.musinsa.com/search/musinsa/integration?q=%EB%94%A5%EA%B7%B8%EB%A6%B0%20%ED%8C%AC%EC%B8%A0',true,false);

-- soft-001 (soft) — 2슬롯 · "오트밀 크루넥 니트에 오트밀 슬랙스" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/soft-001.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-001.jpg','오트밀 크루넥 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%8B%88%ED%8A%B8',true,false),
('soft','moods/soft-001.jpg','오트밀 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- soft-003 (soft) — 3슬롯 · "베이지 맥코트에 아이보리 셔츠·브라운 치노" · 완성가 ≈ 205,900 → "20.6만"
delete from products where photo_image_url = 'moods/soft-003.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-003.jpg','베이지 맥코트','아우터','하이',149000,'무신사 스탠다드','linear-gradient(150deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EB%A7%A5%EC%BD%94%ED%8A%B8',true,false),
('soft','moods/soft-003.jpg','아이보리 셔츠','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%95%84%EC%9D%B4%EB%B3%B4%EB%A6%AC%20%EC%85%94%EC%B8%A0',true,false),
('soft','moods/soft-003.jpg','브라운 치노','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%B9%98%EB%85%B8',true,false);

-- soft-004 (soft) — 2슬롯 · "크림 크루넥 니트에 웜그레이 슬랙스" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/soft-004.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-004.jpg','크림 크루넥 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%8B%88%ED%8A%B8',true,false),
('soft','moods/soft-004.jpg','웜그레이 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EC%9B%9C%EA%B7%B8%EB%A0%88%EC%9D%B4%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- soft-006 (soft) — 2슬롯 · "크림 니트 블루종에 베이지 팬츠" · 완성가 ≈ 93,900 → "9.4만"
delete from products where photo_image_url = 'moods/soft-006.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-006.jpg','크림 니트 블루종','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EB%8B%88%ED%8A%B8%20%EB%B8%94%EB%A3%A8%EC%A2%85',true,false),
('soft','moods/soft-006.jpg','베이지 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%ED%8C%AC%EC%B8%A0',true,false);

-- soft-007 (soft) — 3슬롯 · "오트밀 가디건에 오트밀 니트티·오트밀 팬츠" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/soft-007.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-007.jpg','오트밀 가디건','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%EA%B0%80%EB%94%94%EA%B1%B4',true,false),
('soft','moods/soft-007.jpg','오트밀 니트티','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%EB%8B%88%ED%8A%B8%ED%8B%B0',true,false),
('soft','moods/soft-007.jpg','오트밀 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%ED%8C%AC%EC%B8%A0',true,false);

-- soft-008 (soft) — 3슬롯 · "크림 가디건에 화이트 티·베이지 치노" · 완성가 ≈ 115,900 → "11.6만"
delete from products where photo_image_url = 'moods/soft-008.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-008.jpg','크림 가디건','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EA%B0%80%EB%94%94%EA%B1%B4',true,false),
('soft','moods/soft-008.jpg','화이트 티','상의','로우',22000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%8B%B0',true,false),
('soft','moods/soft-008.jpg','베이지 치노','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%B9%98%EB%85%B8',true,false);

-- soft-009 (soft) — 2슬롯 · "크림 크루넥 니트에 브라운 슬랙스" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/soft-009.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-009.jpg','크림 크루넥 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%8B%88%ED%8A%B8',true,false),
('soft','moods/soft-009.jpg','브라운 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- soft-011 (soft) — 3슬롯 · "크림 가디건에 탄 니트티·베이지 팬츠" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/soft-011.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-011.jpg','크림 가디건','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EA%B0%80%EB%94%94%EA%B1%B4',true,false),
('soft','moods/soft-011.jpg','탄 니트티','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%ED%83%84%20%EB%8B%88%ED%8A%B8%ED%8B%B0',true,false),
('soft','moods/soft-011.jpg','베이지 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%ED%8C%AC%EC%B8%A0',true,false);

-- soft-012 (soft) — 3슬롯 · "크림 숄카라 가디건에 오트밀 니트티·라이트그레이 플리츠 팬츠" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/soft-012.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-012.jpg','크림 숄카라 가디건','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EC%88%84%EC%B9%B4%EB%9D%BC%20%EA%B0%80%EB%94%94%EA%B1%B4',true,false),
('soft','moods/soft-012.jpg','오트밀 니트티','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%EB%8B%88%ED%8A%B8%ED%8B%B0',true,false),
('soft','moods/soft-012.jpg','라이트그레이 플리츠 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EB%9D%BC%EC%9D%B4%ED%8A%B8%EA%B7%B8%EB%A0%88%EC%9D%B4%20%ED%94%8C%EB%A6%AC%EC%B8%A0%20%ED%8C%AC%EC%B8%A0',true,false);

-- soft-013 (soft) — 2슬롯 · "크림 크루넥 니트에 브라운 치노" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/soft-013.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-013.jpg','크림 크루넥 니트','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%8B%88%ED%8A%B8',true,false),
('soft','moods/soft-013.jpg','브라운 치노','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%B9%98%EB%85%B8',true,false);

-- soft-014 (soft) — 3슬롯 · "오트밀 가디건에 오트밀 니트티·브라운 팬츠" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/soft-014.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-014.jpg','오트밀 가디건','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%EA%B0%80%EB%94%94%EA%B1%B4',true,false),
('soft','moods/soft-014.jpg','오트밀 니트티','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%EB%8B%88%ED%8A%B8%ED%8B%B0',true,false),
('soft','moods/soft-014.jpg','브라운 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%ED%8C%AC%EC%B8%A0',true,false);

-- soft-015 (soft) — 3슬롯 · "베이지 가디건에 오트밀 니트티·올리브 팬츠" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/soft-015.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-015.jpg','베이지 가디건','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EA%B0%80%EB%94%94%EA%B1%B4',true,false),
('soft','moods/soft-015.jpg','오트밀 니트티','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%EB%8B%88%ED%8A%B8%ED%8B%B0',true,false),
('soft','moods/soft-015.jpg','올리브 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%ED%8C%AC%EC%B8%A0',true,false);

-- street-002 (street) — 3슬롯 · "네이비 자켓에 후디·탄 카고" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/street-002.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-002.jpg','네이비 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#2a3550,#141b2e)','https://www.musinsa.com/search/musinsa/integration?q=%EB%84%A4%EC%9D%B4%EB%B9%84%20%EC%9E%90%EC%BC%93',true,false),
('street','moods/street-002.jpg','후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%ED%9B%84%EB%94%94',true,false),
('street','moods/street-002.jpg','탄 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%ED%83%84%20%EC%B9%B4%EA%B3%A0',true,false);

-- street-003 (street) — 3슬롯 · "브라운 필드자켓에 후디·올리브 카고" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/street-003.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-003.jpg','브라운 필드자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%ED%95%84%EB%93%9C%EC%9E%90%EC%BC%93',true,false),
('street','moods/street-003.jpg','후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%ED%9B%84%EB%94%94',true,false),
('street','moods/street-003.jpg','올리브 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0',true,false);

-- street-004 (street) — 3슬롯 · "블랙 자켓에 후디·올리브 카고" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/street-004.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-004.jpg','블랙 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EC%9E%90%EC%BC%93',true,false),
('street','moods/street-004.jpg','후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%ED%9B%84%EB%94%94',true,false),
('street','moods/street-004.jpg','올리브 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0',true,false);

-- street-005 (street) — 3슬롯 · "베이지 자켓에 화이트 후디·올리브 카고" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/street-005.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-005.jpg','베이지 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%9E%90%EC%BC%93',true,false),
('street','moods/street-005.jpg','화이트 후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%9B%84%EB%94%94',true,false),
('street','moods/street-005.jpg','올리브 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0',true,false);

-- street-006 (street) — 2슬롯 · "차콜 오버핏 후디에 베이지 카고" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/street-006.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-006.jpg','차콜 오버핏 후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%98%A4%EB%B2%84%ED%95%8F%20%ED%9B%84%EB%94%94',true,false),
('street','moods/street-006.jpg','베이지 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%B9%B4%EA%B3%A0',true,false);

-- street-007 (street) — 2슬롯 · "브라운 오버핏 후디에 올리브 카고" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/street-007.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-007.jpg','브라운 오버핏 후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%98%A4%EB%B2%84%ED%95%8F%20%ED%9B%84%EB%94%94',true,false),
('street','moods/street-007.jpg','올리브 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0',true,false);

-- street-008 (street) — 3슬롯 · "블랙 봄버에 오렌지 후디·올리브 카고" · 완성가 ≈ 101,900 → "10.2만"
delete from products where photo_image_url = 'moods/street-008.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-008.jpg','블랙 봄버','상의','로우',22000,'무신사 스탠다드','linear-gradient(150deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EB%B4%84%EB%B2%84',true,false),
('street','moods/street-008.jpg','오렌지 후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%EB%A0%8C%EC%A7%80%20%ED%9B%84%EB%94%94',true,false),
('street','moods/street-008.jpg','올리브 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0',true,false);

-- street-009 (street) — 2슬롯 · "블랙 오버핏 후디에 올리브 카고" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/street-009.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-009.jpg','블랙 오버핏 후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EC%98%A4%EB%B2%84%ED%95%8F%20%ED%9B%84%EB%94%94',true,false),
('street','moods/street-009.jpg','올리브 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0',true,false);

-- street-012 (street) — 3슬롯 · "카키 자켓에 오렌지 후디·올리브 카고" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/street-012.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-012.jpg','카키 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%ED%82%A4%20%EC%9E%90%EC%BC%93',true,false),
('street','moods/street-012.jpg','오렌지 후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%EB%A0%8C%EC%A7%80%20%ED%9B%84%EB%94%94',true,false),
('street','moods/street-012.jpg','올리브 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0',true,false);

-- street-013 (street) — 3슬롯 · "카키 코치자켓에 후디·베이지 카고" · 완성가 ≈ 138,900 → "13.9만"
delete from products where photo_image_url = 'moods/street-013.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-013.jpg','카키 코치자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%ED%82%A4%20%EC%BD%94%EC%B9%98%EC%9E%90%EC%BC%93',true,false),
('street','moods/street-013.jpg','후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%ED%9B%84%EB%94%94',true,false),
('street','moods/street-013.jpg','베이지 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%B9%B4%EA%B3%A0',true,false);

-- street-014 (street) — 4슬롯 · "올리브 자켓에 후디·올리브 카고·백팩" · 완성가 ≈ 187,900 → "18.8만"
delete from products where photo_image_url = 'moods/street-014.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-014.jpg','올리브 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%9E%90%EC%BC%93',true,false),
('street','moods/street-014.jpg','후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%ED%9B%84%EB%94%94',true,false),
('street','moods/street-014.jpg','올리브 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0',true,false),
('street','moods/street-014.jpg','백팩','가방','미드',49000,'무신사 스탠다드','linear-gradient(300deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B0%B1%ED%8C%A9',true,false);

-- street-015 (street) — 2슬롯 · "올리브 오버핏 후디에 올리브 카고" · 완성가 ≈ 79,900 → "8만"
delete from products where photo_image_url = 'moods/street-015.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-015.jpg','올리브 오버핏 후디','상의','미드',45000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%98%A4%EB%B2%84%ED%95%8F%20%ED%9B%84%EB%94%94',true,false),
('street','moods/street-015.jpg','올리브 카고','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0',true,false);
