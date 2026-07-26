"use client";

import { useState } from "react";
import { useMoodStore } from "@/lib/store";
import type { BodyProfile } from "@/lib/store";

const BODY: NonNullable<BodyProfile["bodyType"]>[] = ["마른", "보통", "통통", "근육"];
const COLOR: NonNullable<BodyProfile["personalColor"]>[] = ["웜", "쿨", "모름"];

/**
 * 신체 프로필 — 한 번 넣으면 이후 모든 룩 검색이 이걸로 걸러짐(고정 검색축·락인).
 * 접힘 기본, 펼쳐서 체형·퍼스널컬러·키 선택. 저장 즉시 결과 재정렬.
 */
export default function ProfileBar() {
  const { bodyProfile, setBodyProfile, hydrated } = useMoodStore();
  const [open, setOpen] = useState(false);
  if (!hydrated) return null;

  const set = bodyProfile.bodyType || bodyProfile.personalColor || bodyProfile.height;
  const summary = set
    ? [bodyProfile.bodyType, bodyProfile.personalColor && `${bodyProfile.personalColor}톤`, bodyProfile.height && `${bodyProfile.height}cm`]
        .filter(Boolean)
        .join(" · ")
    : "내 몸에 맞춰 걸러줄게 — 한 번만 넣어둬";

  return (
    <div className="border-b border-line bg-paper-2 px-5 py-2.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-[12.5px] text-ink-soft">
          <span className="font-semibold text-ink">내 정보</span>
          <span className="ml-2">{summary}</span>
        </span>
        <span className="text-[12px] text-ink-faint">{open ? "접기" : set ? "수정" : "입력"}</span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <Row label="체형">
            {BODY.map((b) => (
              <Chip key={b} active={bodyProfile.bodyType === b} onClick={() => setBodyProfile({ ...bodyProfile, bodyType: bodyProfile.bodyType === b ? undefined : b })}>
                {b}
              </Chip>
            ))}
          </Row>
          <Row label="퍼스널컬러">
            {COLOR.map((c) => (
              <Chip key={c} active={bodyProfile.personalColor === c} onClick={() => setBodyProfile({ ...bodyProfile, personalColor: bodyProfile.personalColor === c ? undefined : c })}>
                {c}
              </Chip>
            ))}
          </Row>
          <Row label="키">
            <input
              type="number"
              inputMode="numeric"
              value={bodyProfile.height ?? ""}
              onChange={(e) => {
                const v = e.target.value ? Number(e.target.value) : undefined;
                setBodyProfile({ ...bodyProfile, height: v });
              }}
              placeholder="cm"
              className="w-24 rounded-lg border border-line bg-white px-3 py-1.5 text-[13px] outline-none focus:border-accent"
            />
          </Row>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-[12px] text-ink-faint">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[12.5px] transition ${
        active ? "border-accent bg-accent text-white" : "border-line bg-white text-ink hover:border-accent"
      }`}
    >
      {children}
    </button>
  );
}
