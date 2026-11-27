"use client";

import { useState, type InputHTMLAttributes } from "react";

/** 비밀번호 입력 + 눈 아이콘으로 보기/숨기기. 나머지 속성은 input에 그대로 넘긴다. */
export default function PasswordInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={show ? "text" : "password"}
        className="w-full rounded-[10px] border border-line bg-white py-3.5 pl-4 pr-12 text-[15px] outline-none focus:border-accent"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-ink-soft"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
          {show && <path d="M4 4l16 16" />}
        </svg>
      </button>
    </div>
  );
}
