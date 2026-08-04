import { createClient } from "@supabase/supabase-js";

// 관리자 집계 API — 서버 전용(서비스키). Bearer 토큰으로 유저 검증 후 ADMIN_EMAILS 화이트리스트만 허용.
// events는 anon이 못 읽으므로 여기서 서비스키로 집계. 서비스키는 클라이언트에 절대 노출 안 됨.
export const dynamic = "force-dynamic";

interface EventRow {
  type: string;
  query: string | null;
  mood_key: string | null;
  created_at: string;
}
interface TasteRow {
  mood_vector: Record<string, number> | null;
  saved_photo_ids: string[] | null;
}

export async function GET(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const svc = process.env.SUPABASE_SERVICE_KEY;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!url || !anon || !svc) {
    return Response.json({ error: "서버 설정 누락(SUPABASE_SERVICE_KEY 등)" }, { status: 500 });
  }

  // 1) 토큰 → 유저 검증
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "로그인이 필요해" }, { status: 401 });
  const authClient = createClient(url, anon);
  const { data: userData } = await authClient.auth.getUser(token);
  const email = userData.user?.email?.toLowerCase() ?? "";
  if (!userData.user) return Response.json({ error: "세션이 유효하지 않아" }, { status: 401 });
  if (admins.length === 0 || !admins.includes(email)) {
    return Response.json({ error: "관리자만 볼 수 있어" }, { status: 403 });
  }

  // 2) 서비스키로 집계
  const sb = createClient(url, svc);
  const [{ data: events }, { data: tastes }, evCount] = await Promise.all([
    sb.from("events").select("type,query,mood_key,created_at").order("created_at", { ascending: false }).limit(3000),
    sb.from("user_taste").select("mood_vector,saved_photo_ids").limit(5000),
    sb.from("events").select("id", { count: "exact", head: true }),
  ]);

  const ev = (events ?? []) as EventRow[];
  const ts = (tastes ?? []) as TasteRow[];

  // 이벤트 유형별 카운트
  const byType: Record<string, number> = {};
  for (const e of ev) byType[e.type] = (byType[e.type] ?? 0) + 1;

  // 인기 검색어(최근 3000 기준)
  const q: Record<string, number> = {};
  for (const e of ev) if (e.type === "search" && e.query) q[e.query] = (q[e.query] ?? 0) + 1;
  const topSearches = Object.entries(q).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([query, n]) => ({ query, n }));

  // 무드 분포(취향벡터의 최상위 축 합산)
  const moodDist: Record<string, number> = {};
  let formed = 0; // 취향 형성(저장 3+)
  for (const t of ts) {
    const v = t.mood_vector ?? {};
    const top = Object.entries(v).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (top) moodDist[top] = (moodDist[top] ?? 0) + 1;
    if ((t.saved_photo_ids?.length ?? 0) >= 3) formed++;
  }

  return Response.json({
    totals: {
      events: evCount.count ?? ev.length,
      users: ts.length,
      formedUsers: formed,
    },
    byType,
    topSearches,
    moodDist,
    recent: ev.slice(0, 20).map((e) => ({ type: e.type, query: e.query, mood: e.mood_key, at: e.created_at })),
  });
}
