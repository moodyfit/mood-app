# CAP-004: 폰트 로컬 번들링 + 오프라인 대응

CDN 폰트를 로컬 번들로 전환하고, Capacitor 앱에서 오프라인 상태일 때 기본 UI가 깨지지 않도록 처리.

---

## Metadata

| Key | Value |
|-----|-------|
| Prefix | CAP |
| Type | FEAT |
| Severity | Minor |
| Layer | frontend |
| Milestone | MS-00 |
| Status | Backlog |
| 예상h | 1 |
| 우선순위 | P0 |
| Depends | CAP-001 |
| Related | CAP-005 |

---

## Problem

- **현재 동작**: 폰트가 Google Fonts CDN에서 로드됨. 오프라인 시 폰트가 깨지고 FOUT 발생.
- **기대 동작**: 폰트가 앱 번들에 포함되어 오프라인에서도 즉시 렌더링. 데이터 페칭 실패 시 빈 상태 UI 표시.

---

## Scope

### 포함

- 사용 중인 웹폰트를 `public/fonts/`에 로컬 저장
- `@font-face` 선언을 로컬 경로로 변경
- Supabase 데이터 페칭 실패 시 빈 상태 UI (로딩 스피너 + "연결 확인" 메시지)
- `next/font` 또는 직접 `@font-face` 사용 판단

### 제외

- Service Worker (Capacitor WebView에서 불필요)
- 오프라인 데이터 캐시 (IndexedDB 등 — 과설계)
- PWA manifest

---

## Strategy

### Step 1: 현재 폰트 사용 현황 파악

글로벌 CSS 또는 `_document`/`layout.tsx`에서 폰트 로드 방식 확인.

### Step 2: 폰트 파일 로컬화

WOFF2 파일을 `public/fonts/`에 저장하고, CSS `@font-face`를 로컬 경로로 변경.

### Step 3: 오프라인 빈 상태 처리

데이터 훅(CAP-001에서 생성)의 에러 상태에 "인터넷 연결을 확인해줘" 메시지 추가.

---

## Acceptance Criteria

- [ ] 네트워크 차단 상태에서 앱 실행 시 폰트가 정상 렌더링
- [ ] 네트워크 차단 상태에서 데이터 로드 실패 시 빈 상태 UI 표시 (크래시 없음)
- [ ] CDN 폰트 요청이 발생하지 않음 (DevTools Network 탭 확인)

---

## Testing Rules

- [ ] 시뮬레이터에서 비행기 모드 → 앱 실행 → 폰트 정상 확인
- [ ] 데이터 로드 실패 시 빈 상태 UI 표시 확인

---

## Implementation Notes

_(구현 후 기록)_
