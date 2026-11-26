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

export function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * FEAT-041 프로토타입 — 무신사 스냅 필터 바텀시트 참고. 탭(스타일/TPO/무드)을 안 닫고 자유롭게
 * 넘나들며 고르고, 바닥의 적용 버튼 하나로 한 번에 반영한다. 정확한 결과 수는 안 보여주고,
 * 0장일 때만 적용 버튼을 막는다.
 *
 * 스타일 탭 안 "커스텀 필터"는 체크박스 목록 아래 접어둔 아코디언(평소 접힘, 눌러야 슬라이더가
 * 보임) — 체크박스는 그대로 두고 그 아래에서만 펼쳐진다. 슬라이더에 값이 하나라도 있으면
 * 체크박스 대신 그 비율로 랭킹한다(둘 다 차 있으면 슬라이더 우선).
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
  /** BUG 수정: 이 탭·다른 탭에서 아직 "적용" 안 한 draft(특히 TPO·무드)를 같이 넘겨받아야,
   * 슬라이더로 적용할 때 그 선택들이 날아가지 않는다(에린 리포트 — 간헐적 TPO/무드 초기화). */
  onApplyCustom: (restDraft: FilterSelections) => void;
}) {
  const [tab, setTab] = useState<Axis>(initialTab);
  const [draft, setDraft] = useState<FilterSelections>({
    style: new Set(initial.style),
    tpo: new Set(initial.tpo),
    vibe: new Set(initial.vibe),
  });
  const [customExpanded, setCustomExpanded] = useState(false);

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

  const customHasWeight = Object.values(customDraft).some((v) => v > 0);
  const countDraft = customHasWeight ? { ...draft, style: new Set<string>() } : draft;
  const count = countMatches(genderedPhotos, countDraft);
  const empty = !customHasWeight && count === 0;

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

        <div className="flex items-center justify-end px-5 pt-3 text-[12px]">
          <button type="button" onClick={resetTab} className="text-ink-soft underline">
            초기화
          </button>
        </div>

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

        {tab === "style" && (
          <div className="px-5 pb-2">
            <button
              type="button"
              onClick={() => setCustomExpanded((v) => !v)}
              className="flex w-full items-center justify-between border-t border-line py-3 text-[13px] text-ink-soft"
            >
              <span className="inline-flex items-center gap-1">
                커스텀 필터{customHasWeight ? " · 적용 중" : ""}
              </span>
              <Chevron open={customExpanded} />
            </button>
            {customExpanded && (
              <div className="flex flex-col gap-3 pb-3">
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
          </div>
        )}

        <div className="sticky bottom-0 bg-paper px-5 pb-6 pt-2">
          <button
            type="button"
            onClick={() => (customHasWeight ? onApplyCustom(draft) : onApply(draft))}
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
