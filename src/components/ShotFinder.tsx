"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import type { MoodKey } from "@/lib/types";
import { useMoodStore } from "@/lib/store";
import { PENDING_SHOT_KEY } from "./SearchScreen";

/**
 * 7.11 스크린샷 부하 — "멋있다 싶으면 무드핏으로 보내."
 * 갤러리 업로드 → 근접 무드 제시 → 택1 → 해당 무드 그리드로 + '발견' 결 입주 + 토스트.
 *
 * ⚠ 근접 무드 축 분류(비전 LLM API)는 v1 최소구현: 지금은 유저가 최근접에서 택1하는 셸
 *   (제0조: 취향은 유저 것). 자동 분류가 붙으면 top-2를 자동 제시하고 실패 시 이 셸로 폴백.
 * ⚠ OS 공유 시트 수신(share_target)은 v2 네이티브 전환 항목 — 지금 구현하지 않음.
 */
export default function ShotFinder() {
  const router = useRouter();
  const { addDiscovered, showToast } = useMoodStore();
  const [shot, setShot] = useState<string | null>(null);
  const [seed, setSeed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(PENDING_SHOT_KEY);
      if (pending) {
        setShot(pending);
        setSeed(pending.length % ALL_MOOD_KEYS.length);
        sessionStorage.removeItem(PENDING_SHOT_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSeed(file.size % ALL_MOOD_KEYS.length);
    const reader = new FileReader();
    reader.onload = () => setShot(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  function pick(k: MoodKey) {
    addDiscovered(k);
    showToast("나의 공간에 담았어");
    router.push(`/mood/${k}`);
  }

  // 근접 무드(분류 전 셸): 파일 시드로 순서만 흔든다. 앞 2개 = 최근접 제시
  const near: MoodKey[] = [...ALL_MOOD_KEYS.slice(seed), ...ALL_MOOD_KEYS.slice(0, seed)];
  const top2 = near.slice(0, 2);
  const more = near.slice(2);

  if (!shot) {
    return (
      <div className="flex min-h-[60vh] animate-fade flex-col justify-center">
        <h1 className="text-[24px] font-extrabold leading-[1.32] tracking-[-0.6px]">
          멋있다 싶으면,
          <br />
          여기로 보내.
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
          유튜브·릴스·거리에서 본 그 느낌. 스크린샷을 올리면
          <br />
          비슷한 무드로 바꿔서, 살 수 있게 해줄게.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-6 rounded-[12px] bg-accent py-4 text-[15px] font-bold text-white"
        >
          스크린샷 올리기
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shot} alt="올린 스크린샷" className="h-16 w-16 flex-shrink-0 rounded-xl object-cover" />
        <div>
          <div className="text-[13px] text-ink-faint">이 스샷, 이 느낌에 가까워?</div>
          <div className="text-[15px] font-bold">가까운 걸 골라</div>
        </div>
      </div>

      {/* 최근접 2개 — 크게 제시 */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {top2.map((k) => {
          const mood = MOODS[k];
          if (!mood) return null;
          return (
            <button
              key={k}
              type="button"
              onClick={() => pick(k)}
              className="relative aspect-[4/5] overflow-hidden rounded-2xl text-left transition active:scale-[0.98]"
            >
              <div
                className="absolute inset-0"
                style={
                  mood.imageUrl
                    ? { backgroundImage: `url(${mood.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: mood.gradient }
                }
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8">
                <span className="text-[14px] font-bold text-white">{mood.name}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 나머지 — 작게 */}
      <div className="mt-3 flex flex-wrap gap-2">
        {more.map((k) => {
          const mood = MOODS[k];
          if (!mood) return null;
          return (
            <button
              key={k}
              type="button"
              onClick={() => pick(k)}
              className="rounded-full border border-line px-3.5 py-1.5 text-[13px] text-ink-soft transition hover:border-accent"
            >
              {mood.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setShot(null)}
        className="mt-6 block w-full rounded-[12px] border border-line py-3.5 text-center text-[14px] font-semibold text-ink-soft transition hover:bg-paper-2"
      >
        다른 스샷으로
      </button>
    </div>
  );
}
