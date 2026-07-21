"use client";

import { useRef, useState } from "react";
import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import MoodCard from "./MoodCard";

/**
 * 7.11 주력 트리거 — 스크린샷 부하. "멋있다 싶으면, 무드핏으로 보내."
 * 유튜브·릴스·거리에서 본 걸 스샷 → 무드핏 → 근접 무드 그리드 → 실행(구매)까지.
 *
 * ⚠ 자동 무드 분류는 비전 모델 의존(v1 최소구현 예정). 지금은 유저가 근접 무드를
 *   직접 고르는 셸 — 제0조("취향은 유저 것, 실행은 무드핏 것")에 정합.
 *   진짜 OS 공유 수신(share_target)은 PWA/네이티브 과제.
 */
export default function ShotFinder() {
  const [shot, setShot] = useState<string | null>(null);
  const [seed, setSeed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSeed(file.size % ALL_MOOD_KEYS.length);
    const reader = new FileReader();
    reader.onload = () => setShot(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(file);
  }

  // 근접 무드 (분류 전 셸): 파일 크기 시드로 순서만 흔들어 '결과' 느낌
  const near = [
    ...ALL_MOOD_KEYS.slice(seed),
    ...ALL_MOOD_KEYS.slice(0, seed),
  ];

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
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade">
      <div className="flex items-center gap-3">
        <img
          src={shot}
          alt="올린 스크린샷"
          className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
        />
        <div>
          <div className="text-[13px] text-ink-faint">이 스샷이랑 비슷한 무드</div>
          <div className="text-[15px] font-bold">가까운 걸 골라봐</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {near.map((k) => {
          const mood = MOODS[k];
          if (!mood) return null;
          return <MoodCard key={k} mood={mood} />;
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
