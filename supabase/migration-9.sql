-- #9 구매 후 여정 마이그레이션

-- 1) 입는 법 1줄 (원본 소환 화면 ③). 값 없으면 앱에서 미표시.
alter table photos add column if not exists caption_how text;

-- 2) user_actions 에 'worn'(입었어) 액션 추가 — 체크 제약 갱신
--    기존 제약명이 다르면 실제 제약명으로 교체하세요.
alter table user_actions drop constraint if exists user_actions_action_check;
alter table user_actions add constraint user_actions_action_check
  check (action in ('view','save','search','scan_like','buy_out','worn','discover','new_feel'));

-- 참고: 앱은 로컬(localStorage)로 caption_how·worn 을 이미 처리.
--   DB 연동 시 photos.caption_how 를 원본 소환 ③에, user_actions(worn) 을 [입었어] 탭에 기록.
