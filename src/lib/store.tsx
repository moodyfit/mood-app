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
import { MOODS, resolveMoods } from "./moods";
import { dominantMood } from "./photos";
import { haptic } from "./haptic";
import { trackEvent, syncTaste, fetchTaste } from "./track";
import { getSupabase } from "./supabase";
import { getConfig, fetchConfig } from "./config";

export interface AuthUser {
  id: string;
  email: string | null;
}
interface AuthResult {
  error: string | null;
  needsConfirm?: boolean;
}
/** 두 취향 벡터 병합 — 축별 최댓값(익명+계정 continuity). */
function mergeAffinity(a: Affinity, b: Affinity): Affinity {
  const out: Affinity = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = Math.max(out[k] ?? 0, v);
  return out;
}

// affinity 누적 모델 — 시간 기반 지수감쇠. 반감기(일) 지나면 절반, alpha가 saturate에서
// 영구 고정되지 않고 시간이 지나면 다시 내려올 수 있게 함. 나중에 튜닝 필요해지면 config.ts로 이동.
const AFFINITY_DECAY_HALF_LIFE_DAYS = 14;

/** lastTouchedAt(ms) 기준 지난 시간만큼 절반씩 감쇠. 클라이언트·서버 양쪽 다 이걸로 통일해야
 *  mergeAffinity(Math.max)가 "감쇠 안 된 값 vs 감쇠된 값"을 비교하는 불공정을 피함. */
function decayAffinity(vec: Affinity, lastTouchedAt: number, now: number = Date.now()): Affinity {
  const days = Math.max(0, (now - lastTouchedAt) / (1000 * 60 * 60 * 24));
  if (days === 0) return vec;
  const factor = Math.pow(0.5, days / AFFINITY_DECAY_HALF_LIFE_DAYS);
  return Object.fromEntries(
    Object.entries(vec).map(([k, v]) => [k, Math.round(v * factor * 10000) / 10000])
  );
}

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
const K_AFFINITY_TS = "mood.affinityUpdatedAt.v1"; // affinity 마지막 갱신 시각(ms) — 감쇠 계산용
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
  togglePhotoSave: (id: string, moodVector?: MoodKey | Affinity, query?: string) => void;
  recordView: (input: MoodKey | Affinity) => void;
  recordScanLike: (key: MoodKey) => void;
  recordSearch: (query: string) => void;
  recordProductClick: (moodKey: MoodKey, name: string) => void;
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
  user: AuthUser | null;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const userIdRef = useRef<string | null>(null); // 현재 신원(로그인 시 auth id, 아니면 익명 id)
  const anonIdRef = useRef<string | null>(null); // 익명 id(로그아웃 시 복귀용)
  // 병합/동기화 콜백에서 최신 상태를 읽기 위한 미러 ref(클로저 stale 방지)
  const affinityRef = useRef<Affinity>({});
  const savedRef = useRef<string[]>([]);
  affinityRef.current = affinity;
  savedRef.current = savedPhotoIds;

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
        const known = Object.fromEntries(Object.entries(raw).filter(([k]) => isKnownMood(k)));
        // 감쇠(affinity 누적 모델): 타임스탬프 없으면(배포 전 기존 유저) 감쇠 없이 그대로 쓰고 지금 시각으로 새로 기록.
        const tsRaw = localStorage.getItem(K_AFFINITY_TS);
        setAffinity(tsRaw ? decayAffinity(known, Number(tsRaw)) : known);
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
    anonIdRef.current = uid;
    setHydrated(true);
    void fetchConfig(); // 개인화 파라미터(가중치·포화·다양성) 서버값 반영

    // 서버 취향 복구 — 로컬이 비었을 때만 하이드레이트(로컬 우선, 세션 내 최신 보존)
    const hydrateTaste = async (forId: string | null) => {
      const t = await fetchTaste(forId);
      if (!t) return;
      if (t.mood_vector && Object.keys(t.mood_vector).length > 0) {
        const clean = Object.fromEntries(Object.entries(t.mood_vector).filter(([k]) => isKnownMood(k)));
        // 감쇠(affinity 누적 모델): 서버 updated_at 기준으로 얼마나 오래됐는지 반영.
        const decayed = t.updated_at ? decayAffinity(clean, new Date(t.updated_at).getTime()) : clean;
        setAffinity((prev) => (Object.keys(prev).length > 0 ? prev : decayed));
      }
      if (Array.isArray(t.saved_photo_ids) && t.saved_photo_ids.length > 0) {
        setSavedPhotoIds((prev) => (prev.length > 0 ? prev : (t.saved_photo_ids as string[])));
      }
    };

    // 인증(로그인) — 세션 있으면 신원=auth id. 로그인 순간 익명 취향 ↔ 계정 취향 병합(크로스기기).
    const sb = getSupabase();
    if (!sb) {
      void hydrateTaste(uid);
      return;
    }
    sb.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        userIdRef.current = u.id;
        setUser({ id: u.id, email: u.email ?? null });
        void hydrateTaste(u.id);
      } else {
        void hydrateTaste(uid);
      }
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      const u = session?.user;
      if (u) {
        userIdRef.current = u.id;
        setUser({ id: u.id, email: u.email ?? null });
        if (event === "SIGNED_IN") {
          // 병합: 계정 서버 취향 ∪ 현재(익명) 로컬 취향 → 로컬 반영 + 계정으로 저장
          void (async () => {
            const server = await fetchTaste(u.id);
            // 감쇠(affinity 누적 모델): 서버 값도 updated_at 기준으로 감쇠해야 max 비교가 공정함
            // (감쇠 안 된 서버 값이 항상 이겨버리는 문제 방지).
            const serverAff =
              server?.mood_vector && server.updated_at
                ? decayAffinity(server.mood_vector, new Date(server.updated_at).getTime())
                : (server?.mood_vector ?? {});
            const mergedAff = mergeAffinity(serverAff, affinityRef.current);
            const mergedSaved = Array.from(new Set([...(server?.saved_photo_ids ?? []), ...savedRef.current]));
            setAffinity(mergedAff);
            setSavedPhotoIds(mergedSaved);
            syncTaste(u.id, mergedAff, mergedSaved);
          })();
        }
      } else {
        userIdRef.current = anonIdRef.current; // 로그아웃 → 익명 신원 복귀
        setUser(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 취향 스냅샷 → 서버 upsert(영속·복구·로그인 병합 대비). 로컬 변경 시마다.
  useEffect(() => {
    if (!hydrated || !userIdRef.current) return;
    syncTaste(userIdRef.current, affinity, savedPhotoIds);
  }, [affinity, savedPhotoIds, hydrated]);

  // 감쇠(affinity 누적 모델) 타임스탬프 — affinity 자체가 바뀔 때만 갱신(다른 상태 변화에 안 섞이게 별도 effect).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(K_AFFINITY_TS, String(Date.now()));
    } catch {
      /* ignore */
    }
  }, [affinity, hydrated]);

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
    // 다축 곱셈(FEAT-001)의 소수 오차 정리 + 음수(취소 시 되돌리기, BUG-001) 0 하한 방어.
    setAffinity((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.round(((prev[key] ?? 0) + w) * 10000) / 10000),
    }));
  }, []);

  /** 다축 mood_vector를 축별 값에 비례해 반영(단일 bump의 다축 버전, FEAT-001). */
  const bumpVector = useCallback(
    (vector: Affinity, baseWeight: number) => {
      for (const [axis, value] of Object.entries(vector)) bump(axis, baseWeight * value);
    },
    [bump]
  );

  /** FEAT-001: 문자열(단일 축, 기존 무드 상세용)과 다축 벡터(사진용)를 모두 받아 적절히 분배.
   *  photo.mood_vector가 DB에 null로 들어있는 경우 방어(QA 지적 — 이전엔 dominantMood가 조용히 ""로 흡수하던 케이스). */
  const bumpInput = useCallback(
    (input: MoodKey | Affinity | null | undefined, baseWeight: number) => {
      if (input == null) return;
      if (typeof input === "string") bump(input, baseWeight);
      else bumpVector(input, baseWeight);
    },
    [bump, bumpVector]
  );

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
        bump(key, getConfig().wSave); // 프로필 가중 (저장은 강한 신호)

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

  // 사진별 저장(전시 하트). 다축 mood_vector면 축별 값에 비례해 affinity 반영(FEAT-001). 취향카드 발급도 사진 저장 수 기준.
  // BUG-001: 취소 시 그때 올렸던 만큼(다축 전체) 대칭으로 되돌림 — 저장/취소 반복해도 무한 누적 안 됨.
  const togglePhotoSave = useCallback(
    (id: string, moodInput?: MoodKey | Affinity, query?: string) => {
      const domKey = moodInput == null ? undefined : typeof moodInput === "string" ? moodInput : (dominantMood(moodInput) as MoodKey);
      const exists0 = savedPhotoIds.includes(id);
      trackEvent(userIdRef.current, exists0 ? "unsave" : "save", { photo_id: id, mood_key: domKey });
      setSavedPhotoIds((prev) => {
        if (prev.includes(id)) {
          if (moodInput != null) bumpInput(moodInput, -getConfig().wSave);
          return prev.filter((x) => x !== id);
        }
        const next = [...prev, id];
        showToast("저장했어");
        haptic();
        if (moodInput != null && domKey) {
          bumpInput(moodInput, getConfig().wSave);
          setSaves((s) => (s.some((r) => r.moodKey === domKey) ? s : [...s, { moodKey: domKey, savedAt: Date.now(), query }]));
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
    [cardEverIssued, showToast, bumpInput, savedPhotoIds]
  );

  // 다축 mood_vector(사진) 또는 단일 MoodKey(무드 상세) 둘 다 수용 — 축별 값에 비례해 affinity 반영(FEAT-001).
  const recordView = useCallback(
    (input: MoodKey | Affinity) => {
      const domKey = typeof input === "string" ? input : (dominantMood(input) as MoodKey);
      trackEvent(userIdRef.current, "view", { mood_key: domKey });
      bumpInput(input, getConfig().wView);
    },
    [bumpInput]
  );

  // 7.10 3초 취향 스캔: '좋아'는 저장에 준하는 신호(보드엔 안 담고 프로필만 적재)
  const recordScanLike = useCallback(
    (key: MoodKey) => {
      trackEvent(userIdRef.current, "scan_like", { mood_key: key });
      bump(key, getConfig().wSave);
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

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { error: "서버 연결이 안 돼 있어" };
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) return { error: error.message };
    trackEvent(userIdRef.current, "profile_set", { meta: { auth: "signup" } });
    return { error: null, needsConfirm: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { error: "서버 연결이 안 돼 있어" };
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
  }, []);

  const recordSearch = useCallback(
    (query: string) => {
      const q = normalizeQuery(query);
      if (!q) return;
      trackEvent(userIdRef.current, "search", { query: q });
      setSearchCounts((prev) => ({ ...prev, [q]: (prev[q] ?? 0) + 1 }));
      // 검색 의도도 취향 신호 — 해석된 무드축에 가중(1순위 강, 이후 약). 검색할수록 개인화 반영.
      resolveMoods(query)
        .slice(0, 3)
        .forEach((k, i) => bump(k, i === 0 ? getConfig().wView : getConfig().wView * 0.5));
    },
    [bump]
  );

  const recordProductClick = useCallback((moodKey: MoodKey, name: string) => {
    trackEvent(userIdRef.current, "product_click", { mood_key: moodKey, meta: { name } });
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
        // 내 옷 담기 = 강한 취향 신호(저장에 준함) — affinity 반영 + 적재
        bump(item.moodKey, getConfig().wSave);
        trackEvent(userIdRef.current, "owned", { mood_key: item.moodKey, photo_id: item.id });
        return [...prev, { ...item, at: Date.now() }];
      });
    },
    [showToast, bump]
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
      recordProductClick,
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
      user,
      signUp,
      signIn,
      signOut,
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
      recordProductClick,
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
      user,
      signUp,
      signIn,
      signOut,
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
