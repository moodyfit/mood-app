"use client";

import BackButton from "@/components/BackButton";
import MoodCard from "@/components/MoodCard";
import { MOODS } from "@/lib/moods";
import { useMoodStore } from "@/lib/store";

export default function ArchivePage() {
  const { saves, cardEverIssued, openCard } = useMoodStore();

  return (
    <div className="animate-fade px-5 pb-12">
      <BackButton href="/" />
      {saves.length === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-faint">
          저장한 사진이 없어요
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {saves.map((s) => {
            const mood = MOODS[s.moodKey];
            if (!mood) return null;
            return <MoodCard key={s.moodKey} mood={mood} />;
          })}
        </div>
      )}
      {cardEverIssued && (
        <button
          type="button"
          onClick={openCard}
          className="mt-[22px] rounded-full border border-line px-[15px] py-[9px] text-[13px] transition hover:border-accent hover:bg-paper-2"
        >
          추구미 카드
        </button>
      )}
    </div>
  );
}
