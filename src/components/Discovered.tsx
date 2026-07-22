"use client";

import Link from "next/link";
import { MOODS } from "@/lib/moods";
import { useMoodStore } from "@/lib/store";

/**
 * 나의 공간 '발견' 결 (C7) — 스크린샷으로 담은 무드가 모인다.
 * 동경(저장)·소유(내 옷)와 나란한 3결의 하나.
 */
export default function Discovered() {
  const { discovered } = useMoodStore();
  if (discovered.length === 0) return null;

  return (
    <div>
      <div className="mb-2 text-[12px] text-ink-faint">발견 — 스샷으로 담은 것</div>
      <div className="grid grid-cols-3 gap-2">
        {discovered.map((d) => {
          const mood = MOODS[d.moodKey];
          if (!mood) return null;
          return (
            <Link
              key={d.id}
              href={`/mood/${d.moodKey}`}
              className="relative block aspect-[3/4] overflow-hidden rounded-xl"
            >
              <div
                className="absolute inset-0"
                style={
                  mood.imageUrl
                    ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: mood.gradient }
                }
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
