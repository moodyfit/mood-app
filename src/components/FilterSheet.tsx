"use client";

import { useState } from "react";
import { OCCASIONS, VIBE_CHIPS } from "@/lib/moods";
import { STYLE_OPTIONS, countMatches, type FilterSelections } from "@/lib/filters";
import type { Photo } from "@/lib/photos";

/**
 * FEAT-041 프로토타입 — 무신사 스냅 필터 바텀시트 참고.
 * 탭(스타일/TPO/무드)을 전환하며 체크박스로 고르고, 바닥의 "N장 보기" 버튼이 지금 선택
 * 조합으로 몇 장이 나올지 실시간으로 보여준다. 무신사와 다른 점: 거긴 백만 단위라 걱정 없지만
 * 우리는 59장뿐이라 "N장 보기"가 0으로 떨어지는 조합이 흔함 — 그걸 숨기지 않고 미리 보여줘서
 * 사용자가 직접 보고 빼게 한다(필터가 깨진 게 아니라 데이터가 적다는 걸 투명하게).
 */
const TABS = [
  { key: "style" as const, label: "스타일" },
  { key: "tpo" as const, label: "TPO" },
  { key: "vibe" as const, label: "무드" },
];

export default function FilterSheet({
  initial,
  genderedPhotos,
  onApply,
  onClose,
}: {
  initial: FilterSelections;
  genderedPhotos: Photo[];
  onApply: (next: FilterSelections) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"style" | "tpo" | "vibe">("style");
  const [draft, setDraft] = useState<FilterSelections>({
    style: new Set(initial.style),
    tpo: new Set(initial.tpo),
    vibe: new Set(initial.vibe),
  });

  function toggle(key: "style" | "tpo" | "vibe", value: string) {
    setDraft((prev) => {
      const next = new Set(prev[key]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, [key]: next };
    });
  }

  function resetTab() {
    setDraft((prev) => ({ ...prev, [tab]: new Set() }));
  }

  function resetAll() {
    setDraft({ style: new Set(), tpo: new Set(), vibe: new Set() });
  }

  const liveCount = countMatches(genderedPhotos, draft);
  const allCount = genderedPhotos.length;

  const options: { key: string; label: string }[] =
    tab === "style"
      ? STYLE_OPTIONS.map((c) => ({ key: c.mood, label: c.label }))
      : tab === "tpo"
      ? OCCASIONS.map((o) => ({ key: o, label: o }))
      : VIBE_CHIPS.map((v) => ({ key: v, label: v }));

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

        <div className="flex items-center justify-between px-5 pt-3 text-[12px] text-ink-faint">
          <span>탭 안에서는 여러 개 선택 가능(합쳐서 찾음)</span>
          <button type="button" onClick={resetTab} className="underline">
            이 탭 초기화
          </button>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 px-5 py-4">
          {options.map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-[14px]">
              <input
                type="checkbox"
                checked={draft[tab].has(opt.key)}
                onChange={() => toggle(tab, opt.key)}
                className="h-4 w-4"
              />
              {opt.label}
            </label>
          ))}
        </div>

        <div className="sticky bottom-0 bg-paper px-5 pb-6 pt-2">
          <button
            type="button"
            onClick={() => onApply(draft)}
            className="w-full rounded-[12px] bg-ink py-3.5 text-[15px] font-semibold text-white disabled:opacity-50"
            disabled={liveCount === 0}
          >
            {liveCount}장 보기
          </button>
          <button type="button" onClick={resetAll} className="mt-2 w-full text-center text-[13px] text-ink-soft">
            선택 초기화하고 {allCount}장 보기
          </button>
        </div>
      </div>
    </div>
  );
}
