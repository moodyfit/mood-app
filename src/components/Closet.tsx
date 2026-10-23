"use client";

import Link from "next/link";
import { MOODS } from "@/lib/moods";
import { useMoodStore } from "@/lib/store";

/**
 * 1.5.2 '내 옷' 결 — 나의 공간 3결(동경/발견/소유)의 소유.
 * 카드 탭 → 원본 소환(/closet/[id]).
 */
export default function Closet({
  promotedName,
  hideHeader = false,
}: {
  promotedName?: string;
  hideHeader?: boolean;
}) {
  const { owned } = useMoodStore();
  if (owned.length === 0) {
    return <p className="text-[13px] text-ink-soft">아직 담은 옷이 없어.</p>;
  }

  return (
    <div>
      {!hideHeader && (
        <div className="mb-2 text-[12px] text-ink-faint">
          {promotedName ? `새로 온 ${promotedName}, 입어볼 조합` : "내 옷"}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {owned.map((item) => {
          const mood = MOODS[item.moodKey];
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-line bg-white p-3"
            >
              <Link href={`/closet/${encodeURIComponent(item.id)}`} className="flex min-w-0 flex-1 items-center gap-3">
                <div
                  className="h-11 w-11 flex-shrink-0 rounded-lg"
                  style={
                    mood?.imageUrl
                      ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: mood?.gradient }
                  }
                />
                <div className="min-w-0 flex-1 text-[14px] font-medium">{item.name}</div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
