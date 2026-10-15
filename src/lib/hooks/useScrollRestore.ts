"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 뒤로가기 시 "로드된 카드 수 + 스크롤 위치"를 복원하는 훅(BUG-004 HomeGallery, BUG-008 PhotoGrid).
 * 사진 클릭→상세→뒤로가기 시 무한스크롤 컴포넌트가 리마운트되며 visible/스크롤이 초기화돼
 * 스크롤해서 쌓은 피드가 사라지는 문제를 sessionStorage로 복원한다.
 *
 * @param storageKey sessionStorage 슬롯 이름. 다른 결과 집합(검색어 등)마다 분리해야 하면
 *   호출부에서 키에 섞어 넣는다(예: `moodfit:results-scroll:${query}`). 바뀌면 그 시점 저장값으로
 *   복원을 다시 시도한다.
 * @param resetKey storageKey는 그대로인데 "진짜 값이 바뀌어서" 처음부터 다시 보여줘야 하는 신호
 *   (예: 같은 컴포넌트 인스턴스 안에서 검색 모드 on/off). 단순 mounted 플래그로 만들면 React
 *   StrictMode(dev)의 effect 이중 실행에서 두 번째 실행 때 플래그가 이미 true라 오탐 리셋이
 *   발생한다 — "값 자체"를 비교하는 이 방식은 effect가 몇 번 실행되든 진짜 변경에서만 반응한다.
 * @param initialVisible 복원할 값이 없을 때의 시작 카드 수.
 * @param skip true면 복원·저장을 둘 다 하지 않는다(검색 모드처럼 세션 간 유지가 불필요한 경우).
 */
export function useScrollRestore(
  storageKey: string,
  resetKey: string,
  initialVisible: number,
  skip: boolean
): readonly [number, React.Dispatch<React.SetStateAction<number>>] {
  const [visible, setVisible] = useState(() =>
    !skip ? (readScrollState(storageKey)?.visible ?? initialVisible) : initialVisible
  );
  const resetKeyRef = useRef(resetKey);
  // 스크롤 복원이 끝나기 전까지 저장을 막는 플래그. 복원 목표 높이만큼 카드가 그려지기 전에
  // window.scrollTo를 부르면 브라우저가 더 짧은 문서 높이로 값을 잘라버리고, 그 잘린 값을 아래
  // scroll 리스너가 곧바로 sessionStorage에 재저장해서 복원이 무효화되는 경합이 있었다 — 복원
  // 완료 전에는 쓰기를 전부 보류한다.
  const restoredRef = useRef(false);

  // resetKey가 실제로 바뀌면 처음부터 다시 — 최초 마운트(복원된 visible)는 ref가 이미 같은
  // 값으로 시작하므로 자연히 스킵된다.
  useEffect(() => {
    if (resetKeyRef.current === resetKey) return;
    resetKeyRef.current = resetKey;
    setVisible(initialVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  // 로드량 변경 시 sessionStorage에 저장(skip·복원 진행 중 제외) — 뒤로가기 시 이 값으로 복원.
  useEffect(() => {
    if (skip || !restoredRef.current) return;
    writeScrollState(storageKey, { visible, scrollY: readScrollState(storageKey)?.scrollY ?? 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, skip, storageKey]);

  // 스크롤 위치도 저장(skip·복원 진행 중 제외), 200ms 디바운스로 쓰기 빈도를 줄인다.
  // scrollY===0인 이벤트는 저장하지 않는다 — 카드 클릭→router.push로 페이지를 떠날 때 Next가
  // 네비게이션 시작과 함께 스크롤을 0으로 되돌리는데, 새 페이지 데이터가 준비될 때까지 이전
  // 페이지가 계속 마운트 상태로 남아있어서(App Router 특성) 그 리셋 이벤트가 디바운스 타이머보다
  // 먼저 끝나버려 실제 위치를 0으로 덮어쓰는 경합이 있었다. 0은 저장 안 해도 "복원할 값 없음"과
  // 결과가 같으므로, 사용자가 실제로 맨 위로 스크롤한 경우를 놓쳐도 안전하다.
  useEffect(() => {
    if (skip) return;
    let timer = 0;
    const onScroll = () => {
      if (!restoredRef.current) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const y = window.scrollY;
        if (y <= 0) return;
        writeScrollState(storageKey, { visible: readScrollState(storageKey)?.visible ?? visible, scrollY: y });
      }, 200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, storageKey]);

  // storageKey가 바뀌거나 마운트될 때, 저장된 스크롤 위치로 복원.
  // 목표 높이만큼 카드가 그려지기 전에 scrollTo하면 브라우저가 값을 잘라버리므로, 문서가 충분히
  // 자랄 때까지 50ms 간격으로 재시도한다. visible이 이미 복원된 값으로 시작하므로 보통 1~2회
  // 안에 도달한다(카드 박스는 aspect-ratio로 이미지 로드 전에도 크기가 고정됨).
  useEffect(() => {
    restoredRef.current = false;
    const saved = skip ? null : readScrollState(storageKey);
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
  }, [storageKey, skip]);

  return [visible, setVisible] as const;
}

interface ScrollState {
  visible: number;
  scrollY: number;
}

function readScrollState(key: string): ScrollState | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.visible === "number" && typeof parsed?.scrollY === "number") return parsed;
  } catch {
    /* sessionStorage 접근 불가(프라이빗 모드 등) — 그냥 초기값으로 */
  }
  return null;
}

function writeScrollState(key: string, state: ScrollState) {
  try {
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* 무시 — 복원 실패해도 기능엔 지장 없음 */
  }
}
