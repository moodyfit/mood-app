"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import { useMoodStore } from "@/lib/store";

// 로그인/회원가입 — 이메일+비밀번호(Supabase Auth). 로그인 순간 익명 취향이 계정으로 병합됨.
export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user } = useMoodStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // 이미 로그인 상태면 안내
  if (user) {
    return (
      <div className="animate-fade px-5 pb-14">
        <BackButton href="/space" />
        <h1 className="mb-2 mt-2 text-[22px] font-extrabold tracking-[-0.5px]">이미 로그인됨</h1>
        <p className="text-[14px] text-ink-soft">{user.email}로 로그인돼 있어.</p>
        <button
          type="button"
          onClick={() => router.push("/space")}
          className="mt-6 w-full rounded-[12px] bg-ink py-3.5 text-[15px] font-semibold text-white"
        >
          나의 공간으로
        </button>
      </div>
    );
  }

  async function submit() {
    const em = email.trim();
    if (!em || !pw) {
      setMsg("이메일과 비밀번호를 넣어줘.");
      return;
    }
    if (pw.length < 6) {
      setMsg("비밀번호는 6자 이상이어야 해.");
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = mode === "login" ? await signIn(em, pw) : await signUp(em, pw);
    setBusy(false);
    if (res.error) {
      setMsg(res.error);
      return;
    }
    if (res.needsConfirm) {
      setMsg("확인 메일을 보냈어. 메일에서 인증하면 로그인돼.");
      return;
    }
    router.push("/space");
  }

  return (
    <div className="animate-fade px-5 pb-14">
      <BackButton href="/space" />
      <h1 className="mb-1 mt-2 text-[22px] font-extrabold tracking-[-0.5px]">
        {mode === "login" ? "로그인" : "회원가입"}
      </h1>
      <p className="mb-6 text-[13px] text-ink-soft">
        {mode === "login"
          ? "로그인하면 취향이 기기 상관없이 이어져."
          : "가입하면 지금까지 모은 취향이 계정으로 옮겨져."}
      </p>

      <div className="flex flex-col gap-2.5">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          className="w-full rounded-[10px] border border-line bg-white px-4 py-3.5 text-[15px] outline-none focus:border-accent"
        />
        <input
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="비밀번호 (6자 이상)"
          className="w-full rounded-[10px] border border-line bg-white px-4 py-3.5 text-[15px] outline-none focus:border-accent"
        />
      </div>

      {msg && <p className="mt-3 text-[13px] text-accent">{msg}</p>}

      <button
        type="button"
        onClick={submit}
        disabled={busy}
        className="mt-5 w-full rounded-[12px] bg-ink py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
      >
        {busy ? "처리 중…" : mode === "login" ? "로그인" : "회원가입"}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setMsg(null);
        }}
        className="mt-4 w-full text-center text-[13.5px] text-ink-soft"
      >
        {mode === "login" ? "계정이 없어? 회원가입" : "이미 계정이 있어? 로그인"}
      </button>
    </div>
  );
}
