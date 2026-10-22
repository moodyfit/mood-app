import { ClosetItemView } from "./ClosetItemView";

// 정적 빌드용 — id는 유저 데이터 기반이라 빌드 시점에 열거 불가.
// 웹 옛 링크용. 앱 빌드에선 빠지고 /closet/item?id= 가 같은 화면을 연다.
export async function generateStaticParams() {
  return [];
}

// 원본 소환 — '내 옷' 아이템 상세 (#9)
export default function ClosetItemPage({ params }: { params: { id: string } }) {
  return <ClosetItemView id={params.id} />;
}
