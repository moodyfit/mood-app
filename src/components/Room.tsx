"use client";

import Link from "next/link";
import type { Mood } from "@/lib/types";
import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import { computeTaste, moodsByAffinity } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";

/**
 * 7.7 '내 방' — 개인 무드 공간.
 * · 가중 레이아웃: 저장 무드를 취향 비중(affinity)대로, 지배 무드는 크게.
 * · 미개척지: 안 고른 무드는 흐릿한 실루엣으로 존재, 누르면 그 무드로 이동(탐색).
 * · 문패: 방 입구에 요약 추구미 한 줄 — 카드가 일회성이 아니라 상시 거주.
 */
function tileBg(mood: Mood) {
  return mood.imageUrl
    ? {
        backgroundImage: `url(${mood.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: mood.gradient };
}

export default function Room() {
  const { affinity, isSaved } = useMoodStore();

  const savedRanked = moodsByAffinity(affinity).filter((k) => isSaved(k));
  const dominant = savedRanked[0];
  const rest = savedRanked.slice(1);
  const unexplored = ALL_MOOD_KEYS.filter((k) => !isSaved(k));

  const { title } = computeTaste(affinity);

  return (
    <div>
      {/* 문패 */}
      <div className="mb-3">
        <div className="text-[12px] text-ink-faint">나의 방</div>
        <div className="mt-0.5 text-[15px] font-bold tracking-[-0.3px]">
          {title}의 방
        </div>
      </div>

      {/* 지배 무드 — 크게 (취향 비중 시각화) */}
      {dominant && MOODS[dominant] && (
        <Link
          href={`/mood/${dominant}`}
          className="relative mb-2 block aspect-[16/10] w-full overflow-hidden rounded-xl"
        >
          <div className="absolute inset-0" style={tileBg(MOODS[dominant])} />
          <div className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            내 취향의 중심
          </div>
        </Link>
      )}

      {/* 나머지 저장 무드 — 2열 */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {rest.map((k) => (
            <Link
              key={k}
              href={`/mood/${k}`}
              className="relative block aspect-[3/4] overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0" style={tileBg(MOODS[k])} />
            </Link>
          ))}
        </div>
      )}

      {/* 미개척지 — 안 고른 무드, 흐릿한 실루엣 */}
      {unexplored.length > 0 && (
        <>
          <div className="mb-2 mt-6 text-[12px] text-ink-faint">
            아직 안 가본 곳
          </div>
          <div className="grid grid-cols-3 gap-2">
            {unexplored.map((k) => (
              <Link
                key={k}
                href={`/mood/${k}`}
                className="relative block aspect-[3/4] overflow-hidden rounded-xl border border-line"
              >
                <div
                  className="absolute inset-0 opacity-25 grayscale"
                  style={tileBg(MOODS[k])}
                />
                <div className="absolute inset-0 flex items-center justify-center px-1 text-center text-[10px] font-medium text-ink-soft">
                  {MOODS[k]?.name}
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
