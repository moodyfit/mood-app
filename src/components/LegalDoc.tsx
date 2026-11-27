import Link from "next/link";
import BackButton from "@/components/BackButton";

/** 약관·처리방침 공용 틀 — 헤더 + 시행일 + 맨 아래 다른 문서 링크 */
export function LegalDoc({
  title,
  meta,
  related,
  children,
}: {
  title: string;
  meta: React.ReactNode;
  related: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <article className="animate-fade px-5 pb-12 text-[13.5px] leading-[1.7] text-ink [overflow-wrap:anywhere]">
      <div className="flex items-center gap-1.5">
        <BackButton spacing="py-3" />
        <h1 className="text-[17px] font-bold">{title}</h1>
      </div>
      <p className="mb-2 mt-1 text-xs text-ink-soft">{meta}</p>
      {children}
      <p className="mt-8 border-t border-line pt-4 text-xs text-ink-soft">
        <Link href={related.href} className="underline underline-offset-2">
          {related.label} ›
        </Link>
      </p>
    </article>
  );
}

/** 아직 정하지 않은 값 — 배포 전 찾기 쉽게 칩으로 표시 */
export function Ph({ children }: { children: string }) {
  return <span className="rounded-sm bg-paper-3 px-1 font-semibold text-ink-soft">[{children}]</span>;
}

export function Article({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="mb-2 mt-6 text-[15px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-0.5 pl-[18px]">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}

/** 표 대신 세로 목록 — 좁은 폭에서 가로 스크롤을 만들지 않는다 */
export function Rows({ rows }: { rows: { head: React.ReactNode; body: React.ReactNode; sub?: React.ReactNode }[] }) {
  return (
    <div className="border-t border-line">
      {rows.map((r, i) => (
        <div key={i} className="border-b border-line py-2.5 text-[13px] leading-[1.55]">
          <b className="block font-bold">{r.head}</b>
          {r.body}
          {r.sub && <span className="block text-ink-soft">{r.sub}</span>}
        </div>
      ))}
    </div>
  );
}
