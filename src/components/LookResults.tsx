"use client";

import { useMoodStore } from "@/lib/store";
import { applyProfile, type LookCard } from "@/lib/videos";
import LookCardView from "./LookCard";

/**
 * 결과 = 룩 카드 목록. 서버가 상황 검색으로 후보를 주면, 클라이언트에서 신체 프로필로 재정렬(락인).
 * 프로필은 localStorage라 여기서(클라이언트) 필터 — 라이브 키는 서버에 안전.
 */
export default function LookResults({
  looks,
  query,
  live,
}: {
  looks: LookCard[];
  query: string;
  live: boolean;
}) {
  const { bodyProfile } = useMoodStore();
  const ordered = applyProfile(looks, bodyProfile);
  const filtered = Boolean(bodyProfile.bodyType || bodyProfile.personalColor);

  return (
    <div className="px-5 pb-24 pt-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[18px] font-bold tracking-[-0.4px]">
          {query ? `‘${query}’ 이런 룩` : "이런 상황, 이런 룩"}
        </h2>
        <span className="text-[12px] text-ink-faint">{ordered.length}개</span>
      </div>

      {filtered && (
        <div className="mb-3 text-[12px] text-ink-soft">
          네 {bodyProfile.bodyType ?? ""}
          {bodyProfile.bodyType && bodyProfile.personalColor ? " · " : ""}
          {bodyProfile.personalColor && bodyProfile.personalColor !== "모름" ? `${bodyProfile.personalColor}톤` : ""}
          에 맞는 순서로 걸렀어.
        </div>
      )}

      {ordered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-6 text-center text-[13.5px] text-ink-soft">
          딱 맞는 룩을 못 찾았어. 다른 상황으로 검색해봐.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {ordered.map((l) => (
            <LookCardView key={l.id} look={l} />
          ))}
        </div>
      )}

      {!live && (
        <p className="mt-6 text-center text-[11.5px] leading-relaxed text-ink-faint">
          지금은 큐레이션된 룩에서 찾고 있어.
          <br />
          실시간 유튜브 재편집은 API 키 연결 후 켜져.
        </p>
      )}
    </div>
  );
}
