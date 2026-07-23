-- 6단계 (B) 사진 레벨 상품 연결 — 첫 배치(검수용): clean-001
-- 어필리에이트 소스 = 공개 링크 interim (무신사 통합검색 딥링크). verified=false (실링크·실가 확정 전).
-- 스키마 확장(products 재사용, photo_image_url 로 사진 연결)
alter table products add column if not exists photo_image_url text;
alter table products add column if not exists is_default boolean default true;
alter table products add column if not exists verified boolean default false;

-- 멱등: 이 사진의 기존 연결 제거 후 재삽입
delete from products where photo_image_url = 'moods/clean-001.jpg';

-- clean-001 (화이트 라운드 티 + 아이보리 슬랙스 + 로퍼, 여름) — 3슬롯(아우터 없음)
-- 상의 (2 소스: 횡단 가격)
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
 ('clean','moods/clean-001.jpg','화이트 크루넥 반팔 티','상의','로우',12900,'유니클로','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%B0%98%ED%8C%94%ED%8B%B0',true,false),
 ('clean','moods/clean-001.jpg','화이트 크루넥 반팔 티','상의','로우',9900,'무신사 스탠다드','linear-gradient(150deg,#f2f0ea,#d9d4cc)','https://www.musinsa.com/search/musinsa/integration?q=%ED%99%94%EC%9D%B4%ED%8A%B8%20%ED%81%AC%EB%A3%A8%EB%84%A5%20%EB%B0%98%ED%8C%94%ED%8B%B0',true,false);
-- 하의 (2 소스)
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
 ('clean','moods/clean-001.jpg','아이보리 세미와이드 슬랙스','하의','로우',29900,'무신사 스탠다드','linear-gradient(30deg,#efe9dd,#cdbfa6)','https://www.musinsa.com/search/musinsa/integration?q=%EC%95%84%EC%9D%B4%EB%B3%B4%EB%A6%AC%20%EC%84%B8%EB%AF%B8%EC%99%80%EC%9D%B4%EB%93%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false),
 ('clean','moods/clean-001.jpg','아이보리 세미와이드 슬랙스','하의','로우',34000,'29CM','linear-gradient(30deg,#efe9dd,#cdbfa6)','https://www.musinsa.com/search/musinsa/integration?q=%EC%95%84%EC%9D%B4%EB%B3%B4%EB%A6%AC%20%EC%84%B8%EB%AF%B8%EC%99%80%EC%9D%B4%EB%93%9C%20%EC%8A%AC%EB%9E%99%EC%8A%A4',true,false);
-- 신발 (1 소스)
insert into products (mood_key, photo_image_url, name, category, price_tier, price, source, gradient, affiliate_url, is_default, verified) values
 ('clean','moods/clean-001.jpg','아이보리 미니멀 로퍼','신발','미드',89000,'29CM','linear-gradient(210deg,#e6ddcb,#b8a888)','https://www.musinsa.com/search/musinsa/integration?q=%EC%95%84%EC%9D%B4%EB%B3%B4%EB%A6%AC%20%EB%A1%9C%ED%8D%BC',true,false);

-- 완성가 ≈ 최저가 합(9900+29900+89000)=128,800 → "이 느낌 완성 · 12.9만" (더미 26.2만 교체)
