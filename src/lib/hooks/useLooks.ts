"use client";

import { useMemo } from "react";
import { searchLooks, type LookCard } from "@/lib/videos";

// Capacitor에서는 YouTube API 키가 없으므로 시드 기반 검색만 사용
export function useLooks(query: string): LookCard[] {
  return useMemo(() => searchLooks(query), [query]);
}
