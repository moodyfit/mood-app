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
import { MOODS } from "./moods";
import { haptic } from "./haptic";

const isKnownMood = (k: string): boolean => Boolean(MOODS[k]);

export interface DiscoveredItem {
  id: string;
  moodKey: MoodKey;
  at: number;
}

const K_SAVES = "mood.saves.v1";
const K_CARD = "mood.cardIssued.v1";
const K_AFFINITY = "mood.affinity.v1"; // 7.6 프로필 무드 벡터
const K_SEARCH = "mood.searchCounts.v1"; // 7.8 검색 기억
const K_OWNED = "mood.owned.v1"; // 1.5.2 '내 옷' 소유 결
const K_SCAN = "mood.scanDone.v1"; // 스캔 1회 완료 — 이후 스캔 탭은 전시 기본, 원할 때만 재스캔
const K_DOT = "mood.spaceDot.v1"; // B5 카드 발급 dot (나의 공간 미확인 신호)
const K_DISC = "mood.discovered.v1"; // C7 '발견' 결 (스크린샷 입주)

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
  spaceDot: boolean;
  clearSpaceDot: () => void;
  discovered: DiscoveredItem[];
  addDiscovered: (moodKey: MoodKey) => void;
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
  const [spaceDot, setSpaceDot] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // 초기 로드 (localStorage)
  useEffect(() => {
    try {
      // 캐논 6축에 없는 스테일 키(옛 버전 localStorage 잔재)는 로드 시 제거 → self-heal
      const s = localStorage.getItem(K_SAVES);
      if (s) setSaves((JSON.parse(s) as SaveRecord[]).filter((r) => isKnownMood(r.moodKey)));
      const a = localStorage.getItem(K_AFFINITY);
      if (a) {
        const raw = JSON.parse(a) as Affinity;
        setAffinity(Object.fromEntries(Object.entries(raw).filter(([k]) => isKnownMood(k))));
      }
      const q = localStorage.getItem(K_SEARCH);
      if (q) setSearchCounts(JSON.parse(q));
      const o = localStorage.getItem(K_OWNED);
      if (o) setOwned(JSON.parse(o));
      setCardEverIssued(localStorage.getItem(K_CARD) === "1");
      setScanDone(localStorage.getItem(K_SCAN) === "1");
      setSpaceDot(localStorage.getItem(K_DOT) === "1");
      const d = localStorage.getItem(K_DISC);
      if (d) setDiscovered((JSON.parse(d) as DiscoveredItem[]).filter((x) => isKnownMood(x.moodKey)));
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
      localStorage.setItem(K_DISC, JSON.stringify(discovered));
    } catch {
      /* ignore */
    }
  }, [saves, affinity, searchCounts, owned, discovered, hydrated]);

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
        showToast("저장했어");
        haptic(); // soft impact
        bump(key, W_SAVE); // 프로필 가중 (저장은 강한 신호)

        // 카드 '발급'은 조용히 — 모달·알림 금지(스펙). 신호는 탭바 dot 하나뿐.
        if (next.length >= TASTE_CARD_THRESHOLD && !cardEverIssued) {
          setCardEverIssued(true);
          setSpaceDot(true);
          try {
            localStorage.setItem(K_CARD, "1");
            localStorage.setItem(K_DOT, "1");
          } catch {
            /* ignore */
          }
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

  const clearSpaceDot = useCallback(() => {
    setSpaceDot(false);
    try {
      localStorage.removeItem(K_DOT);
    } catch {
      /* ignore */
    }
  }, []);

  const addDiscovered = useCallback((moodKey: MoodKey) => {
    setDiscovered((prev) => {
      const id = `${moodKey}-${prev.length}`;
      return [{ id, moodKey, at: Date.now() }, ...prev].slice(0, 24);
    });
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
        showToast("내 옷에 담았어 — 도착하면 입을 조합 알려줄게");
        haptic();
        return [...prev, { ...item, at: Date.now() }];
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
      spaceDot,
      clearSpaceDot,
      discovered,
      addDiscovered,
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
      spaceDot,
      clearSpaceDot,
      discovered,
      addDiscovered,
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
