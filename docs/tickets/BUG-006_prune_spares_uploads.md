# BUG-006: prune 이 유저 업로드 행을 삭제한다

`apply-photos.ts` 의 구 행 정리(prune)가 삭제 대상을 시드 경로로 한정하게 한다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | BUG |
| Status | In Progress |
| 우선순위 | P0 |
| Layer | Script / Data |
| Related | #19 FEAT-013, #20 |

---

## Problem

- **현재 동작**: prune 이 "신 세트 목록에 없는 행 = 구 행"으로 판정한다. `keep` 에
  `moods/*` 만 담기므로 `uploads/*` 행이 전부 삭제 대상이 된다. 프로덕션 `uploads/` 가
  0행이라 아직 터지지 않았고, 유저가 사진을 올린 뒤 스크립트를 실행하면 터진다.
- **기대 동작**: 시드(`moods/`) 행만 교체 대상이고 유저 업로드는 보존된다.
- **영향 범위**: `photos` 의 `uploads/` 행. Storage 파일은 남고 DB 행만 사라져 앱에서
  안 보이는 고아가 되며, `mood_vector`·`caption_*` 이 Claude 채점 결과라 복구에 재채점
  비용이 든다.

---

## Context

```
관련 파일:
- scripts/apply-photos.ts:80-92 (prune 분기, 기본값이 삭제)
- src/lib/upload.ts:8 (UPLOAD_BUCKET = "uploads")
```

### 왜 drift 했나

Storage 는 `moods`·`uploads` 두 버킷으로 갈라져 있다. 시드는 `scripts/upload.ts` 가
`service_role` 로 올리고, 유저 업로드는 로그인 유저가 anon 키로 올려 `storage.objects`
INSERT 정책이 따로 필요해서다. 그런데 `photos` 테이블은 하나고, 거기서는 경로 접두사가
유일한 구분자다. prune 이 그 접두사를 보지 않아 **Storage 의 분리가 DB 에서 무효**가 된다.

`apply-photos.ts` 는 "`photos` 에는 시드만 있다"는 전제로 맞게 쓰인 코드다 — 작성 시점
2026-09-10 에는 업로드 기능이 없었다. 그 전제를 깬 쪽이 FEAT-013(#19)이라 `scripts/` 가
케빈 영역임에도 이쪽에서 가져왔다(#20 인라인 코멘트에 답글로 알림).

### 실행 검증을 하지 않는 이유

`--only`·`--no-prune` 둘 다 prune 분기를 건너뛰고(`:81`) dry-run 플래그도 없어, 실행
검증은 프로덕션에 `uploads/` 더미를 넣고 전 구간을 돌리는 방법밖에 없다. 하지만 이
변경의 인과 경로는 6줄로 전부 드러난다 — `keep` 생성 1곳(`:82`), `stale` 생성 1곳
(`:85`), 삭제 1곳(`:89`)이고 `update`·`insert` 는 `moods/{f}.jpg` 로 한정된다(`:70`,
`:73`). 삭제 대상이 `stale` 뿐이고 숨은 경로가 없다.

더미를 넣고 돌려도 "이번 실행에서 행 1개가 안 지워졌다"만 확인되는데, 그 대가로 팀 공용
프로덕션에 쓰기 121건(upsert 120 + 더미 1)이 일어난다. 실제 E2E 는 다음에 업로드가 있는
상태로 스크립트를 돌릴 때 자연히 생기므로 인위적으로 만들지 않는다.

---

## Scope

### 포함

1. `scripts/apply-photos.ts:85` — `stale` 판정에 `moods/` 접두사 조건 추가
2. `scripts/apply-photos.ts:2` — 헤더 주석 정정. `delete 없음 → id·FK 보존` 이 #20 이후
   사실과 다르다

### 제외

- Storage 의 v2 고아 파일 94장 정리 — 별도
- `--no-prune` 기본값 전환 — 전면 교체가 이 스크립트의 정상 용도라 유지
- `products.photo_image_url` 고아 90건 — BUG-006

---

## Verification

1. `stale` 필터 단위 확인 — 더미 3행(구 시드·신 시드·업로드) 중 수정 전 2건, 수정 후
   `moods/amekaji-001.jpg` 1건만 삭제 대상
2. 삭제 경로가 1곳뿐임 확인 — `grep` 으로 `.delete(` 1건(`:89`), 대상은 `stale` 뿐.
   `update`·`insert` 는 `img = moods/{f}.jpg` 로 한정(`:70`, `:73`)
3. `npx tsc --noEmit` 통과

---

## Implementation Notes

_(구현 완료 후 작성)_
