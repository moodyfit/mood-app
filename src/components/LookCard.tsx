import type { LookCard } from "@/lib/videos";
import { lookImage, youtubeWatchUrl } from "@/lib/videos";

/**
 * 룩 카드 — 유튜브를 룩북으로 재편집한 최소 단위.
 * 프레임(캡처/썸네일) + 아이템 분해 + "왜 이 상황에 맞는지" 한 줄 + 그 지점 영상으로.
 */
export default function LookCardView({ look }: { look: LookCard }) {
  const url = youtubeWatchUrl(look.videoId, look.timestamp);
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative aspect-video bg-paper-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lookImage(look)} alt={look.title} loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            영상에서 뽑은 룩
          </span>
          <span className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </a>

      <div className="p-3.5">
        <div className="text-[14.5px] font-bold leading-snug tracking-[-0.2px] text-ink">
          {look.title}
        </div>
        <div className="mt-0.5 text-[12px] text-ink-faint">{look.channel}</div>

        {/* 왜 이 상황에 맞는지 — 만든 사람의 설명(핀터레스트엔 없는 것) */}
        <div className="mt-2.5 flex gap-1.5 text-[12.5px] leading-relaxed text-ink-soft">
          <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-accent" />
          <span>{look.whyFits}</span>
        </div>

        {/* 아이템 분해 */}
        {look.items.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {look.items.map((it, i) => (
              <span
                key={i}
                className="rounded-full bg-paper-2 px-2.5 py-1 text-[12px] text-ink"
              >
                {it.name}
                <span className="ml-1 text-ink-faint">{it.category}</span>
              </span>
            ))}
          </div>
        )}

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent"
        >
          영상에서 이 룩 보기 <span aria-hidden>↗</span>
        </a>
      </div>
    </div>
  );
}
