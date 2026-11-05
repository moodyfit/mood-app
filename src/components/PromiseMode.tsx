"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "./BackButton";
import { MOODS, ALL_MOOD_KEYS } from "@/lib/moods";
import type { Mood } from "@/lib/types";
import { formatMan, primaryPrice } from "@/lib/products";
import { useMoodLooks } from "@/lib/hooks/usePhotos";
import { moodAliasType } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";

/**
 * 약속 모드 — 상황 → 완성 조합 최대 3개. "3분 안에 결정 끝."
 * 제0조: 취향(무드)은 상황이 정하고, 실행(판매처)은 무드핏이. 생성형 조합 없음.
 * 10/28 회의록 "약속 기능 중복제거(검색창으로 통일)" — "언제"·"예산" 단계 삭제, 자유 입력을
 * 룰베이스(resolveMoods)가 아니라 검색(/search)과 같은 AI 번역 파이프라인으로 통일했다.
 */
// 약속 모드 = 마감 있는 결정용. '동네 산책'은 검색 칩에 이미 있어 제외, '갑자기 모임' 추가.
const OCCASIONS = ["첫 소개팅", "퇴근 후 술약속", "친구 결혼식", "주말 카페", "면접 가는 날", "갑자기 모임"];

function cover(mood: Mood) {
  return mood.imageUrl
    ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: mood.gradient };
}

export default function PromiseMode() {
  const router = useRouter();
  const { recordSearch } = useMoodStore();
  const { lookFor } = useMoodLooks();
  const [occasion, setOccasion] = useState<string | null>(null);
  const [free, setFree] = useState("");
  const [moods, setMoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // 검색(/search)과 같은 AI 번역 엔진(/api/search/translate)으로 통일 — 룰베이스는 이제 PromiseMode가
  // 아니라 API 내부 폴백(키 없음/실패/타임아웃)에서만 쓰인다.
  async function runOccasion(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    recordSearch(trimmed); // user_actions.query_text 대응(로컬). DB 연동 시 동일 파이프라인
    setOccasion(trimmed);
    setLoading(true);
    try {
      const res = await fetch(`/api/search/translate?q=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as { moodKeys?: string[] };
      const keys = (data.moodKeys ?? []).slice(0, 3);
      // AI가 확신에 찬 상황(결혼식·면접 등)일수록 1개로 좁혀서 "택일"이 안 됐다(실측: OCCASIONS
      // 6개 중 5개가 1~2개만 반환). 적어도 둘 중 고르게 안 겹치는 다른 무드로 채운다.
      for (const k of ALL_MOOD_KEYS) {
        if (keys.length >= 2) break;
        if (!keys.includes(k)) keys.push(k);
      }
      setMoods(keys);
    } catch {
      setMoods([]); // 네트워크 실패 — 조용히 빈 결과(에러 화면 대신)
    } finally {
      setLoading(false);
    }
  }

  function commitFree() {
    if (!free.trim()) return;
    runOccasion(free);
  }

  const chip = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-[13px] transition ${
      active ? "border-accent bg-accent text-white" : "border-line text-ink-soft hover:border-accent"
    }`;

  return (
    <div className="animate-fade px-5 pb-28">
      <BackButton href="/" />
      <h1 className="text-[22px] font-extrabold tracking-[-0.5px]">약속 잡혔어?</h1>
      <p className="mt-2 text-[14px] text-ink-soft">고르는 건 나한테 맡겨. 3분 안에 결정 끝.</p>

      <div className="mt-6">
        <div className="mb-2 text-[13px] font-semibold">어떤 자리야</div>
        {/* 적는 게 기본, 칩은 지름길 — 자유 입력이 칩보다 위 */}
        <input
          value={free}
          onChange={(e) => setFree(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commitFree()}
          onBlur={commitFree}
          placeholder="아니면 그냥 적어도 돼 — 예) 전 직장 동료 결혼식 2차"
          className="mb-2.5 w-full rounded-[10px] border border-line bg-white px-3.5 py-3 text-[14px] outline-none transition placeholder:text-ink-faint focus:border-accent"
        />
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setFree("");
                runOccasion(s);
              }}
              className={chip(occasion === s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {occasion ? (
        <div className="mt-8">
          {/* 유저 표현 그대로 되받기 — 축 이름·번역 노출 금지 */}
          <div className="mb-1 text-[15px] font-bold">‘{occasion}’ — 이 조합이면 돼</div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className="h-[92px] animate-pulse rounded-2xl bg-paper-2" />
              ))}
            </div>
          ) : moods.length > 0 ? (
            <div className="flex flex-col gap-3">
              {moods.map((k) => {
                const mood = MOODS[k];
                if (!mood) return null;
                const total = (lookFor(k)?.products ?? []).reduce((sum, p) => sum + primaryPrice(p), 0);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => router.push(`/mood/${k}`)}
                    className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left transition hover:border-accent active:scale-[0.99]"
                  >
                    <div className="h-20 w-16 flex-shrink-0 rounded-xl" style={cover(mood)} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-bold">{moodAliasType(k)}</div>
                      <div className="mt-0.5 line-clamp-1 text-[12.5px] text-ink-soft">{mood.description}</div>
                      {total > 0 && (
                        <div className="mt-1 text-[13px]">
                          이 느낌 완성 ·{" "}
                          <span className="font-latin tnum font-semibold">{formatMan(total)}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-ink-faint">›</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-[13px] text-ink-faint">맞는 조합을 못 찾았어 — 다르게 적어볼래?</p>
          )}
          <p className="mt-3 text-center text-[12px] text-ink-faint">
            골라서 누르면, 바로 살 수 있게 정리돼 있어
          </p>
        </div>
      ) : (
        <p className="mt-8 text-center text-[13px] text-ink-faint">자리만 골라도 조합이 떠</p>
      )}
    </div>
  );
}
