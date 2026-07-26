"use client";

import Link from "next/link";
import BackButton from "./BackButton";
import { MOODS } from "@/lib/moods";
import { slotPieces, formatMan } from "@/lib/products";
import { useMoodStore } from "@/lib/store";

/**
 * #9 원본 소환 — '내 옷' 아이템 상세. 순서 고정:
 * ① 반했던 원본 무드샷 ② 해설 2행 ③ 입는 법(how, 없으면 미표시) ④ 이거 들어간 룩(마지막 조각).
 * 금지: 옷을 평가하는 판정 문구 — 기준점 재제시만. [입었어]는 조용한 카운트.
 */
export default function ClosetItem({ id }: { id: string }) {
  const { owned, hydrated, wornOf, recordWorn } = useMoodStore();

  if (!hydrated) return null;

  // params.id 가 인코딩된 채 올 수도(%2F 미해제), 디코딩돼 올 수도 있어 양쪽 다 매칭.
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    /* 잘못된 인코딩이면 원본 사용 */
  }
  const item = owned.find(
    (o) => o.id === id || o.id === decoded || encodeURIComponent(o.id) === id
  );
  if (!item || !MOODS[item.moodKey]) {
    return (
      <div className="animate-fade px-5 pb-14">
        <BackButton href="/space" />
        <p className="mt-10 text-center text-[14px] text-ink-soft">이 옷을 찾을 수 없어.</p>
      </div>
    );
  }

  const mood = MOODS[item.moodKey];
  const worn = wornOf(id);
  const pieces = slotPieces();
  const ownedCats = new Set(owned.map((o) => o.category).filter(Boolean));

  return (
    <div className="animate-fade px-5 pb-14">
      <BackButton href="/space" />

      {/* ① 반했던 원본 무드샷 (풀폭) */}
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

      {/* ② 해설 2행 재표시 (기준점 재제시) */}
      <div className="mt-4 rounded-xl bg-paper-2 p-4">
        <div className="mb-1 text-[11px] text-ink-faint">네가 반했던 이유</div>
        <p className="text-[14px] leading-relaxed">{mood.caption}</p>
      </div>

      {/* ③ 입는 법 (있을 때만 — 빈 줄 금지) */}
      {mood.how && (
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{mood.how}</p>
      )}

      {/* [입었어] 축적 (조용한 카운트) + 착용 0 살리기 문구 */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="text-[13px] text-ink-soft">
          {worn > 0 ? (
            <span className="font-medium text-ink">{worn}번째 입음</span>
          ) : (
            "아직 못 입었지? 조합 3개 있어"
          )}
        </div>
        <button
          type="button"
          onClick={() => recordWorn(id)}
          className="flex-shrink-0 rounded-full border border-line px-4 py-2 text-[13px] font-semibold text-ink transition hover:border-accent"
        >
          입었어
        </button>
      </div>

      {/* ④ 이거 들어간 룩 (마지막 조각) */}
      <div className="mt-7">
        <div className="mb-2 text-[13px] font-semibold">이거 들어간 룩</div>
        <div className="flex flex-col gap-2">
          {pieces.map((p) => {
            const has = ownedCats.has(p.category);
            const range = p.low < p.mid ? `${formatMan(p.low)}~${formatMan(p.mid)}` : formatMan(p.mid);
            if (has) {
              return (
                <div
                  key={p.category}
                  className="flex items-center justify-between rounded-xl border border-line bg-white p-3 text-[13px]"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-accent">있는 것 ✓</span>
                </div>
              );
            }
            return (
              <Link
                key={p.category}
                href={`/mood/${item.moodKey}`}
                className="flex items-center justify-between rounded-xl border border-line bg-white p-3 text-[13px] transition hover:border-accent"
              >
                <span className="text-ink-soft">
                  더하면 완성 — <span className="font-medium text-ink">{p.name}</span>{" "}
                  <span className="font-latin tnum">{range}</span>
                </span>
                <span className="text-ink-faint">›</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
