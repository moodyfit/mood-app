-- flagship 실링크 수동 큐레이션 — 확신되는 범용 스테이플만 실제 무신사 상품페이지로 교체 + verified=true.
-- (AI 생성 사진이라 '정확한 그 옷'은 실존 X → 대표 실판매 상품으로 연결. 나머지 아이템은 검색딥링크 유지)
-- 이름 매칭되는 모든 사진행에 적용(플래그십 포함).

update products set affiliate_url='https://www.musinsa.com/products/2411191', verified=true
  where name='화이트 크루넥 반팔 티';
update products set affiliate_url='https://www.musinsa.com/products/2028327', verified=true
  where name='미드워시 스트레이트 데님 팬츠';
update products set affiliate_url='https://www.musinsa.com/products/2705776', verified=true
  where name='블랙 오버핏 후디';
update products set affiliate_url='https://www.musinsa.com/products/1115290', verified=true
  where name='베이지 치노 팬츠';
update products set affiliate_url='https://www.musinsa.com/products/1115290', verified=true
  where name='카키 와이드 치노 팬츠';
update products set affiliate_url='https://www.musinsa.com/products/5295321', verified=true
  where name='블랙 메리노 터틀넥';
update products set affiliate_url='https://store.musinsa.com/app/goods/1411191', verified=true
  where name='올리브 카고 팬츠';
update products set affiliate_url='https://www.musinsa.com/products/945803', verified=true
  where name='브라운 페니 로퍼';
