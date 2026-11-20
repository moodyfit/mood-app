"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Photo } from "@/lib/photos";
import { photoUrl, cardRatio } from "@/lib/photos";
import { useMoodStore } from "@/lib/store";

/**
 * DB photos 카드 (메이슨리 = 전시 문법).
 * 단일 탭 = 무드 상세(살 수 있는 surface) / 롱프레스 = 해설 / 하트 = 저장.
 * size: "hero"(개인화 시각화 — 너의 결과 최상위 매치, 전면폭) | "sm"(일반).
 * 해설 밴드는 hero/hint 카드에서만 → 소형 카드는 사진을 덮지 않음(액자 원칙 ②). FEAT-025
 * 코드리뷰에서 "모든 카드 상시 캡션"으로 한 번 바꿨다가, 소피 코드리뷰(Q-1)로 main 동작(hero/
 * hint만 캡션)이 맞다는 게 확인돼 원복 — 이 PR에서 실제로 바뀐 건 헤더 문구뿐.
 * 높이는 사진 실비율(cardRatio)로 — 크롭으로 세로를 위조하지 않음(①).
 */
export default function PhotoCard({
  photo,
  hint = false,
  size = "sm",
}: {
  photo: Photo;
  hint?: boolean;
  size?: "hero" | "sm";
}) {
  const router = useRouter();
  const { isPhotoSaved, togglePhotoSave, recordView } = useMoodStore();
  const saved = isPhotoSaved(photo.id); // 사진별 저장 — 같은 무드의 다른 사진과 독립
  // (B) 사진 전용 상품 뷰로 — slug = 파일명(moods/clean-001.jpg → clean-001)
  const slug = photo.image_url.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
  const hero = size === "hero";
  const showCaption = hero || hint;
  const ratio = hero ? 0.78 : cardRatio(photo);

  const [caption, setCaption] = useState(false);
  const longTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);

  function down() {
    longPressed.current = false;
    longTimer.current = setTimeout(() => {
      longPressed.current = true;
      setCaption(true);
    }, 380);
  }
  // BUG-016: 타이머·캡션 정리를 up()에서 분리 — pointercancel에서도 같은 정리가 필요하다.
  function cancelPress() {
    if (longTimer.current) clearTimeout(longTimer.current);
    setCaption(false);
  }
  function up() {
    cancelPress();
    if (longPressed.current) {
      longPressed.current = false;
      return;
    }
    if (slug) {
      recordView(photo.mood_vector); // 클릭(상세 열기)도 취향 신호 → 점점 개인화, 다축 그대로 반영(FEAT-001)
      router.push(`/photo?slug=${encodeURIComponent(slug)}`);
    }
  }

  const url = photoUrl(photo.image_url);

  return (
    <div
      role="link"
      tabIndex={0}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={cancelPress}
      // BUG-016(사파리에서 간헐적 "검정 화면"): 터치가 스크롤로 판정되면 브라우저가 pointerup
      // 대신 pointercancel을 보낸다 — 이게 안 잡히면 롱프레스 타이머가 끝난 뒤 caption=true가
      // 영원히 안 풀려서, 전면을 덮는 rgba(26,26,26,0.72) 해설 오버레이가 화면에 그대로 남는다
      // (히어로 카드는 전면폭이라 "검정 화면"처럼 보임). pointerleave만으론 안 되는 이유 —
      // 포인터가 같은 자리에서 들려서 leave가 안 일어나는 경우가 있다.
      onPointerCancel={cancelPress}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => slug && e.key === "Enter" && router.push(`/photo?slug=${encodeURIComponent(slug)}`)}
      // BUG-016(2차): hero 카드가 Safari에서 간헐적으로 검정 화면 — border-radius+overflow:hidden
      // 요소에 transform(이 카드의 active:scale-[0.98], 부모 .animate-rise 등장 애니메이션)이 겹치면
      // Safari가 배경 레이어 합성을 깨뜨리는 오래된 WebKit 버그(bugs.webkit.org/show_bug.cgi?id=77572).
      // will-change:transform으로 합성 레이어를 미리 고정해두면 재현되지 않는다. 작은 카드는 최대
      // 216장까지 떠 있을 수 있어(FEAT-010) 전부에 레이어를 강제하면 메모리 부담이라 hero 1장만.
      style={{ aspectRatio: String(ratio), willChange: hero ? "transform" : undefined }}
      className="group relative block w-full cursor-pointer select-none overflow-hidden rounded-2xl transition active:scale-[0.98]"
    >
      <div
        className="absolute inset-0 bg-paper-2"
        style={url ? { backgroundImage: `url(${url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      />

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          togglePhotoSave(photo.id, photo.mood_vector);
        }}
        aria-label="내 취향에 반영"
        aria-pressed={saved}
        className={`absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full border text-base backdrop-blur transition ${
          saved ? "border-accent bg-accent text-white" : "border-white/35 bg-black/25 text-white"
        }`}
      >
        {saved ? "♥" : "♡"}
      </button>

      {/* hero/첫 카드: 해설을 '펼쳐서' 상시 노출 (v2.6 1번 사진 해설 펼침 + §7.10 무기#1).
          왜 멋있는지를 롱프레스 없이 즉시 보여 최강 무기를 전면화. 소형 일반 카드는 생략(②) */}
      {showCaption && !caption && photo.caption_item && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
          <div className="text-[12.5px] font-semibold text-white">{photo.caption_item}</div>
          {/* 해설이 펼쳐진 것 자체가 노출 — 별도 안내 문구 금지(스펙) */}
          {photo.caption_why && (
            <div className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-white/85">
              {photo.caption_why}
            </div>
          )}
        </div>
      )}

      {/* 롱프레스 해설 (전문) */}
      <div
        className={`absolute inset-0 flex flex-col justify-end gap-1 p-3 text-white transition-opacity duration-150 ${
          caption ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ background: "rgba(26,26,26,0.72)" }}
      >
        {photo.caption_item && <div className="text-[13px] font-semibold">{photo.caption_item}</div>}
        {photo.caption_why && <div className="text-[12.5px] leading-relaxed opacity-90">{photo.caption_why}</div>}
      </div>
    </div>
  );
}
