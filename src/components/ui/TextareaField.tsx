"use client";

/** 라벨 + 글자수 카운터가 붙은 여러 줄 입력. 도메인 무관. */
export default function TextareaField({
  label,
  value,
  onChange,
  maxLength,
  rows = 3,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full resize-none rounded-[10px] border border-line bg-white px-4 py-3 text-[14px] leading-relaxed outline-none transition focus:border-accent disabled:opacity-50"
      />
      {maxLength && (
        <div className="mt-1 text-right font-latin text-[11px] tabular-nums text-ink-faint">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
