import BackButton from "@/components/BackButton";
import ResultsGrid from "@/components/ResultsGrid";

// ?q= 는 매 요청 달라지므로 동적 렌더
export const dynamic = "force-dynamic";

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q ?? "";
  return (
    <div className="animate-fade px-5 pb-12">
      <BackButton href="/" />
      <ResultsGrid query={q} />
    </div>
  );
}
