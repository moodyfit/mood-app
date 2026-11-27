"use client";

import { useState } from "react";
import Link from "next/link";

const ITEMS = [
  { key: "age", label: "(필수) 만 14세 이상이에요" },
  { key: "terms", label: "(필수) 이용약관 동의" },
  { key: "privacy", label: "(필수) 개인정보 수집 · 이용 동의" },
] as const;
type Key = (typeof ITEMS)[number]["key"];

// 개인정보보호법 제15조 제2항 고지 사항 — 처리방침(/privacy) 제2 · 3조와 맞춘다
const PRIVACY_NOTICE: [string, string][] = [
  ["수집 항목", "이메일 가입: 이메일, 비밀번호(암호화)\n카카오 가입: 카카오 회원번호, 닉네임, 카카오계정 이메일"],
  ["목적", "회원 식별, 로그인 인증, 인증 메일 발송"],
  ["보유 기간", "회원 탈퇴 시 지체 없이 파기"],
];

function Notice({ children, href, linkLabel }: { children: React.ReactNode; href: string; linkLabel: string }) {
  return (
    <div className="ml-[28px] mt-1.5 flex flex-col gap-1.5 rounded-[8px] bg-[#F7F6F3] px-3 py-2.5 text-[12.5px] text-ink-soft">
      {children}
      <Link href={href} className="mt-1 underline">
        {linkLabel} ›
      </Link>
    </div>
  );
}

/** 가입 필수 동의 3개. 모두 체크되면 onChange(true). */
export default function SignupConsent({ onChange }: { onChange: (agreed: boolean) => void }) {
  const [checked, setChecked] = useState<Record<Key, boolean>>({ age: false, terms: false, privacy: false });
  const [open, setOpen] = useState<Record<Key, boolean>>({ age: false, terms: false, privacy: false });
  const all = ITEMS.every((i) => checked[i.key]);

  function update(next: Record<Key, boolean>) {
    setChecked(next);
    onChange(ITEMS.every((i) => next[i.key]));
  }

  return (
    <div className="mt-4 rounded-[10px] border border-line bg-white px-4 py-3 text-[13.5px]">
      <label className="flex items-center gap-2.5 font-semibold">
        <input
          type="checkbox"
          checked={all}
          onChange={(e) => update({ age: e.target.checked, terms: e.target.checked, privacy: e.target.checked })}
          className="h-[18px] w-[18px] accent-ink"
        />
        전체 동의
      </label>
      <div className="my-2.5 h-px bg-line" />
      <ul className="flex flex-col gap-2">
        {ITEMS.map((item) => (
          <li key={item.key}>
            <div className="flex items-center gap-2.5">
              <label className="flex flex-1 items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={checked[item.key]}
                  onChange={(e) => update({ ...checked, [item.key]: e.target.checked })}
                  className="h-[18px] w-[18px] accent-ink"
                />
                {item.label}
              </label>
              {item.key !== "age" && (
                <button
                  type="button"
                  onClick={() => setOpen((o) => ({ ...o, [item.key]: !o[item.key] }))}
                  aria-expanded={open[item.key]}
                  className="shrink-0 text-[12.5px] text-ink-soft"
                >
                  보기 {open[item.key] ? "▴" : "▾"}
                </button>
              )}
            </div>
            {item.key === "terms" && open.terms && (
              // 이용약관(/terms) 조항 제목을 묶은 요약 — 약관 조항이 바뀌면 함께 맞춘다
              <Notice href="/terms" linkLabel="이용약관 전문 보기">
                <p>
                  회원가입과 계정 관리, 서비스 제공 · 변경 · 중단, AI 추천과 외부 링크, 게시물과 저작권, 이용계약
                  해지(탈퇴), 책임의 제한 등을 정해요.
                </p>
              </Notice>
            )}
            {item.key === "privacy" && open.privacy && (
              <Notice href="/privacy" linkLabel="개인정보 처리방침 전문 보기">
                <dl className="flex flex-col gap-1.5">
                  {PRIVACY_NOTICE.map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="w-[56px] shrink-0 font-semibold text-ink">{k}</dt>
                      <dd className="whitespace-pre-line">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-1">동의를 거부할 수 있지만, 거부하면 가입할 수 없어요.</p>
              </Notice>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
