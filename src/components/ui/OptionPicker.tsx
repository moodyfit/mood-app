"use client";

/** 택일 버튼 그룹. 도메인 무관 — 값 타입만 맞으면 어디서든 쓴다. */
export default function OptionPicker<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  note,
}: {
  label?: string;
  value: T;
  options: { value: T; text: string; disabled?: boolean }[];
  onChange: (v: T) => void;
  disabled?: boolean;
  note?: string;
}) {
  return (
    <div>
      {label && <div className="mb-1.5 text-[13px] font-semibold">{label}</div>}
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled || o.disabled}
              onClick={() => onChange(o.value)}
              className={`flex-1 rounded-[10px] border py-3 text-[14px] transition disabled:cursor-not-allowed disabled:opacity-40 ${
                active
                  ? "border-ink bg-ink font-semibold text-white"
                  : "border-line bg-white text-ink-soft"
              }`}
            >
              {o.text}
            </button>
          );
        })}
      </div>
      {note && <div className="mt-1.5 text-[11.5px] text-ink-faint">{note}</div>}
    </div>
  );
}
