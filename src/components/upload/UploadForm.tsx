"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import OptionPicker from "@/components/ui/OptionPicker";
import TextareaField from "@/components/ui/TextareaField";
import ImagePickField from "./ImagePickField";
import { readImage, uploadPhotoFile, requestTagging, type Gender, type PhotoType } from "@/lib/upload";

const DESCRIPTION_MAX = 120;

// 여성 사진은 6축 루브릭이 남성 기준이라 정확도가 낮다(FEAT-011 리뷰) — 루브릭 티켓 전까지 닫아둔다.
const FEMALE_OPEN = false;

type Phase = "idle" | "uploading" | "scoring";

export default function UploadForm() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [ratio, setRatio] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState<Gender>("male");
  const [photoType, setPhotoType] = useState<PhotoType>("real");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);

  const busy = phase !== "idle";

  async function pick(picked: File) {
    setError(null);
    const read = await readImage(picked);
    if (!read.ok) {
      setError(read.error);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(picked);
    setPreviewUrl(read.data.previewUrl);
    setRatio(read.data.ratio);
  }

  async function submit() {
    if (!file || ratio === null) return;
    setError(null);

    setPhase("uploading");
    const uploaded = await uploadPhotoFile(file);
    if (!uploaded.ok) {
      setPhase("idle");
      setError(uploaded.error);
      return;
    }

    setPhase("scoring");
    const tagged = await requestTagging({
      storagePath: uploaded.data.storagePath,
      aspectRatio: ratio,
      gender,
      photoType,
      userDescription: description.trim() || null,
    });
    if (!tagged.ok) {
      // 폼 값은 그대로 둔다 — 한도 초과(429)나 일시 오류면 다시 누르기만 하면 되게
      setPhase("idle");
      setError(tagged.error);
      return;
    }

    router.push(`/photo/${tagged.data.slug}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <ImagePickField previewUrl={previewUrl} ratio={ratio} onPick={pick} disabled={busy} />

      <TextareaField
        label="추천하는 이유"
        value={description}
        onChange={setDescription}
        maxLength={DESCRIPTION_MAX}
        placeholder="어디가 좋았는지 한 줄로 남겨줘 (선택)"
        disabled={busy}
      />

      <OptionPicker
        label="누구 옷차림이야?"
        value={gender}
        onChange={setGender}
        disabled={busy}
        note={FEMALE_OPEN ? undefined : "여자 사진은 무드 읽는 눈을 더 다듬고 나서 열어줄게."}
        options={[
          { value: "male", text: "남자" },
          { value: "female", text: "여자", disabled: !FEMALE_OPEN },
        ]}
      />

      <OptionPicker
        label="어떤 사진이야?"
        value={photoType}
        onChange={setPhotoType}
        disabled={busy}
        options={[
          { value: "real", text: "실제 사진" },
          { value: "ai", text: "AI로 생성" },
        ]}
      />

      {error && (
        <p role="alert" className="text-[13px] leading-relaxed text-accent">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={!file || busy}
        className="mt-1 w-full rounded-[12px] bg-ink py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
      >
        {phase === "uploading" ? "올리는 중…" : phase === "scoring" ? "무드 붙이는 중…" : "올리기"}
      </button>

      {phase === "scoring" && (
        <p className="-mt-2 text-center text-[12px] text-ink-faint">
          사진을 읽고 있어. 조금만 기다려줘.
        </p>
      )}
    </div>
  );
}
