"use client";

import { useState } from "react";
import MoodCard from "./MoodCard";
import { MOODS, resolveMoods } from "@/lib/moods";
import { personalizeOrder } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";

/**
 * 모먼트 3: [모두의 결과 ↔ 너의 결과] 토글.
 * 취향 학습을 유저가 직접 조작 → "너를 배웠다"를 손가락 한 번으로 증명.
 * 추구미 카드가 발급된(취향이 생긴) 뒤에만 노출.
 */
export default function ResultsGrid({ query }: { query: string }) {
  const { cardEverIssued, saves } = useMoodStore();
  const [personal, setPersonal] = useState(false);

  const base = resolveMoods(query); // 모두의 결과 (실패 없는 폴백 보장)
  const ordered = personal ? personalizeOrder(base, saves) : base;

  return (
    <div>
      {cardEverIssued && (
        <div className="mb-4 inline-flex rounded-full border border-line p-1 text-[13px]">
          <button
            type="button"
            onClick={() => setPersonal(false)}
            className={`rounded-full px-3.5 py-1.5 transition ${
              !personal ? "bg-accent text-white" : "text-ink-soft"
            }`}
          >
            모두의 결과
          </button>
          <button
            type="button"
            onClick={() => setPersonal(true)}
            className={`rounded-full px-3.5 py-1.5 transition ${
              personal ? "bg-accent text-white" : "text-ink-soft"
            }`}
          >
            너의 결과
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {ordered.map((key) => {
          const mood = MOODS[key];
          if (!mood) return null;
          return <MoodCard key={key} mood={mood} />;
        })}
      </div>
    </div>
  );
}
