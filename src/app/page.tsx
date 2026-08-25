"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import SearchScreen from "@/components/SearchScreen";
import HomeGallery from "@/components/HomeGallery";
import HomeCloset from "@/components/HomeCloset";
import { usePhotos } from "@/lib/hooks/usePhotos";

// 홈 = 검색창(위 고정) + 약속 모드 진입 카드(유일) + 종합 취향 상시 메이슨리 전시.
// FEAT-006: 검색해도 페이지 이동 없이 아래 HomeGallery가 검색 결과로 바뀜(인플레이스).
export default function HomePage() {
  const { photos } = usePhotos();
  const [query, setQuery] = useState("");
  const [moodKeys, setMoodKeys] = useState<string[]>([]);

  // 빈 문자열 = 검색 해제(기본 피드 복귀). AI 실패해도 API가 폴백을 함께 반환해서 항상 결과 있음.
  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    if (!q) {
      setMoodKeys([]);
      return;
    }
    try {
      const res = await fetch(`/api/search/translate?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { moodKeys?: string[] };
      setMoodKeys(data.moodKeys ?? []);
    } catch {
      setMoodKeys([]); // 요청 자체가 실패(네트워크 등)하면 조용히 기본 피드로(에러 화면 대신)
    }
  }, []);

  return (
    <div className="animate-fade">
      <SearchScreen onSearch={handleSearch} />

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
        <HomeGallery photos={photos} moodKeys={moodKeys} query={query} />
      </div>
    </div>
  );
}
