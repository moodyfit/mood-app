"use client";

import { useState } from "react";
import { TASTE_CARD_THRESHOLD } from "@/lib/taste";

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
}: {
  personal: boolean;
  formed: boolean;
  savedCount: number;
  changedCount: number;
  onChange: (p: boolean) => void;
}) {
  const [note, setNote] = useState<string | null>(null);

  function pickAll() {
    onChange(false);
    setNote(null);
  }
  function pickYou() {
    if (!formed) {
      const left = Math.max(1, TASTE_CARD_THRESHOLD - savedCount);
      setNote(`${left}장만 저장하면 너만의 결과가 열려`);
      return;
    }
    onChange(true);
    setNote(changedCount > 0 ? `${changedCount}장이 자리를 바꿨어` : "너의 취향으로 정렬했어");
  }

  const tab = (active: boolean) =>
    `rounded-full px-3.5 py-1.5 transition ${active ? "bg-accent text-white" : "text-ink-soft"}`;

  return (
    <div className="mb-4">
      <div className="inline-flex rounded-full border border-line p-1 text-[13px]">
        <button type="button" onClick={pickAll} className={tab(!personal)}>
          모두의 결과
        </button>
        <button type="button" onClick={pickYou} className={tab(personal)}>
          너의 결과
        </button>
      </div>
      {note && <div className="mt-2 text-[12.5px] text-ink-soft">{note}</div>}
    </div>
  );
}
