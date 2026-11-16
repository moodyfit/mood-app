import Link from "next/link";

/** 나의 공간 섹션 헤더 — 제목 + 개수(href가 있으면 전체 보기 링크). */
export function ShelfHeader({ title, count, href }: { title: string; count?: string; href?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[16px] font-bold tracking-[-0.3px]">{title}</h2>
      {count &&
        (href ? (
          <Link href={href} className="text-[13px] text-ink-soft">
            {count} ›
          </Link>
        ) : (
          <span className="text-[13px] text-ink-soft">{count}</span>
        ))}
    </div>
  );
}

/** 가로로 넘기는 3:4 카드 줄. 화면 좌우 여백까지 스크롤된다. */
export function Shelf({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-5 flex snap-x scroll-px-5 gap-2.5 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

/** 3:4 사진 카드 + 아래 한 줄 라벨. href가 없으면 스켈레톤. */
export default function ShelfCard({
  href,
  image,
  background,
  label,
}: {
  href?: string;
  image?: string;
  background?: string;
  label?: string;
}) {
  const body = (
    <>
      <div
        className="aspect-[3/4] w-full rounded-xl bg-paper-2"
        style={
          image
            ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
            : background
              ? { background }
              : undefined
        }
      />
      {label && <div className="mt-1.5 truncate text-[12px] text-ink-soft">{label}</div>}
    </>
  );
  return href ? (
    <Link href={href} className="w-[38%] flex-none snap-start">
      {body}
    </Link>
  ) : (
    <div className="w-[38%] flex-none" aria-hidden>
      {body}
    </div>
  );
}
