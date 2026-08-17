import { MoodDetail } from "./MoodDetail";

// 정적 빌드용 — 캐논 6축 전부 사전 생성
export async function generateStaticParams() {
  return ["clean", "cityboy", "street", "amekaji", "classic", "soft"].map((key) => ({ key }));
}

export default function MoodDetailPage({ params }: { params: { key: string } }) {
  return <MoodDetail moodKey={params.key} />;
}
