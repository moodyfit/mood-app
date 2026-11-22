"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/ui/PasswordInput";
import { EXPIRED_LINK, K_LOGIN_EMAIL, useMoodStore } from "@/lib/store";

// 재설정 메일 링크로 들어오는 화면. 만료된 링크는 Supabase가 #error=...를 붙여 보낸다.
export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, signOut, user } = useMoodStore();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<"form" | "done" | "expired">("form");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (window.location.hash.includes("error")) setState("expired");
  }, []);

  const valid = pw.length >= 6 && pw === pw2;

  async function submit() {
    if (!valid) return;
    setBusy(true);
    setMsg(null);
    const res = await updatePassword(pw);
    if (!res.error) {
      try {
        if (user?.email) sessionStorage.setItem(K_LOGIN_EMAIL, user.email);
      } catch {
        /* 미리 채우기만 빠진다 */
      }
      try {
        await signOut(); // 복구 세션으로 로그인된 상태를 끊고 새 비밀번호로 로그인하게 한다
      } catch {
        /* 비밀번호는 이미 바뀌었다 — 완료 화면으로 넘어간다 */
      }
    }
    setBusy(false);
    if (!res.error) setState("done");
    else if (res.error === EXPIRED_LINK) setState("expired");
    else setMsg(res.error);
  }

  if (state !== "form") {
    const done = state === "done";
    return (
      <div className="animate-fade px-5 pb-14">
        <h1 className="mb-2 mt-8 text-[22px] font-extrabold tracking-[-0.5px]">
          {done ? "비밀번호를 바꿨어" : "링크가 만료됐어"}
        </h1>
        <p className="text-[14px] text-ink-soft">
          {done ? "새 비밀번호로 다시 로그인해줘." : "재설정 메일을 다시 요청해줘."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-6 w-full rounded-[12px] bg-ink py-3.5 text-[15px] font-semibold text-white"
        >
          {done ? "로그인하러 가기" : "로그인으로"}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade px-5 pb-14">
      <h1 className="mb-1 mt-8 text-[22px] font-extrabold tracking-[-0.5px]">새 비밀번호</h1>
      <p className="mb-6 text-[13px] text-ink-soft">앞으로 로그인할 때 쓸 비밀번호를 정해줘.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {/* 브라우저가 어느 계정의 비밀번호를 갱신할지 알도록 넘기는 아이디 칸 */}
        <input type="email" name="email" autoComplete="username" value={user?.email ?? ""} readOnly hidden />
        <div className="flex flex-col gap-2.5">
          <PasswordInput
            name="new-password"
            autoComplete="new-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="새 비밀번호 (6자 이상)"
          />
          <PasswordInput
            autoComplete="new-password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="새 비밀번호 확인"
          />
        </div>

        {pw2 && pw !== pw2 && <p className="mt-3 text-[13px] text-accent">두 비밀번호가 달라.</p>}
        {msg && <p className="mt-3 text-[13px] text-accent">{msg}</p>}

        <button
          type="submit"
          disabled={busy || !valid}
          className="mt-5 w-full rounded-[12px] bg-ink py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
        >
          {busy ? "처리 중…" : "변경하기"}
        </button>
      </form>
    </div>
  );
}
