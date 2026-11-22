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
  consented: boolean; // 가입 동의 기록(user_metadata.consent) 유무
}
export const TERMS_VERSION = "2026-11";
const consentRecord = () => ({ at: new Date().toISOString(), terms_version: TERMS_VERSION, age14: true });
const toAuthUser = (u: { id: string; email?: string; user_metadata?: Record<string, unknown> }): AuthUser => ({
  id: u.id,
  email: u.email ?? null,
  consented: Boolean(u.user_metadata?.consent),
});
interface AuthResult {
  error: string | null;
  needsConfirm?: boolean;
}
const NO_SERVER = "서버에 연결할 수 없어요.";
const AUTH_ERRORS: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 맞지 않아요.",
  user_already_exists: "이미 가입된 이메일이에요.",
  email_exists: "이미 가입된 이메일이에요.",
  email_not_confirmed: "메일 인증을 먼저 완료해 주세요.",
  email_address_invalid: "이메일 주소를 다시 확인해 주세요.",
  weak_password: "더 안전한 비밀번호를 입력해 주세요.",
  same_password: "지금 쓰는 비밀번호와 다른 비밀번호를 입력해 주세요.",
  over_email_send_rate_limit: "요청이 너무 잦아요. 잠시 후 다시 요청해 주세요.",
  over_request_rate_limit: "요청이 너무 잦아요. 잠시 후 다시 요청해 주세요.",
  access_denied: "카카오 로그인을 취소했어요.",
};
/** Supabase Auth 오류를 화면용 한국어로. 모르는 코드는 원문 대신 일반 안내를 보여 준다. */
export function authError(e: { code?: string } | null): string | null {
  if (!e) return null;
  return AUTH_ERRORS[e.code ?? ""] ?? "문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
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
  // 손상된 타임스탬프(NaN) 방어(QA 지적) — 감쇠 계산 없이 원본 그대로, 호출부가 새 타임스탬프로 재기록함.
  if (!Number.isFinite(lastTouchedAt)) return vec;
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

// mood.saves.v1은 사진 하트의 자동 기록과 구분할 수 없어 읽지 않는다
const K_LIKED_MOODS = "mood.likedMoods.v1";
const K_SAVED_PHOTOS = "mood.savedPhotos.v1"; // 사진별 저장(전시 하트) — 무드 저장과 별개
const K_CARD = "mood.cardIssued.v1";
const K_AFFINITY = "mood.affinity.v1"; // 7.6 프로필 무드 벡터
const K_AFFINITY_TS = "mood.affinityUpdatedAt.v1"; // affinity 마지막 갱신 시각(ms) — 감쇠 계산용
const K_SEARCH = "mood.searchCounts.v1"; // 7.8 검색 기억
const K_OWNED = "mood.owned.v1"; // 1.5.2 '내 옷' 소유 결
const K_SCAN = "mood.scanDone.v1"; // 스캔 1회 완료 — 이후 스캔 탭은 전시 기본, 원할 때만 재스캔
const K_DOT = "mood.spaceDot.v1"; // B5 카드 발급 dot (나의 공간 미확인 신호)
export const K_KAKAO_PENDING = "mood.kakaoPending.v1"; // 카카오로 떠났다가 /login으로 돌아왔는지(sessionStorage)
export const K_LOGIN_EMAIL = "mood.loginEmail.v1"; // 재설정 후 로그인 칸 미리 채우기(sessionStorage, 1회용)
export const EXPIRED_LINK = "링크가 만료됐어요. 다시 요청해 주세요.";
export const K_RECOVERY = "mood.recovery.v1"; // 재설정 메일 링크로 들어온 탭 표시(sessionStorage, 새로고침에도 유지)
const K_DISC = "mood.discovered.v1"; // C7 '발견' 결 (스크린샷 입주)
const K_BODY = "mood.bodyProfile.v1"; // 영상(룩북) 탭 — 신체 프로필(고정 검색축·락인)
const K_UID = "mood.uid.v1"; // 익명 기기 신원(개인화 서버 적재 키. 로그인 도입 시 병합)
const K_GENDER_FILTER = "mood.genderFilter.v1"; // 회의록(2026-10-08) 남/녀 토글 — v3(#20) 이후 남녀 코디가 섞여 나오는 문제

/** 피드 성별 필터. "all"이면 photos.gender 무관 전부 노출(기존 동작). */
export type GenderFilter = "all" | "male" | "female";

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
  likedMoods: SaveRecord[];
  likedPhotoIds: string[];
  savedCount: number;
  affinity: Affinity;
  isSaved: (key: MoodKey) => boolean;
  toggleSave: (key: MoodKey, query?: string) => void;
  isPhotoSaved: (id: string) => boolean;
  togglePhotoSave: (id: string, moodVector?: MoodKey | Affinity) => void;
  recordView: (input: MoodKey | Affinity) => void;
  recordScanLike: (key: MoodKey) => void;
  recordSearch: (query: string) => void;
  recordProductClick: (moodKey: MoodKey, name: string) => void;
  searchCount: (query: string) => number;
  wardrobeItems: OwnedItem[];
  isOwned: (id: string) => boolean;
  toggleOwned: (item: OwnedItem) => void;
  addOwnedMany: (items: OwnedItem[]) => void;
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
  bodyProfile: BodyProfile;
  setBodyProfile: (p: BodyProfile) => void;
  genderFilter: GenderFilter;
  setGenderFilter: (g: GenderFilter) => void;
  user: AuthUser | null;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  signInWithKakao: () => Promise<AuthResult>;
  recordConsent: () => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  toast: ToastState | null;
  showToast: (msg: string, link?: ToastLink) => void;
}

export interface ToastLink {
  href: string;
  label: string;
}
export interface ToastState {
  msg: string;
  link?: ToastLink;
}

const CLOSET_LINK: ToastLink = { href: "/closet", label: "내 옷장 보기" };

const Ctx = createContext<MoodStore | null>(null);

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [likedMoods, setLikedMoods] = useState<SaveRecord[]>([]);
  const [likedPhotoIds, setLikedPhotoIds] = useState<string[]>([]);
  const [affinity, setAffinity] = useState<Affinity>({});
  const [searchCounts, setSearchCounts] = useState<Record<string, number>>({});
  const [wardrobeItems, setWardrobeItems] = useState<OwnedItem[]>([]);
  const [cardEverIssued, setCardEverIssued] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [scanDone, setScanDone] = useState(false);
  const [spaceDot, setSpaceDot] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredItem[]>([]);
  const [bodyProfile, setBodyProfileState] = useState<BodyProfile>({});
  // FEAT-030: 몇 달간 남자만 타겟 — 토글 UI는 없앴지만 타입·필터·DB는 그대로 둬서 나중에
  // 되돌리기 쉽게 한다. 기본값을 "male"로 고정.
  const [genderFilter, setGenderFilterState] = useState<GenderFilter>("male");
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const userIdRef = useRef<string | null>(null); // 현재 신원(로그인 시 auth id, 아니면 익명 id)
  const anonIdRef = useRef<string | null>(null); // 익명 id(로그아웃 시 복귀용)
  // 병합/동기화 콜백에서 최신 상태를 읽기 위한 미러 ref(클로저 stale 방지)
  const affinityRef = useRef<Affinity>({});
  const savedRef = useRef<string[]>([]);
  affinityRef.current = affinity;
  savedRef.current = likedPhotoIds;

  // 초기 로드 (localStorage)
  useEffect(() => {
    try {
      // 캐논 6축에 없는 스테일 키(옛 버전 localStorage 잔재)는 로드 시 제거 → self-heal
      const s = localStorage.getItem(K_LIKED_MOODS);
      if (s) setLikedMoods((JSON.parse(s) as SaveRecord[]).filter((r) => isKnownMood(r.moodKey)));
      const sp = localStorage.getItem(K_SAVED_PHOTOS);
      if (sp) setLikedPhotoIds(JSON.parse(sp) as string[]);
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
      if (o) setWardrobeItems(JSON.parse(o));
      setCardEverIssued(localStorage.getItem(K_CARD) === "1");
      setScanDone(localStorage.getItem(K_SCAN) === "1");
      setSpaceDot(localStorage.getItem(K_DOT) === "1");
      const d = localStorage.getItem(K_DISC);
      if (d) setDiscovered((JSON.parse(d) as DiscoveredItem[]).filter((x) => isKnownMood(x.moodKey)));
      const bp = localStorage.getItem(K_BODY);
      if (bp) setBodyProfileState(JSON.parse(bp));
      // FEAT-030: 토글 UI를 없애면서 복원도 멈춘다 — 안 멈추면 예전에 "여자"/"전체"를
      // 선택했던 적 있는 기존 유저는 토글이 없어져도 그 값을 계속 복원해서 여자 사진이
      // 새어 나간다. genderFilter는 항상 위 초기값("male")으로 고정.
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
        setLikedPhotoIds((prev) => (prev.length > 0 ? prev : (t.saved_photo_ids as string[])));
      }
    };

    // 인증(로그인) — 세션 있으면 신원=auth id. 로그인 순간 익명 취향 ↔ 계정 취향 병합(크로스기기).
    const sb = getSupabase();
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        userIdRef.current = u.id;
        setUser(toAuthUser(u));
        void hydrateTaste(u.id);
      }
      // 비회원 취향은 서버에 두지 않는다(브라우저에만) — user_taste는 회원 행만 읽고 쓸 수 있다
    });
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      const u = session?.user;
      if (u) {
        userIdRef.current = u.id;
        setUser(toAuthUser(u));
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
            setLikedPhotoIds(mergedSaved);
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
    if (!hydrated || !userIdRef.current || userIdRef.current === anonIdRef.current) return; // 비회원은 저장하지 않음
    syncTaste(userIdRef.current, affinity, likedPhotoIds);
  }, [affinity, likedPhotoIds, hydrated]);

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
      localStorage.setItem(K_LIKED_MOODS, JSON.stringify(likedMoods));
      localStorage.setItem(K_SAVED_PHOTOS, JSON.stringify(likedPhotoIds));
      localStorage.setItem(K_AFFINITY, JSON.stringify(affinity));
      localStorage.setItem(K_SEARCH, JSON.stringify(searchCounts));
      localStorage.setItem(K_OWNED, JSON.stringify(wardrobeItems));
      localStorage.setItem(K_DISC, JSON.stringify(discovered));
    } catch {
      /* ignore */
    }
  }, [likedMoods, likedPhotoIds, affinity, searchCounts, wardrobeItems, discovered, hydrated]);

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

  const showToast = useCallback((msg: string, link?: ToastLink) => {
    setToast({ msg, link });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    // 링크가 있으면 누를 시간을 더 준다
    toastTimer.current = setTimeout(() => setToast(null), link ? 3000 : 1900);
  }, []);

  const isSaved = useCallback(
    (key: MoodKey) => likedMoods.some((s) => s.moodKey === key),
    [likedMoods]
  );

  // Issue #3 7번: togglePhotoSave(BUG-001)와 동일한 비대칭이 무드 레벨 저장에도 있었음 — 취소 시 대칭 복원.
  const toggleSave = useCallback(
    (key: MoodKey, query?: string) => {
      const exists0 = likedMoods.some((s) => s.moodKey === key);
      trackEvent(userIdRef.current, exists0 ? "unsave" : "save", { mood_key: key });
      setLikedMoods((prev) => {
        const exists = prev.some((s) => s.moodKey === key);
        if (exists) {
          bump(key, -getConfig().wSave);
          return prev.filter((s) => s.moodKey !== key);
        }

        const next = [...prev, { moodKey: key, savedAt: Date.now(), query }];
        showToast("내 취향에 반영했어");
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
    [cardEverIssued, showToast, bump, likedMoods]
  );

  const isPhotoSaved = useCallback(
    (id: string) => likedPhotoIds.includes(id),
    [likedPhotoIds]
  );

  // 사진별 저장(전시 하트). 다축 mood_vector면 축별 값에 비례해 affinity 반영(FEAT-001). 취향카드 발급도 사진 저장 수 기준.
  // BUG-001: 취소 시 그때 올렸던 만큼(다축 전체) 대칭으로 되돌림 — 저장/취소 반복해도 무한 누적 안 됨.
  const togglePhotoSave = useCallback(
    (id: string, moodInput?: MoodKey | Affinity) => {
      const domKey = moodInput == null ? undefined : typeof moodInput === "string" ? moodInput : (dominantMood(moodInput) as MoodKey);
      const exists0 = likedPhotoIds.includes(id);
      trackEvent(userIdRef.current, exists0 ? "unsave" : "save", { photo_id: id, mood_key: domKey });
      setLikedPhotoIds((prev) => {
        if (prev.includes(id)) {
          if (moodInput != null) bumpInput(moodInput, -getConfig().wSave);
          return prev.filter((x) => x !== id);
        }
        const next = [...prev, id];
        showToast("내 취향에 반영했어");
        haptic();
        if (moodInput != null) bumpInput(moodInput, getConfig().wSave);
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
    [cardEverIssued, showToast, bumpInput, likedPhotoIds]
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

  const setBodyProfile = useCallback((p: BodyProfile) => {
    trackEvent(userIdRef.current, "profile_set", { meta: p as Record<string, unknown> });
    setBodyProfileState(p);
    try {
      localStorage.setItem(K_BODY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }, []);

  const setGenderFilter = useCallback((g: GenderFilter) => {
    setGenderFilterState(g);
    try {
      localStorage.setItem(K_GENDER_FILTER, g);
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
    if (!sb) return { error: NO_SERVER };
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { consent: consentRecord() }, emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) return { error: authError(error) };
    trackEvent(userIdRef.current, "profile_set", { meta: { auth: "signup" } });
    return { error: null, needsConfirm: !data.session };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { error: NO_SERVER };
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return { error: authError(error) };
  }, []);

  // 성공하면 카카오로 페이지가 넘어갔다가 /login으로 돌아온다. 여기서는 출발 전 오류만 받는다.
  const signInWithKakao = useCallback(async (): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { error: NO_SERVER };
    const { error } = await sb.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    return { error: authError(error) };
  }, []);

  // 카카오 가입자 · 동의 기록 없는 기존 계정의 가입 동의 기록
  const recordConsent = useCallback(async (): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { error: NO_SERVER };
    const { data, error } = await sb.auth.updateUser({ data: { consent: consentRecord() } });
    if (error) return { error: authError(error) };
    if (data.user) setUser(toAuthUser(data.user));
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
  }, []);

  // 미가입 이메일도 Supabase가 성공으로 응답한다 — 오류는 발송 제한 등만 온다.
  const requestPasswordReset = useCallback(async (email: string): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { error: NO_SERVER };
    const { error } = await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: authError(error) };
  }, []);

  // 재설정 메일 링크로 들어온 탭에서만 바꾼다. 로그인 세션으로 주소를 직접 열면 막힌다.
  const updatePassword = useCallback(async (password: string): Promise<AuthResult> => {
    const sb = getSupabase();
    if (!sb) return { error: NO_SERVER };
    const { data } = await sb.auth.getSession();
    let fromLink = false;
    try {
      fromLink = sessionStorage.getItem(K_RECOVERY) === "1";
    } catch {
      /* 저장소 접근 불가 — 막는 쪽으로 */
    }
    if (!data.session || !fromLink) return { error: EXPIRED_LINK };
    const { error } = await sb.auth.updateUser({ password });
    return { error: authError(error) };
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
    (id: string) => wardrobeItems.some((o) => o.id === id),
    [wardrobeItems]
  );

  const toggleOwned = useCallback(
    (item: OwnedItem) => {
      setWardrobeItems((prev) => {
        if (prev.some((o) => o.id === item.id)) {
          return prev.filter((o) => o.id !== item.id);
        }
        showToast("담았어", CLOSET_LINK);
        haptic();
        // 내 옷 담기 = 강한 취향 신호(저장에 준함) — affinity 반영 + 적재
        bump(item.moodKey, getConfig().wSave);
        trackEvent(userIdRef.current, "owned", { mood_key: item.moodKey, photo_id: item.id });
        return [...prev, { ...item, at: Date.now() }];
      });
    },
    [showToast, bump]
  );

  // 코디 통째로 담기 — 안 담은 옷만 넣고, 취향 신호는 코디 1개로 센다
  const addOwnedMany = useCallback(
    (items: OwnedItem[]) => {
      const fresh = items.filter((i) => !wardrobeItems.some((o) => o.id === i.id));
      if (fresh.length === 0) return;
      const at = Date.now();
      setWardrobeItems((prev) => [...prev, ...fresh.map((i) => ({ ...i, at }))]);
      showToast(fresh.length > 1 ? `${fresh.length}벌 담았어` : "담았어", CLOSET_LINK);
      haptic();
      bump(fresh[0].moodKey, getConfig().wSave);
      for (const i of fresh) {
        trackEvent(userIdRef.current, "owned", { mood_key: i.moodKey, photo_id: i.id });
      }
    },
    [wardrobeItems, showToast, bump]
  );

  const value = useMemo<MoodStore>(
    () => ({
      likedMoods,
      likedPhotoIds,
      // 취향 형성 기준 = 사진 저장 수(전시 주 경로), 폴백(무드 저장)도 포괄
      savedCount: Math.max(likedPhotoIds.length, likedMoods.length),
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
      wardrobeItems,
      isOwned,
      toggleOwned,
      addOwnedMany,
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
      bodyProfile,
      setBodyProfile,
      genderFilter,
      setGenderFilter,
      user,
      signUp,
      signIn,
      signOut,
      signInWithKakao,
      recordConsent,
      requestPasswordReset,
      updatePassword,
      toast,
      showToast,
    }),
    [
      likedMoods,
      likedPhotoIds,
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
      wardrobeItems,
      isOwned,
      toggleOwned,
      addOwnedMany,
      cardEverIssued,
      cardOpen,
      scanDone,
      markScanDone,
      hydrated,
      spaceDot,
      clearSpaceDot,
      discovered,
      addDiscovered,
      bodyProfile,
      setBodyProfile,
      genderFilter,
      setGenderFilter,
      user,
      signUp,
      signIn,
      signOut,
      signInWithKakao,
      recordConsent,
      requestPasswordReset,
      updatePassword,
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
