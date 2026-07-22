"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Affinity, MoodKey, OwnedItem, SaveRecord } from "./types";
import { TASTE_CARD_THRESHOLD } from "./taste";

const K_SAVES = "mood.saves.v1";
const K_CARD = "mood.cardIssued.v1";
const K_AFFINITY = "mood.affinity.v1"; // 7.6 프로필 무드 벡터
const K_SEARCH = "mood.searchCounts.v1"; // 7.8 검색 기억
const K_OWNED = "mood.owned.v1"; // 1.5.2 '내 옷' 소유 결
const K_SCAN = "mood.scanDone.v1"; // 스캔 1회 완료 — 이후 스캔 탭은 전시 기본, 원할 때만 재스캔

// 프로필 가중치: 저장은 클릭보다 강한 신호
const W_SAVE = 2;
const W_VIEW = 1;

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

interface MoodStore {
  saves: SaveRecord[];
  savedCount: number;
  affinity: Affinity;
  isSaved: (key: MoodKey) => boolean;
  toggleSave: (key: MoodKey, query?: string) => void;
  recordView: (key: MoodKey) => void;
  recordScanLike: (key: MoodKey) => void;
  recordSearch: (query: string) => void;
  searchCount: (query: string) => number;
  owned: OwnedItem[];
  isOwned: (id: string) => boolean;
  toggleOwned: (item: OwnedItem) => void;
  cardEverIssued: boolean;
  cardOpen: boolean;
  openCard: () => void;
  closeCard: () => void;
  scanDone: boolean;
  markScanDone: () => void;
  hydrated: boolean;
  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<MoodStore | null>(null);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [saves, setSaves] = useState<SaveRecord[]>([]);
  const [affinity, setAffinity] = useState<Affinity>({});
  const [searchCounts, setSearchCounts] = useState<Record<string, number>>({});
  const [owned, setOwned] = useState<OwnedItem[]>([]);
  const [cardEverIssued, setCardEverIssued] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // 초기 로드 (localStorage)
  useEffect(() => {
    try {
      const s = localStorage.getItem(K_SAVES);
      if (s) setSaves(JSON.parse(s));
      const a = localStorage.getItem(K_AFFINITY);
      if (a) setAffinity(JSON.parse(a));
      const q = localStorage.getItem(K_SEARCH);
      if (q) setSearchCounts(JSON.parse(q));
      const o = localStorage.getItem(K_OWNED);
      if (o) setOwned(JSON.parse(o));
      setCardEverIssued(localStorage.getItem(K_CARD) === "1");
      setScanDone(localStorage.getItem(K_SCAN) === "1");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // 영속화
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(K_SAVES, JSON.stringify(saves));
      localStorage.setItem(K_AFFINITY, JSON.stringify(affinity));
      localStorage.setItem(K_SEARCH, JSON.stringify(searchCounts));
      localStorage.setItem(K_OWNED, JSON.stringify(owned));
    } catch {
      /* ignore */
    }
  }, [saves, affinity, searchCounts, owned, hydrated]);

  const bump = useCallback((key: MoodKey, w: number) => {
    setAffinity((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + w }));
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  }, []);

  const isSaved = useCallback(
    (key: MoodKey) => saves.some((s) => s.moodKey === key),
    [saves]
  );

  const toggleSave = useCallback(
    (key: MoodKey, query?: string) => {
      setSaves((prev) => {
        const exists = prev.some((s) => s.moodKey === key);
        if (exists) return prev.filter((s) => s.moodKey !== key);

        const next = [...prev, { moodKey: key, savedAt: Date.now(), query }];
        showToast("무드보드에 저장");
        bump(key, W_SAVE); // 프로필 가중 (저장은 강한 신호)

        if (next.length >= TASTE_CARD_THRESHOLD && !cardEverIssued) {
          setCardEverIssued(true);
          try {
            localStorage.setItem(K_CARD, "1");
          } catch {
            /* ignore */
          }
          setTimeout(() => setCardOpen(true), 550);
        }
        return next;
      });
    },
    [cardEverIssued, showToast, bump]
  );

  const recordView = useCallback(
    (key: MoodKey) => bump(key, W_VIEW),
    [bump]
  );

  // 7.10 3초 취향 스캔: '좋아'는 저장에 준하는 신호(보드엔 안 담고 프로필만 적재)
  const recordScanLike = useCallback(
    (key: MoodKey) => bump(key, W_SAVE),
    [bump]
  );

  const markScanDone = useCallback(() => {
    setScanDone(true);
    try {
      localStorage.setItem(K_SCAN, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const recordSearch = useCallback((query: string) => {
    const q = normalizeQuery(query);
    if (!q) return;
    setSearchCounts((prev) => ({ ...prev, [q]: (prev[q] ?? 0) + 1 }));
  }, []);

  const searchCount = useCallback(
    (query: string) => searchCounts[normalizeQuery(query)] ?? 0,
    [searchCounts]
  );

  const isOwned = useCallback(
    (id: string) => owned.some((o) => o.id === id),
    [owned]
  );

  const toggleOwned = useCallback(
    (item: OwnedItem) => {
      setOwned((prev) => {
        if (prev.some((o) => o.id === item.id)) {
          return prev.filter((o) => o.id !== item.id);
        }
        showToast("내 옷에 추가");
        return [...prev, item];
      });
    },
    [showToast]
  );

  const value = useMemo<MoodStore>(
    () => ({
      saves,
      savedCount: saves.length,
      affinity,
      isSaved,
      toggleSave,
      recordView,
      recordScanLike,
      recordSearch,
      searchCount,
      owned,
      isOwned,
      toggleOwned,
      cardEverIssued,
      cardOpen,
      openCard: () => setCardOpen(true),
      closeCard: () => setCardOpen(false),
      scanDone,
      markScanDone,
      hydrated,
      toast,
      showToast,
    }),
    [
      saves,
      affinity,
      isSaved,
      toggleSave,
      recordView,
      recordScanLike,
      recordSearch,
      searchCount,
      owned,
      isOwned,
      toggleOwned,
      cardEverIssued,
      cardOpen,
      scanDone,
      markScanDone,
      hydrated,
      toast,
      showToast,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMoodStore(): MoodStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMoodStore must be used within MoodProvider");
  return ctx;
}
