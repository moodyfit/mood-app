"use client";

import BackButton from "@/components/BackButton";
import ShotFinder from "@/components/ShotFinder";

// 7.11 스크린샷 부하 — "멋있다 싶으면, 무드핏으로 보내"
export default function ShotPage() {
  return (
    <div className="animate-fade px-5 pb-12">
      <BackButton href="/" />
      <ShotFinder />
    </div>
  );
}
