import type { FashionVideo } from "@/lib/videos";
import { youtubeThumb, youtubeWatchUrl } from "@/lib/videos";

/**
 * 패션 영상 카드 — 썸네일 + 제목/채널 + 핵심 요약 3줄 + 유튜브 열기.
 * 전시(취향)와 톤 구분: 여긴 실용 축(고민 직답)이라 요약을 전면에 편다.
 */
export default function VideoCard({ video }: { video: FashionVideo }) {
  const url = youtubeWatchUrl(video.id);
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-2xl border border-line bg-white transition active:scale-[0.99]"
    >
      <div className="relative aspect-video bg-paper-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={youtubeThumb(video.id)}
          alt={video.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>

      <div className="p-3.5">
        <div className="text-[14px] font-bold leading-snug tracking-[-0.2px] text-ink line-clamp-2">
          {video.title}
        </div>
        <div className="mt-1 text-[12px] text-ink-faint">{video.channel}</div>

        <div className="mt-3 rounded-xl bg-paper-2 p-3">
          <div className="mb-1.5 text-[11px] font-semibold tracking-wide text-ink-faint">
            핵심 요약
          </div>
          <ul className="space-y-1">
            {video.summary.map((line, i) => (
              <li key={i} className="flex gap-1.5 text-[12.5px] leading-relaxed text-ink-soft">
                <span className="mt-[3px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-3 flex items-center gap-1 text-[12.5px] font-semibold text-accent">
          유튜브에서 보기
          <span aria-hidden>↗</span>
        </div>
      </div>
    </a>
  );
}
