import { Suspense } from "react";
import BackButton from "@/components/BackButton";
import MoodCard from "@/components/MoodCard";
import { MOODS, resolveMoods } from "@/lib/moods";

// ?q= 는 매 요청 달라지므로 동적 렌더
export const dynamic = "force-dynamic";

function Results({ q }: { q: string }) {
  const moodKeys = resolveMoods(q);
  return (
    <div className="animate-fade px-5 pb-12">
      <BackButton href="/" />
      <div className="grid grid-cols-2 gap-3">
        {moodKeys.map((key) => {
          const mood = MOODS[key];
          if (!mood) return null;
          return <MoodCard key={key} mood={mood} />;
        })}
      </div>
    </div>
  );
}

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";
  return (
    <Suspense>
      <Results q={q} />
    </Suspense>
  );
}
