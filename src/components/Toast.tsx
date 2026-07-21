"use client";

import { useMoodStore } from "@/lib/store";

export default function Toast() {
  const { toast } = useMoodStore();
  return (
    <div
      className={`pointer-events-none fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-5 py-3 text-[13px] font-medium text-paper shadow-[0_10px_30px_rgba(14,14,16,0.18)] transition ${
        toast ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      {toast}
    </div>
  );
}
