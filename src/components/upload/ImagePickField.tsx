"use client";

import { useRef } from "react";
import { ACCEPTED_TYPES } from "@/lib/upload";

/** 사진 고르기 + 미리보기. 파일 검증·비율 측정은 호출부(lib/upload)가 한다. */
export default function ImagePickField({
  previewUrl,
  ratio,
  onPick,
  disabled = false,
  busyLabel,
}: {
  previewUrl: string;
  ratio: number | null;
  onPick: (file: File) => void;
  disabled?: boolean;
  /** 진행 중 문구. 사진이 세로로 길어 하단 버튼이 화면 밖으로 밀리므로 미리보기 위에 띄운다 */
  busyLabel?: string;
}) {
  const input = useRef<HTMLInputElement>(null);

  function change(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onPick(file);
    event.target.value = ""; // 같은 파일을 다시 골라도 change 가 뜨게
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={change}
        className="hidden"
      />

      {previewUrl ? (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={disabled}
          className="relative w-full overflow-hidden rounded-2xl transition disabled:opacity-60"
          style={{ aspectRatio: String(ratio ?? 0.8) }}
        >
          <div
            className="absolute inset-0 bg-paper-2 bg-cover bg-center"
            style={{ backgroundImage: `url(${previewUrl})` }}
          />
          {busyLabel ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/55 backdrop-blur-[2px]">
              <div className="h-7 w-7 animate-spin rounded-full border-[2.5px] border-white/30 border-t-white" />
              <div className="text-[14px] font-semibold text-white">{busyLabel}</div>
              <div className="text-[11.5px] text-white/80">사진을 읽고 있어 · 10초쯤</div>
            </div>
          ) : (
            <div className="absolute bottom-3 left-3 rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur">
              다른 사진으로
            </div>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={disabled}
          className="flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line bg-paper-2 py-16 transition active:scale-[0.99] disabled:opacity-50"
        >
          <span className="text-[15px] font-semibold">사진 고르기</span>
          <span className="text-[12px] text-ink-faint">JPG · PNG · WebP · 5MB까지</span>
        </button>
      )}
    </>
  );
}
