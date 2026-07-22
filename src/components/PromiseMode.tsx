"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "./BackButton";
import { resolveMoods, MOODS } from "@/lib/moods";
import type { Mood } from "@/lib/types";
import { productsFor, fitLookToBudget, formatMan, BUDGETS } from "@/lib/products";
import { moodAliasType } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";

/**
 * 약속 모드 (★ v1) — 상황·언제·예산 → 완성 조합 2~3개 택일. "3분 안에 결정 끝."
 * 제0조: 취향(무드)은 상황이 정하고, 실행(예산 맞춤·판매처)은 무드핏이. 생성형 조합 없음.
 */
// 약속 모드 = 마감 있는 결정용. '동네 산책'은 검색 칩에 이미 있어 제외, '갑자기 모임' 추가.
const OCCASIONS = ["첫 소개팅", "퇴근 후 술약속", "친구 결혼식", "주말 카페", "면접 가는 날", "갑자기 모임"];

const WHEN = [
  { label: "오늘·내일", note: "급하니까 바로 결정" },
  { label: "이번 주말", note: "넉넉하게 골라도 돼" },
  { label: "여유 있어", note: "천천히 봐도 좋아" },
];

function cover(mood: Mood) {
  return mood.imageUrl
    ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: mood.gradient };
}

export default function PromiseMode() {
  const router = useRouter();
  const { recordSearch } = useMoodStore();
  const [occasion, setOccasion] = useState<string | null>(null);
  const [free, setFree] = useState("");
  const [budget, setBudget] = useState<number | null>(null);
  const [when, setWhen] = useState<(typeof WHEN)[number] | null>(null);

  // 자유 입력 = 아무말 검색과 동일 파이프라인(resolveMoods 폴백). 미매핑 상황어는 로깅(겹5 수요 주도)
  function commitFree() {
    const q = free.trim();
    if (!q) return;
    recordSearch(q); // user_actions.query_text 대응(로컬). DB 연동 시 동일 파이프라인
    setOccasion(q);
  }

  const moods = occasion ? resolveMoods(occasion).slice(0, 3) : [];

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
                setOccasion(s);
              }}
              className={chip(occasion === s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-[13px] font-semibold">언제야</div>
        <div className="flex flex-wrap gap-2">
          {WHEN.map((w) => (
            <button key={w.label} type="button" onClick={() => setWhen(w)} className={chip(when?.label === w.label)}>
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 text-[13px] font-semibold">예산은</div>
        <div className="flex flex-wrap gap-2">
          {BUDGETS.map((b) => (
            <button key={b.label} type="button" onClick={() => setBudget(b.won)} className={chip(budget === b.won)}>
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {occasion ? (
        <div className="mt-8">
          {/* 유저 표현 그대로 되받기 — 축 이름·번역 노출 금지 */}
          <div className="mb-1 text-[15px] font-bold">‘{occasion}’ — 이 조합이면 돼</div>
          {when && <div className="mb-3 text-[12.5px] text-ink-soft">{when.note}</div>}
          <div className="flex flex-col gap-3">
            {moods.map((k) => {
              const mood = MOODS[k];
              if (!mood) return null;
              const fit = fitLookToBudget(productsFor(k), budget);
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
                    <div className="mt-1 text-[13px]">
                      이 느낌 완성 ·{" "}
                      <span className="font-latin tnum font-semibold">{formatMan(fit.total)}</span>
                    </div>
                  </div>
                  <span className="text-ink-faint">›</span>
                </button>
              );
            })}
          </div>
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
