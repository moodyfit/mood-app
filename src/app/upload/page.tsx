"use client";

import { useRouter } from "next/navigation";
import BackButton from "@/components/BackButton";
import UploadForm from "@/components/upload/UploadForm";
import { useMoodStore } from "@/lib/store";

// FEAT-013 — 사진 올리기. 태깅 라우트가 Bearer 토큰을 요구하므로 비로그인은 폼을 열지 않는다.
export default function UploadPage() {
  const router = useRouter();
  const { user } = useMoodStore();

  return (
    <div className="animate-fade px-5 pb-14">
      <BackButton href="/space" />
      <h1 className="mb-1 mt-2 text-[22px] font-extrabold tracking-[-0.5px]">사진 올리기</h1>

      {user ? (
        <>
          <p className="mb-6 text-[13px] text-ink-soft">
            네가 찾은 느낌을 올리면 무드를 자동으로 붙여줄게.
          </p>
          <UploadForm />
        </>
      ) : (
        <>
          <p className="mb-6 text-[13px] text-ink-soft">
            로그인하면 네가 찾은 느낌을 올릴 수 있어.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full rounded-[12px] bg-ink py-3.5 text-[15px] font-semibold text-white transition active:scale-[0.99]"
          >
            로그인하러 가기
          </button>
        </>
      )}
    </div>
  );
}
