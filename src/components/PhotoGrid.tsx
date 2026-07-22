"use client";

import { useState } from "react";
import type { Photo } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";
import { topShare, SKEW_THRESHOLD } from "@/lib/taste";
import PhotoCard from "./PhotoCard";

/**
 * DB photos 그리드 + 모먼트3 [모두의 결과 ↔ 너의 결과] 토글.
 * you=true(추구미 카드 진입): 처음부터 '너의 결과'로, 헤더도 개인화 문구.
 */
export default function PhotoGrid({
  photos,
  query,
  you = false,
}: {
  photos: Photo[];
  query: string;
  you?: boolean;
}) {
  const { affinity, cardEverIssued } = useMoodStore();
  const [personal, setPersonal] = useState(you);

  const showToggle = you || (cardEverIssued && topShare(affinity) >= SKEW_THRESHOLD);

  const ordered =
    personal
      ? [...photos]
          .map((p) => ({
            p,
            s: Object.entries(p.mood_vector ?? {}).reduce((a, [k, v]) => a + (affinity[k] ?? 0) * v, 0),
          }))
          .sort((a, b) => b.s - a.s)
          .map((x) => x.p)
      : photos;

  return (
    <div>
      <h2 className="mb-4 text-[20px] font-bold tracking-[-0.4px]">
        {you ? "너의 추구미로 골라봤어" : `‘${query}’ 느낌`}
      </h2>

      {showToggle && (
        <div className="mb-4 inline-flex rounded-full border border-line p-1 text-[13px]">
          <button
            type="button"
            onClick={() => setPersonal(false)}
            className={`rounded-full px-3.5 py-1.5 transition ${!personal ? "bg-accent text-white" : "text-ink-soft"}`}
          >
            모두의 결과
          </button>
          <button
            type="button"
            onClick={() => setPersonal(true)}
            className={`rounded-full px-3.5 py-1.5 transition ${personal ? "bg-accent text-white" : "text-ink-soft"}`}
          >
            너의 결과
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {ordered.map((p, idx) => (
          <PhotoCard key={p.id} photo={p} query={query} hint={idx === 0} />
        ))}
      </div>
    </div>
  );
}
