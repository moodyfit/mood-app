import BackButton from "@/components/BackButton";
import Closet from "@/components/Closet";

// 내 옷 — 나의 공간 하위 페이지(리스트 분리)
export default function ClosetPage() {
  return (
    <div className="animate-fade px-5 pb-14">
      <BackButton href="/space" />
      <h1 className="mb-4 text-[22px] font-extrabold tracking-[-0.5px]">내 옷</h1>
      <Closet hideHeader />
    </div>
  );
}
