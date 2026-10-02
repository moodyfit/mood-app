"use client";

import Link from "next/link";
import { useMoodStore } from "@/lib/store";
import { computeTaste, aliasType, TASTE_CARD_THRESHOLD } from "@/lib/taste";

/**
 * 취향 카드 프로필 — 추구미 + 공유.
 * 저장 0이면 빈 상태, 임계치 전이면 "선명해지는 중", 이후 확정 카드 + 공유 버튼.
 */
export default function TasteProfile() {
  const { affinity, savedCount, showToast } = useMoodStore();

  if (savedCount === 0) {
    return (
      <div className="rounded-[18px] border border-dashed border-line bg-paper-2 p-6 text-center">
        <div className="text-[15px] font-semibold">여기가 나의 공간</div>
        <div className="mt-2 text-[13px] leading-relaxed text-ink-soft">
          담으면 여기 쌓여.
        </div>
        <Link
          href="/"
          className="mt-4 inline-block rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white"
        >
          둘러보기 →
        </Link>
      </div>
    );
  }

  const { title, rarityPct } = computeTaste(affinity);
  const alias = aliasType(affinity);
  const settled = savedCount >= TASTE_CARD_THRESHOLD;

  const handleShare = async () => {
    const label = alias || title;
    const shareData = {
      title: `나의 추구미: ${label}`,
      text: `나의 추구미는 "${label}"! 이 무드를 가진 사람, 전체의 ${rarityPct}%`,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* 사용자가 공유 취소 */
      }
    } else {
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      showToast("링크가 복사됐어");
    }
  };

  return (
    <div
      className="rounded-[18px] p-6 text-white"
      style={{ background: "linear-gradient(160deg,#1E1E20,#000000)" }}
    >
      <div className="text-[11px] font-semibold tracking-[2px] opacity-70">
        {settled ? "나의 추구미" : "선명해지는 중"}
      </div>
      <div className="mt-2 text-[22px] font-extrabold leading-[1.2] tracking-[-0.5px]">
        {alias || title}
      </div>
      {alias && <div className="mt-1 text-[12px] opacity-55">{title}</div>}
      <div className="mt-2 text-[12.5px] opacity-85">
        이 무드를 가진 사람, 전체의{" "}
        <span className="font-latin font-semibold">{rarityPct}%</span>
      </div>

      {settled && (
        <div className="mt-4 flex gap-2">
          <Link
            href="/results?you=1"
            className="flex-1 rounded-[10px] bg-white py-2.5 text-center text-[13px] font-bold text-ink"
          >
            이 추구미로 다시 보기
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/25 transition hover:bg-white/10"
            title="내 추구미 공유하기"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
