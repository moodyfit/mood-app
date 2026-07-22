import ClosetItem from "@/components/ClosetItem";

// 원본 소환 — '내 옷' 아이템 상세 (#9)
export default function ClosetItemPage({ params }: { params: { id: string } }) {
  return <ClosetItem id={params.id} />;
}
