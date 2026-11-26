"use client";

import { useState } from "react";
import { STYLE_OPTIONS, countMatches, type FilterSelections } from "@/lib/filters";
import type { Photo } from "@/lib/photos";
import type { Affinity } from "@/lib/types";

type Axis = "style" | "tpo" | "vibe";

const TABS: { key: Axis; label: string }[] = [
  { key: "style", label: "스타일" },
  { key: "tpo", label: "TPO" },
  { key: "vibe", label: "무드" },
];

/**
 * FEAT-041 프로토타입 — 무신사 스냅 필터 바텀시트 참고. 탭(스타일/TPO/무드)을 안 닫고 자유롭게
 * 넘나들며 고르고, 바닥의 적용 버튼 하나로 한 번에 반영한다(에린 피드백 — 축 버튼마다 따로
 * 닫히는 패널이 아니라 무신사처럼 하나의 시트 안에서 탭만 바꾸는 구조로 되돌림). 정확한 결과
 * 수는 안 보여주고(이전 피드백), 0장일 때만 적용 버튼을 막는다.
 */
export default function FilterSheet({
  initialTab,
  options,
  initial,
  genderedPhotos,
  onApply,
  onClose,
  customDraft,
  onCustomChange,
  onApplyCustom,
}: {
  initialTab: Axis;
  options: Record<Axis, { key: string; label: string }[]>;
  initial: FilterSelections;
  genderedPhotos: Photo[];
  onApply: (next: FilterSelections) => void;
  onClose: () => void;
  customDraft: Affinity;
  onCustomChange: (next: Affinity) => void;
  onApplyCustom: () => void;
}) {
  const [tab, setTab] = useState<Axis>(initialTab);
  const [draft, setDraft] = useState<FilterSelections>({
    style: new Set(initial.style),
    tpo: new Set(initial.tpo),
    vibe: new Set(initial.vibe),
  });
  const [mode, setMode] = useState<"list" | "custom">("list");

  function toggle(key: string) {
    setDraft((prev) => {
      const next = new Set(prev[tab]);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, [tab]: next };
    });
  }

  function resetTab() {
    setDraft((prev) => ({ ...prev, [tab]: new Set() }));
  }

  const count = countMatches(genderedPhotos, draft);
  const empty = mode === "list" && count === 0;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-end bg-black/40" role="dialog" aria-modal="true">
      <div className="max-h-[80vh] overflow-y-auto rounded-t-2xl bg-paper">
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="text-[16px] font-bold">필터</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-[18px] text-ink-soft">
            ×
          </button>
        </div>

        <div className="mt-3 flex gap-5 border-b border-line px-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`pb-2.5 text-[14px] transition ${
                tab === t.key ? "border-b-2 border-ink font-semibold text-ink" : "text-ink-faint"
              }`}
            >
              {t.label}
              {draft[t.key].size > 0 ? ` (${draft[t.key].size})` : ""}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-5 pt-3 text-[12px]">
          {tab === "style" ? (
            <button
              type="button"
              onClick={() => setMode((m) => (m === "list" ? "custom" : "list"))}
              className="text-ink-soft underline"
            >
              {mode === "list" ? "비율로 직접 정하기" : "목록에서 고르기"}
            </button>
          ) : (
            <span />
          )}
          {mode === "list" && (
            <button type="button" onClick={resetTab} className="text-ink-soft underline">
              초기화
            </button>
          )}
        </div>

        {mode === "list" || tab !== "style" ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 px-5 py-4">
            {options[tab].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={draft[tab].has(opt.key)}
                  onChange={() => toggle(opt.key)}
                  className="h-4 w-4"
                />
                {opt.label}
              </label>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 px-5 py-4">
            {STYLE_OPTIONS.map((cat) => (
              <div key={cat.mood}>
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span>{cat.label}</span>
                  <span className="text-ink-faint">{customDraft[cat.mood] ?? 0}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={customDraft[cat.mood] ?? 0}
                  onChange={(e) => onCustomChange({ ...customDraft, [cat.mood]: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}

        <div className="sticky bottom-0 bg-paper px-5 pb-6 pt-2">
          <button
            type="button"
            onClick={() => (mode === "custom" && tab === "style" ? onApplyCustom() : onApply(draft))}
            disabled={empty}
            className="w-full rounded-[12px] bg-ink py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
          >
            {empty ? "조건에 맞는 사진이 없어요" : "적용"}
          </button>
        </div>
      </div>
    </div>
  );
}
