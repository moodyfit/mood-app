# FEAT-036: 회원 탈퇴

나의 공간에서 회원이 직접 탈퇴하고, 계정과 회원 데이터가 삭제되게 한다.

---

## Metadata

| Key | Value |
|-----|-------|
| Type | FEAT |
| Status | Todo |
| 우선순위 | P1 |
| Layer | Page / DB |
| Related | FEAT-033 |

---

## Problem

- **현재 동작**: 앱 안에 탈퇴 기능이 없다. 처리방침 · 약관(FEAT-033)은 탈퇴를 이메일로 받는다고 적어 두었다
- **기대 동작**: 나의 공간에서 탈퇴하면 계정, 이용 기록, 취향, 올린 사진이 삭제된다
- **영향 범위**: 나의 공간 화면, Supabase Auth · `events` · `user_taste` · `photos` · Storage `uploads`

---

## Context

```
관련 파일:
- src/app/space/page.tsx            로그아웃 버튼 위치(탈퇴 진입점 후보)
- src/lib/store.tsx:501             signOut
- src/app/api/photos/tag/route.ts   photos.uploaded_by 기록
- src/app/privacy/page.tsx          제3조 · 제8조
- src/app/terms/page.tsx            제12조
```

### 서버 권한

Auth 사용자 삭제는 service role이 필요하다. API Route는 `build:cap`에서 빠지므로 앱에서도 쓰려면 API Route가 아닌 방법이 필요하다(CLAUDE.md Capacitor 주의).

---

## Scope

### 포함

1. 나의 공간 — 탈퇴 버튼 + 확인 단계
2. 삭제 — Auth 사용자, 해당 user_id의 `events` · `user_taste` · `photos` 행, Storage `uploads` 파일
3. 탈퇴 후 로그아웃 · 익명 신원 복귀
4. 처리방침 제8조 · 약관 제12조 문구를 앱 내 탈퇴에 맞게 수정

### 제외

- 올린 사진 개별 삭제 — 별도 티켓

---

## 결정

- 삭제 실행 위치: `security definer` DB 함수(RPC). 앱 빌드에는 API Route가 없어 서버 대신 DB 함수가 본인 행만 지운다. FEAT-035와 같은 방식(서영이 대시보드에서 실행 · 티켓에 기록). BE(NestJS) 착수 후 탈퇴 API로 옮긴다
- (대기) 화면 구성 — 구현 전 md 도식으로 확인

---

## Acceptance Criteria

- [ ] 탈퇴 후 같은 이메일로 로그인되지 않는다
- [ ] 탈퇴 즉시 그 user_id의 `events` · `user_taste` 행이 남지 않는다(1년 파기 크론이 비회원으로 다루지 않도록)
- [ ] 탈퇴한 회원의 사진이 홈 · 검색에 나오지 않는다
- [ ] 웹과 앱 빌드에서 모두 동작한다

---

## Verification

1. `tsc --noEmit`: (대기)
2. `npm run build` · `npm run build:cap`: (대기)
3. 테스트 계정 탈퇴 후 DB · Storage 잔존 행: (대기)

---

## Implementation Notes
