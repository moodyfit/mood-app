"use client";

import { useEffect, useState } from "react";
import BackButton from "@/components/BackButton";
import { useMoodStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";

interface Insights {
  totals: { events: number; users: number; formedUsers: number };
  byType: Record<string, number>;
  topSearches: { query: string; n: number }[];
  moodDist: Record<string, number>;
  recent: { type: string; query: string | null; mood: string | null; at: string }[];
}

const TYPE_LABEL: Record<string, string> = {
  save: "저장", unsave: "저장취소", view: "조회", scan_like: "스캔좋아",
  search: "검색", photo_open: "사진열기", worn: "입었어", profile_set: "프로필",
};

export default function AdminPage() {
  const { user, hydrated } = useMoodStore();
  const [data, setData] = useState<Insights | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated || !user) return;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const sb = getSupabase();
        const { data: s } = (await sb?.auth.getSession()) ?? { data: { session: null } };
        const token = s?.session?.access_token;
        if (!token) {
          setErr("로그인이 필요해");
          return;
        }
        const res = await fetch("/api/admin/insights", { headers: { authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (!res.ok) {
          setErr(json.error ?? "불러오기 실패");
          return;
        }
        setData(json as Insights);
      } catch {
        setErr("네트워크 오류");
      } finally {
        setLoading(false);
      }
    })();
  }, [hydrated, user]);

  if (!hydrated) return null;

  if (!user) {
    return (
      <div className="animate-fade px-5 pb-14">
        <BackButton href="/space" />
        <h1 className="mb-2 mt-2 text-[22px] font-extrabold tracking-[-0.5px]">관리자</h1>
        <p className="text-[14px] text-ink-soft">로그인이 필요해.</p>
      </div>
    );
  }

  const maxMood = Math.max(1, ...Object.values(data?.moodDist ?? {}));

  return (
    <div className="animate-fade px-5 pb-24">
      <BackButton href="/space" />
      <h1 className="mb-1 mt-2 text-[22px] font-extrabold tracking-[-0.5px]">관리자 대시보드</h1>
      <p className="mb-5 text-[12.5px] text-ink-faint">{user.email}</p>

      {loading && <p className="text-[13px] text-ink-soft">불러오는 중…</p>}
      {err && (
        <div className="rounded-2xl border border-line bg-white p-5 text-[13.5px] text-ink-soft">
          {err}
          {err.includes("관리자") && (
            <p className="mt-2 text-[12px] text-ink-faint">
              Vercel 환경변수 <span className="font-latin">ADMIN_EMAILS</span> 에 이 이메일을 넣어야 보여.
            </p>
          )}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {/* 총계 타일 */}
          <div className="grid grid-cols-3 gap-2.5">
            <Tile label="이벤트" value={data.totals.events} />
            <Tile label="유저" value={data.totals.users} />
            <Tile label="취향형성" value={data.totals.formedUsers} />
          </div>

          {/* 행동 유형 */}
          <Section title="행동 유형">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(data.byType).sort((a, b) => b[1] - a[1]).map(([t, n]) => (
                <span key={t} className="rounded-full bg-paper-2 px-2.5 py-1 text-[12.5px]">
                  {TYPE_LABEL[t] ?? t} <span className="font-latin font-semibold">{n}</span>
                </span>
              ))}
              {Object.keys(data.byType).length === 0 && <Empty />}
            </div>
          </Section>

          {/* 무드 분포 */}
          <Section title="무드 분포 (유저 최상위 취향)">
            {Object.keys(data.moodDist).length === 0 ? <Empty /> : (
              <div className="space-y-1.5">
                {Object.entries(data.moodDist).sort((a, b) => b[1] - a[1]).map(([m, n]) => (
                  <div key={m} className="flex items-center gap-2 text-[12.5px]">
                    <span className="w-16 shrink-0">{m}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-2">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${(n / maxMood) * 100}%` }} />
                    </div>
                    <span className="w-6 text-right font-latin text-ink-soft">{n}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* 인기 검색어 */}
          <Section title="인기 검색어">
            {data.topSearches.length === 0 ? <Empty /> : (
              <div className="flex flex-wrap gap-1.5">
                {data.topSearches.map((s) => (
                  <span key={s.query} className="rounded-full border border-line px-2.5 py-1 text-[12.5px]">
                    {s.query} <span className="font-latin text-ink-faint">{s.n}</span>
                  </span>
                ))}
              </div>
            )}
          </Section>

          {/* 최근 활동 */}
          <Section title="최근 활동">
            {data.recent.length === 0 ? <Empty /> : (
              <div className="flex flex-col gap-1 text-[12px] text-ink-soft">
                {data.recent.map((r, i) => (
                  <div key={i} className="flex justify-between gap-2 border-b border-line/60 py-1">
                    <span>{TYPE_LABEL[r.type] ?? r.type} {r.query ? `· ${r.query}` : r.mood ? `· ${r.mood}` : ""}</span>
                    <span className="font-latin text-ink-faint">{r.at.slice(5, 16).replace("T", " ")}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3.5 text-center">
      <div className="font-latin text-[24px] font-bold tracking-tight">{value}</div>
      <div className="mt-0.5 text-[11.5px] text-ink-faint">{label}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[13px] font-bold">{title}</div>
      {children}
    </div>
  );
}
function Empty() {
  return <p className="text-[12.5px] text-ink-faint">아직 데이터가 없어.</p>;
}
