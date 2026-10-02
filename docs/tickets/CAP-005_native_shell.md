# CAP-005: 네이티브 셸 (SafeArea, StatusBar, 스플래시)

Capacitor 앱의 네이티브 셸 요소 — 노치/하단바 대응(SafeArea), 상태바 스타일, 스플래시 스크린 설정.

---

## Metadata

| Key | Value |
|-----|-------|
| Prefix | CAP |
| Type | FEAT |
| Severity | Major |
| Layer | infra |
| Milestone | MS-00 |
| Status | Done |
| 예상h | 1 |
| 우선순위 | P0 |
| Depends | CAP-002 |
| Related | CAP-004 |

---

## Problem

- **현재 동작**: 웹 배포 기준이라 SafeArea, StatusBar, 스플래시 스크린이 없음. 네이티브 앱에서 콘텐츠가 노치/하단바에 가려짐.
- **기대 동작**: 노치/Dynamic Island/하단 홈 인디케이터 영역을 자동으로 피함. 상태바 색상이 앱 테마와 일치. 앱 시작 시 스플래시 표시.

---

## Scope

### 포함

- `@capacitor/status-bar` — 상태바 스타일 (라이트/다크)
- `@capacitor/splash-screen` — 앱 로딩 중 표시할 스플래시 이미지
- CSS `env(safe-area-inset-*)` 적용 — 하단 내비게이션 바에 패딩
- `viewport-fit=cover` 메타 태그 추가

### 제외

- 앱 아이콘 디자인 (별도 디자인 작업)
- 앱 스토어 스크린샷/메타데이터

---

## Strategy

### Step 1: StatusBar 플러그인

```bash
npm install @capacitor/status-bar
```

앱 초기화 시 `StatusBar.setStyle({ style: Style.Light })` 호출.

### Step 2: Splash Screen 플러그인

```bash
npm install @capacitor/splash-screen
```

`capacitor.config.ts`에 스플래시 설정 추가. 기본 런치 스크린 이미지 배치.

### Step 3: SafeArea CSS

레이아웃 컴포넌트(`layout.tsx`)에 SafeArea 패딩 적용:

```css
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

하단 내비게이션 바(`BottomNav` 등)에 SafeArea 반영.

### Step 4: viewport-fit 메타 태그

`layout.tsx`의 `<meta name="viewport">`에 `viewport-fit=cover` 추가.

---

## Acceptance Criteria

- [ ] iOS 시뮬레이터에서 콘텐츠가 노치/하단 영역에 가려지지 않음
- [ ] 상태바 텍스트 색상이 앱 배경과 대비됨
- [ ] 앱 시작 시 스플래시 스크린 표시 후 홈 화면 전환
- [ ] 하단 내비게이션 바가 홈 인디케이터와 겹치지 않음

---

## Testing Rules

- [ ] iPhone 시뮬레이터 (노치 있는 모델)에서 SafeArea 확인
- [ ] 앱 콜드 스타트 시 스플래시 → 홈 전환 확인

---

## Implementation Notes

### 완료 항목

1. **viewport-fit=cover**: `layout.tsx` Viewport 설정에 추가 — `env(safe-area-inset-*)` 활성화
2. **SafeArea 상단**: TopBar, SearchScreen, VideoSearch의 `pt`를 `pt-[max(1.25rem,env(safe-area-inset-top))]`으로 교체
3. **SafeArea 하단**: TabBar에 기존 `pb-[env(safe-area-inset-bottom)]` 유지 확인
4. **StatusBar**: `@capacitor/status-bar@8.0.3` — Light 스타일 (밝은 배경에 다크 텍스트)
5. **Splash Screen**: `@capacitor/splash-screen@8.0.2` — 배경색 #FAFAF8, `launchAutoHide: false` (CapacitorInit에서 수동 hide)
6. **CapacitorInit 컴포넌트**: 앱 시작 시 StatusBar 스타일 설정 + 스플래시 숨김, 웹에서는 no-op
7. 시뮬레이터에서 노치/하단 인디케이터 대응 확인
