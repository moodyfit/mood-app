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
  'moods/clean-001.jpg', '{"clean":0.8,"cityboy":0.2}'::jsonb, array['주말카페','나들이'], array['summer'], '{"height":"178","build":"slim"}'::jsonb,
  '아이보리 오버셔츠 재킷에 화이트 티, 크림 스트레이트 팬츠', '위아래 톤을 크림으로 맞춰서 여름에도 정돈된 느낌, 색을 두 개로 줄이니까 깔끔함이 살아', '재킷은 단추 풀고 걸치듯 입고, 안에 티는 살짝만 빼서 레이어 티 내줘', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-002.jpg', '{"clean":0.6,"cityboy":0.4}'::jsonb, array['주말카페','동네'], array['summer'], '{"height":"179","build":"slim"}'::jsonb,
  '라이트블루 오버셔츠에 화이트 티, 아이보리 롤업 팬츠', '밝은 블루로 포인트 주고 소매 걷어 올려서 재팬 캐주얼 무드가 자연스럽게 나와', '소매는 두어 번 접어 팔뚝 보이게, 밑단은 롤업해서 발목 트여줘', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-003.jpg', '{"clean":0.7,"amekaji":0.3}'::jsonb, array['동네','나들이'], array['summer'], '{"height":"180","build":"slim"}'::jsonb,
  '올리브 코치재킷에 그레이 티, 크림 롤업 팬츠', '올리브 흙톤 재킷 하나로 캐주얼한 무게감, 아래는 크림으로 눌러줘서 안 튀어', '밑단 롤업해서 스니커즈랑 발목 사이 여백 남겨주면 가벼워져', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-004.jpg', '{"clean":0.7,"cityboy":0.3}'::jsonb, array['캠퍼스','주말카페'], array['summer'], '{"height":"181","build":"slim"}'::jsonb,
  '세이지그린 셔츠재킷에 화이트 티, 라이트올리브 롤업 팬츠', '연한 그린 톤으로 상하의 맞춰서 산뜻하고, 셔츠 걸쳐 입어 레이어가 여름스럽게 가벼워', '셔츠는 오픈해서 걸치고 티는 반만 넣어 라인 정리해줘', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-005.jpg', '{"clean":0.7,"cityboy":0.3}'::jsonb, array['주말카페','저녁약속'], array['summer'], '{"height":"182","build":"slim"}'::jsonb,
  '베이지 오버셔츠에 화이트 티, 크림 팬츠, 블랙 시계', '전체 크림톤에 시계 하나로 포인트, 오픈 셔츠 걸쳐서 무심한 시티보이 결이 나와', '셔츠 풀어 걸치고 손목엔 얇은 시계 하나로 여백 채워줘', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-006.jpg', '{"clean":0.6,"cityboy":0.4}'::jsonb, array['동네','여행'], array['summer'], '{"height":"183","build":"slim"}'::jsonb,
  '라이트블루 셔츠재킷에 화이트 티, 아이보리 와이드 팬츠', '밝은 블루랑 아이보리 조합이 여름 햇살에 시원하게 떨어지고 레이어가 여유로워', '와이드 팬츠엔 셔츠 오픈해서 세로 라인 길게 뽑아줘', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-007.jpg', '{"clean":0.8,"cityboy":0.2}'::jsonb, array['출근','저녁약속'], array['winter'], '{"height":"178","build":"slim"}'::jsonb,
  '베이지 코치재킷에 그레이 맨투맨, 크림 슬랙스', '베이지랑 그레이만 써서 겨울에도 담백하고, 무채+뉴트럴 조합이 깔끔함을 잡아줘', '맨투맨 밑단 살짝 넣어 재킷 안 실루엣 정리하면 깔끔해', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-008.jpg', '{"clean":0.9,"cityboy":0.1}'::jsonb, array['출근','소개팅'], array['winter'], '{"height":"179","build":"slim"}'::jsonb,
  '베이지 하링턴 재킷에 화이트 티, 크림 팬츠', '군더더기 없이 베이지·화이트 두 색으로 끝낸 정핏, 미니멀 그 자체', '재킷 지퍼는 반만 올리고 팬츠는 슬림하게 떨어뜨려 라인 살려줘', true, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-009.jpg', '{"clean":0.7,"classic":0.3}'::jsonb, array['출근','저녁약속'], array['winter'], '{"height":"180","build":"slim"}'::jsonb,
  '세이지 롱코트에 화이트 티, 베이지 슬랙스', '기장 긴 코트가 세로로 떨어져서 차분하고, 딥하지 않은 톤이라 부담 없이 정갈해', '코트 오픈하고 안엔 화이트 티로 비워서 코트 라인만 보여줘', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-010.jpg', '{"clean":0.6,"cityboy":0.4}'::jsonb, array['주말카페','나들이'], array['spring'], '{"height":"181","build":"slim"}'::jsonb,
  '라이트블루 셔츠에 화이트 티, 크림 와이드 팬츠, 화이트 하이탑', '봄볕에 어울리는 밝은 블루 레이어, 오픈 셔츠에 하이탑까지 캐주얼하게 풀어졌어', '셔츠 풀어 걸치고 밑단은 하이탑에 살짝 걸치게 길이 맞춰줘', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-011.jpg', '{"clean":0.7,"soft":0.3}'::jsonb, array['동네','주말카페'], array['spring'], '{"height":"182","build":"slim"}'::jsonb,
  '베이지 셔츠재킷에 그레이 니트, 베이지 와이드 팬츠', '그레이 니트 질감이 포근함을 더하고 베이지로 톤 맞춰서 봄에 편안하게 정돈돼', '니트 밑단 살짝 넣고 셔츠는 걸쳐서 질감 레이어 보여줘', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-012.jpg', '{"clean":0.7,"cityboy":0.3}'::jsonb, array['캠퍼스','나들이'], array['spring'], '{"height":"183","build":"slim"}'::jsonb,
  '세이지그린 셔츠재킷에 화이트 티, 베이지 치노팬츠', '연그린이랑 베이지가 봄 거리랑 잘 붙고, 셔츠 걸침이 여유로운 시티보이 결', '셔츠 오픈하고 티는 반턱해서 상체 라인 정리해줘', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-013.jpg', '{"clean":0.7,"amekaji":0.3}'::jsonb, array['동네','저녁약속'], array['fall'], '{"height":"178","build":"slim"}'::jsonb,
  '카키 셔츠재킷에 화이트 티, 그레이베이지 롤업 팬츠', '카키 흙톤 재킷이 가을 무드를 잡고, 화이트 티로 눌러줘서 정돈된 캐주얼이 돼', '밑단 롤업하고 재킷 오픈해서 안쪽 화이트 여백 살려줘', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-014.jpg', '{"clean":0.7,"cityboy":0.3}'::jsonb, array['주말카페','나들이'], array['fall'], '{"height":"179","build":"slim"}'::jsonb,
  '세이지 블루종에 라이트블루 티, 크림 팬츠', '세이지랑 라이트블루 쿨톤 조합이 가을에도 산뜻하고 정핏이라 깔끔해', '블루종은 오픈해서 티 색 보이게, 팬츠는 스트레이트로 떨어뜨려', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/clean-015.jpg', '{"clean":0.8,"cityboy":0.2}'::jsonb, array['동네','출근'], array['fall'], '{"height":"180","build":"slim"}'::jsonb,
  '크림 셔츠재킷에 그레이 티, 크림 와이드 팬츠', '위아래 크림 톤온톤에 그레이 티만 안에 받쳐서 차분하고 정제된 가을 무드', '셔츠 오픈하고 와이드 팬츠로 세로 라인 길게, 발목은 스니커즈에 살짝 걸쳐줘', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-001.jpg', '{"cityboy":0.7,"clean":0.3}'::jsonb, array['주말카페','동네'], array['summer'], '{"height":"178","build":"slim"}'::jsonb,
  '네이비 오픈 블루종에 화이트 티, 카키 와이드 팬츠', '딥한 네이비 겉옷에 흰 티 대비를 주니 정돈되면서도 캐주얼한 시티보이 결', '블루종은 단추 다 풀어 걸치고 티는 팬츠 안에 살짝만 넣어 밸런스 잡기', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-002.jpg', '{"cityboy":0.6,"soft":0.4}'::jsonb, array['주말카페','데이트'], array['summer'], '{"height":"179","build":"slim"}'::jsonb,
  '브라운 니트 가디건에 크림 티, 그레이 와이드 팬츠', '도톰한 니트 가디건이 포근한 무드를 더해 시티보이에 소프트가 얹힌 느낌', '가디건은 단추 풀고 소매 살짝 접어 니트 질감 강조하기', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-003.jpg', '{"cityboy":0.7,"clean":0.3}'::jsonb, array['동네','나들이'], array['summer'], '{"height":"180","build":"slim"}'::jsonb,
  '머스터드 코치 재킷에 화이트 티, 네이비 와이드 팬츠', '밝은 옐로 겉옷과 딥네이비 팬츠 대비로 산뜻한 포인트가 사는 조합', '재킷 열어 흰 티 보이게 걸치고 팬츠는 발등 살짝 덮게 기장 맞추기', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-004.jpg', '{"cityboy":0.5,"street":0.4,"amekaji":0.1}'::jsonb, array['동네','주말카페'], array['summer'], '{"height":"181","build":"slim"}'::jsonb,
  '러스트 오버핏 후드집업에 화이트 티, 라이트 데님 와이드', '볼륨 큰 후드집업에 워시드 데님이 붙어 스트릿 볼륨이 강해진 캐주얼', '집업 반쯤 열어 흰 티 레이어드, 데님은 넉넉하게 흘려 입기', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-005.jpg', '{"cityboy":0.7,"clean":0.3}'::jsonb, array['동네','나들이'], array['summer'], '{"height":"182","build":"slim"}'::jsonb,
  '네이비 오버셔츠에 화이트 티, 카키 와이드 팬츠', '오버핏 셔츠를 겉옷처럼 걸쳐 레이어감 준 정돈된 시티보이', '셔츠 단추 다 풀고 어깨 넉넉히 떨어뜨려 오버핏 그대로 살리기', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-006.jpg', '{"cityboy":0.7,"amekaji":0.3}'::jsonb, array['동네','주말카페'], array['summer'], '{"height":"183","build":"slim"}'::jsonb,
  '브라운 코치 재킷에 크림 티, 그레이 조거 팬츠', '브라운 워크 무드 겉옷이 흙톤 아메카지 결을 더한 데일리 시티보이', '재킷 열어 걸치고 조거 밑단은 발목에서 살짝 접어 정리하기', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-007.jpg', '{"cityboy":0.6,"soft":0.4}'::jsonb, array['저녁약속','출근'], array['winter'], '{"height":"178","build":"slim"}'::jsonb,
  '베이지 코트에 머스터드 스웨트, 화이트 셔츠, 네이비 팬츠', '코트+스웨트+셔츠 삼중 레이어에 머스터드 포근함이 겨울 시티보이를 완성', '셔츠 카라만 살짝 빼서 목선 포인트 주고 코트는 열어 걸치기', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-008.jpg', '{"cityboy":0.55,"street":0.45}'::jsonb, array['동네','여행'], array['winter'], '{"height":"179","build":"slim"}'::jsonb,
  '오렌지 오버핏 코치 재킷에 크림 티, 라이트 데님 와이드', '큼직한 오렌지 겉옷과 배기 데님이 만나 스트릿 볼륨이 살아난 조합', '재킷은 오버핏 그대로 걸치고 데님은 넉넉히 흘려 볼륨 맞추기', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-009.jpg', '{"cityboy":0.6,"clean":0.2,"street":0.2}'::jsonb, array['저녁약속','동네'], array['winter'], '{"height":"180","build":"slim"}'::jsonb,
  '네이비 오버핏 카코트에 화이트 오버 티, 차콜 와이드 팬츠', '박시한 네이비 코트에 흰 티 볼륨을 겹쳐 묵직하면서 깔끔한 겨울 무드', '코트는 단추 풀고 카라 세워 걸치고 티는 넉넉히 내려 볼륨 살리기', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-010.jpg', '{"cityboy":0.7,"amekaji":0.3}'::jsonb, array['주말카페','나들이'], array['spring'], '{"height":"181","build":"slim"}'::jsonb,
  '브라운 하링턴 재킷에 화이트 티, 그레이 와이드 팬츠', '브라운 겉옷과 버건디 스니커즈로 흙톤을 이어준 봄 시티보이', '재킷 열어 걸치고 신발 컬러로 톤 이어주면 완성도 올라감', true, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-011.jpg', '{"cityboy":0.6,"soft":0.2,"clean":0.2}'::jsonb, array['캠퍼스','주말카페'], array['spring'], '{"height":"182","build":"slim"}'::jsonb,
  '머스터드 오버핏 스웨트에 화이트 셔츠, 네이비 와이드 팬츠', '스웨트 안에 셔츠 카라만 빼주니 포근하면서도 산뜻한 레이어', '셔츠 밑단 살짝 빼서 기장 차이 주고 카라는 스웨트 위로 정리', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-012.jpg', '{"cityboy":0.7,"clean":0.3}'::jsonb, array['동네','나들이'], array['spring'], '{"height":"183","build":"slim"}'::jsonb,
  '오렌지 코치 재킷에 크림 티, 라이트 그레이 팬츠', '밝은 오렌지 겉옷에 뉴트럴 팬츠로 균형 준 산뜻한 봄 캐주얼', '재킷 열어 걸치고 스니커즈 레드 포인트로 톤 살짝 이어주기', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-013.jpg', '{"cityboy":0.5,"clean":0.3,"soft":0.2}'::jsonb, array['동네','캠퍼스'], array['fall'], '{"height":"178","build":"slim"}'::jsonb,
  '네이비 오버핏 스웨트에 화이트 티, 카키 팬츠', '군더더기 없는 스웨트에 흰 티 밑단만 살짝 빼 깔끔·포근을 잡은 조합', '스웨트 밑으로 티 1~2cm만 빼서 레이어감 주고 팬츠는 살짝 접기', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-014.jpg', '{"cityboy":0.5,"soft":0.3,"amekaji":0.2}'::jsonb, array['주말카페','데이트'], array['fall'], '{"height":"179","build":"slim"}'::jsonb,
  '브라운 롱 가디건에 크림 티, 그레이 팬츠', '기장 긴 니트 가디건이 포근함과 흙톤을 동시에 얹어준 가을 무드', '가디건은 풀어 흐름 살리고 티는 안에서 정리해 라인 깔끔하게', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/cityboy-015.jpg', '{"cityboy":0.6,"amekaji":0.2,"clean":0.2}'::jsonb, array['저녁약속','출근'], array['fall'], '{"height":"180","build":"slim"}'::jsonb,
  '베이지 울 재킷에 머스터드 티, 화이트 티, 네이비 플리츠 팬츠', '베이지 워크 재킷에 머스터드 포인트로 흙톤 아메카지를 살짝 낀 시티보이', '머스터드 티 안에 흰 티 밑단 살짝 빼고 재킷은 열어 걸치기', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-001.jpg', '{"street":0.85,"amekaji":0.15}'::jsonb, array['동네','저녁약속'], array['winter'], '{"height":"178","build":"slim"}'::jsonb,
  '올블랙 오버핏 후디에 블랙 카고 팬츠, 블랙 청키 부츠', '위아래 블랙으로 깔맞춤해서 볼륨은 살고 무게감은 딱 잡힌 조합', '비니로 얼굴 위쪽 정리하고 부츠로 밑단 눌러줘야 라인이 산다', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-002.jpg', '{"street":0.7,"amekaji":0.3}'::jsonb, array['동네','주말카페'], array['winter'], '{"height":"179","build":"slim"}'::jsonb,
  '그레이 오버핏 후디에 워시드 다크 카고 데님, 블랙 스니커', '후디의 회색이랑 워시드 데님의 바랜 톤이 자연스럽게 붙는 무드', '팬츠가 볼륨 크니까 밑단은 살짝 접어 신발 위로 떨어뜨려', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-003.jpg', '{"street":0.75,"amekaji":0.15,"cityboy":0.1}'::jsonb, array['동네','여행'], array['winter'], '{"height":"180","build":"slim"}'::jsonb,
  '차콜 오버핏 후디에 블랙 카고 팬츠, 아이보리 청키 스니커', '어두운 상하의에 밝은 신발 하나로 시선 아래로 툭 떨어뜨린 조합', '골목 배경일수록 신발만 밝게 가면 포인트가 확실해진다', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-004.jpg', '{"street":0.8,"amekaji":0.2}'::jsonb, array['동네','나들이'], array['winter'], '{"height":"181","build":"slim"}'::jsonb,
  '블루그레이 후디에 블랙 와이드 카고 팬츠, 화이트 스니커', '차분한 블루그레이 상의에 넓은 카고로 하체 볼륨 확 준 밸런스', '팬츠가 넓으니 상의는 너무 길지 않게 골반쯤에서 끊어줘', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-005.jpg', '{"street":0.85,"amekaji":0.15}'::jsonb, array['동네','저녁약속'], array['summer'], '{"height":"182","build":"slim"}'::jsonb,
  '올블랙 오버핏 후디에 블랙 카고 팬츠, 블랙 스니커', '통짜 블랙에 카고 디테일만 살아있어서 심플한데 안 밋밋한 조합', '올블랙일수록 후디 볼륨 크게 잡아야 답답 안 하고 시원해', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-006.jpg', '{"street":0.75,"amekaji":0.25}'::jsonb, array['동네','주말카페'], array['summer'], '{"height":"183","build":"slim"}'::jsonb,
  '그레이 후디에 워시드 다크 배기 카고, 아이보리 청키 스니커', '바랜 카고의 워시감이랑 그레이 후디가 톤으로 부드럽게 이어짐', '배기 실루엣이라 신발은 볼륨 있는 걸로 무게중심 맞춰줘', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-007.jpg', '{"street":0.8,"amekaji":0.2}'::jsonb, array['동네','출근'], array['summer'], '{"height":"178","build":"slim"}'::jsonb,
  '차콜 오버핏 후디에 다크 카고 조거, 아이보리 러너 스니커', '어두운 상하의를 밝은 러너로 끊어서 무겁지 않게 정리한 조합', '조거 밑단이 좁으니 신발은 살짝 두툼한 걸로 비율 잡아', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-008.jpg', '{"street":0.8,"amekaji":0.2}'::jsonb, array['나들이','여행'], array['spring'], '{"height":"179","build":"slim"}'::jsonb,
  '블루그레이 오버핏 후디에 블랙 와이드 카고, 화이트 청키 스니커', '블루 톤 상의에 블랙 하의로 위아래 대비 준 시원한 조합', '와이드 카고는 신발 덮을 정도로 길이 넉넉히 잡아야 멋있어', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-009.jpg', '{"street":0.85,"amekaji":0.15}'::jsonb, array['동네','저녁약속'], array['spring'], '{"height":"180","build":"slim"}'::jsonb,
  '올블랙 오버핏 후디에 블랙 와이드 카고, 블랙 스니커', '길 한복판에서도 통짜 블랙 볼륨만으로 존재감 잡는 조합', '전신 블랙일 땐 팬츠 밑단 넓게 퍼뜨려 실루엣으로 승부해', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-010.jpg', '{"street":0.75,"amekaji":0.25}'::jsonb, array['동네','주말카페'], array['spring'], '{"height":"181","build":"slim"}'::jsonb,
  '그레이 후디에 워시드 차콜 배기 카고, 화이트 플랫폼 스니커', '바랜 카고의 빈티지한 워시감이 그레이 후디랑 편하게 붙는 무드', '배기 폭 크니까 상의는 골반에서 끊어 다리 길어보이게 해', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-011.jpg', '{"street":0.8,"amekaji":0.2}'::jsonb, array['동네','출근'], array['spring'], '{"height":"182","build":"slim"}'::jsonb,
  '차콜 오버핏 후디에 차콜 카고 팬츠, 아이보리 스니커', '위아래 차콜로 톤 맞추고 밝은 신발로 밑단만 띄운 조합', '톤온톤일수록 소재 다른 카고 넣어야 밋밋하지 않다', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-012.jpg', '{"street":0.8,"amekaji":0.2}'::jsonb, array['동네','저녁약속'], array['fall'], '{"height":"183","build":"slim"}'::jsonb,
  '블루그레이 오버핏 후디에 블랙 와이드 카고, 블랙 로우 스니커', '젖은 거리 배경에 어두운 톤으로 무게 잡은 차분한 조합', '로우 스니커라 팬츠는 밑단 접어 발등 살짝 보이게 정리해', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-013.jpg', '{"street":0.85,"amekaji":0.15}'::jsonb, array['동네','저녁약속'], array['fall'], '{"height":"178","build":"slim"}'::jsonb,
  '올블랙 오버핏 후디에 블랙 카고 팬츠, 블랙 청키 스니커', '루프탑 배경에 통짜 블랙 볼륨으로 각 잡히게 떨어지는 조합', '올블랙은 후디 기장 길게 빼서 상하 경계 없애야 통일감 산다', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-014.jpg', '{"street":0.7,"amekaji":0.3}'::jsonb, array['동네','주말카페'], array['fall'], '{"height":"179","build":"slim"}'::jsonb,
  '그레이 후디에 워시드 차콜 슈퍼배기 카고, 카키 스니커', '바랜 카고의 워시감에 카키 신발까지 흙톤으로 묶은 조합', '슈퍼배기라 상의는 크롭하게 올려 다리 길이 확보해', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/street-015.jpg', '{"street":0.65,"amekaji":0.35}'::jsonb, array['동네','나들이'], array['fall'], '{"height":"180","build":"slim"}'::jsonb,
  '그레이 캡에 차콜 후디, 워시드 브라운그레이 워크 카고, 아이보리 러너', '바랜 워크 카고의 빈티지 톤이 후디랑 흙빛으로 자연스럽게 붙는 조합', '워시드 카고는 밝은 러너로 끊어 무겁지 않게 정리해', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-001.jpg', '{"amekaji":0.8,"cityboy":0.2}'::jsonb, array['동네','주말카페'], array['winter'], '{"height":"178","build":"slim"}'::jsonb,
  '인디고 데님 셔츠자켓에 화이트 티, 탄 치노, 브라운 워크부츠', '청량한 인디고랑 흙톤 탄이 만나 딱 정직한 아메카지 결이 나와', '셔츠자켓은 단추 다 풀고 안에 흰 티 살짝 보이게 걸치면 편해', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-002.jpg', '{"amekaji":0.85,"cityboy":0.15}'::jsonb, array['출근','저녁약속'], array['winter'], '{"height":"179","build":"slim"}'::jsonb,
  '올리브 M-65풍 필드자켓에 샴브레이 셔츠, 블루 진, 브라운 부츠', '올리브랑 인디고 두 톤만으로 밀리터리 워크 무드가 진하게 잡혀', '자켓 열어 샴브레이 레이어 보여주고 청바지는 살짝만 접어 부츠에 걸쳐', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-003.jpg', '{"amekaji":0.85,"cityboy":0.15}'::jsonb, array['동네','주말카페'], array['winter'], '{"height":"180","build":"slim"}'::jsonb,
  '올리브 포켓 필드자켓에 데님 셔츠, 올리브 팬츠, 브라운 워크부츠', '올리브 온톤에 인디고 하나 껴서 차분하면서 워크웨어 느낌 확실해', '위아래 올리브로 맞추고 안쪽 데님으로 포인트 주면 톤이 안 지루해', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-004.jpg', '{"amekaji":0.85,"cityboy":0.15}'::jsonb, array['나들이','주말카페'], array['winter'], '{"height":"181","build":"slim"}'::jsonb,
  '카멜 워크 셔츠자켓에 데님 셔츠, 브라운 팬츠, 브라운 부츠', '카멜·인디고·브라운 다 흙톤이라 가을 낙엽길에 그대로 녹아들어', '워크자켓 안에 데님 셔츠 레이어드하고 벨트로 허리 잡아주면 깔끔해', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-005.jpg', '{"amekaji":0.6,"street":0.4}'::jsonb, array['동네','캠퍼스'], array['winter'], '{"height":"182","build":"slim"}'::jsonb,
  '오버핏 인디고 트러커에 플란넬·화이트 티, 탄 팬츠, 브라운 워크부츠', '넉넉한 데님 트러커 실루엣이라 아메카지에 스트릿 무드가 섞여', '트러커 크게 걸치고 안에 체크 플란넬 카라 빼서 레이어 티 내봐', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-006.jpg', '{"amekaji":0.8,"cityboy":0.2}'::jsonb, array['출근','동네'], array['spring'], '{"height":"183","build":"slim"}'::jsonb,
  '올리브 필드 셔츠자켓에 샴브레이 셔츠, 블루 진, 브라운 부츠', '올리브랑 데님 레이어가 도시 골목이랑 붙으니 정돈된 워크 무드가 나와', '셔츠자켓 열어 걸치고 진은 밑단 한 번 접어 부츠에 살짝 얹어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-007.jpg', '{"amekaji":0.8,"street":0.2}'::jsonb, array['나들이','여행'], array['spring'], '{"height":"178","build":"slim"}'::jsonb,
  '무스탕 카라 올리브 자켓에 체크 플란넬·머스타드 티, 카키 카고, 브라운 부츠', '플리스 카라랑 체크 플란넬, 카고까지 겹쳐 아메카지 레이어가 꽉 찼어', '자켓 안에 플란넬 열어 머스타드 티 보이게 하고 카고는 부츠에 넣어 마무리해', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-008.jpg', '{"amekaji":0.8,"cityboy":0.2}'::jsonb, array['출근','저녁약속'], array['spring'], '{"height":"179","build":"slim"}'::jsonb,
  '탄 워크자켓에 데님 셔츠·화이트 티, 브라운 팬츠, 브라운 더비', '탄·인디고·브라운 흙톤 정리에 더비 하나로 도시적으로 딱 다듬어져', '워크자켓 안에 데님 카라 세워 티랑 겹치고 벨트로 허리 라인 잡아', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-009.jpg', '{"amekaji":0.8,"cityboy":0.2}'::jsonb, array['주말카페','데이트'], array['spring'], '{"height":"180","build":"slim"}'::jsonb,
  '인디고 데님 셔츠자켓에 크림 티, 카멜 팬츠, 브라운 부츠', '인디고랑 크림·카멜이 부드럽게 붙어서 편한데 정돈된 느낌이 같이 나와', '데님 셔츠자켓 단추 풀어 걸치고 카멜 팬츠로 톤 밝혀 무겁지 않게 해', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-010.jpg', '{"amekaji":0.85,"cityboy":0.15}'::jsonb, array['동네','나들이'], array['spring'], '{"height":"181","build":"slim"}'::jsonb,
  '올리브 필드자켓에 샴브레이 셔츠, 딥 인디고 진, 브라운 부츠', '올리브에 진한 인디고까지 딥톤으로 가서 차분하고 묵직한 워크 무드야', '자켓 열어 샴브레이 보이고 벨트로 허리 잡은 뒤 진은 밑단만 살짝 접어', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-011.jpg', '{"amekaji":0.8,"cityboy":0.2}'::jsonb, array['출근','저녁약속'], array['fall'], '{"height":"182","build":"slim"}'::jsonb,
  '올리브 필드자켓에 체크 플란넬·화이트 티, 카키 치노, 브라운 더비', '올리브랑 체크 플란넬 겹치고 더비로 마무리해 워크에 도시 정돈이 붙어', '자켓 안에 플란넬 카라 살짝 빼고 치노는 밑단 접어 더비에 딱 맞춰', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-012.jpg', '{"amekaji":0.85,"cityboy":0.15}'::jsonb, array['동네','주말카페'], array['fall'], '{"height":"183","build":"slim"}'::jsonb,
  '브라운 워크자켓에 데님 셔츠·크림 티, 브라운 팬츠, 브라운 부츠', '브라운 온톤에 인디고 하나 껴서 가을 흙톤이 진하게 정리돼', '워크자켓 안에 데님 열어 크림 티 보이게 3겹 레이어로 깊이 줘', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-013.jpg', '{"amekaji":0.65,"street":0.35}'::jsonb, array['나들이','여행'], array['fall'], '{"height":"178","build":"slim"}'::jsonb,
  '오버핏 인디고 트러커에 크림 티, 카멜 팬츠 롤업, 브라운 워크부츠', '넉넉한 트러커에 카멜 팬츠라 낙엽길 배경에서 아메카지에 스트릿이 섞여', '트러커 크게 걸치고 카멜 팬츠 밑단 두껍게 접어 부츠 위로 볼륨 줘', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-014.jpg', '{"amekaji":0.8,"cityboy":0.2}'::jsonb, array['출근','동네'], array['fall'], '{"height":"179","build":"slim"}'::jsonb,
  '올리브 필드자켓에 샴브레이 셔츠·티, 인디고 진 롤업, 브라운 부츠', '올리브랑 샴브레이 인디고가 도시 골목에서 차분한 워크 무드로 딱 맞아', '자켓 열어 샴브레이 레이어 보이고 진 밑단 접어 부츠에 얹어 마무리해', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/amekaji-015.jpg', '{"amekaji":0.8,"cityboy":0.2}'::jsonb, array['출근','저녁약속'], array['fall'], '{"height":"180","build":"slim"}'::jsonb,
  '탄 워크자켓에 인디고 데님 셔츠, 카키 팬츠, 브라운 더비', '탄·인디고·카키 흙톤 정리에 재팬 골목 배경이라 도시 캐주얼 결이 살아', '워크자켓 안에 데님 카라 세워 겹치고 팬츠는 밑단 접어 더비에 맞춰', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-001.jpg', '{"classic":0.6,"clean":0.25,"soft":0.15}'::jsonb, array['출근','저녁약속'], array['winter'], '{"height":"178","build":"slim"}'::jsonb,
  '차콜 블레이저에 오트밀 니트, 카키 슬랙스, 브라운 로퍼', '딱딱한 셔츠 대신 니트를 받쳐서 테일러링이 부드럽게 풀렸어', '블레이저 단추는 풀고 걸치듯 입어서 힘 빼는 게 포인트', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-002.jpg', '{"classic":0.7,"cityboy":0.3}'::jsonb, array['저녁약속','데이트'], array['winter'], '{"height":"179","build":"slim"}'::jsonb,
  '네이비 롱코트에 다크 브이넥, 그레이 슬랙스, 브라운 더비', '코트를 걸치고 도심을 걸으니 어른스러운 무드가 확 산다', '코트는 팔 안 끼고 어깨에 걸쳐서 실루엣을 길게 뽑아', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-003.jpg', '{"classic":0.6,"soft":0.25,"clean":0.15}'::jsonb, array['주말카페','나들이'], array['winter'], '{"height":"180","build":"slim"}'::jsonb,
  '카키 코트에 아이보리 니트폴로, 브라운 슬랙스, 블랙 더비', '그린과 브라운 딥톤을 맞춰서 차분하고 고급진 느낌', '니트폴로 단추 살짝 풀고 크롭 기장 슬랙스로 발목 보여줘', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-004.jpg', '{"classic":0.55,"clean":0.3,"soft":0.15}'::jsonb, array['출근','저녁약속'], array['winter'], '{"height":"181","build":"slim"}'::jsonb,
  '카멜 코트에 그레이 니트, 차콜 슬랙스, 블랙 로퍼', '카멜과 차콜의 대비가 심플한데 존재감 있게 정돈됐어', '코트 안은 미니멀하게, 색은 세 가지 안으로 딱 묶어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-005.jpg', '{"classic":0.55,"clean":0.3,"street":0.15}'::jsonb, array['저녁약속','동네'], array['winter'], '{"height":"182","build":"slim"}'::jsonb,
  '차콜 블레이저에 블랙 티, 그레이 플리츠 슬랙스, 블랙 로퍼', '셔츠 대신 검정 티를 넣어서 격식은 낮추고 시크함은 올렸어', '셋업 톤을 맞추되 안은 티로 캐주얼하게 힘 빼기', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-006.jpg', '{"classic":0.5,"clean":0.35,"soft":0.15}'::jsonb, array['여행','주말카페'], array['summer'], '{"height":"183","build":"slim"}'::jsonb,
  '네이비 오버 블레이저에 화이트 티, 그레이 슬랙스, 블랙 로퍼', '여름에 화이트 티로 가볍게 받쳐서 테일러링이 안 답답해', '블레이저는 오버핏으로 걸치고 티는 살짝 넣어 밸런스 잡아', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-007.jpg', '{"classic":0.6,"amekaji":0.25,"clean":0.15}'::jsonb, array['출근','나들이'], array['fall'], '{"height":"178","build":"slim"}'::jsonb,
  '카키 블레이저에 아이보리 니트폴로, 브라운 슬랙스, 레더 벨트', '흙톤 브라운에 레더 벨트로 포인트 줘서 가을 무드 제대로', '벨트 노출되게 니트폴로 넣어 입고 딥톤끼리 매치해', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-008.jpg', '{"classic":0.65,"cityboy":0.35}'::jsonb, array['저녁약속','데이트'], array['fall'], '{"height":"179","build":"slim"}'::jsonb,
  '카멜 코트에 네이비 니트폴로, 그레이 슬랙스, 브라운 더비', '카멜 코트에 네이비를 받치니 딥한 색 대비가 세련돼', '코트 열어 입고 안쪽 니트폴로로 차분한 레이어드', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-009.jpg', '{"classic":0.7,"clean":0.3}'::jsonb, array['출근','저녁약속'], array['fall'], '{"height":"180","build":"slim"}'::jsonb,
  '그레이 셋업 블레이저에 화이트 셔츠, 매칭 슬랙스, 블랙 로퍼', '톤온톤 그레이 셋업이라 미니멀하면서 격식 딱 맞아', '셋업은 색 맞춰 입고 안은 흰 셔츠로 깔끔하게', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-010.jpg', '{"classic":0.6,"clean":0.25,"soft":0.15}'::jsonb, array['저녁약속','동네'], array['fall'], '{"height":"181","build":"slim"}'::jsonb,
  '네이비 블레이저에 아이보리 니트폴로, 차콜 슬랙스, 브라운 로퍼', '네이비와 차콜 딥톤에 아이보리로 밝기 줘서 균형 좋아', '블레이저 걸치고 니트폴로 단추 풀어 여유롭게', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-011.jpg', '{"classic":0.65,"amekaji":0.2,"clean":0.15}'::jsonb, array['나들이','주말카페'], array['fall'], '{"height":"182","build":"slim"}'::jsonb,
  '그린 블레이저에 화이트 셔츠, 브라운 슬랙스, 블랙 로퍼', '딥그린에 브라운 조합이 프레피하면서 안 흔한 색감', '셔츠 단추 목까지 채우고 크롭 슬랙스로 발목 보여줘', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-012.jpg', '{"classic":0.6,"cityboy":0.25,"clean":0.15}'::jsonb, array['출근','저녁약속'], array['spring'], '{"height":"183","build":"slim"}'::jsonb,
  '카멜 블레이저에 네이비 셔츠, 차콜 플리츠 슬랙스, 블랙 로퍼', '카멜과 네이비 대비에 플리츠로 클래식 감도를 높였어', '셔츠 안 넣고 자연스럽게, 블레이저는 걸치듯 입어', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-013.jpg', '{"classic":0.55,"clean":0.3,"soft":0.15}'::jsonb, array['출근','주말카페'], array['spring'], '{"height":"178","build":"slim"}'::jsonb,
  '차콜 블레이저에 오프화이트 니트, 그레이 플리츠 슬랙스, 블랙 로퍼', '차분한 무채색에 니트로 포근함 더해 봄에 딱 좋아', '블레이저 단추 풀고 니트 밑단 살짝 보이게 레이어드', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-014.jpg', '{"classic":0.55,"clean":0.3,"cityboy":0.15}'::jsonb, array['데이트','저녁약속'], array['spring'], '{"height":"179","build":"slim"}'::jsonb,
  '네이비 블레이저에 화이트 브이넥, 차콜 슬랙스, 포켓치프', '포켓치프 하나로 캐주얼한데 격식 있는 무드가 완성돼', '안은 흰 티로 가볍게, 치프로 디테일만 살짝 넣어', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/classic-015.jpg', '{"classic":0.5,"clean":0.3,"soft":0.2}'::jsonb, array['나들이','주말카페'], array['spring'], '{"height":"180","build":"slim"}'::jsonb,
  '딥그린 블레이저에 아이보리 니트, 카멜 와이드 슬랙스, 블랙 몽크', '그린과 카멜 딥톤에 와이드 실루엣이라 여유롭고 무드 있어', '슬랙스 밑단 롤업하고 니트로 포근하게 받쳐 입어', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-001.jpg', '{"soft":0.7,"clean":0.3}'::jsonb, array['주말카페','데이트'], array['winter'], '{"height":"178","build":"slim"}'::jsonb,
  '크림 니트 위에 오트밀 니트 코트, 베이지 와이드 슬랙스', '톤온톤 크림 조합이라 포근하면서 깔끔해', '니트에 니트 코트 겹쳐서 부피감 주고 하의는 톤 맞춰 정돈', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-002.jpg', '{"soft":0.6,"clean":0.4}'::jsonb, array['동네','저녁약속'], array['winter'], '{"height":"179","build":"slim"}'::jsonb,
  '세이지 니트에 같은 색 니트 가디건, 크림 슬랙스', '세이지 톤온톤에 크림 하의라 차분하고 부드러워', '가디건 풀어 열고 니트 겹쳐 편하게, 브라운 부츠로 마무리', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-003.jpg', '{"soft":0.6,"clean":0.4}'::jsonb, array['동네','출근'], array['winter'], '{"height":"180","build":"slim"}'::jsonb,
  '파우더블루 니트 가디건에 베이지 슬랙스', '차분한 블루에 뉴트럴 하의라 담백하고 클린해', '단추 채운 가디건에 밑단 롤업 슬랙스로 깔끔하게', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-004.jpg', '{"soft":0.7,"clean":0.3}'::jsonb, array['나들이','주말카페'], array['winter'], '{"height":"181","build":"slim"}'::jsonb,
  '라일락 니트 집업에 카키 베이지 슬랙스', '라일락 파스텔이 포인트라 부드럽고 산뜻해', '오버핏 니트 집업 열어 안에 셔츠 살짝, 로퍼로 정돈', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-005.jpg', '{"soft":0.55,"clean":0.45}'::jsonb, array['주말카페','데이트'], array['summer'], '{"height":"182","build":"slim"}'::jsonb,
  '크림 케이블 니트 가디건에 베이지 와이드 슬랙스', '크림 톤온톤이라 깔끔하고 포근한 느낌', '안에 흰 티 받쳐 레이어링하고 브라운 슈즈로 톤 맞춰', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-006.jpg', '{"soft":0.8,"clean":0.2}'::jsonb, array['동네','저녁약속'], array['summer'], '{"height":"183","build":"slim"}'::jsonb,
  '세이지 청키 케이블 니트에 크림 와이드 슬랙스', '두꺼운 케이블 짜임이 히어로라 포근함이 확 살아', '니트를 하의에 살짝 걸치고 로퍼로 깔끔하게 마무리', true, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-007.jpg', '{"soft":0.6,"clean":0.4}'::jsonb, array['여행','동네'], array['summer'], '{"height":"178","build":"slim"}'::jsonb,
  '파우더블루 케이블 니트에 라이트그레이 슬랙스', '연한 블루에 그레이라 시원하고 담백해', '니트에 밑단 롤업 슬랙스, 화이트 스니커로 산뜻하게', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-008.jpg', '{"soft":0.65,"amekaji":0.2,"clean":0.15}'::jsonb, array['동네','출근'], array['spring'], '{"height":"179","build":"slim"}'::jsonb,
  '라벤더 니트에 베이지 와이드 슬랙스', '파스텔 니트에 흙톤 슬랙스라 부드러움에 무게감 더해', '안에 셔츠 카라 빼서 레이어링, 로퍼로 정돈', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-009.jpg', '{"soft":0.55,"amekaji":0.3,"clean":0.15}'::jsonb, array['나들이','캠퍼스'], array['spring'], '{"height":"180","build":"slim"}'::jsonb,
  '크림 케이블 니트에 브라운 슬랙스', '크림 니트에 흙톤 하의라 포근하면서 캐주얼해', '안에 흰 티 살짝 빼주고 브라운 부츠로 톤 이어가', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-010.jpg', '{"soft":0.7,"clean":0.3}'::jsonb, array['동네','주말카페'], array['spring'], '{"height":"181","build":"slim"}'::jsonb,
  '세이지 케이블 니트 가디건에 크림 슬랙스', '세이지에 크림이라 봄답게 화사하고 부드러워', '단추 채운 카라 가디건에 흰 티 받쳐 깔끔하게', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-011.jpg', '{"soft":0.55,"clean":0.45}'::jsonb, array['여행','주말카페'], array['spring'], '{"height":"182","build":"slim"}'::jsonb,
  '파우더블루 케이블 니트에 화이트 와이드 팬츠', '블루에 화이트라 깨끗하고 시원한 느낌', '넉넉한 니트에 와이드 팬츠, 화이트 스니커로 클린하게', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-012.jpg', '{"soft":0.65,"amekaji":0.2,"clean":0.15}'::jsonb, array['저녁약속','데이트'], array['fall'], '{"height":"183","build":"slim"}'::jsonb,
  '라일락 니트 가디건에 브라운 슬랙스', '라일락에 흙톤 하의라 부드럽고 따뜻한 무드', '안에 크림 셔츠 받쳐 카라 살리고 로퍼로 정돈', false, 0.571
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-013.jpg', '{"soft":0.55,"clean":0.45}'::jsonb, array['동네','출근'], array['fall'], '{"height":"178","build":"slim"}'::jsonb,
  '크림 케이블 니트 가디건에 베이지 슬랙스', '크림 톤온톤이라 담백하고 정갈해', '안에 셔츠 받쳐 카라 빼고 화이트 스니커로 깔끔하게', false, 0.8
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-014.jpg', '{"soft":0.7,"clean":0.3}'::jsonb, array['주말카페','나들이'], array['fall'], '{"height":"179","build":"slim"}'::jsonb,
  '세이지 케이블 니트 가디건에 크림 와이드 팬츠', '세이지에 크림이라 부드럽고 편안한 가을 무드', '안에 카키 티 받쳐 톤 맞추고 블랙 로퍼로 포인트', false, 0.75
);

insert into photos (image_url, mood_vector, situations, seasons, body_spec, caption_item, caption_why, caption_how, is_flagship, aspect_ratio) values (
  'moods/soft-015.jpg', '{"soft":0.6,"clean":0.4}'::jsonb, array['동네','캠퍼스'], array['fall'], '{"height":"180","build":"slim"}'::jsonb,
  '파우더블루 케이블 니트에 라이트베이지 슬랙스', '연블루에 베이지라 차분하고 깔끔한 느낌', '넉넉한 니트에 밑단 롤업 슬랙스, 브라운 로퍼로 마무리', false, 0.8
);
