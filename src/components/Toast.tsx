"use client";

import Link from "next/link";
import { useMoodStore } from "@/lib/store";

export default function Toast() {
  const { toast } = useMoodStore();
  return (
    <div
      className={`fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-5 py-3 text-[13px] font-medium text-paper shadow-[0_10px_30px_rgba(14,14,16,0.18)] transition ${
        toast?.link ? "pointer-events-auto" : "pointer-events-none"
      } ${toast ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
    >
      {toast?.msg}
      {toast?.link && (
        <Link href={toast.link.href} className="ml-3 font-semibold underline underline-offset-2">
          {toast.link.label}
        </Link>
      )}
    </div>
  );
}
