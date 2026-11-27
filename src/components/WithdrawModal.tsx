"use client";

import { useState } from "react";
import { deleteAccount } from "@/lib/account";

const DELETED = ["내 취향 · 내 옷장 기록", "올린 사진", "이용 기록"];

/** 회원 탈퇴 확인 창. 탈퇴가 끝나면 onDone — 로그아웃 · 이동은 부른 쪽이 한다. */
export default function WithdrawModal({
  userId,
  onClose,
  onDone,
}: {
  userId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function withdraw() {
    setBusy(true);
    setError(null);
    const res = await deleteAccount(userId);
    if (res.ok) return onDone();
    setError(res.error);
    setBusy(false);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex animate-fade items-center justify-center bg-black/55 p-6 backdrop-blur-sm"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-title"
        className="w-full max-w-[340px] animate-pop rounded-[22px] bg-white p-[28px_24px_22px] shadow-[0_24px_70px_rgba(14,14,16,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="withdraw-title" className="text-[20px] font-extrabold tracking-[-0.4px]">
          정말 탈퇴할까요?
        </h2>
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">
          계정과 함께 아래 정보가 바로 삭제되고 되돌릴 수 없어요.
        </p>
        <ul className="mt-3 rounded-[10px] bg-paper-2 px-3.5 py-3 text-[13px] leading-[1.9]">
          {DELETED.map((d) => (
            <li key={d}>
              <span className="text-ink-soft">▪</span> {d}
            </li>
          ))}
        </ul>
        {error && (
          <p role="alert" className="mt-3 text-[13px] text-accent">
            {error}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 rounded-[10px] bg-paper-2 py-3.5 text-sm font-bold text-ink disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={withdraw}
            disabled={busy}
            className="flex-1 rounded-[10px] bg-ink py-3.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {busy ? "탈퇴하는 중…" : "탈퇴하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
