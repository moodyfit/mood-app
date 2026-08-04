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
import { trackEvent, syncTaste, fetchTaste } from "./track";

const isKnownMood = (k: string): boolean => Boolean(MOODS[k]);

export interface DiscoveredItem {
  id: string;
  moodKey: MoodKey;
  at: number;
}

const K_SAVES = "mood.saves.v1";
const K_SAVED_PHOTOS = "mood.savedPhotos.v1"; // 사진별 저장(전시 하트) — 무드 저장과 별개
const K_CARD = "mood.cardIssued.v1";
const K_AFFINITY = "mood.affinity.v1"; // 7.6 프로필 무드 벡터
const K_SEARCH = "mood.searchCounts.v1"; // 7.8 검색 기억
const K_OWNED = "mood.owned.v1"; // 1.5.2 '내 옷' 소유 결
const K_SCAN = "mood.scanDone.v1"; // 스캔 1회 완료 — 이후 스캔 탭은 전시 기본, 원할 때만 재스캔
const K_DOT = "mood.spaceDot.v1"; // B5 카드 발급 dot (나의 공간 미확인 신호)
const K_DISC = "mood.discovered.v1"; // C7 '발견' 결 (스크린샷 입주)
const K_WORN = "mood.worn.v1"; // #9 [입었어] 착용 횟수 (아이템 id별)
const K_BODY = "mood.bodyProfile.v1"; // 영상(룩북) 탭 — 신체 프로필(고정 검색축·락인)
const K_UID = "mood.uid.v1"; // 익명 기기 신원(개인화 서버 적재 키. 로그인 도입 시 병합)

// 신체 프로필: 한 번 넣으면 이후 모든 룩 검색이 이걸로 걸러짐(쌓일수록 나가기 어려움).
export interface BodyProfile {
  bodyType?: "마른" | "보통" | "통통" | "근육";
  personalColor?: "웜" | "쿨" | "모름";
  height?: number; // cm
}

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
  isPhotoSaved: (id: string) => boolean;
  togglePhotoSave: (id: string, moodKey?: MoodKey, query?: string) => void;
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
  recordWorn: (id: string) => void;
  wornOf: (id: string) => number;
  bodyProfile: BodyProfile;
  setBodyProfile: (p: BodyProfile) => void;
  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<MoodStore | null>(null);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [saves, setSaves] = useState<SaveRecord[]>([]);
  const [savedPhotoIds, setSavedPhotoIds] = useState<string[]>([]);
  const [affinity, setAffinity] = useState<Affinity>({});
  const [searchCounts, setSearchCounts] = useState<Record<string, number>>({});
  const [owned, setOwned] = useState<OwnedItem[]>([]);
  const [cardEverIssued, setCardEverIssued] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [spaceDot, setSpaceDot] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredItem[]>([]);
  const [worn, setWorn] = useState<Record<string, number>>({});
  const [bodyProfile, setBodyProfileState] = useState<BodyProfile>({});
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const userIdRef = useRef<string | null>(null); // 익명 신원(이벤트·취향 적재 키)

  // 초기 로드 (localStorage)
  useEffect(() => {
    try {
      // 캐논 6축에 없는 스테일 키(옛 버전 localStorage 잔재)는 로드 시 제거 → self-heal
      const s = localStorage.getItem(K_SAVES);
      if (s) setSaves((JSON.parse(s) as SaveRecord[]).filter((r) => isKnownMood(r.moodKey)));
      const sp = localStorage.getItem(K_SAVED_PHOTOS);
      if (sp) setSavedPhotoIds(JSON.parse(sp) as string[]);
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
      const w = localStorage.getItem(K_WORN);
      if (w) setWorn(JSON.parse(w));
      const bp = localStorage.getItem(K_BODY);
      if (bp) setBodyProfileState(JSON.parse(bp));
    } catch {
      /* ignore */
    }

    // 익명 신원 확보(없으면 발급·영속). 개인화 서버 적재 키.
    let uid: string | null = null;
    try {
      uid = localStorage.getItem(K_UID);
      if (!uid) {
        uid = crypto.randomUUID();
        localStorage.setItem(K_UID, uid);
      }
    } catch {
      /* ignore */
    }
    userIdRef.current = uid;
    setHydrated(true);

    // 서버 취향 복구 — 로컬이 비었을 때만 하이드레이트(로컬 우선, 세션 내 최신 보존)
    (async () => {
      const t = await fetchTaste(uid);
      if (!t) return;
      if (t.mood_vector && Object.keys(t.mood_vector).length > 0) {
        const clean = Object.fromEntries(Object.entries(t.mood_vector).filter(([k]) => isKnownMood(k)));
        setAffinity((prev) => (Object.keys(prev).length > 0 ? prev : clean));
      }
      if (Array.isArray(t.saved_photo_ids) && t.saved_photo_ids.length > 0) {
        setSavedPhotoIds((prev) => (prev.length > 0 ? prev : (t.saved_photo_ids as string[])));
      }
    })();
  }, []);

  // 취향 스냅샷 → 서버 upsert(영속·복구·로그인 병합 대비). 로컬 변경 시마다.
  useEffect(() => {
    if (!hydrated || !userIdRef.current) return;
    syncTaste(userIdRef.current, affinity, savedPhotoIds);
  }, [affinity, savedPhotoIds, hydrated]);

  // 영속화
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(K_SAVES, JSON.stringify(saves));
      localStorage.setItem(K_SAVED_PHOTOS, JSON.stringify(savedPhotoIds));
      localStorage.setItem(K_AFFINITY, JSON.stringify(affinity));
      localStorage.setItem(K_SEARCH, JSON.stringify(searchCounts));
      localStorage.setItem(K_OWNED, JSON.stringify(owned));
      localStorage.setItem(K_DISC, JSON.stringify(discovered));
      localStorage.setItem(K_WORN, JSON.stringify(worn));
    } catch {
      /* ignore */
    }
  }, [saves, savedPhotoIds, affinity, searchCounts, owned, discovered, worn, hydrated]);

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
      const exists0 = saves.some((s) => s.moodKey === key);
      trackEvent(userIdRef.current, exists0 ? "unsave" : "save", { mood_key: key });
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
    [cardEverIssued, showToast, bump, saves]
  );

  const isPhotoSaved = useCallback(
    (id: string) => savedPhotoIds.includes(id),
    [savedPhotoIds]
  );

  // 사진별 저장(전시 하트). 무드 affinity는 그대로 올려 개인화 유지. 취향카드 발급도 사진 저장 수 기준.
  const togglePhotoSave = useCallback(
    (id: string, moodKey?: MoodKey, query?: string) => {
      const exists0 = savedPhotoIds.includes(id);
      trackEvent(userIdRef.current, exists0 ? "unsave" : "save", { photo_id: id, mood_key: moodKey });
      setSavedPhotoIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        const next = [...prev, id];
        showToast("저장했어");
        haptic();
        if (moodKey) {
          bump(moodKey, W_SAVE);
          setSaves((s) => (s.some((r) => r.moodKey === moodKey) ? s : [...s, { moodKey, savedAt: Date.now(), query }]));
        }
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
    [cardEverIssued, showToast, bump, savedPhotoIds]
  );

  const recordView = useCallback(
    (key: MoodKey) => {
      trackEvent(userIdRef.current, "view", { mood_key: key });
      bump(key, W_VIEW);
    },
    [bump]
  );

  // 7.10 3초 취향 스캔: '좋아'는 저장에 준하는 신호(보드엔 안 담고 프로필만 적재)
  const recordScanLike = useCallback(
    (key: MoodKey) => {
      trackEvent(userIdRef.current, "scan_like", { mood_key: key });
      bump(key, W_SAVE);
    },
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

  // #9 [입었어] — 조용한 카운트(팡파레·보상 없음). user_actions.worn 대응(로컬)
  const recordWorn = useCallback((id: string) => {
    trackEvent(userIdRef.current, "worn", { photo_id: id });
    setWorn((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);
  const wornOf = useCallback((id: string) => worn[id] ?? 0, [worn]);

  const setBodyProfile = useCallback((p: BodyProfile) => {
    trackEvent(userIdRef.current, "profile_set", { meta: p as Record<string, unknown> });
    setBodyProfileState(p);
    try {
      localStorage.setItem(K_BODY, JSON.stringify(p));
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
    trackEvent(userIdRef.current, "search", { query: q });
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
      // 취향 형성 기준 = 사진 저장 수(전시 주 경로), 폴백(무드 저장)도 포괄
      savedCount: Math.max(savedPhotoIds.length, saves.length),
      affinity,
      isSaved,
      toggleSave,
      isPhotoSaved,
      togglePhotoSave,
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
      recordWorn,
      wornOf,
      bodyProfile,
      setBodyProfile,
      toast,
      showToast,
    }),
    [
      saves,
      savedPhotoIds,
      affinity,
      isSaved,
      toggleSave,
      isPhotoSaved,
      togglePhotoSave,
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
      recordWorn,
      wornOf,
      bodyProfile,
      setBodyProfile,
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
