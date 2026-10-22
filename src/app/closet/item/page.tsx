"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ClosetItem from "@/components/ClosetItem";

// 옷 상세 — /closet/item?id=…. 앱(정적 빌드)은 동적 경로를 만들 수 없어 쿼리로 받는다
function ClosetItemByQuery() {
  const id = useSearchParams()?.get("id") ?? "";
  return <ClosetItem id={id} />;
}

export default function ClosetItemPage() {
  return (
    <Suspense>
      <ClosetItemByQuery />
    </Suspense>
  );
}
