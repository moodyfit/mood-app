import BackButton from "@/components/BackButton";

/** 약관·처리방침 공용 틀 — 헤더 + 법률 검토 표시 + 시행일 */
export function LegalDoc({ title, meta, children }: { title: string; meta: React.ReactNode; children: React.ReactNode }) {
  return (
    <article className="animate-fade px-5 pb-12 text-[13.5px] leading-[1.7] text-ink [overflow-wrap:anywhere]">
      <div className="flex items-center gap-1.5">
        <BackButton spacing="py-3" />
        <h1 className="text-[17px] font-bold">{title}</h1>
      </div>
      <p className="rounded border border-line bg-paper-2 px-3.5 py-3 text-[12.5px] leading-[1.55] text-ink-soft">
        <b className="font-bold text-ink">참고용 초안이에요.</b> 법률 검토 전 문서로, 내용이 바뀔 수 있어요.
      </p>
      <p className="mb-2 mt-3.5 text-xs text-ink-soft">{meta}</p>
      {children}
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
