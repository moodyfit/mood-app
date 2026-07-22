import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import MoodHero from "@/components/MoodHero";
import ProductSection from "@/components/ProductSection";
import WholeLook from "@/components/WholeLook";
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
      <WholeLook products={products} />
      <ProductSection mood={mood} products={products} />
    </div>
  );
}
