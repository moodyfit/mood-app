"use client";

import Link from "next/link";
import { MOODS } from "@/lib/moods";
import { photoUrl } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";
import type { OwnedItem } from "@/lib/types";

/**
 * 1.5.2 '내 옷' 결 — 나의 공간 3결(동경/발견/소유)의 소유.
 * 같은 사진에서 담은 옷은 코디로 묶는다(사진 탭 → 사진 상세). 사진 없는 옷은 한 줄씩.
 * 옷 탭 → 원본 소환(/closet/[id]).
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

  // 같은 photo 는 코디로 묶고(최근 담은 코디가 위), photo 없는 옷은 담은 순서대로 따로
  const byPhoto = new Map<string, OwnedItem[]>();
  const singles: OwnedItem[] = [];
  for (const item of owned) {
    if (!item.photo) {
      singles.push(item);
      continue;
    }
    byPhoto.set(item.photo, [...(byPhoto.get(item.photo) ?? []), item]);
  }
  const latest = (items: OwnedItem[]) => Math.max(...items.map((i) => i.at ?? 0));
  const looks = [...byPhoto.entries()].sort((a, b) => latest(b[1]) - latest(a[1]));

  return (
    <div>
      {!hideHeader && (
        <div className="mb-2 text-[12px] text-ink-faint">
          {promotedName ? `새로 온 ${promotedName}, 입어볼 조합` : "내 옷"}
        </div>
      )}

      {looks.length > 0 && (
        <>
          <div className="mb-1.5 text-[12px] font-semibold text-ink-soft">코디 {looks.length}</div>
          <div className="flex flex-col gap-2">
            {looks.map(([photo, items]) => {
              const mood = MOODS[items[0].moodKey];
              const slug = photo.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
              return (
                <div key={photo} className="rounded-xl border border-line bg-white">
                  <Link href={`/photo?slug=${encodeURIComponent(slug)}`} className="flex items-center gap-3 p-3">
                    <div
                      className="h-11 w-11 flex-shrink-0 rounded-lg bg-paper-2"
                      style={{ backgroundImage: `url(${photoUrl(photo)})`, backgroundSize: "cover", backgroundPosition: "center" }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[14px] font-medium">코디 · {mood?.name ?? items[0].moodKey}</div>
                      <div className="mt-0.5 truncate text-[12px] text-ink-soft">
                        {items.map((i) => i.name).join(" · ")}
                      </div>
                    </div>
                    <span className="flex-shrink-0 rounded-full border border-line px-2.5 py-1 text-[11px] text-ink-soft">
                      사진 보기
                    </span>
                  </Link>
                  <div className="border-t border-line">
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        href={`/closet/item?id=${encodeURIComponent(item.id)}`}
                        className="flex items-center justify-between py-2.5 pl-[68px] pr-3 text-[13px] transition hover:bg-paper-2"
                      >
                        <span className="truncate">{item.name}</span>
                        <span className="text-ink-faint">›</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {singles.length > 0 && (
        <>
          <div className={`mb-1.5 text-[12px] font-semibold text-ink-soft ${looks.length > 0 ? "mt-5" : ""}`}>
            옷 {singles.length}
          </div>
          <div className="flex flex-col gap-2">
            {singles.map((item) => {
              const mood = MOODS[item.moodKey];
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl border border-line bg-white p-3"
                >
                  <Link href={`/closet/item?id=${encodeURIComponent(item.id)}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <div
                      className="h-11 w-11 flex-shrink-0 rounded-lg"
                      style={
                        mood?.imageUrl
                          ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                          : { background: mood?.gradient }
                      }
                    />
                    <div className="min-w-0 flex-1 text-[14px] font-medium">{item.name}</div>
                    <span className="text-ink-faint">›</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
