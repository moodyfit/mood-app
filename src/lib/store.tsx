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
import type { MoodKey, SaveRecord } from "./types";
import { TASTE_CARD_THRESHOLD } from "./taste";

const STORAGE_KEY = "mood.saves.v1";
const CARD_KEY = "mood.cardIssued.v1";

interface MoodStore {
  saves: SaveRecord[];
  savedCount: number;
  isSaved: (key: MoodKey) => boolean;
  toggleSave: (key: MoodKey) => void;
  cardEverIssued: boolean;
  cardOpen: boolean;
  openCard: () => void;
  closeCard: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<MoodStore | null>(null);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [saves, setSaves] = useState<SaveRecord[]>([]);
  const [cardEverIssued, setCardEverIssued] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // 초기 로드 (localStorage) — 취향 데이터/카드 발급 이력 복원
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaves(JSON.parse(raw));
      setCardEverIssued(localStorage.getItem(CARD_KEY) === "1");
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // 변경 시 영속화
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
    } catch {
      /* ignore */
    }
  }, [saves, hydrated]);

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
    (key: MoodKey) => {
      setSaves((prev) => {
        const exists = prev.some((s) => s.moodKey === key);
        if (exists) return prev.filter((s) => s.moodKey !== key);

        const next = [...prev, { moodKey: key, savedAt: Date.now() }];
        showToast("무드보드에 저장");

        // 임계치 도달 & 최초 발급 → 추구미 카드
        if (next.length >= TASTE_CARD_THRESHOLD && !cardEverIssued) {
          setCardEverIssued(true);
          try {
            localStorage.setItem(CARD_KEY, "1");
          } catch {
            /* ignore */
          }
          setTimeout(() => setCardOpen(true), 550);
        }
        return next;
      });
    },
    [cardEverIssued, showToast]
  );

  const value = useMemo<MoodStore>(
    () => ({
      saves,
      savedCount: saves.length,
      isSaved,
      toggleSave,
      cardEverIssued,
      cardOpen,
      openCard: () => setCardOpen(true),
      closeCard: () => setCardOpen(false),
      toast,
      showToast,
    }),
    [saves, isSaved, toggleSave, cardEverIssued, cardOpen, toast, showToast]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMoodStore(): MoodStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMoodStore must be used within MoodProvider");
  return ctx;
}
