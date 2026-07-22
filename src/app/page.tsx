import SearchScreen from "@/components/SearchScreen";
import HomeGallery from "@/components/HomeGallery";

// 홈 = 검색창(위 고정) + 지금까지 종합된 취향의 상시 메이슨리 전시(장소화 · N3)
export default function HomePage() {
  return (
    <div className="animate-fade">
      <SearchScreen />
      <div className="pt-4">
        <HomeGallery />
      </div>
    </div>
  );
}
