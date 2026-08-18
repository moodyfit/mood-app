# BE-FEAT-003: JWT 인증 모듈

httpOnly cookie 기반 JWT 인증 — 15분 액세스 토큰 + 7일 리프레시 토큰, Guard/Decorator 패턴.

---

## Metadata

| Key | Value |
|-----|-------|
| Prefix | BE |
| Type | FEAT |
| Severity | Critical |
| Layer | Module (auth) |
| Milestone | MS-01 |
| Status | Backlog |
| 예상h | 5h |
| 주차 | W1-후반 |
| 우선순위 | P0 |

---

## Problem

MOODFIT은 현재 인증 시스템이 없다. 모든 사용자 데이터(저장, 취향, 검색기록)가 localStorage에 저장되어 있어 기기 변경 시 데이터가 유실되고, 개인화 기능의 확장이 불가능하다.

- 사용자 식별 수단이 없어 취향 프로필을 서버에 보관할 수 없음
- 저장(찜) 목록이 localStorage `mood.saves.v1`에만 존재 — 브라우저 초기화 시 소실
- BE-FEAT-004(회원가입/로그인), BE-FEAT-005(카카오 OAuth)의 선행 의존성
- FE-FEAT-013(인증 플로우 연결), FE-FEAT-014(서버 동기화)의 전제 조건

### 비즈니스 근거

> "패션 취향 분석을 쌓아온 사용자가 기기를 바꾸면 처음부터 다시 시작해야 한다"는 이탈 요인 제거. 개인화 데이터를 서버 동기화하려면 인증이 필수.

---

## Context

### 현재 상태

인증 관련 코드가 전혀 없다. Supabase Auth도 미사용.

```
현재 사용자 식별 방식: 없음 (anonymous)
현재 데이터 저장: localStorage 10개 키
  - mood.saves.v1        → SaveRecord[] (찜 목록)
  - mood.affinity.v1     → Record<MoodKey, number> (취향 벡터)
  - mood.savedPhotos.v1  → string[] (저장한 사진 id)
  - mood.owned.v1        → OwnedItem[] (내 옷 목록)
  - mood.discovered.v1   → DiscoveredItem[] (발견 목록, 최대 24건)
  - mood.searchCounts.v1 → Record<string, number>
  - mood.worn.v1         → Record<string, number>
  - mood.cardIssued.v1   → "1" | undefined
  - mood.scanDone.v1     → "1" | undefined
  - mood.spaceDot.v1     → "1" | undefined
```

### 관련 파일 (현재 FE)

```
src/lib/store.tsx          — Zustand 스토어 (모든 상태 + localStorage persist)
src/lib/types.ts           — SaveRecord, Affinity, OwnedItem 등 타입
src/app/layout.tsx         — 루트 레이아웃 (AuthProvider 삽입 위치)
```

### 관련 티켓

```
선행: (없음 — 이 티켓이 인증의 시작점)
후행: BE-FEAT-004 (회원가입/로그인 API)
      BE-FEAT-005 (카카오 OAuth)
      BE-FEAT-006 (Redis 토큰 블랙리스트)
      FE-FEAT-013 (인증 플로우 연결)
```

### 기술 선택 근거

| 결정 | 이유 |
|------|------|
| httpOnly cookie | XSS 공격 시 토큰 탈취 불가. SPA에서 Authorization 헤더보다 안전 |
| 15분 액세스 토큰 | 짧은 수명으로 토큰 노출 시 피해 최소화. 리프레시로 UX 유지 |
| 7일 리프레시 토큰 | 패션앱 특성상 매일 접속보다 가끔 접속 — 7일이면 재로그인 빈도 적정 |
| Passport.js 미사용 | BE-FEAT-005(카카오 OAuth)에서 passport-kakao 도입. 이 단계에선 과도 |

---

## Scope

### 포함

- NestJS AuthModule 생성 (JWT 발급·검증 로직)
- JwtStrategy — `@nestjs/jwt` + cookie 파서로 토큰 추출
- 액세스 토큰 (15분) + 리프레시 토큰 (7일) 발급 유틸
- `JwtAuthGuard` — 인증 필수 엔드포인트 보호
- `@CurrentUser()` 데코레이터 — 컨트롤러에서 userId 추출
- `POST /auth/refresh` — 리프레시 토큰으로 액세스 토큰 재발급
- `POST /auth/logout` — 쿠키 클리어 (블랙리스트는 BE-FEAT-006)
- 환경변수 정의 (`JWT_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_SECRET`)

### 제외

- 회원가입/로그인 API (→ BE-FEAT-004)
- 카카오 OAuth (→ BE-FEAT-005)
- Redis 토큰 블랙리스트 (→ BE-FEAT-006)
- FE AuthContext / 로그인 페이지 (→ FE-FEAT-013)

---

## Strategy

### Step 1: AuthModule 구조 생성

```
src/modules/auth/
├── auth.module.ts           — JwtModule.registerAsync() + ConfigService 연동
├── auth.service.ts          — generateTokenPair(), validateRefreshToken()
├── auth.controller.ts       — POST /auth/refresh, POST /auth/logout
├── strategies/
│   └── jwt.strategy.ts      — cookie에서 토큰 추출, validate()
├── guards/
│   └── jwt-auth.guard.ts    — @UseGuards(JwtAuthGuard)
├── decorators/
│   └── current-user.decorator.ts  — createParamDecorator
├── types/
│   └── jwt-payload.type.ts  — { sub: string, email: string }
└── test/
    ├── auth.service.spec.ts
    └── jwt.strategy.spec.ts
```

### Step 2: 토큰 발급 로직

```typescript
// auth.service.ts 핵심 구조
generateTokenPair(userId: string, email: string) → {
  accessToken:  sign({ sub: userId, email }, ACCESS_SECRET,  { expiresIn: '15m' })
  refreshToken: sign({ sub: userId },        REFRESH_SECRET, { expiresIn: '7d' })
}
```

- 액세스 토큰: userId + email 포함 (Guard에서 바로 사용)
- 리프레시 토큰: userId만 포함 (최소 정보 원칙)

### Step 3: 쿠키 설정

```typescript
// 쿠키 옵션
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',       // 카카오 OAuth 리다이렉트 대응
  path: '/',
  maxAge: 15 * 60 * 1000  // 액세스: 15분 / 리프레시: 7일
}
```

### Step 4: Guard + Decorator

```typescript
// jwt-auth.guard.ts — 선택적 인증도 지원
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // canActivate: 토큰 없으면 401, 만료면 401
}

// current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  }
);
```

---

## Acceptance Criteria

- [ ] `POST /auth/refresh` — 유효한 리프레시 토큰 → 새 액세스 토큰 쿠키 설정 + 200
- [ ] `POST /auth/refresh` — 만료된 리프레시 토큰 → 401
- [ ] `POST /auth/logout` — 쿠키 클리어 + 200
- [ ] `JwtAuthGuard` — 유효 토큰 → 요청 통과, userId를 `req.user`에 주입
- [ ] `JwtAuthGuard` — 토큰 없음/만료/변조 → 401
- [ ] `@CurrentUser()` — 컨트롤러에서 `{ sub, email }` 추출 가능
- [ ] 쿠키 httpOnly=true, secure=true(production), sameSite=lax 확인

---

## Testing Rules

- [ ] `auth.service.spec.ts` — generateTokenPair 정상 발급 (sub, exp 검증)
- [ ] `auth.service.spec.ts` — validateRefreshToken 성공/실패/만료 3케이스
- [ ] `jwt.strategy.spec.ts` — cookie에서 토큰 추출 → validate 호출 확인
- [ ] `jwt.strategy.spec.ts` — 토큰 없는 요청 → UnauthorizedException
- [ ] `npm test` 전체 통과

---

## Verification

1. `npm run start:dev` 실행
2. 수동으로 토큰 발급 후 (BE-FEAT-004 구현 전이라 테스트용 임시 엔드포인트 사용)
3. 쿠키에 `access_token`, `refresh_token` 설정 확인 (DevTools > Application > Cookies)
4. Guard가 걸린 테스트 엔드포인트에 쿠키 포함 요청 → 200 확인
5. 쿠키 제거 후 동일 요청 → 401 확인
6. `POST /auth/refresh` → 새 액세스 토큰 발급 확인

---

## Implementation Notes

_(구현 후 기록)_
