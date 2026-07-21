import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import MoodHero from "@/components/MoodHero";
import ProductRow from "@/components/ProductRow";
import { MOODS, ALL_MOOD_KEYS } from "@/lib/moods";
import { productsFor } from "@/lib/products";

export function generateStaticParams() {
  return ALL_MOOD_KEYS.map((key) => ({ key }));
}

export default function MoodDetailPage({
  params,
}: {
  params: { key: string };
}) {
  const mood = MOODS[params.key];
  if (!mood) notFound();

  const products = productsFor(mood.key);

  return (
    <div className="animate-fade px-5 pb-12">
      <BackButton />
      <MoodHero mood={mood} />
      <div className="mt-[22px] flex flex-col gap-2.5">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
