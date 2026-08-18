# CAP-002: Capacitor 초기화 + iOS/Android 프로젝트 생성

CAP-001의 정적 빌드 출력(`out/`)을 Capacitor가 인식하도록 초기화하고, iOS/Android 네이티브 프로젝트를 생성.

---

## Metadata

| Key | Value |
|-----|-------|
| Prefix | CAP |
| Type | FEAT |
| Severity | Critical |
| Layer | infra |
| Milestone | MS-00 |
| Status | Done |
| 예상h | 1 |
| 우선순위 | P0 |
| Depends | CAP-001 |
| Related | CAP-003, CAP-005 |

---

## Problem

- **현재 동작**: Next.js 프로젝트가 Vercel에 웹 배포만 지원. 네이티브 앱 빌드 불가.
- **기대 동작**: `npx cap sync` → Xcode/Android Studio에서 네이티브 앱 빌드 가능.
- **영향 범위**: 프로젝트 루트 (`capacitor.config.ts`, `ios/`, `android/`)

---

## Scope

### 포함

- `@capacitor/core`, `@capacitor/cli` 설치
- `capacitor.config.ts` 생성 (appId, appName, webDir: `out`)
- `@capacitor/ios`, `@capacitor/android` 설치
- `npx cap add ios` / `npx cap add android`
- `npx cap sync` 실행 확인
- `.gitignore`에 iOS/Android 빌드 산출물 패턴 추가

### 제외

- 네이티브 플러그인 설치 (→ CAP-003)
- 스플래시/SafeArea 설정 (→ CAP-005)
- 앱 아이콘, 스토어 메타데이터

---

## Strategy

### Step 1: Capacitor 패키지 설치

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "MOODFIT" "com.moodfit.app" --web-dir out
```

### Step 2: 플랫폼 추가

```bash
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

### Step 3: 빌드 → 동기화

```bash
next build      # CAP-001에서 output:'export' 설정 완료 상태
npx cap sync    # out/ → ios/android 복사
```

### Step 4: Xcode에서 실행 확인

`npx cap open ios` → 시뮬레이터에서 앱 로드 확인.

---

## Acceptance Criteria

- [ ] `capacitor.config.ts`가 루트에 존재하고 `webDir: 'out'` 설정
- [ ] `ios/` 디렉토리에 Xcode 프로젝트 생성됨
- [ ] `android/` 디렉토리에 Android 프로젝트 생성됨
- [ ] `npx cap sync` 에러 없이 완료
- [ ] iOS 시뮬레이터에서 앱이 WebView로 로드됨

---

## Testing Rules

- [ ] `npx cap sync` 에러 없이 완료
- [ ] iOS 시뮬레이터에서 홈 화면 렌더링 확인

---

## Implementation Notes

### 완료 항목

1. **패키지 설치**: `@capacitor/core@8.5.0`, `@capacitor/cli@8.5.0` (devDep), `@capacitor/ios@8.5.0`, `@capacitor/android@8.5.0`
2. **`capacitor.config.ts` 생성**: `npx cap init "MOODFIT" "com.moodfit.app" --web-dir out`
3. **플랫폼 프로젝트 생성**: `npx cap add ios` / `npx cap add android` — 둘 다 에러 없이 완료
4. **빌드 + sync 테스트**: `npm run build:cap` → `npx cap sync` 정상 완료 (19 페이지 정적 생성)
5. **`.gitignore`**: `/ios/`, `/android/` 추가 — `npx cap add`로 재생성 가능하므로 git 제외
6. **`package.json`**: `"cap:sync": "npm run build:cap && npx cap sync"` 편의 스크립트 추가

### iOS 시뮬레이터 확인 완료

Xcode 26.6 + iOS 26.5 시뮬레이터 설치 → iPhone 17 Pro에서 앱 로드 확인.
