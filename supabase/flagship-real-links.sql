-- flagship 실링크 수동 큐레이션 — 확신되는 아이템만 실제 무신사 상품페이지 + verified=true.
-- AI 생성 사진이라 '정확히 그 옷'은 실존 X → 대표 실판매 상품으로 연결. 나머지(20종)는 검색딥링크 유지.
-- 이름 매칭되는 모든 사진행에 적용(플래그십 포함). 커버리지: 44종 중 24종(~55%).
-- 네이버 검색 API가 신규 앱에 막혀, 수동 큐레이션으로 대체. 전 상품 자동화는 쿠팡 파트너스 승인 후.

-- 상의
update products set affiliate_url='https://www.musinsa.com/products/2411191', verified=true where name='화이트 크루넥 반팔 티';
update products set affiliate_url='https://www.musinsa.com/products/2411269', verified=true where name='다크 그레이 크루넥 반팔 티';
update products set affiliate_url='https://www.musinsa.com/products/5295321', verified=true where name='블랙 메리노 터틀넥';
update products set affiliate_url='https://www.musinsa.com/products/4387516', verified=true where name='오트밀 크루넥 니트';
update products set affiliate_url='https://www.musinsa.com/products/4387516', verified=true where name='아이보리 크루넥 니트';
update products set affiliate_url='https://www.musinsa.com/products/2705776', verified=true where name='블랙 오버핏 후디';
update products set affiliate_url='https://www.musinsa.com/products/4682250', verified=true where name='네이비 니트 폴로';

-- 하의
update products set affiliate_url='https://www.musinsa.com/products/2028327', verified=true where name='미드워시 스트레이트 데님 팬츠';
update products set affiliate_url='https://www.musinsa.com/products/1115290', verified=true where name='베이지 치노 팬츠';
update products set affiliate_url='https://www.musinsa.com/products/1115290', verified=true where name='카키 와이드 치노 팬츠';
update products set affiliate_url='https://store.musinsa.com/app/goods/1411191', verified=true where name='올리브 카고 팬츠';
update products set affiliate_url='https://www.musinsa.com/products/1222183', verified=true where name='차콜 슬랙스';
update products set affiliate_url='https://www.musinsa.com/products/1222183', verified=true where name='차콜 울 슬랙스';
update products set affiliate_url='https://www.musinsa.com/products/2568748', verified=true where name='블랙 슬랙스';
update products set affiliate_url='https://www.musinsa.com/products/1224095', verified=true where name='그레이 울 슬랙스';
update products set affiliate_url='https://store.musinsa.com/app/goods/1009422', verified=true where name='베이지 린넨 와이드 팬츠';

-- 아우터
update products set affiliate_url='https://www.musinsa.com/products/4312730', verified=true where name='인디고 데님 트러커 자켓';
update products set affiliate_url='https://www.musinsa.com/products/2518456', verified=true where name='차콜 울 오버코트';
update products set affiliate_url='https://www.musinsa.com/products/1873073', verified=true where name='그레이 울 블레이저';
update products set affiliate_url='https://www.musinsa.com/products/5662151', verified=true where name='크림 가디건';
update products set affiliate_url='https://www.musinsa.com/products/3346084', verified=true where name='크림 카 코트';

-- 신발·모자
update products set affiliate_url='https://www.musinsa.com/products/945803', verified=true where name='브라운 페니 로퍼';
update products set affiliate_url='https://www.musinsa.com/products/3529588', verified=true where name='브라운 레더 워크부츠';
update products set affiliate_url='https://www.musinsa.com/products/957351', verified=true where name='블랙 볼캡';
