import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 관리자 집계·튜닝 API — 서버 전용(서비스키). Bearer 토큰 + ADMIN_EMAILS 게이트.
// GET: 이벤트/취향 집계 + 개인화 분포 + config.  POST: 개인화 파라미터(config) 저장.
export const dynamic = "force-dynamic";

interface EventRow { type: string; query: string | null; mood_key: string | null; created_at: string }
interface TasteRow { mood_vector: Record<string, number> | null; saved_photo_ids: string[] | null }

async function gate(req: Request): Promise<{ sb: SupabaseClient } | { error: string; status: number }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const svc = process.env.SUPABASE_SERVICE_KEY;
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (!url || !anon || !svc) return { error: "서버 설정 누락", status: 500 };
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return { error: "로그인이 필요해", status: 401 };
  const { data } = await createClient(url, anon).auth.getUser(token);
  const email = data.user?.email?.toLowerCase() ?? "";
  if (!data.user) return { error: "세션이 유효하지 않아", status: 401 };
  if (admins.length === 0 || !admins.includes(email)) return { error: "관리자만 볼 수 있어", status: 403 };
  return { sb: createClient(url, svc) };
}

export async function GET(req: Request) {
  const g = await gate(req);
  if ("error" in g) return Response.json({ error: g.error }, { status: g.status });
  const sb = g.sb;

  const [{ data: events }, { data: tastes }, evCount, { data: cfg }] = await Promise.all([
    sb.from("events").select("type,query,mood_key,created_at").order("created_at", { ascending: false }).limit(3000),
    sb.from("user_taste").select("mood_vector,saved_photo_ids").limit(5000),
    sb.from("events").select("id", { count: "exact", head: true }),
    sb.from("app_config").select("w_save,w_view,saturate,diversity").eq("id", 1).maybeSingle(),
  ]);

  const ev = (events ?? []) as EventRow[];
  const ts = (tastes ?? []) as TasteRow[];
  const saturate = Number(cfg?.saturate ?? 12);

  const byType: Record<string, number> = {};
  for (const e of ev) byType[e.type] = (byType[e.type] ?? 0) + 1;

  const q: Record<string, number> = {};
  for (const e of ev) if (e.type === "search" && e.query) q[e.query] = (q[e.query] ?? 0) + 1;
  const topSearches = Object.entries(q).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([query, n]) => ({ query, n }));

  // 개인화 분포: 무드별 affinity 총합 + 유저 α 버킷(콜드/워밍/따뜻)
  const moodAffinity: Record<string, number> = {};
  const alphaBuckets = { cold: 0, warming: 0, warm: 0 };
  let formed = 0;
  for (const t of ts) {
    const v = t.mood_vector ?? {};
    let total = 0;
    for (const [k, val] of Object.entries(v)) { moodAffinity[k] = (moodAffinity[k] ?? 0) + val; total += val; }
    const alpha = Math.min(1, total / saturate);
    if (alpha < 0.15) alphaBuckets.cold++;
    else if (alpha < 0.6) alphaBuckets.warming++;
    else alphaBuckets.warm++;
    if ((t.saved_photo_ids?.length ?? 0) >= 3) formed++;
  }

  return Response.json({
    totals: { events: evCount.count ?? ev.length, users: ts.length, formedUsers: formed },
    byType,
    topSearches,
    moodAffinity,
    alphaBuckets,
    config: {
      wSave: Number(cfg?.w_save ?? 2),
      wView: Number(cfg?.w_view ?? 1),
      saturate,
      diversity: Number(cfg?.diversity ?? 0.6),
    },
    recent: ev.slice(0, 20).map((e) => ({ type: e.type, query: e.query, mood: e.mood_key, at: e.created_at })),
  });
}

export async function POST(req: Request) {
  const g = await gate(req);
  if ("error" in g) return Response.json({ error: g.error }, { status: g.status });
  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { return Response.json({ error: "잘못된 요청" }, { status: 400 }); }
  const num = (v: unknown, min: number, max: number, dflt: number) => {
    const n = Number(v);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : dflt;
  };
  const patch = {
    w_save: num(body.wSave, 0, 10, 2),
    w_view: num(body.wView, 0, 10, 1),
    saturate: num(body.saturate, 1, 100, 12),
    diversity: num(body.diversity, 0, 3, 0.6),
    updated_at: new Date().toISOString(),
  };
  const { error } = await g.sb.from("app_config").update(patch).eq("id", 1);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, config: patch });
}
