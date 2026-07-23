-- 6단계 (B) 사진 레벨 상품 연결 — batch2 (나머지 flagship 17장)
-- 자동 생성: scripts/gen-batch2.ts. 어필리에이트=공개링크(무신사 통합검색), verified=false interim.
-- products 스키마는 batch1 에서 정규화됨(재실행 안전, 사진별 멱등 삭제 후 삽입).

-- amekaji-002 (amekaji) — 4슬롯 · 완성가 ≈ 279,900 → "28만"
delete from products where photo_image_url = 'moods/amekaji-002.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-002.jpg','인디고 데님 트러커 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EC%9D%B8%EB%94%94%EA%B3%A0%20%EB%8D%B0%EB%8B%98%20%ED%8A%B8%EB%9F%AC%EC%BB%A4%20%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-002.jpg','인디고 데님 트러커 자켓','아우터','미드',69000,'리','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EC%9D%B8%EB%94%94%EA%B3%A0%20%EB%8D%B0%EB%8B%98%20%ED%8A%B8%EB%9F%AC%EC%BB%A4%20%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-002.jpg','다크 그레이 크루넥 반팔 티','상의','로우',12900,'무신사 스탠다드','linear-gradient(30deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EB%8B%A4%ED%81%AC%20%EA%B7%B8%EB%A0%88%EC%9D%B4%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%B0%98%ED%8C%94%20%ED%8B%B0',true,false),
('amekaji','moods/amekaji-002.jpg','미드워시 스트레이트 데님 팬츠','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%AF%B8%EB%93%9C%EC%9B%8C%EC%8B%9C%20%EC%8A%A4%ED%8A%B8%EB%A0%88%EC%9D%B4%ED%8A%B8%20%EB%8D%B0%EB%8B%98%20%ED%8C%AC%EC%B8%A0',true,false),
('amekaji','moods/amekaji-002.jpg','미드워시 스트레이트 데님 팬츠','하의','미드',79000,'리바이스','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%AF%B8%EB%93%9C%EC%9B%8C%EC%8B%9C%20%EC%8A%A4%ED%8A%B8%EB%A0%88%EC%9D%B4%ED%8A%B8%20%EB%8D%B0%EB%8B%98%20%ED%8C%AC%EC%B8%A0',true,false),
('amekaji','moods/amekaji-002.jpg','브라운 레더 워크부츠','신발','하이',159000,'크림','linear-gradient(300deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EB%A0%88%EB%8D%94%20%EC%9B%8C%ED%81%AC%EB%B6%80%EC%B8%A0',true,false),
('amekaji','moods/amekaji-002.jpg','브라운 레더 워크부츠','신발','하이',189000,'닥터마틴','linear-gradient(300deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EB%A0%88%EB%8D%94%20%EC%9B%8C%ED%81%AC%EB%B6%80%EC%B8%A0',true,false);

-- amekaji-013 (amekaji) — 3슬롯 · 완성가 ≈ 177,000 → "17.7만"
delete from products where photo_image_url = 'moods/amekaji-013.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-013.jpg','셰르파 데님 자켓','아우터','미드',79000,'무신사 스탠다드','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EC%85%B0%EB%A5%B4%ED%8C%8C%20%EB%8D%B0%EB%8B%98%20%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-013.jpg','셰르파 데님 자켓','아우터','미드',129000,'칼하트','linear-gradient(150deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EC%85%B0%EB%A5%B4%ED%8C%8C%20%EB%8D%B0%EB%8B%98%20%EC%9E%90%EC%BC%93',true,false),
('amekaji','moods/amekaji-013.jpg','크림 케이블 니트','상의','미드',49000,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EC%BC%80%EC%9D%B4%EB%B8%94%20%EB%8B%88%ED%8A%B8',true,false),
('amekaji','moods/amekaji-013.jpg','미드워시 스트레이트 데님 팬츠','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%AF%B8%EB%93%9C%EC%9B%8C%EC%8B%9C%20%EC%8A%A4%ED%8A%B8%EB%A0%88%EC%9D%B4%ED%8A%B8%20%EB%8D%B0%EB%8B%98%20%ED%8C%AC%EC%B8%A0',true,false),
('amekaji','moods/amekaji-013.jpg','미드워시 스트레이트 데님 팬츠','하의','미드',79000,'리바이스','linear-gradient(210deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%AF%B8%EB%93%9C%EC%9B%8C%EC%8B%9C%20%EC%8A%A4%ED%8A%B8%EB%A0%88%EC%9D%B4%ED%8A%B8%20%EB%8D%B0%EB%8B%98%20%ED%8C%AC%EC%B8%A0',true,false);

-- amekaji-014 (amekaji) — 3슬롯 · 완성가 ≈ 218,800 → "21.9만"
delete from products where photo_image_url = 'moods/amekaji-014.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('amekaji','moods/amekaji-014.jpg','에크루 헨리넥 반팔 티','상의','로우',19900,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%97%90%ED%81%AC%EB%A3%A8%20%ED%97%A8%EB%A6%AC%EB%84%A5%20%EB%B0%98%ED%8C%94%20%ED%8B%B0',true,false),
('amekaji','moods/amekaji-014.jpg','올리브 워크 팬츠','하의','미드',39900,'무신사 스탠다드','linear-gradient(30deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%9B%8C%ED%81%AC%20%ED%8C%AC%EC%B8%A0',true,false),
('amekaji','moods/amekaji-014.jpg','올리브 워크 팬츠','하의','미드',89000,'칼하트','linear-gradient(30deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%9B%8C%ED%81%AC%20%ED%8C%AC%EC%B8%A0',true,false),
('amekaji','moods/amekaji-014.jpg','브라운 레더 워크부츠','신발','하이',159000,'크림','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EB%A0%88%EB%8D%94%20%EC%9B%8C%ED%81%AC%EB%B6%80%EC%B8%A0',true,false);

-- cityboy-001 (cityboy) — 3슬롯 · 완성가 ≈ 74,700 → "7.5만"
delete from products where photo_image_url = 'moods/cityboy-001.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-001.jpg','베이지 오버핏 오픈 셔츠','아우터','로우',29900,'무신사 스탠다드','linear-gradient(150deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%98%A4%EB%B2%84%ED%95%8F%20%EC%98%A4%ED%94%88%20%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-001.jpg','베이지 오버핏 오픈 셔츠','아우터','로우',39900,'유니클로','linear-gradient(150deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%98%A4%EB%B2%84%ED%95%8F%20%EC%98%A4%ED%94%88%20%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-001.jpg','화이트 크루넥 반팔 티','상의','로우',9900,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%B0%98%ED%8C%94%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-001.jpg','카키 와이드 치노 팬츠','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%ED%82%A4%20%EC%99%80%EC%9D%B4%EB%93%9C%20%EC%B9%98%EB%85%B8%20%ED%8C%AC%EC%B8%A0',true,false);

-- cityboy-008 (cityboy) — 4슬롯 · 완성가 ≈ 152,800 → "15.3만"
delete from products where photo_image_url = 'moods/cityboy-008.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-008.jpg','네이비 코치 자켓','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#2a3550,#141b2e)','https://www.musinsa.com/search/musinsa/integration?q=%EB%84%A4%EC%9D%B4%EB%B9%84%20%EC%BD%94%EC%B9%98%20%EC%9E%90%EC%BC%93',true,false),
('cityboy','moods/cityboy-008.jpg','화이트 크루넥 반팔 티','상의','로우',9900,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%B0%98%ED%8C%94%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-008.jpg','브라운 와이드 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%99%80%EC%9D%B4%EB%93%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false),
('cityboy','moods/cityboy-008.jpg','블랙 레더 토트백','가방','미드',49000,'29CM','linear-gradient(300deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EB%A0%88%EB%8D%94%20%ED%86%A0%ED%8A%B8%EB%B0%B1',true,false);

-- cityboy-013 (cityboy) — 4슬롯 · 완성가 ≈ 126,700 → "12.7만"
delete from products where photo_image_url = 'moods/cityboy-013.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('cityboy','moods/cityboy-013.jpg','올리브 하프 셔츠','아우터','로우',32900,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%ED%95%98%ED%94%84%20%EC%85%94%EC%B8%A0',true,false),
('cityboy','moods/cityboy-013.jpg','화이트 크루넥 반팔 티','상의','로우',9900,'무신사 스탠다드','linear-gradient(30deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%B0%98%ED%8C%94%20%ED%8B%B0',true,false),
('cityboy','moods/cityboy-013.jpg','블랙 와이드 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EC%99%80%EC%9D%B4%EB%93%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false),
('cityboy','moods/cityboy-013.jpg','블랙 레더 토트백','가방','미드',49000,'29CM','linear-gradient(300deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EB%A0%88%EB%8D%94%20%ED%86%A0%ED%8A%B8%EB%B0%B1',true,false);

-- classic-001 (classic) — 3슬롯 · 완성가 ≈ 247,000 → "24.7만"
delete from products where photo_image_url = 'moods/classic-001.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-001.jpg','차콜 울 오버코트','아우터','하이',159000,'무신사 스탠다드','linear-gradient(150deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%9A%B8%20%EC%98%A4%EB%B2%84%EC%BD%94%ED%8A%B8',true,false),
('classic','moods/classic-001.jpg','차콜 울 오버코트','아우터','하이',189000,'29CM','linear-gradient(150deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%9A%B8%20%EC%98%A4%EB%B2%84%EC%BD%94%ED%8A%B8',true,false),
('classic','moods/classic-001.jpg','블랙 메리노 터틀넥','상의','미드',39000,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EB%A9%94%EB%A6%AC%EB%85%B8%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-001.jpg','블랙 메리노 터틀넥','상의','미드',49900,'유니클로','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EB%A9%94%EB%A6%AC%EB%85%B8%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-001.jpg','차콜 울 슬랙스','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%9A%B8%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- classic-012 (classic) — 3슬롯 · 완성가 ≈ 227,000 → "22.7만"
delete from products where photo_image_url = 'moods/classic-012.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-012.jpg','네이비 니트 폴로','상의','미드',49000,'무신사 스탠다드','linear-gradient(150deg,#2a3550,#141b2e)','https://www.musinsa.com/search/musinsa/integration?q=%EB%84%A4%EC%9D%B4%EB%B9%84%20%EB%8B%88%ED%8A%B8%20%ED%8F%B4%EB%A1%9C',true,false),
('classic','moods/classic-012.jpg','그레이 울 슬랙스','하의','미드',49000,'무신사 스탠다드','linear-gradient(30deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A0%88%EC%9D%B4%20%EC%9A%B8%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false),
('classic','moods/classic-012.jpg','브라운 페니 로퍼','신발','하이',129000,'29CM','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%ED%8E%98%EB%8B%88%20%EB%A1%9C%ED%8D%BC',true,false);

-- classic-014 (classic) — 3슬롯 · 완성가 ≈ 217,000 → "21.7만"
delete from products where photo_image_url = 'moods/classic-014.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('classic','moods/classic-014.jpg','그레이 울 블레이저','아우터','하이',129000,'무신사 스탠다드','linear-gradient(150deg,#8f8a82,#5a5650)','https://www.musinsa.com/search/musinsa/integration?q=%EA%B7%B8%EB%A0%88%EC%9D%B4%20%EC%9A%B8%20%EB%B8%94%EB%A0%88%EC%9D%B4%EC%A0%80',true,false),
('classic','moods/classic-014.jpg','블랙 메리노 터틀넥','상의','미드',39000,'무신사 스탠다드','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EB%A9%94%EB%A6%AC%EB%85%B8%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-014.jpg','블랙 메리노 터틀넥','상의','미드',49900,'유니클로','linear-gradient(30deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EB%A9%94%EB%A6%AC%EB%85%B8%20%ED%84%B0%ED%8B%80%EB%84%A5',true,false),
('classic','moods/classic-014.jpg','브라운 울 슬랙스','하의','미드',49000,'무신사 스탠다드','linear-gradient(210deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%9A%B8%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- clean-008 (clean) — 3슬롯 · 완성가 ≈ 222,900 → "22.3만"
delete from products where photo_image_url = 'moods/clean-008.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-008.jpg','크림 카 코트','아우터','하이',139000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EC%B9%B4%20%EC%BD%94%ED%8A%B8',true,false),
('clean','moods/clean-008.jpg','오트밀 크루넥 니트','상의','미드',49000,'무신사 스탠다드','linear-gradient(30deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%8B%88%ED%8A%B8',true,false),
('clean','moods/clean-008.jpg','블랙 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(210deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);

-- clean-012 (clean) — 3슬롯 · 완성가 ≈ 142,900 → "14.3만"
delete from products where photo_image_url = 'moods/clean-012.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('clean','moods/clean-012.jpg','아이보리 크루넥 니트','상의','미드',49000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%EC%95%84%EC%9D%B4%EB%B3%B4%EB%A6%AC%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%8B%88%ED%8A%B8',true,false),
('clean','moods/clean-012.jpg','차콜 슬랙스','하의','로우',34900,'무신사 스탠다드','linear-gradient(30deg,#4a4d55,#17181c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B0%A8%EC%BD%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false),
('clean','moods/clean-012.jpg','블랙 미니 크로스백','가방','미드',59000,'29CM','linear-gradient(210deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EB%AF%B8%EB%8B%88%20%ED%81%AC%EB%A1%9C%EC%8A%A4%EB%B0%B1',true,false);

-- soft-002 (soft) — 2슬롯 · 완성가 ≈ 88,900 → "8.9만"
delete from products where photo_image_url = 'moods/soft-002.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-002.jpg','크림 플리스 블루종','아우터','미드',59000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%ED%94%8C%EB%A6%AC%EC%8A%A4%20%EB%B8%94%EB%A3%A8%EC%A2%85',true,false),
('soft','moods/soft-002.jpg','베이지 치노 팬츠','하의','로우',29900,'무신사 스탠다드','linear-gradient(30deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%B9%98%EB%85%B8%20%ED%8C%AC%EC%B8%A0',true,false),
('soft','moods/soft-002.jpg','베이지 치노 팬츠','하의','로우',39900,'유니클로','linear-gradient(30deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EC%B9%98%EB%85%B8%20%ED%8C%AC%EC%B8%A0',true,false);

-- soft-005 (soft) — 3슬롯 · 완성가 ≈ 108,800 → "10.9만"
delete from products where photo_image_url = 'moods/soft-005.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-005.jpg','크림 가디건','아우터','미드',49000,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EA%B0%80%EB%94%94%EA%B1%B4',true,false),
('soft','moods/soft-005.jpg','오트밀 니트 티','상의','로우',29900,'무신사 스탠다드','linear-gradient(30deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%A4%ED%8A%B8%EB%B0%80%20%EB%8B%88%ED%8A%B8%20%ED%8B%B0',true,false),
('soft','moods/soft-005.jpg','카키 치노 팬츠','하의','로우',29900,'무신사 스탠다드','linear-gradient(210deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%ED%82%A4%20%EC%B9%98%EB%85%B8%20%ED%8C%AC%EC%B8%A0',true,false),
('soft','moods/soft-005.jpg','카키 치노 팬츠','하의','로우',39900,'유니클로','linear-gradient(210deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EC%B9%B4%ED%82%A4%20%EC%B9%98%EB%85%B8%20%ED%8C%AC%EC%B8%A0',true,false);

-- soft-010 (soft) — 2슬롯 · 완성가 ≈ 69,800 → "7만"
delete from products where photo_image_url = 'moods/soft-010.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('soft','moods/soft-010.jpg','크림 반팔 니트 티','상의','로우',29900,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%81%AC%EB%A6%BC%20%EB%B0%98%ED%8C%94%20%EB%8B%88%ED%8A%B8%20%ED%8B%B0',true,false),
('soft','moods/soft-010.jpg','베이지 린넨 와이드 팬츠','하의','로우',39900,'무신사 스탠다드','linear-gradient(30deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EB%A6%B0%EB%84%A8%20%EC%99%80%EC%9D%B4%EB%93%9C%20%ED%8C%AC%EC%B8%A0',true,false),
('soft','moods/soft-010.jpg','베이지 린넨 와이드 팬츠','하의','로우',39900,'유니클로','linear-gradient(30deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B2%A0%EC%9D%B4%EC%A7%80%20%EB%A6%B0%EB%84%A8%20%EC%99%80%EC%9D%B4%EB%93%9C%20%ED%8C%AC%EC%B8%A0',true,false);

-- street-001 (street) — 3슬롯 · 완성가 ≈ 108,800 → "10.9만"
delete from products where photo_image_url = 'moods/street-001.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-001.jpg','블랙 오버핏 후디','상의','미드',49000,'무신사 스탠다드','linear-gradient(150deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EC%98%A4%EB%B2%84%ED%95%8F%20%ED%9B%84%EB%94%94',true,false),
('street','moods/street-001.jpg','올리브 카고 팬츠','하의','로우',39900,'무신사 스탠다드','linear-gradient(30deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%B9%B4%EA%B3%A0%20%ED%8C%AC%EC%B8%A0',true,false),
('street','moods/street-001.jpg','블랙 볼캡','모자','로우',19900,'무신사 스탠다드','linear-gradient(210deg,#3a3a3a,#141414)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%94%EB%9E%99%20%EB%B3%BC%EC%BA%A1',true,false);

-- street-010 (street) — 2슬롯 · 완성가 ≈ 88,900 → "8.9만"
delete from products where photo_image_url = 'moods/street-010.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-010.jpg','올리브 오버핏 후디','상의','미드',49000,'무신사 스탠다드','linear-gradient(150deg,#6b6a3a,#3a3a1c)','https://www.musinsa.com/search/musinsa/integration?q=%EC%98%AC%EB%A6%AC%EB%B8%8C%20%EC%98%A4%EB%B2%84%ED%95%8F%20%ED%9B%84%EB%94%94',true,false),
('street','moods/street-010.jpg','브라운 카고 팬츠','하의','로우',39900,'무신사 스탠다드','linear-gradient(30deg,#8a6b4a,#3d2f22)','https://www.musinsa.com/search/musinsa/integration?q=%EB%B8%8C%EB%9D%BC%EC%9A%B4%20%EC%B9%B4%EA%B3%A0%20%ED%8C%AC%EC%B8%A0',true,false);

-- street-011 (street) — 2슬롯 · 완성가 ≈ 68,900 → "6.9만"
delete from products where photo_image_url = 'moods/street-011.jpg';
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
('street','moods/street-011.jpg','화이트 오버핏 헤비코튼 티','상의','로우',19900,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%EC%98%A4%EB%B2%84%ED%95%8F%20%ED%97%A4%EB%B9%84%EC%BD%94%ED%8A%BC%20%ED%8B%B0',true,false),
('street','moods/street-011.jpg','화이트 오버핏 헤비코튼 티','상의','로우',19900,'유니클로','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%EC%98%A4%EB%B2%84%ED%95%8F%20%ED%97%A4%EB%B9%84%EC%BD%94%ED%8A%BC%20%ED%8B%B0',true,false),
('street','moods/street-011.jpg','라이트워시 와이드 데님','하의','미드',49000,'무신사 스탠다드','linear-gradient(30deg,#3d5a80,#1d2d44)','https://www.musinsa.com/search/musinsa/integration?q=%EB%9D%BC%EC%9D%B4%ED%8A%B8%EC%9B%8C%EC%8B%9C%20%EC%99%80%EC%9D%B4%EB%93%9C%20%EB%8D%B0%EB%8B%98',true,false);
