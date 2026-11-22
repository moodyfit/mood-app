"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SignupConsent from "@/components/SignupConsent";
import { useMoodStore } from "@/lib/store";

// 문서를 읽거나 재설정 링크로 들어온 화면은 덮지 않는다
const SKIP = ["/terms", "/privacy", "/reset-password"];

/** 로그인했지만 가입 동의 기록이 없는 계정(카카오 첫 가입 · 기존 계정)에 전체 화면으로 동의를 받는다. */
export default function ConsentGate() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, recordConsent, signOut } = useMoodStore();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!user || user.consented || SKIP.some((p) => pathname?.startsWith(p))) return null;

  // 카카오는 버튼 한 번에 계정이 생겨 여기서 가입을 마친다. 그 외는 동의 기록 없이 가입한 기존 계정
  const kakao = user.provider === "kakao";

  async function accept() {
    setBusy(true);
    setMsg(null);
    const res = await recordConsent();
    setBusy(false);
    if (res.error) setMsg(res.error);
  }

  async function leave() {
    await signOut().catch(() => {});
    router.replace("/login");
  }

  return (
    <div className="fixed inset-0 z-[90] overflow-y-auto bg-paper" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <div className="mx-auto max-w-frame px-5 pb-14 pt-16">
        <h1 id="consent-title" className="mb-1 text-[22px] font-extrabold tracking-[-0.5px]">
          {kakao ? "회원가입" : "서비스 이용 약관에 동의해 주세요"}
        </h1>
        <p className="text-[13px] text-ink-soft">
          {kakao ? "카카오 계정으로 가입해요." : "무드핏을 이용하려면 필수 항목에 동의해야 해요."}
        </p>
        {kakao ? (
          <input
            type="email"
            value={user.email ?? ""}
            readOnly
            aria-label="이메일"
            className="mt-5 w-full rounded-[10px] border border-line bg-paper-2 px-4 py-3.5 text-[15px] text-ink-soft outline-none"
          />
        ) : (
          user.email && <p className="mt-1 text-[12px] text-ink-faint">{user.email}</p>
        )}

        <SignupConsent onChange={setAgreed} />

        {msg && <p className="mt-3 text-[13px] text-accent">{msg}</p>}

        <button
          type="button"
          onClick={accept}
          disabled={busy || !agreed}
          className="mt-5 w-full rounded-[12px] bg-ink py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
        >
          {busy ? "처리 중…" : kakao ? "가입하기" : "동의하고 시작하기"}
        </button>
        <button type="button" onClick={leave} className="mt-3 w-full text-center text-[13px] text-ink-soft">
          {kakao ? "가입하지 않고 나가기" : "동의하지 않고 나가기"}
        </button>
      </div>
    </div>
  );
}
