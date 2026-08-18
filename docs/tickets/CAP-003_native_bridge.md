# CAP-003: 네이티브 브릿지 (Haptics, Browser, Camera)

웹 API 또는 시뮬레이션으로 대체 중인 기능을 Capacitor 네이티브 플러그인으로 교체. 앱 안에서 네이티브 경험 제공.

---

## Metadata

| Key | Value |
|-----|-------|
| Prefix | CAP |
| Type | FEAT |
| Severity | Major |
| Layer | frontend |
| Milestone | MS-00 |
| Status | Done |
| 예상h | 2 |
| 우선순위 | P0 |
| Depends | CAP-002 |
| Related | CAP-001 |

---

## Problem

- **현재 동작**: 터치 피드백 없음(진동), 외부 링크가 인앱이 아닌 시스템 브라우저로 열림, 카메라 접근은 HTML `<input type="file">` 의존.
- **기대 동작**: 네이티브 haptics(진동), 인앱 브라우저, 네이티브 카메라 접근.

---

## Scope

### 포함

- `@capacitor/haptics` — 하트 탭, 저장 등 인터랙션에 진동 피드백
- `@capacitor/browser` — 상품 외부 링크를 인앱 브라우저로 열기
- `@capacitor/camera` — 스크린샷 분석(`/scan`) 페이지에서 네이티브 카메라/갤러리 접근
- 각 플러그인의 웹 폴백 처리 (웹에서 실행 시 네이티브 기능 없이 동작)

### 제외

- Push Notification (현재 요구사항 없음)
- Geolocation (현재 요구사항 없음)
- 카메라 촬영 후 AI 분석 로직 (기존 `/scan` 로직 유지)

---

## Strategy

### Step 1: 플러그인 설치

```bash
npm install @capacitor/haptics @capacitor/browser @capacitor/camera
npx cap sync
```

### Step 2: Haptics 적용

하트/저장 인터랙션에 `Haptics.impact()` 호출 추가. 웹에서는 no-op.

### Step 3: Browser 적용

상품 링크 클릭 시 `Browser.open({ url })` 사용. 웹에서는 `window.open` 폴백.

### Step 4: Camera 적용

`/scan` 페이지의 이미지 입력을 `Camera.getPhoto()` 로 교체. 웹에서는 기존 `<input>` 유지.

---

## Acceptance Criteria

- [ ] 하트/저장 탭 시 디바이스 진동 발생 (시뮬레이터에서 로그 확인)
- [ ] 상품 링크 탭 시 인앱 브라우저로 열림
- [ ] `/scan`에서 카메라/갤러리 접근 가능
- [ ] 웹 브라우저에서 실행 시 에러 없이 폴백 동작

---

## Testing Rules

- [ ] iOS 시뮬레이터에서 각 네이티브 기능 동작 확인
- [ ] 웹 브라우저(`localhost`)에서 에러 없이 폴백 동작 확인

---

## Implementation Notes

### 완료 항목

1. **@capacitor/haptics@8.0.2**: `src/lib/haptic.ts` — `navigator.vibrate()` → `Haptics.impact(Light)`, 웹 폴백 유지
2. **@capacitor/browser@8.0.4**: `src/lib/browser.ts` 유틸 생성 — `openExternal(url)` (네이티브: 인앱 브라우저, 웹: `window.open`)
   - `ProductRow.tsx`: `window.open()` → `openExternal()`
   - `LookCard.tsx`: `<a target="_blank">` → `<button onClick={openExternal}>`
3. **@capacitor/camera@8.2.2**: `ShotFinder.tsx` — 네이티브: `Camera.getPhoto(Prompt)`, 웹: 기존 `<input type="file">` 유지
4. 모든 플러그인에 `Capacitor.isNativePlatform()` 분기로 웹 호환성 보장
5. 시뮬레이터 빌드 + 실행 확인 (크래시 없음)
