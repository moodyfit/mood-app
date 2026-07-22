"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import { computeTaste, personalizeOrder } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";
import MoodCard from "./MoodCard";

/**
 * 7.10 3초 취향 스캔 — 질문 0개. 사진 좋아/별로만으로 취향 방향을 잡는다.
 * 덱(고르는 모드)은 '처음 1회'만 강제. 이후 스캔 탭은 전시(그리드)가 기본,
 * '다시 스캔'으로 원할 때만 재실행. '좋아'는 프로필 벡터에 적재(recordScanLike).
 */
export default function ScanDeck() {
  const { recordScanLike, affinity, scanDone, markScanDone, hydrated } = useMoodStore();
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState<string[]>([]); // 이번 세션 '좋아' 순서 (실시간 요약용)
  const [rescanning, setRescanning] = useState(false);

  const deck = ALL_MOOD_KEYS;
  const done = i >= deck.length;
  // 덱을 보여줄 조건: 아직 1회도 안 했거나(최초) 사용자가 다시 스캔을 눌렀을 때
  const scanning = rescanning || !scanDone;

  // 덱을 끝까지 넘기면 완료 기록 + 재스캔 종료 → 전시로 전환
  useEffect(() => {
    if (scanning && done) {
      markScanDone();
      setRescanning(false);
    }
  }, [scanning, done, markScanDone]);

  function like(key: string) {
    recordScanLike(key);
    setLiked((a) => [...a, key]);
    setI((n) => n + 1);
  }
  function skip() {
    setI((n) => n + 1);
  }
  function restart() {
    setI(0);
    setLiked([]);
    setRescanning(true);
  }

  // 실시간 요약 — 관찰문만(해석문 금지). 같은 축 연속을 세어 "지금 N연속"
  const last = liked[liked.length - 1];
  let streak = 0;
  for (let j = liked.length - 1; j >= 0 && liked[j] === last; j--) streak++;
  const observation =
    liked.length === 0
      ? null
      : streak >= 2 && MOODS[last]
        ? `지금 ${MOODS[last].name} ${streak}연속 👀`
        : `${liked.length}개 골랐어`;

  // 하이드레이션 전에는 렌더 보류(전시/덱 깜빡임 방지)
  if (!hydrated) return null;

  // ── 전시 모드 (기본): 스캔 1회 완료 후, 또는 재스캔 종료 후 ──
  if (!scanning || done) {
    const { title } = computeTaste(affinity);
    const ordered = personalizeOrder([...ALL_MOOD_KEYS], affinity);
    // 개인화 신호(title)가 있으면 최상위 매치를 전면폭 히어로(크기=적합도)
    const heroKey = title && ordered.length > 3 ? ordered[0] : null;
    const restKeys = heroKey ? ordered.slice(1) : ordered;
    return (
      <div className="animate-fade">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[20px] font-bold tracking-[-0.4px]">
            {title ? `너는 지금 ${title} 쪽` : "눈에 드는 것부터"}
          </div>
          <button
            type="button"
            onClick={restart}
            className="mt-1 flex-shrink-0 rounded-full border border-line px-3 py-1.5 text-[12.5px] text-ink-soft transition hover:border-accent"
          >
            다시 스캔
          </button>
        </div>

        {heroKey && MOODS[heroKey] && (
          <div className="mt-4">
            <MoodCard mood={MOODS[heroKey]} size="hero" />
          </div>
        )}

        <div className="mt-3" style={{ columnCount: 2, columnGap: "12px" }}>
          {restKeys.map((k) => {
            const mood = MOODS[k];
            if (!mood) return null;
            return (
              <div key={k} className="mb-3 break-inside-avoid">
                <MoodCard mood={mood} />
              </div>
            );
          })}
        </div>

        <Link
          href="/space"
          className="mt-6 block rounded-[10px] bg-accent py-3.5 text-center text-sm font-bold text-white"
        >
          나의 공간 보기
        </Link>
      </div>
    );
  }

  // ── 덱 모드: 최초 1회(또는 재스캔 중) ──
  const mood = MOODS[deck[i]];

  return (
    <div className="animate-fade">
      <div className="mb-3 flex items-center justify-between text-[13px] text-ink-faint">
        <span>눈에 들면 좋아, 아니면 넘겨</span>
        <span className="font-latin">
          {i + 1} / {deck.length}
        </span>
      </div>

      {/* v2.6 §7.12 스캔 실시간 요약 — 관찰문만(해석문 금지) */}
      {observation && (
        <div className="mb-3 rounded-full bg-paper-2 py-2 text-center text-[13px] font-semibold text-accent">
          {observation}
        </div>
      )}

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0"
          style={
            mood.imageUrl
              ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: mood.gradient }
          }
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={skip}
          className="rounded-[12px] border border-line py-4 text-[15px] font-semibold text-ink-soft transition hover:bg-paper-2"
        >
          별로
        </button>
        <button
          type="button"
          onClick={() => like(mood.key)}
          className="rounded-[12px] bg-accent py-4 text-[15px] font-semibold text-white transition"
        >
          좋아
        </button>
      </div>
    </div>
  );
}
