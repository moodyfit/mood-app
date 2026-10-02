import { ClosetItemView } from "./ClosetItemView";

// 정적 빌드용 — id는 유저 데이터 기반이라 빌드 시점에 열거 불가.
// Capacitor에서는 SPA 폴백 라우팅(CAP-002)으로 처리.
export async function generateStaticParams() {
  return [];
}

// 원본 소환 — '내 옷' 아이템 상세 (#9)
export default function ClosetItemPage({ params }: { params: { id: string } }) {
  return <ClosetItemView id={params.id} />;
}
