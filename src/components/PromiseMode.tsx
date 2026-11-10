"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "./BackButton";
import { MOODS, resolveMoods } from "@/lib/moods";
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
// 약속 모드 = 마감 있는 결정용. '동네 산책'은 마감이 없어 제외, '갑자기 모임' 추가.
const OCCASIONS = ["첫 소개팅", "퇴근 후 술약속", "친구 결혼식", "주말 카페", "면접 가는 날", "갑자기 모임"];
// #39에서 /search 상황별·밈 칩을 걷어내면서, OCCASIONS에 대응 문구가 없는 것만 옮겼다(코드리뷰
// P1-2). '오늘의 추천'(날짜 기반 로테이션)은 대응 칩도 없고 별도 로직이라 이번엔 옮기지 않음.
const VIBE_CHIPS = ["꾸안꾸 그거 뭐냐", "남들이 아는 그 느낌", "테토남 그 느낌", "느좋 그 자체", "남친룩"];

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
  // 마지막으로 보낸 요청만 결과를 반영 — blur 요청과 칩 클릭 요청이 거의 동시에 나가면
  // 늦게 도착한 쪽이 먼저 온 결과를 덮어써서 헤더·카드가 서로 다른 상황을 가리키는 문제가
  // 있었다(코드리뷰 P0-2). /results의 cancelled 패턴과 동일한 발상.
  const requestRef = useRef(0);

  // 검색(/search)과 같은 AI 번역 엔진(/api/search/translate)으로 통일 — 룰베이스는 이제 PromiseMode가
  // 아니라 API 내부 폴백(키 없음/실패/타임아웃)에서만 쓰인다.
  async function runOccasion(q: string) {
    const trimmed = q.trim();
    // 이미 처리한 값이면 건너뛴다(코드리뷰 P1-1) — onBlur가 Enter 제출 뒤에도 매번 불려서
    // 같은 입력으로 요청·기록이 중복되던 문제.
    if (!trimmed || trimmed === occasion) return;
    recordSearch(trimmed); // user_actions.query_text 대응(로컬). DB 연동 시 동일 파이프라인
    setOccasion(trimmed);
    setLoading(true);
    const reqId = ++requestRef.current;
    try {
      const res = await fetch(`/api/search/translate?q=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as { moodKeys?: string[] };
      if (requestRef.current !== reqId) return; // 더 최신 요청이 나간 뒤 — 이 응답은 버림
      // 캐논 축으로 억지로 채우지 않는다(코드리뷰 — 서로 다른 상황인데 똑같이 채워져 "전부
      // 같은 조합"으로 보이는 역효과가 있었다). AI가 확신에 차서 1개만 주면 1개 그대로 — 그게
      // 오히려 "이 상황엔 이거 하나면 충분하다"는 정직한 신호다.
      setMoods((data.moodKeys ?? []).slice(0, 3));
    } catch {
      if (requestRef.current !== reqId) return;
      // Capacitor 앱 빌드(output: "export")엔 API 라우트가 없어 이 catch가 매번 실행된다
      // (별도 BUG 티켓 — Capacitor API 호출 아키텍처). 그때도 결과가 비면 안 되니 기존
      // 룰베이스(resolveMoods)로 폴백 — 웹에서도 네트워크 실패 시 같은 경로를 탄다.
      setMoods(resolveMoods(trimmed).slice(0, 3));
    } finally {
      if (requestRef.current === reqId) setLoading(false);
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

      <div className="mt-5">
        <div className="mb-2 text-[13px] font-semibold">이런 느낌도 돼</div>
        <div className="flex flex-wrap gap-2">
          {VIBE_CHIPS.map((s) => (
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
          {moods.length > 0 && (
            <p className="mt-3 text-center text-[12px] text-ink-faint">
              골라서 누르면, 바로 살 수 있게 정리돼 있어
            </p>
          )}
        </div>
      ) : (
        <p className="mt-8 text-center text-[13px] text-ink-faint">자리만 골라도 조합이 떠</p>
      )}
    </div>
  );
}
