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
 *   (예: 같은 컴포넌트 인스턴스 안에서 검색어 변경). skip=true로 가는 전환(검색 진입)에서만
 *   리셋이 실행된다 — skip=false로 돌아오는 전환(검색 해제)은 "처음부터"가 아니라 저장된 값으로
 *   복귀하는 게 맞는 동작이라 resetKey가 바뀌어도 여기선 손대지 않는다(복원 effect가 담당).
 *   단순 mounted 플래그로 만들면 React StrictMode(dev)의 effect 이중 실행에서 두 번째 실행 때
 *   플래그가 이미 true라 오탐 리셋이 발생한다 — "값 자체"를 비교하는 이 방식은 effect가 몇 번
 *   실행되든 진짜 변경에서만 반응한다.
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
  // 저장·복원 effect용 "최신 skip" ref — 이 두 effect의 deps에는 일부러 skip을 안 넣는다(코드리뷰
  // P1-2). storageKey가 그대로인데 skip만 바뀌는 경우(같은 컴포넌트 인스턴스 안에서 검색 모드
  // on/off, 예: 홈 인라인 검색)는 "슬롯이 바뀐 것도 처음 마운트된 것도" 아니라서, 복원(scrollTo)을
  // 다시 트리거하면 안 되고 검색 중이던 visible을 슬롯에 흘려 써도 안 된다 — deps에 skip이 있으면
  // 검색 해제 순간 두 effect가 재실행되며 정확히 이 문제를 일으켰다(재현: 검색 해제 시 예전 스크롤
  // 위치로 튐). ref로 "지금 skip인지"만 읽고, "skip이 바뀌었다는 사실" 자체엔 반응하지 않는다.
  const skipRef = useRef(skip);
  skipRef.current = skip;

  // resetKey가 실제로 바뀌면 처음부터 다시 — 단, skip 쪽(예: 검색 모드 진입)으로 바뀔 때만이다.
  // skip=false로 돌아오는 전환(예: 검색 해제 → 홈 복귀)은 "처음부터"가 아니라 "저장된 값으로
  // 돌아가기"가 맞는 동작이라 여기서 손대지 않는다 — 아래 복원 effect가 담당한다. 둘 다 여기서
  // 리셋해버리면 홈 슬롯에 저장돼 있던 값(예: 48장/4285px)이 복원 없이 날아간다(코드리뷰 P1-2).
  useEffect(() => {
    if (resetKeyRef.current === resetKey) return;
    resetKeyRef.current = resetKey;
    if (skip) setVisible(initialVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey, skip]);

  // 로드량 변경 시 sessionStorage에 저장(skip·복원 진행 중 제외) — 뒤로가기 시 이 값으로 복원.
  // deps에 skip을 넣지 않는다 — skip만 바뀌는 순간(예: 검색 해제)에 이 effect가 재실행되면,
  // restoredRef가 이미 true로 남아있어 가드를 통과하고 "검색 중이던 visible"을 그대로 슬롯에
  // 흘려 써버린다(P1-2). visible이 실제로 바뀔 때만 저장하고, 그 시점의 skip은 ref로 읽는다.
  useEffect(() => {
    if (skipRef.current || !restoredRef.current) return;
    writeScrollState(storageKey, { visible, scrollY: readScrollState(storageKey)?.scrollY ?? 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, storageKey]);

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

  // storageKey가 바뀌거나, skip이 false가 될 때(최초 마운트 또는 검색 해제 등 "복귀") 저장된
  // 스크롤 위치로 복원. skip이 true가 되는 전환(검색 진입)은 여기서 바로 return — 복원은
  // "세션 유지 대상으로 돌아올 때"만 의미가 있고, 검색 중엔 scrollTo를 아예 시도하지 않는다.
  // 목표 높이만큼 카드가 그려지기 전에 scrollTo하면 브라우저가 값을 잘라버리므로, 문서가 충분히
  // 자랄 때까지 50ms 간격으로 재시도한다.
  useEffect(() => {
    if (skip) {
      restoredRef.current = true; // 검색 중엔 복원할 것도 저장할 것도 없음 — 바로 완료 처리
      return;
    }
    restoredRef.current = false;
    const saved = readScrollState(storageKey);
    if (!saved) {
      restoredRef.current = true;
      return;
    }
    // 검색 해제처럼 storageKey는 그대로인 복귀에서도 visible을 저장값으로 맞춘다 — resetKey
    // effect는 skip=true로 갈 때만 리셋하므로, 여기서 안 하면 복귀 시 visible이 안 맞는다.
    setVisible(saved.visible);
    if (saved.scrollY <= 0) {
      restoredRef.current = true;
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
