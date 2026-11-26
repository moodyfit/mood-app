"use client";

import { useState } from "react";
import { STYLE_OPTIONS } from "@/lib/filters";
import type { Affinity } from "@/lib/types";

type Axis = "style" | "tpo" | "vibe";

const AXIS_LABEL: Record<Axis, string> = { style: "스타일", tpo: "TPO", vibe: "무드" };

/**
 * FEAT-041 프로토타입 — 무신사 스냅 필터 참고, 축 하나(스타일/TPO/무드)를 다루는 패널.
 * 탭 전환 없이 메인 화면의 칩 버튼 3개가 각자 이 패널을 연다. 탭 안 다중선택(OR)은 그대로 두되,
 * 정확한 결과 수는 더는 보여주지 않는다 — 0장일 때만 적용 버튼을 막고 문구로 알린다(에린 피드백:
 * 숫자 노출은 빼고 싶다).
 */
export default function FilterSheet({
  axis,
  options,
  initialSelected,
  countIfApplied,
  onApply,
  onClose,
  customDraft,
  onCustomChange,
  onApplyCustom,
}: {
  axis: Axis;
  options: { key: string; label: string }[];
  initialSelected: Set<string>;
  /** 지금 다른 축 선택은 그대로 두고, 이 축만 바꿨을 때 몇 장이 남는지(0 체크용, 화면엔 숫자 자체를 안 보여줌). */
  countIfApplied: (selected: Set<string>) => number;
  onApply: (next: Set<string>) => void;
  onClose: () => void;
  /** 스타일 축 전용 — "비율로 직접 정하기"(슬라이더) 모드. 다른 축엔 안 넘기면 토글이 안 보임. */
  customDraft?: Affinity;
  onCustomChange?: (next: Affinity) => void;
  onApplyCustom?: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [mode, setMode] = useState<"list" | "custom">("list");
  const canCustom = axis === "style" && customDraft !== undefined && onCustomChange && onApplyCustom;

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const count = countIfApplied(selected);
  const empty = mode === "list" && count === 0;

  return (
    <div className="fixed inset-0 z-[90] flex flex-col justify-end bg-black/40" role="dialog" aria-modal="true">
      <div className="max-h-[80vh] overflow-y-auto rounded-t-2xl bg-paper">
        <div className="flex items-center justify-between px-5 pt-4">
          <h2 className="text-[16px] font-bold">{AXIS_LABEL[axis]}</h2>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-[18px] text-ink-soft">
            ×
          </button>
        </div>

        <div className="flex items-center justify-between px-5 pt-3 text-[12px]">
          {canCustom ? (
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
            <button type="button" onClick={() => setSelected(new Set())} className="text-ink-soft underline">
              초기화
            </button>
          )}
        </div>

        {mode === "list" ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 px-5 py-4">
            {options.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={selected.has(opt.key)}
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
                  <span className="text-ink-faint">{customDraft?.[cat.mood] ?? 0}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={customDraft?.[cat.mood] ?? 0}
                  onChange={(e) => onCustomChange?.({ ...customDraft, [cat.mood]: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        )}

        <div className="sticky bottom-0 bg-paper px-5 pb-6 pt-2">
          <button
            type="button"
            onClick={() => (mode === "custom" ? onApplyCustom?.() : onApply(selected))}
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
