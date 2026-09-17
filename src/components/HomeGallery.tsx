"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import { personalizeOrder } from "@/lib/taste";
import { rankPersonalized, personalizationStrength, HERO_MIN_STRENGTH } from "@/lib/rank";
import { useMoodStore } from "@/lib/store";
import type { Photo } from "@/lib/photos";
import { rankPhotos } from "@/lib/photos";
import MoodCard from "./MoodCard";
import PhotoCard from "./PhotoCard";

/**
 * 홈 상시 전시 (장소화 = "내 추구미만 모아두는 곳").
 * photos 있으면 실제 사진 볼륨(90장) 메이슨리 — 핀터레스트식 벽돌 전시(내 취향 크게, 나머지 작게).
 * 없으면 6무드 커버로 폴백(로컬/빈 DB).
 * 크기 = 추구미 적합도(개인화 시각화), 인기 랭킹 아님(헌법).
 * FEAT-006(2026-08-19): 무한 스크롤. moodKeys/query 있으면 검색 결과 모드(rankPhotos 관련도순).
 * FEAT-009(2026-08-25 회의): [나의느낌↔새로운느낌] 토글 제거 — 항상 개인화7:탐색3으로 자동 블렌드.
 * BUG(2026-09-17 회의록 "뒤로가기 시 예전 UI"): 사진 클릭→상세→뒤로가기 시 이 페이지가 리마운트되며
 * visible/스크롤이 초기화돼 스크롤해서 쌓은 피드가 사라지던 문제. sessionStorage에 스크롤/로드량을
 * 남겨뒀다가 검색 모드가 아닐 때만 복원한다(검색 상태는 세션 간 유지할 필요 없음).
 */
const INITIAL_VISIBLE = 12;
const LOAD_STEP = 12;
const SCROLL_STATE_KEY = "moodfit:home-scroll";
const PERSONAL_BATCH = 7;
const EXPLORE_BATCH = 3;
// FEAT-010: 순환 재생이라 종료 조건이 없어 DOM이 무한히 쌓일 수 있음(Capacitor WebView 메모리 취약).
// 실사용 상한을 둔다 — rest 90장 기준 약 2.5바퀴. 이미지 볼륨이 늘면 이 상수를 올리거나 윈도잉으로 전환.
const MAX_VISIBLE = 216;

/** personalOrder·exploreOrder를 7:3 블록 단위로 번갈아 뽑아 하나로 합침(중복 스킵). */
function blendFeed(personalOrder: Photo[], exploreOrder: Photo[]): Photo[] {
  const used = new Set<string>();
  const out: Photo[] = [];
  let pi = 0;
  let ei = 0;
  const total = personalOrder.length;
  while (out.length < total && (pi < personalOrder.length || ei < exploreOrder.length)) {
    for (let n = 0; n < PERSONAL_BATCH && pi < personalOrder.length; pi++) {
      const p = personalOrder[pi];
      if (used.has(p.id)) continue;
      used.add(p.id);
      out.push(p);
      n++;
    }
    for (let n = 0; n < EXPLORE_BATCH && ei < exploreOrder.length; ei++) {
      const p = exploreOrder[ei];
      if (used.has(p.id)) continue;
      used.add(p.id);
      out.push(p);
      n++;
    }
  }
  return out;
}

interface HomeScrollState {
  visible: number;
  scrollY: number;
}

function readScrollState(): HomeScrollState | null {
  try {
    const raw = sessionStorage.getItem(SCROLL_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.visible === "number" && typeof parsed?.scrollY === "number") return parsed;
  } catch {
    /* sessionStorage 접근 불가(프라이빗 모드 등) — 그냥 초기값으로 */
  }
  return null;
}

function writeScrollState(state: HomeScrollState) {
  try {
    sessionStorage.setItem(SCROLL_STATE_KEY, JSON.stringify(state));
  } catch {
    /* 무시 — 복원 실패해도 기능엔 지장 없음 */
  }
}

export default function HomeGallery({
  photos = [],
  moodKeys,
  query,
}: {
  photos?: Photo[];
  /** FEAT-006: 검색 결과 모드 — 있으면 이 순서로, 없으면 기존 개인화 피드 */
  moodKeys?: string[];
  query?: string;
}) {
  const { affinity } = useMoodStore();
  const searching = Boolean(moodKeys && moodKeys.length > 0);

  const hasTaste = Object.keys(affinity).length > 0;
  // 검색 모드가 아니면 마운트 시 sessionStorage에서 이전 로드량을 복원(뒤로가기 대응). 검색 모드는 항상 새로
  // 시작(직전 검색 상태를 다음 방문까지 끌고 갈 필요 없음).
  const [visible, setVisible] = useState(() =>
    !searching ? (readScrollState()?.visible ?? INITIAL_VISIBLE) : INITIAL_VISIBLE
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  // "이전에 본 searching/query"를 기억해서 실제로 바뀐 경우에만 리셋한다. 단순 mounted 플래그는
  // React StrictMode(dev)가 effect를 이중 실행하면서 두 번째 실행에서 플래그가 이미 true라
  // 오탐 리셋을 일으킨다(재현: 뒤로가기 시 방금 복원한 visible이 곧바로 12로 되돌아감) — 이 방식은
  // deps 값 자체를 비교하므로 effect가 몇 번 실행되든 "진짜 변경"에서만 반응한다.
  const searchKeyRef = useRef(`${searching}|${query}`);
  // 스크롤 복원이 끝나기 전까지 저장을 막는 플래그. 복원 목표 높이(scrollY)만큼 카드가 그려지기 전에
  // window.scrollTo를 부르면 브라우저가 더 짧은 문서 높이로 값을 잘라버리고, 그 잘린 값을 아래 scroll
  // 리스너가 곧바로 sessionStorage에 재저장해서 복원이 무효화되는 경합이 있었다(재현: 뒤로가기 후
  // 카드 수는 복원되는데 scrollY만 0으로 남음) — 복원 완료 전에는 쓰기를 전부 보류한다.
  const restoredRef = useRef(false);

  // 검색 모드로 전환/해제되거나 검색어가 바뀌면 처음부터 다시 끊어 보여줌 — 최초 마운트(복원된 visible)는
  // searchKeyRef가 이미 같은 값으로 시작하므로 자연히 스킵된다.
  useEffect(() => {
    const key = `${searching}|${query}`;
    if (searchKeyRef.current === key) return;
    searchKeyRef.current = key;
    setVisible(INITIAL_VISIBLE);
  }, [searching, query]);

  // 로드량 변경 시 sessionStorage에 저장(검색 모드·복원 진행 중 제외) — 뒤로가기 시 이 값으로 복원.
  useEffect(() => {
    if (searching || !restoredRef.current) return;
    writeScrollState({ visible, scrollY: readScrollState()?.scrollY ?? 0 });
  }, [visible, searching]);

  // 스크롤 위치도 저장(검색 모드·복원 진행 중 제외), 200ms 디바운스로 쓰기 빈도를 줄인다.
  // scrollY===0인 이벤트는 저장하지 않는다 — 카드 클릭→router.push로 페이지를 떠날 때 Next가
  // 네비게이션 시작과 함께 스크롤을 0으로 되돌리는데, 새 페이지 데이터가 준비될 때까지 이전 페이지가
  // 계속 마운트 상태로 남아있어서(App Router의 특성) 그 리셋 이벤트가 디바운스 타이머보다 먼저
  // 끝나버려 실제 위치(4206 등)를 0으로 덮어쓰는 경합이 있었다(재현: 뒤로가기 시 visible은
  // 복원되는데 scrollY만 항상 0으로 저장돼있음). 0은 저장 안 해도 "복원할 값 없음"과 결과가
  // 같으므로, 사용자가 실제로 맨 위로 스크롤한 경우를 놓쳐도 안전하다.
  useEffect(() => {
    if (searching) return;
    let timer = 0;
    const onScroll = () => {
      if (!restoredRef.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const y = window.scrollY;
        if (y <= 0) return;
        writeScrollState({ visible: readScrollState()?.visible ?? visible, scrollY: y });
      }, 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searching]);

  // 마운트 시 1회, 저장된 스크롤 위치로 복원.
  // 목표 높이(scrollY)만큼 카드가 그려지기 전에 scrollTo하면 브라우저가 값을 잘라버리므로, 문서가
  // 충분히 자랄 때까지 50ms 간격으로 재시도한다. visible이 이미 복원된 값으로 시작하므로 보통 1~2회
  // 안에 도달한다(카드 박스는 aspect-ratio로 이미지 로드 전에도 크기가 고정됨).
  useEffect(() => {
    const saved = searching ? null : readScrollState();
    if (!saved || saved.scrollY <= 0) {
      restoredRef.current = true; // 복원할 게 없으면 바로 완료 처리 — 이후 저장이 정상 동작하도록
      return;
    }
    let tries = 0;
    let timer = 0;
    const tick = () => {
      tries++;
      const reachedTarget = document.documentElement.scrollHeight - window.innerHeight >= saved.scrollY;
      if (reachedTarget || tries > 30) {
        window.scrollTo(0, saved.scrollY);
        restoredRef.current = true;
        return;
      }
      timer = window.setTimeout(tick, 50);
    };
    timer = window.setTimeout(tick, 50);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FEAT-009: 토글 없이 항상 개인화(7):탐색(3) 자동 블렌드. 검색 모드면 관련도 순(rankPhotos, 중립) 그대로.
  const strength = personalizationStrength(affinity);
  // rankPersonalized는 O(n²) greedy MMR을 2회 호출 → visible 바뀔 때마다(스크롤 배치) 재계산되면 안 됨.
  // visible은 deps에서 제외(잘라내기는 아래 shown에서). photos/affinity/검색어가 바뀔 때만 다시 랭킹.
  const ordered = useMemo(
    () =>
      searching
        ? rankPhotos(photos, moodKeys ?? [])
        : blendFeed(
            rankPersonalized(photos, affinity, { explore: false }),
            rankPersonalized(photos, affinity, { explore: true })
          ),
    [photos, affinity, searching, moodKeys]
  );

  // 히어로(크기=적합도)는 검색 아니고 개인화가 유의미해진 뒤에만(랭킹 중립 원칙 — 검색 결과엔 히어로 없음)
  const heroPhoto = !searching && strength >= HERO_MIN_STRENGTH && ordered.length > 3 ? ordered[0] : null;
  const rest = heroPhoto ? ordered.slice(1) : ordered;
  // FEAT-010: 무한 스크롤 — rest 다 보여주면 처음부터 순환 재생(이미지 볼륨 늘어날 때까지 임시).
  // MAX_VISIBLE에서 잘라 DOM 누적 상한을 건다.
  const cappedVisible = Math.min(visible, MAX_VISIBLE);
  const shown =
    rest.length > 0 ? Array.from({ length: cappedVisible }, (_, i) => rest[i % rest.length]) : [];
  const hasMore = rest.length > 0 && cappedVisible < MAX_VISIBLE;

  // 무한 스크롤: sentinel이 화면에 들어오면 다음 배치 로드(FEAT-004와 동일 패턴)
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible((v) => v + LOAD_STEP);
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
    // visible을 deps에 포함 — 배치마다 observer를 재연결해 다음 교차를 다시 잡는다(스크롤을 멈춰도
    // 이어서 로드). searching/query도 필요: key 변경 시 sentinel DOM이 통째로 리마운트되므로
    // (remaining 상수화 이전, 이 deps 누락으로 검색 후 무한스크롤이 먹통이던 버그 — FEAT-006 Playwright 재현·수정).
  }, [visible, hasMore, searching, query]);

  const header = searching ? (
    <div className="mb-3">
      <div className="text-[15px] font-bold tracking-[-0.3px]">‘{query}’ — 대충 쳐도 돼</div>
    </div>
  ) : (
    <>
      <div className="mb-3">
        <div className="text-[15px] font-bold tracking-[-0.3px]">
          {hasTaste ? "네가 좋아한 느낌, 지금까지" : "오늘의 한 장"}
        </div>
        {!hasTaste && (
          <div className="mt-0.5 text-[12.5px] text-ink-soft">
            취향이 없는 게 아니야, 이름을 몰랐을 뿐. 눈에 드는 것부터.
          </div>
        )}
      </div>
    </>
  );

  // ── 사진 볼륨 전시 (기본 경로) ──────────────────────────────
  if (photos.length > 0) {
    return (
      <div className="animate-fade px-5 pb-8">
        {header}
        <div key={searching ? `q:${query}` : "feed"} className="animate-fade">
          {heroPhoto && (
            <div className="mb-3 animate-rise">
              <PhotoCard photo={heroPhoto} size="hero" />
            </div>
          )}
          {/* CSS columnCount는 높이 기준으로 왼쪽부터 꽉 채워서 좌우가 따로 자라 보임(비대칭) —
              배열을 직접 반으로 나눠 두 칸이 같이 자라게 함(FEAT-009 QA에서 발견).
              트레이드오프: i%2 교대는 카드 높이를 안 봄 → 세로 긴 카드가 한쪽에 몰리면 패킹 불균형.
              현재 cardRatio 범위가 0.78~0.9로 좁아 실측상 무시할 수준. 이미지 볼륨/비율 다양성이
              커지면 cardRatio로 예상 높이 누적해 짧은 컬럼에 넣는 방식으로 전환. */}
          <div className="flex gap-3">
            {[0, 1].map((col) => (
              <div key={col} className="flex flex-1 flex-col gap-3">
                {shown
                  .map((p, i) => ({ p, i }))
                  .filter(({ i }) => i % 2 === col)
                  .map(({ p, i }) => (
                    // FEAT-010: 무한반복이라 같은 사진 id가 여러 번 나올 수 있음 — 인덱스 합성 key 필요.
                    <div key={`${p.id}-${i}`} className="animate-rise">
                      <PhotoCard photo={p} query={query} hint={!heroPhoto && i === 0} />
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* 무한 스크롤: sentinel이 보이면 다음 배치 로드(FEAT-004와 동일 패턴) */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-6">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink-faint" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 폴백: 6무드 커버 (빈 DB/로컬) — 토글 제거로 항상 개인화 순 ──────────
  const orderedKeys = personalizeOrder([...ALL_MOOD_KEYS], affinity);
  const heroKey = hasTaste && orderedKeys.length > 3 ? orderedKeys[0] : null;
  const restKeys = heroKey ? orderedKeys.slice(1) : orderedKeys;

  return (
    <div className="animate-fade px-5 pb-8">
      {header}
      <div className="animate-fade">
        {heroKey && MOODS[heroKey] && (
          <div className="mb-3 animate-rise">
            <MoodCard mood={MOODS[heroKey]} size="hero" />
          </div>
        )}
        <div className="flex gap-3">
          {[0, 1].map((col) => (
            <div key={col} className="flex flex-1 flex-col gap-3">
              {restKeys
                .map((k, i) => ({ k, i }))
                .filter(({ i }) => i % 2 === col)
                .map(({ k, i }) =>
                  MOODS[k] ? (
                    <div key={k} className="animate-rise">
                      <MoodCard mood={MOODS[k]} hint={!heroKey && i === 0} />
                    </div>
                  ) : null,
                )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
