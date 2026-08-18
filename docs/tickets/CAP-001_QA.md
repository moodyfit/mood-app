# CAP-001 Q&A 기록

CAP-001(서버 컴포넌트 → 클라이언트 전환) 작업 중 나온 질문과 답변.

---

## Q1. 왜 이 작업이 필요했나?

Capacitor는 웹앱을 앱 안에 HTML 파일로 넣고 WebView로 여는 구조. 앱 안에는 서버가 없다.
그런데 우리 앱의 페이지 5개는 서버 컴포넌트로 되어 있었다 — Next.js 서버가 매 요청마다 데이터를 가져와서 HTML을 만들어주는 방식.

서버가 없는 Capacitor에서는 이 방식이 작동하지 않으니, 모든 페이지를 클라이언트에서 알아서 데이터를 가져오는 방식으로 바꿔야 했다.

## Q2. 뭘 했나?

크게 3가지.

### 1) 서버 → 클라이언트 전환 (핵심)

서버에서 데이터를 가져오던 5개 페이지를 클라이언트에서 가져오도록 바꿨다.

- 기존: 페이지가 서버에서 `fetchPhotos()` 호출 → HTML에 결과를 담아서 전달
- 변경: 페이지가 브라우저에서 `usePhotos()` 훅 호출 → 화면에 직접 렌더링

이때 데이터 페칭 로직을 커스텀 훅(`usePhotos`, `useLooks` 등)으로 묶어뒀다. 나중에 BE API로 전환할 때 이 훅 내부만 교체하면 되니까.

### 2) 듀얼 빌드 설정

하나의 코드로 두 가지 빌드를 할 수 있게 했다:
- `npm run build` — Vercel 웹 배포용 (기존과 동일, 관리자 API Route 포함)
- `npm run build:cap` — Capacitor용 정적 빌드 (`out/` 폴더에 HTML 파일 생성)

`next.config.mjs`에서 환경변수(`BUILD_TARGET=capacitor`)로 분기.

### 3) ISR 캐시 제거

`supabase.ts`에 있던 `next: { revalidate: 60 }` 옵션을 제거. Next.js 서버 전용 기능이라 클라이언트에서는 의미가 없다.

## Q3. 어떤 문제를 만났고, 어떻게 풀었나?

### 문제 1 — `useSearchParams`에 Suspense가 필요

`results`와 `watch` 페이지는 URL에서 검색어(`?q=...`)를 읽어야 한다. 클라이언트에서는 `useSearchParams()`를 쓰는데, Next.js 14는 이걸 쓰는 페이지를 `<Suspense>`로 감싸라고 요구한다. 안 감싸면 빌드가 실패.

→ 페이지를 래퍼(Suspense 포함) + 내용 컴포넌트로 분리해서 해결.

### 문제 2 — `"use client"`와 `generateStaticParams` 충돌

Capacitor 정적 빌드(`output: 'export'`)에서는 `/mood/[key]` 같은 동적 라우트에 `generateStaticParams()`을 넣어서 "어떤 URL들을 미리 만들어둘지" 알려줘야 한다. 그런데 `"use client"` 파일에서는 이 함수를 쓸 수가 없다 — Next.js가 금지.

→ 페이지를 두 파일로 분리:
- `page.tsx` (서버) — `generateStaticParams` + 클라이언트 컴포넌트 렌더만
- `MoodDetail.tsx` (클라이언트) — 실제 UI와 훅 로직 전부

### 문제 3 — `generateStaticParams`가 빈 배열이면 인식 안 됨

`/photo/[slug]`와 `/closet/[id]`는 DB나 유저 데이터에서 오는 값이라 빌드 시점에 목록을 만들 수가 없다. 그래서 빈 배열(`[]`)을 반환했더니, Next.js 14.2가 "이 함수 없잖아"라고 에러. `async` 키워드, `dynamicParams = false` 등 여러 방법을 시도했지만 해결 안 됨.

→ 빌드 스크립트(`build:cap`)에서 이 두 라우트를 임시로 옮겨놓고 빌드한 뒤 자동으로 복원하는 방식 채택.

### 문제 4 — API Route 비호환

관리자 대시보드의 API Route(`/api/admin/insights`)에 `dynamic = "force-dynamic"`이 있는데, 정적 빌드에서는 이 설정 자체가 금지.

→ 빌드 스크립트에서 API 디렉토리도 임시 제외. 관리자 기능은 RLS 정책 추가 후 클라이언트 훅으로 전환 예정(관리자 이메일 확인 대기 중).

## Q4. 아직 남은 건?

- `/photo/[slug]`와 `/closet/[id]`가 Capacitor 앱에서 직접 URL 진입하면 404. 앱 안에서 링크로 이동하면 되지만, CAP-002에서 Capacitor의 SPA 폴백 라우팅을 설정하면 완전히 해결.
- 관리자 기능 앱 지원 — 관리자 이메일 확인 후 RLS 정책 추가 → 클라이언트 훅 전환 예정.

---

## Q5. 나중에 BE API로 전환한다는 건 무슨 말이야?

### 지금 데이터가 어떻게 오는지

현재 앱은 브라우저에서 Supabase(DB)를 직접 호출한다.

```
사용자 브라우저 → Supabase DB
```

`usePhotos()` 훅 내부를 보면 `fetchPhotos()`를 호출하고, 그 안에서 `getSupabase().from("photos").select("*")` — 즉 브라우저가 DB에 직접 SQL 쿼리를 날리는 것.

이게 프로토타입에서는 빠르고 편하지만, 문제가 있다:

1. **보안** — Supabase의 anon key가 브라우저에 노출. 누구나 DB에 쿼리를 날릴 수 있다. RLS(행 수준 보안)로 어느 정도 막지만, 서버만큼 안전하지는 않다.
2. **비즈니스 로직이 클라이언트에 흩어짐** — 검색 랭킹, 개인화 점수 계산, 무드 벡터 변환 같은 로직이 전부 브라우저 코드에 있다. 앱이 커지면 관리가 어렵다.
3. **AI 키 노출 불가** — Claude API 키 같은 건 브라우저에 넣을 수 없다. 자연어→무드 벡터 변환 같은 AI 기능은 반드시 서버를 거쳐야 한다.

### BE API로 전환하면 어떻게 바뀌는지

WBS에 있는 NestJS 백엔드가 구축되면:

```
지금:   브라우저 → Supabase DB (직접)
나중:   브라우저 → NestJS 서버 → PostgreSQL DB
```

브라우저는 DB를 모른다. 서버한테 "사진 목록 줘"라고 요청하고, 서버가 DB를 조회해서 결과만 돌려준다.

### 훅 내부 교체가 뭔지

`usePhotos()` 훅의 내부를 비교하면:

```ts
// 지금 — Supabase 직접 호출
useEffect(() => {
  fetchPhotos()  // → getSupabase().from("photos").select("*")
    .then(setPhotos);
}, []);

// 나중 — BE API 호출로 교체
useEffect(() => {
  fetch("/api/photos")  // → NestJS 서버에 요청
    .then(res => res.json())
    .then(setPhotos);
}, []);
```

훅을 쓰는 페이지 입장에서는 달라지는 게 없다. `usePhotos()`를 호출하면 사진 배열이 나온다는 사실은 동일. 데이터가 어디서 오는지(Supabase 직접 vs BE API)만 훅 내부에서 바뀔 뿐.

이게 훅으로 분리해둔 이유. 안 그랬으면 페이지마다 Supabase 호출 코드가 흩어져 있어서, BE 전환할 때 페이지를 하나하나 찾아서 고쳐야 했을 것.
