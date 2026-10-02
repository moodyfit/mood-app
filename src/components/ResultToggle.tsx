"use client";

import { useState } from "react";
import { TASTE_CARD_THRESHOLD } from "@/lib/taste";
import { haptic } from "@/lib/haptic";

/**
 * 모먼트 3 토글 — 상시 노출, 두 상태 모두 '살아있는' UI(회색 비활성 금지).
 * · 프로필 미형성: '너의 결과' 탭 → 전환 대신 초대 문구("N장만 저장하면 열려").
 * · 형성 후: 기본값 '너의 결과', 전환 시 "N장이 자리를 바꿨어" 1줄.
 */
export default function ResultToggle({
  personal,
  formed,
  savedCount,
  changedCount,
  onChange,
  labels = ["모두의 결과", "너의 결과"],
  invite,
  rightNote,
  leftNote = null,
}: {
  personal: boolean;
  formed: boolean;
  savedCount: number;
  changedCount: number;
  onChange: (p: boolean) => void;
  labels?: [string, string];
  invite?: string; // 오른쪽(개인화) 탭 시 미형성 초대 문구
  rightNote?: string; // 오른쪽 전환 노트 오버라이드('' = 노트 없음)
  leftNote?: string | null; // 왼쪽 전환 노트
}) {
  const [note, setNote] = useState<string | null>(null);

  function pickAll() {
    haptic();
    onChange(false);
    setNote(leftNote);
  }
  function pickYou() {
    haptic();
    if (!formed) {
      const left = Math.max(1, TASTE_CARD_THRESHOLD - savedCount);
      setNote(invite ?? `${left}장만 담으면 너만의 결과가 열려`);
      return;
    }
    onChange(true);
    setNote(
      rightNote !== undefined
        ? rightNote
        : changedCount > 0
          ? `네 취향 반영으로 ${changedCount}장이 자리를 바꿨어`
          : "네 취향으로 정렬했어"
    );
  }

  const tab = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 transition ${active ? "bg-accent text-white" : "text-ink-soft"}`;

  return (
    <div className="mb-4">
      <div className="inline-flex rounded-full border border-line p-1 text-[13px]">
        <button type="button" onClick={pickAll} className={tab(!personal)}>
          {labels[0]}
        </button>
        <button type="button" onClick={pickYou} className={tab(personal)}>
          {labels[1]}
        </button>
      </div>
      {note && <div className="mt-2 text-[12.5px] text-ink-soft">{note}</div>}
    </div>
  );
}
