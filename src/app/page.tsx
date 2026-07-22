import Link from "next/link";
import SearchScreen from "@/components/SearchScreen";
import HomeGallery from "@/components/HomeGallery";
import HomeCloset from "@/components/HomeCloset";

// 홈 = 검색창(위 고정) + 약속 모드 진입 카드(유일) + 종합 취향 상시 메이슨리 전시
export default function HomePage() {
  return (
    <div className="animate-fade">
      <SearchScreen />

      {/* 홈의 유일한 카드형 진입점 — 약속 모드 (기능 목록 노출 아님, 길목 배치) */}
      <div className="px-5 pt-4">
        <Link
          href="/promise"
          className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3.5 text-white"
        >
          <div className="min-w-0">
            <div className="text-[14px] font-bold">약속 잡혔어? 3분 안에 결정 끝</div>
            <div className="mt-0.5 text-[12px] text-white/70">자리·예산만 고르면 완성 조합을 골라줄게</div>
          </div>
          <span className="ml-2 text-lg">›</span>
        </Link>
      </div>

      {/* '내 옷' 보유 시에만 노출되는 슬림 진입 줄 (소환형) */}
      <HomeCloset />

      <div className="pt-5">
        <HomeGallery />
      </div>
    </div>
  );
}
