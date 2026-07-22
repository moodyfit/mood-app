"use client";

import Link from "next/link";
import { SUGGESTIONS } from "@/lib/moods";

/**
 * v2.6 §7.12 그리드 끝 검색어 제안 — "더 보기"(무한 피드) 대신 "이런 것도 쳐봐".
 * 유한 구경(③)은 유지하면서 재검색만 유도. 제안은 현재 검색어를 뺀 일상어에서.
 */
export default function GridTail({
  query,
  count,
  unit = "장",
}: {
  query: string;
  count: number;
  unit?: string;
}) {
  const q = query.trim();
  const pool = SUGGESTIONS.filter((s) => s !== q);
  // 결정적 회전(랜덤 X — SSR 일관성): 검색어 길이로 시작점만 흔든다
  const off = pool.length ? query.length % pool.length : 0;
  const picks = [...pool.slice(off), ...pool.slice(0, off)].slice(0, 2);

  return (
    <div className="mt-8 border-t border-line pt-5 text-center">
      <p className="text-[12px] text-ink-faint">여기까지 · {count}{unit}</p>
      {picks.length > 0 && (
        <div className="mt-3">
          <p className="text-[12.5px] text-ink-soft">이런 것도 쳐봐</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {picks.map((s) => (
              <Link
                key={s}
                href={`/results?q=${encodeURIComponent(s)}`}
                className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-soft transition hover:border-accent"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
