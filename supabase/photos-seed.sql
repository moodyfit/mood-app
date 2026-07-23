-- MOODFIT 최종 photos 입고본 (자동 생성: scripts/gen-seed9.ts) — 검수 승인 90장
-- 마이그레이션
alter table photos add column if not exists caption_how text;
alter table photos add column if not exists aspect_ratio real default 0.8;
alter table user_actions drop constraint if exists user_actions_action_check;
alter table user_actions add constraint user_actions_action_check
  check (action in ('view','save','search','scan_like','buy_out','worn','discover','new_feel'));

-- 옛 힉스필드 태깅 행 제거 후 신규 전량 대체
delete from photos;

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-001.jpg', '{"clean":1}'::jsonb, array['주말카페','동네'], array['summer'], '{"height":"178","build":"slim"}'::jsonb,
  '화이트 라운드 티에 아이보리 슬랙스', '위아래 톤을 밝게 붙여 색을 안 늘리니까 대충 입어도 정돈돼 보여', '티는 앞만 살짝 넣어야 슬랙스 라인이 살아', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-002.jpg', '{"clean":0.8,"cityboy":0.2}'::jsonb, array['주말카페','동네'], array['summer'], '{"height":"180","build":"regular"}'::jsonb,
  '오버핏 크림 티에 아이보리 팬츠', '같은 톤으로 헐렁하게 떨어뜨려 힘을 뺐는데도 깔끔해', '티를 넣지 말고 그대로 흘려야 이 여유가 나', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-003.jpg', '{"clean":1}'::jsonb, array['동네'], array['summer'], '{"height":"183","build":"slim"}'::jsonb,
  '크림 티에 블랙 와이드 슬랙스', '밝은 상의에 검정 하의로 딱 두 색만 끊어 대비를 줬어', '밑단은 신발에 살짝 닿는 길이로 둬야 균형이 맞아', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-004.jpg', '{"clean":1}'::jsonb, array['여행'], array['spring','fall'], '{"height":"175","build":"slim"}'::jsonb,
  '크림 와플 롱슬리브에 베이지 팬츠', '톤을 베이지로 맞추고 질감만 더해 밋밋하지 않게 정리돼', '소매를 한 번 걷어 손목을 보여야 답답하지 않아', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-005.jpg', '{"clean":1}'::jsonb, array['주말카페','동네'], array['summer'], '{"height":"180","build":"regular"}'::jsonb,
  '오버핏 크림 티에 아이보리 치노', '톤을 다 밝게 맞추고 핏만 크게 둬서 편한데 깔끔해', '티 밑단이 엉덩이 덮는 길이라 그대로 흘려 입어', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-006.jpg', '{"clean":1}'::jsonb, array['동네'], array['summer'], '{"height":"178","build":"slim"}'::jsonb,
  '크림 니트 티에 블랙 와이드 슬랙스', '밝은 니트 상의에 검정 하의로 두 색만 써서 산책룩인데 정돈돼', '슬랙스는 발등에 한 번 접히게 길이를 잡아', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-007.jpg', '{"clean":1}'::jsonb, array['출근','동네'], array['winter'], '{"height":"183","build":"slim"}'::jsonb,
  '그레이 울 코트에 크림 니트·차콜 슬랙스', '무채색 톤으로 붙여 겨울에도 군더더기가 없어', '코트는 열고 니트를 살짝 보여야 답답하지 않아', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-008.jpg', '{"clean":1}'::jsonb, array['주말카페','동네'], array['winter'], '{"height":"180","build":"regular"}'::jsonb,
  '크림 카코트에 오트밀 니트·블랙 슬랙스', '겉옷까지 아이보리로 맞추고 하의만 검정으로 눌러 균형을 잡았어', '코트 단추는 잠그지 말고 열어 레이어를 보여', true, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-009.jpg', '{"clean":1}'::jsonb, array['출근','동네'], array['fall','winter'], '{"height":"180","build":"regular"}'::jsonb,
  '크림 크루넥 니트에 블랙 크롭 슬랙스', '밝은 니트에 검정 크롭 하의로 두 색만 끊어 발목을 띄웠어', '슬랙스는 복사뼈 위로 올려 스니커가 드러나게', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-010.jpg', '{"clean":1}'::jsonb, array['동네'], array['spring','fall'], '{"height":"183","build":"slim"}'::jsonb,
  '아이보리 니트에 차콜 슬랙스', '톤을 아이보리로 올리고 하의만 차콜로 눌러 깔끔해', '니트 소매는 손목까지 딱 맞게 내려 입어', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-011.jpg', '{"clean":1}'::jsonb, array['데이트'], array['summer'], '{"height":"179","build":"slim"}'::jsonb,
  '화이트 니트 폴로에 차콜 테일러드 쇼츠', '밝은 폴로에 차콜 쇼츠로 두 색만 써서 여름에도 정제돼', '폴로는 넣지 말고 반듯하게 흘려', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-012.jpg', '{"clean":1}'::jsonb, array['동네','출근'], array['spring','fall'], '{"height":"182","build":"regular"}'::jsonb,
  '아이보리 크루넥 니트에 차콜 슬랙스', '니트와 슬랙스를 톤차만 줘 붙이고 검정 크로스백으로 포인트', '크로스백은 짧게 메 허리선을 끊지 않게', true, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-013.jpg', '{"clean":1}'::jsonb, array['동네','출근'], array['fall','winter'], '{"height":"179","build":"slim"}'::jsonb,
  '크림 니트에 블랙 슬랙스', '밝은 니트에 검정 하의로 두 색만 끊어', '슬랙스는 복사뼈 위로 올려 스니커를 드러내', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-014.jpg', '{"clean":1}'::jsonb, array['동네','주말카페'], array['fall'], '{"height":"181","build":"regular"}'::jsonb,
  '크림 스웻셔츠에 다크브라운 슬랙스', '밝은 상의에 짙은 브라운으로 톤만 대비', '밑단 한 번 접어 발목을 띄워', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-015.jpg', '{"clean":1}'::jsonb, array['동네'], array['fall'], '{"height":"176","build":"slim"}'::jsonb,
  '크림 스웻셔츠에 딥그린 팬츠', '밝은 상의에 짙은 하의로 톤 대비만 줘 차분해', '팬츠는 스니커에 살짝 걸치게', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-001.jpg', '{"cityboy":1}'::jsonb, array['주말카페','동네'], array['summer'], '{"height":"180","build":"slim"}'::jsonb,
  '베이지 오픈셔츠에 화이트 티·카키 와이드', '셔츠를 걸치듯 열고 티로 받쳐 힘 뺐는데 층이 생겨', '단추 풀고 소매 걷어 안 티를 보여', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-002.jpg', '{"cityboy":1}'::jsonb, array['주말카페','동네'], array['summer'], '{"height":"178","build":"regular"}'::jsonb,
  '카키 하프셔츠에 화이트 티·올리브 와이드', '흙색 톤에 토트만 더해 데일리로 정리', '셔츠는 티보다 길게 흘려', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-003.jpg', '{"cityboy":1}'::jsonb, array['동네','여행'], array['summer'], '{"height":"183","build":"slim"}'::jsonb,
  '블루그레이 하프셔츠에 화이트 티·브라운 와이드', '상의만 옅은 블루로 포인트 주고 하의는 차분히', '앞을 다 열어 티 라인을 세로로 살려', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-004.jpg', '{"cityboy":1}'::jsonb, array['동네','여행'], array['summer'], '{"height":"177","build":"regular"}'::jsonb,
  '베이지 셔츠에 화이트 티·카키 카고', '밝은 흙색 톤에 크로스백으로 실용 포인트', '소매는 팔꿈치까지 걷어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-005.jpg', '{"cityboy":1}'::jsonb, array['주말카페','동네'], array['summer'], '{"height":"185","build":"slim"}'::jsonb,
  '베이지 하프셔츠에 화이트 티·올리브 와이드', '톤온톤 흙색으로 편한데 갖춰 보여', '오픈, 밑단은 그대로 흘려', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-006.jpg', '{"cityboy":1}'::jsonb, array['동네'], array['summer'], '{"height":"179","build":"slim"}'::jsonb,
  '올리브 하프 워크셔츠에 화이트 티·올리브 와이드', '강변 산책룩, 토트로 무심한 포인트', '앞 열고 소매 걷어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-007.jpg', '{"cityboy":1}'::jsonb, array['출근','동네'], array['fall','winter'], '{"height":"176","build":"regular"}'::jsonb,
  '올리브 코치 오버셔츠에 화이트 티·카키 팬츠', '가벼운 겉옷 한 겹으로 쌀쌀할 때 층을 더해', '오버셔츠는 열어 티를 보여', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-008.jpg', '{"cityboy":1}'::jsonb, array['출근','주말카페'], array['fall','winter'], '{"height":"182","build":"regular"}'::jsonb,
  '네이비 코치자켓에 화이트 티·브라운 와이드', '네이비 겉옷으로 톤을 눌러 카페에서도 갖춰 보여', '자켓 열고 토트로 균형', true, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-009.jpg', '{"cityboy":1}'::jsonb, array['출근','동네'], array['fall','winter'], '{"height":"180","build":"slim"}'::jsonb,
  '카키 오버셔츠에 크림 티·베이지 팬츠', '흙색 겉옷 한 겹으로 걷는 데 편해', '오버셔츠 소매 걷어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-010.jpg', '{"cityboy":1}'::jsonb, array['동네','주말카페'], array['spring'], '{"height":"178","build":"regular"}'::jsonb,
  '올리브 코치 오버셔츠에 화이트 티·카멜 치노', '봄 톤으로 밝게 열고 카멜 치노로 따뜻하게', '치노 밑단 한 번 접어 스니커를 보여', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-011.jpg', '{"cityboy":1}'::jsonb, array['동네'], array['spring'], '{"height":"174","build":"slim"}'::jsonb,
  '올리브 셔츠에 그린 티·올리브 카고', '올리브 톤온톤에 크로스백으로 실용', '열어 그린 티를 살짝', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-012.jpg', '{"cityboy":1}'::jsonb, array['동네','주말카페'], array['spring'], '{"height":"181","build":"regular"}'::jsonb,
  '브라운 셔츠에 화이트 티·브라운 카고', '브라운 톤으로 붙이고 토트로 무심 포인트', '소매 걷어', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-013.jpg', '{"cityboy":1}'::jsonb, array['동네','주말카페'], array['fall'], '{"height":"179","build":"slim"}'::jsonb,
  '올리브 하프셔츠에 화이트 티·블랙 와이드', '올리브 상의에 검정 하의로 대비 주고 토트로 마무리', '오픈, 밑단 흘려', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-014.jpg', '{"cityboy":1}'::jsonb, array['주말카페','동네'], array['fall'], '{"height":"183","build":"regular"}'::jsonb,
  '카키 오버셔츠에 화이트 티·올리브 팬츠', '흙색 톤으로 걷는 순간에도 정돈돼', '열고 소매 걷어', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-015.jpg', '{"cityboy":1}'::jsonb, array['동네'], array['fall'], '{"height":"177","build":"slim"}'::jsonb,
  '베이지 오버셔츠에 화이트 티·베이지 와이드', '톤온톤 베이지로 층만 나눠 무던하게', '열고 토트로 포인트', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-001.jpg', '{"street":1}'::jsonb, array['동네'], array['fall','winter'], '{"height":"181","build":"slim"}'::jsonb,
  '블랙 오버핏 후디에 올리브 카고', '위아래 다 크게 놀리고 캡으로 눌러 힘을 뺐어', '후디 밑단은 카고 위로 덮어', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-002.jpg', '{"street":1}'::jsonb, array['동네','주말카페'], array['fall','winter'], '{"height":"178","build":"regular"}'::jsonb,
  '네이비 자켓에 후디·탄 카고', '자켓 한 겹 걸쳐 부피를 더해', '자켓은 열고 후디 끈은 밖으로', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-003.jpg', '{"street":1}'::jsonb, array['동네'], array['fall','winter'], '{"height":"184","build":"slim"}'::jsonb,
  '브라운 필드자켓에 후디·올리브 카고', '큰 자켓에 카고로 통일해 덩치를 살려', '지퍼 반만 올려', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-004.jpg', '{"street":1}'::jsonb, array['모임술자리','동네'], array['winter'], '{"height":"179","build":"regular"}'::jsonb,
  '블랙 자켓에 후디·올리브 카고', '검정으로 다 눌러 밤에도 묵직하게', '캡 깊이 눌러', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-005.jpg', '{"street":1}'::jsonb, array['동네','주말카페'], array['fall'], '{"height":"182","build":"slim"}'::jsonb,
  '베이지 자켓에 화이트 후디·올리브 카고', '겉옷만 밝게 띄우고 안은 화이트로 환기', '자켓 오픈, 후드 세워', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-006.jpg', '{"street":1}'::jsonb, array['동네'], array['fall'], '{"height":"177","build":"regular"}'::jsonb,
  '차콜 오버핏 후디에 베이지 카고', '어두운 후디에 밝은 카고로 위아래 대비', '후디는 엉덩이 덮는 길이로', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-007.jpg', '{"street":1}'::jsonb, array['동네'], array['fall','spring'], '{"height":"180","build":"slim"}'::jsonb,
  '브라운 오버핏 후디에 올리브 카고', '흙색 톤으로 크게 붙여 무심하게', '소매는 밀어 올려', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-008.jpg', '{"street":1}'::jsonb, array['모임술자리','주말카페'], array['fall'], '{"height":"183","build":"regular"}'::jsonb,
  '블랙 봄버에 오렌지 후디·올리브 카고', '오렌지 후디로 딱 한 포인트만 튀겨', '봄버 열고 후디로 색을 보여', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-009.jpg', '{"street":1}'::jsonb, array['동네'], array['spring','fall'], '{"height":"179","build":"slim"}'::jsonb,
  '블랙 오버핏 후디에 올리브 카고', '캡까지 검정으로 눌러 걷는 데 군더더기 없어', '카고는 스니커에 살짝 쌓이게', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-010.jpg', '{"street":1}'::jsonb, array['동네'], array['fall'], '{"height":"181","build":"regular"}'::jsonb,
  '올리브 오버핏 후디에 브라운 카고', '흙색으로 붙여 덩치를 편하게', '후드 세우고 밑단 덮어', true, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-011.jpg', '{"street":1}'::jsonb, array['동네'], array['summer'], '{"height":"177","build":"regular"}'::jsonb,
  '무지 오버핏 헤비코튼 티에 와이드 라이트 데님', '프린트 없이 크게 입고 데님으로 받쳐 여름 스트릿', '티 밑단 데님 위로 흘려', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-012.jpg', '{"street":1}'::jsonb, array['주말카페','동네'], array['fall'], '{"height":"180","build":"regular"}'::jsonb,
  '카키 자켓에 오렌지 후디·올리브 카고', '오렌지 후디로 포인트, 겉옷으로 눌러', '자켓 열고 후디 끈 밖으로', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-013.jpg', '{"street":1}'::jsonb, array['모임술자리','동네'], array['fall'], '{"height":"182","build":"slim"}'::jsonb,
  '카키 코치자켓에 후디·베이지 카고', '유틸 자켓과 카고로 워크 무드를 크게', '지퍼 반, 캡', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-014.jpg', '{"street":1}'::jsonb, array['여행','동네'], array['fall'], '{"height":"179","build":"regular"}'::jsonb,
  '올리브 자켓에 후디·올리브 카고·백팩', '백팩까지 흙색으로 통일해 이동성 포인트', '자켓 열고 백팩 짧게', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-015.jpg', '{"street":1}'::jsonb, array['동네'], array['fall','winter'], '{"height":"181","build":"slim"}'::jsonb,
  '올리브 오버핏 후디에 올리브 카고', '올리브 톤온톤으로 크게 붙여', '후디 밑단 카고 위로', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-001.jpg', '{"amekaji":1}'::jsonb, array['동네'], array['spring','fall'], '{"height":"178","build":"slim"}'::jsonb,
  '데님 셔츠자켓에 블랙 티·블루 진', '청청을 톤차로 붙이고 검정 티로 눌러', '셔츠자켓 단추 풀어 티를 보여', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-002.jpg', '{"amekaji":1}'::jsonb, array['동네','주말카페'], array['spring','fall'], '{"height":"182","build":"regular"}'::jsonb,
  '데님 트러커에 다크 티·블루 진', '청청에 워크부츠로 낡은 무드를 잡아', '트러커 열고 진은 부츠에 살짝 걸치게', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-003.jpg', '{"amekaji":1}'::jsonb, array['동네'], array['fall','winter'], '{"height":"176","build":"regular"}'::jsonb,
  '데님 트러커에 오트밀 터틀넥·블루 진', '니트로 목을 채워 겨울 청청을 완성', '트러커 안에 터틀넥을 받쳐', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-004.jpg', '{"amekaji":1}'::jsonb, array['동네','여행'], array['winter'], '{"height":"184","build":"slim"}'::jsonb,
  '롱 데님코트에 니트·블루 진', '긴 코트로 청청에 기장을 더해 묵직하게', '코트 열고 세로로 길게', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-005.jpg', '{"amekaji":1}'::jsonb, array['동네'], array['fall','winter'], '{"height":"180","build":"slim"}'::jsonb,
  '데님 자켓에 버건디 니트·블루 진', '버건디 니트로 청청에 한 톤 색을 얹어', '자켓 열어 니트 색을 보여', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-006.jpg', '{"amekaji":1}'::jsonb, array['동네'], array['spring'], '{"height":"179","build":"regular"}'::jsonb,
  '데님 자켓에 화이트 니트·블루 진', '밝은 니트로 청청을 산뜻하게 환기', '소매 걷어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-007.jpg', '{"amekaji":1}'::jsonb, array['동네'], array['spring'], '{"height":"181","build":"regular"}'::jsonb,
  '데님 셔츠에 그레이 셔츠·그레이 워크팬츠', '청과 그레이로 톤을 낮춰 워크 무드', '셔츠 위에 데님 셔츠를 겹쳐', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-008.jpg', '{"amekaji":1}'::jsonb, array['주말카페','동네'], array['spring','fall'], '{"height":"180","build":"slim"}'::jsonb,
  '데님 트러커에 크림 니트·블루 진', '크림 니트로 청청을 부드럽게 받쳐', '트러커 열고 니트 밑단 보여', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-009.jpg', '{"amekaji":1}'::jsonb, array['동네'], array['spring'], '{"height":"177","build":"regular"}'::jsonb,
  '데님 자켓에 그레이 셔츠·블루 진', '청청에 셔츠를 안에 받쳐 각을 살짝', '자켓 열고 걸어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-010.jpg', '{"amekaji":1}'::jsonb, array['동네','주말카페'], array['spring'], '{"height":"183","build":"slim"}'::jsonb,
  '데님 자켓에 베이지 카디건·블루 진', '카디건으로 청청을 포근하게 눌러', '자켓 안에 카디건 레이어', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-011.jpg', '{"amekaji":1}'::jsonb, array['동네'], array['fall'], '{"height":"178","build":"slim"}'::jsonb,
  '데님 자켓에 화이트 티·블루 진', '가장 기본 청청에 워크부츠로 마감', '자켓 열고 티 그대로', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-012.jpg', '{"amekaji":1}'::jsonb, array['여행','동네'], array['fall'], '{"height":"181","build":"regular"}'::jsonb,
  '올리브 필드자켓에 그레이 셔츠·블루 진·백팩', '밀리터리 필드로 청청에 유틸을 더해', '자켓 열고 백팩 짧게', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-013.jpg', '{"amekaji":1}'::jsonb, array['동네'], array['fall','winter'], '{"height":"182","build":"slim"}'::jsonb,
  '셰르파 데님자켓에 크림 니트·블루 진', '보아 카라로 청청을 겨울용으로', '카라 세우고 니트 받쳐', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-014.jpg', '{"amekaji":1}'::jsonb, array['동네','주말카페'], array['summer'], '{"height":"178","build":"regular"}'::jsonb,
  '에크루 헨리넥 티에 올리브 워크팬츠', '헨리넥에 워크팬츠로 여름에도 낡은 무드', '소매 걷고 부츠로 마감', true, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-015.jpg', '{"amekaji":1}'::jsonb, array['주말카페','동네'], array['summer'], '{"height":"180","build":"slim"}'::jsonb,
  '베이지 린넨 셔츠에 화이트 티·베이지 치노', '린넨 셔츠 열어 여름 청량하게', '앞 열고 치노 밑단 접어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-001.jpg', '{"classic":1}'::jsonb, array['출근','결혼식하객'], array['winter'], '{"height":"180","build":"slim"}'::jsonb,
  '차콜 오버코트에 블랙 터틀넥·차콜 슬랙스', '무채색으로 붙여 각을 세워', '코트 열고 세로로', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-002.jpg', '{"classic":1}'::jsonb, array['출근','데이트'], array['fall','winter'], '{"height":"182","build":"regular"}'::jsonb,
  '브라운 셋업 블레이저에 카멜 터틀넥·브라운 슬랙스', '브라운 톤온톤으로 정장기를 부드럽게', '단추 풀고 터틀넥 받쳐', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-003.jpg', '{"classic":1}'::jsonb, array['출근','면접'], array['fall','winter'], '{"height":"178","build":"slim"}'::jsonb,
  '차콜 블레이저에 카멜 터틀넥·차콜 슬랙스', '블레이저에 니트로 갖추되 안 답답하게', '단추 풀어 터틀넥 보여', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-004.jpg', '{"classic":1}'::jsonb, array['출근','데이트'], array['winter'], '{"height":"181","build":"regular"}'::jsonb,
  '차콜 블레이저에 카멜 니트·네이비 슬랙스', '정장 재킷에 니트로 격을 살짝 낮춰', '재킷 열고 니트 받쳐', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-005.jpg', '{"classic":1}'::jsonb, array['출근'], array['winter'], '{"height":"184","build":"slim"}'::jsonb,
  '올리브 블레이저에 블랙 터틀넥·차콜 슬랙스', '올리브로 정장기에 톤만 얹어', '재킷 열고 벨트 보여', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-006.jpg', '{"classic":1}'::jsonb, array['출근','결혼식하객'], array['winter'], '{"height":"179","build":"regular"}'::jsonb,
  '카멜 오버코트에 블랙 터틀넥·차콜 슬랙스', '카멜 코트로 겨울 정장을 따뜻하게', '벨트로 허리 잡아', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-007.jpg', '{"classic":1}'::jsonb, array['출근'], array['fall'], '{"height":"177","build":"regular"}'::jsonb,
  '차콜 블레이저에 브라운 터틀넥·차콜 슬랙스', '재킷에 니트로 편하게 갖춰', '단추 풀어 걸어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-008.jpg', '{"classic":1}'::jsonb, array['출근','면접'], array['spring'], '{"height":"181","build":"regular"}'::jsonb,
  '라이트블루 옥스퍼드에 오트밀 니트베스트·차콜 슬랙스', '셔츠에 베스트로 격식을 봄에 맞게', '베스트 아래 셔츠 밑단 살짝', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-009.jpg', '{"classic":1}'::jsonb, array['출근','결혼식하객'], array['winter'], '{"height":"183","build":"slim"}'::jsonb,
  '브라운 오버코트에 블랙 터틀넥·차콜 슬랙스', '브라운 코트로 정장에 기장을 더해', '코트 열고 걸어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-010.jpg', '{"classic":1}'::jsonb, array['출근'], array['fall'], '{"height":"181","build":"regular"}'::jsonb,
  '탄 블레이저에 블랙 터틀넥·올리브 슬랙스', '탄 재킷에 검정 니트로 대비', '손 넣고 벨트 보여', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-011.jpg', '{"classic":1}'::jsonb, array['출근'], array['winter'], '{"height":"178","build":"slim"}'::jsonb,
  '올리브 오버코트에 그레이 터틀넥·차콜 슬랙스', '올리브 코트로 톤만 얹어', '코트 열고 벨트', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-012.jpg', '{"classic":1}'::jsonb, array['소개팅','출근'], array['summer'], '{"height":"180","build":"slim"}'::jsonb,
  '네이비 니트 폴로에 그레이 슬랙스·브라운 로퍼', '니트 폴로로 여름 정장기를 부드럽게', '폴로 넣어 로퍼로 마감', true, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-013.jpg', '{"classic":1}'::jsonb, array['출근','면접'], array['winter'], '{"height":"180","build":"slim"}'::jsonb,
  '그레이 오버코트에 블랙 터틀넥·그레이 슬랙스', '무채색 코트로 겨울 정장을 깔끔하게', '코트 열고 세로로', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-014.jpg', '{"classic":1}'::jsonb, array['출근','데이트'], array['spring'], '{"height":"181","build":"regular"}'::jsonb,
  '그레이 블레이저에 블랙 터틀넥·브라운 슬랙스', '그레이 재킷에 브라운 하의로 톤차', '재킷 열고 백 들고', true, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-015.jpg', '{"classic":1}'::jsonb, array['결혼식하객','출근'], array['fall','winter'], '{"height":"183","build":"slim"}'::jsonb,
  '차콜 수트에 러스트 베스트·블랙 터틀넥', '수트에 러스트 조끼로 포인트 한 겹', '조끼 채워 정장기를 살려', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-001.jpg', '{"soft":1}'::jsonb, array['데이트','동네'], array['fall','winter'], '{"height":"178","build":"slim"}'::jsonb,
  '오트밀 크루넥 니트에 오트밀 슬랙스', '톤을 오트밀로 다 맞춰 포근하게 감싸', '니트 밑단 살짝 덮어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-002.jpg', '{"soft":1}'::jsonb, array['동네','주말카페'], array['winter'], '{"height":"181","build":"regular"}'::jsonb,
  '크림 플리스 블루종에 베이지 치노', '보들한 플리스로 겨울 인상을 부드럽게', '지퍼 반 열고 걸어', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-003.jpg', '{"soft":1}'::jsonb, array['데이트','주말카페'], array['fall'], '{"height":"183","build":"slim"}'::jsonb,
  '베이지 맥코트에 아이보리 셔츠·브라운 치노', '옅은 코트로 포근한 무드에 기장만 더해', '코트 열고 셔츠 보여', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-004.jpg', '{"soft":1}'::jsonb, array['소개팅','데이트'], array['fall'], '{"height":"180","build":"regular"}'::jsonb,
  '크림 크루넥 니트에 웜그레이 슬랙스', '밝은 니트로 순한 인상을 앞세워', '소매 걷어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-005.jpg', '{"soft":1}'::jsonb, array['소개팅','데이트'], array['spring','fall'], '{"height":"179","build":"slim"}'::jsonb,
  '크림 가디건에 오트밀 니트티·카키 치노', '가디건으로 겹을 더해 부드럽게 정돈', '단추 두어 개만 채워', true, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-006.jpg', '{"soft":1}'::jsonb, array['동네','주말카페'], array['spring'], '{"height":"177","build":"regular"}'::jsonb,
  '크림 니트 블루종에 베이지 팬츠', '라운드한 블루종으로 톤을 포근히', '앞 열고 손 넣어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-007.jpg', '{"soft":1}'::jsonb, array['데이트','주말카페'], array['spring'], '{"height":"182","build":"slim"}'::jsonb,
  '오트밀 가디건에 오트밀 니트티·오트밀 팬츠', '셋업처럼 톤 맞춘 가디건 세트로', '단추 풀어 이너 보여', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-008.jpg', '{"soft":1}'::jsonb, array['소개팅','데이트'], array['spring'], '{"height":"180","build":"regular"}'::jsonb,
  '크림 가디건에 화이트 티·베이지 치노', '가디건에 티로 산뜻하게 겹을 나눠', '단추 풀고 티 밑단 보여', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-009.jpg', '{"soft":1}'::jsonb, array['데이트','동네'], array['spring'], '{"height":"178","build":"slim"}'::jsonb,
  '크림 크루넥 니트에 브라운 슬랙스', '밝은 니트에 브라운 하의로 웜톤 대비', '소매 걷어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-010.jpg', '{"soft":1}'::jsonb, array['소개팅','데이트'], array['summer'], '{"height":"182","build":"slim"}'::jsonb,
  '크림 반팔 니트티에 베이지 린넨 와이드', '반팔 니트로 여름에도 포근한 인상', '니트티 그대로 흘려', true, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-011.jpg', '{"soft":1}'::jsonb, array['동네','주말카페'], array['fall'], '{"height":"176","build":"slim"}'::jsonb,
  '크림 가디건에 탄 니트티·베이지 팬츠', '가디건 안에 탄 니트티로 살짝 색', '앞 열고 걸어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-012.jpg', '{"soft":1}'::jsonb, array['데이트','주말카페'], array['fall'], '{"height":"183","build":"regular"}'::jsonb,
  '크림 숄카라 가디건에 오트밀 니트티·라이트그레이 플리츠 팬츠', '숄카라 가디건에 쿨톤 플리츠로 무게를 살짝 더해', '단추 풀고 플리츠 라인 살려', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-013.jpg', '{"soft":1}'::jsonb, array['소개팅','데이트'], array['fall'], '{"height":"180","build":"slim"}'::jsonb,
  '크림 크루넥 니트에 브라운 치노', '밝은 니트에 브라운 하의로 톤 대비', '밑단 접어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-014.jpg', '{"soft":1}'::jsonb, array['데이트','동네'], array['fall'], '{"height":"182","build":"regular"}'::jsonb,
  '오트밀 가디건에 오트밀 니트티·브라운 팬츠', '가디건에 브라운 하의로 가을 톤', '단추 풀어', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-015.jpg', '{"soft":1}'::jsonb, array['동네','주말카페'], array['fall'], '{"height":"179","build":"slim"}'::jsonb,
  '베이지 가디건에 오트밀 니트티·올리브 팬츠', '베이지 가디건에 올리브로 톤차', '앞 열고 걸어', false, 0.8
);
