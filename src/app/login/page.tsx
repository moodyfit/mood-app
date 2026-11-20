"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import PasswordInput from "@/components/ui/PasswordInput";
import { K_LOGIN_EMAIL, useMoodStore } from "@/lib/store";

const COPY = {
  login: { title: "로그인", desc: "로그인하면 취향이 기기 상관없이 이어져.", cta: "로그인", toggle: "계정이 없어? 회원가입" },
  signup: { title: "회원가입", desc: "가입하면 지금까지 모은 취향이 계정으로 옮겨져.", cta: "회원가입", toggle: "이미 계정이 있어? 로그인" },
  reset: { title: "비밀번호 재설정", desc: "가입한 이메일로 재설정 링크를 보내줄게.", cta: "재설정 메일 보내기", toggle: "로그인으로 돌아가기" },
} as const;

// 로그인/회원가입 — 이메일+비밀번호(Supabase Auth). 로그인 순간 익명 취향이 계정으로 병합됨.
export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, requestPasswordReset, user } = useMoodStore();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(K_LOGIN_EMAIL);
      if (saved) setEmail(saved);
      sessionStorage.removeItem(K_LOGIN_EMAIL);
    } catch {
      /* 저장소 접근 불가 — 빈 칸으로 시작 */
    }
  }, []);

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
    if (mode === "reset") {
      if (!em) {
        setMsg("이메일을 넣어줘.");
        return;
      }
      setBusy(true);
      setMsg(null);
      const res = await requestPasswordReset(em);
      setBusy(false);
      setMsg(res.error ?? "메일을 보냈어. 메일함을 확인해줘.");
      return;
    }
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
        {COPY[mode].title}
      </h1>
      <p className="mb-6 text-[13px] text-ink-soft">
        {COPY[mode].desc}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex flex-col gap-2.5">
          <input
            type="email"
            name="email"
            inputMode="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full rounded-[10px] border border-line bg-white px-4 py-3.5 text-[15px] outline-none focus:border-accent"
          />
          {mode !== "reset" && (
            <PasswordInput
              key={mode}
              name="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호 (6자 이상)"
            />
          )}
        </div>

        {msg && <p className="mt-3 text-[13px] text-accent">{msg}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 w-full rounded-[12px] bg-ink py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
        >
          {busy ? "처리 중…" : COPY[mode].cta}
        </button>
      </form>

      {mode === "login" && (
        <button
          type="button"
          onClick={() => {
            setMode("reset");
            setMsg(null);
            setPw("");
          }}
          className="mt-3 w-full text-center text-[13px] text-ink-soft"
        >
          비밀번호를 잊었어?
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setMsg(null);
          setPw("");
        }}
        className="mt-4 w-full text-center text-[13.5px] text-ink-soft"
      >
        {COPY[mode].toggle}
      </button>
    </div>
  );
}
