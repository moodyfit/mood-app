import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import MoodHero from "@/components/MoodHero";
import ProductSection from "@/components/ProductSection";
import WholeLook from "@/components/WholeLook";
import { MOODS } from "@/lib/moods";
import { primaryPrice } from "@/lib/products";
import { getProductsForMood } from "@/lib/photos";

// DB products(있으면)로 채우므로 요청 시 렌더
export const dynamic = "force-dynamic";

export default async function MoodDetailPage({
  params,
}: {
  params: { key: string };
}) {
  const mood = MOODS[params.key];
  if (!mood) notFound();

  const products = await getProductsForMood(mood.key);
  const total = products.reduce((s, p) => s + primaryPrice(p), 0);

  return (
    <div className="animate-fade px-5 pb-32">
      <BackButton />
      <MoodHero mood={mood} total={total} />

      {/* 해설 전면화 — 우리의 최강 무기(왜 멋있는지)를 숨기지 않고 상시 노출 */}
      <div className="mt-4 rounded-xl bg-paper-2 p-4">
        <div className="mb-1 text-[11px] text-ink-faint">왜 멋있냐면</div>
        <p className="text-[14px] leading-relaxed">{mood.caption}</p>
      </div>

      <WholeLook products={products} />
      <ProductSection mood={mood} />
    </div>
  );
}
