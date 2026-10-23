"use client";

import Link from "next/link";
import BackButton from "./BackButton";
import { MOODS } from "@/lib/moods";
import { slotPieces, formatMan, primaryPrice } from "@/lib/products";
import { photoUrl } from "@/lib/photos";
import { usePhotoBySlug, useProductsForPhoto } from "@/lib/hooks/usePhotos";
import { openExternal } from "@/lib/browser";
import { useMoodStore } from "@/lib/store";

interface LookRow {
  key: string;
  name: string;
  has: boolean;
  price: string;
  url?: string; // 사진 상품: 판매처
  href?: string; // 더미: 무드 상세
}

/**
 * #9 원본 소환 — '내 옷' 아이템 상세. 순서 고정:
 * ① 반했던 원본 무드샷 ② 해설 2행 ③ 입는 법(how, 없으면 미표시) ④ 이 코디 구성 / 추천 조합(마지막 조각).
 * 금지: 옷을 평가하는 판정 문구 — 기준점 재제시만.
 */
export default function ClosetItem({ id }: { id: string }) {
  const { owned, hydrated } = useMoodStore();

  // params.id 가 인코딩된 채 올 수도(%2F 미해제), 디코딩돼 올 수도 있어 양쪽 다 매칭.
  let decoded = id;
  try {
    decoded = decodeURIComponent(id);
  } catch {
    /* 잘못된 인코딩이면 원본 사용 */
  }
  const item = owned.find(
    (o) => o.id === id || o.id === decoded || encodeURIComponent(o.id) === id
  );
  const { products: lookProducts } = useProductsForPhoto(item?.photo ?? "");
  const slug = item?.photo?.split("/").pop()?.replace(/\.\w+$/, "") ?? "";
  const { photo: shot, loading: shotLoading } = usePhotoBySlug(slug);

  if (!hydrated) return null;
  if (!item || !MOODS[item.moodKey]) {
    return (
      <div className="animate-fade px-5 pb-14">
        <BackButton href="/space" />
        <p className="mt-10 text-center text-[14px] text-ink-soft">이 옷을 찾을 수 없어.</p>
      </div>
    );
  }

  const mood = MOODS[item.moodKey];
  const heroUrl = item.photo ? photoUrl(item.photo) : mood.imageUrl;
  const ownedIds = new Set(owned.map((o) => o.id));

  // 사진에서 담은 옷 → 그 사진의 상품. 더미 룩 옷({mood}-{슬롯}-{티어}) → 더미 4칸. 그 밖은 섹션 숨김
  let rows: LookRow[] = [];
  if (item.photo) {
    rows = lookProducts.map((p) => ({
      key: p.id,
      name: p.name,
      has: ownedIds.has(p.id),
      price: formatMan(primaryPrice(p)),
      url: p.sources[0]?.affiliateUrl,
    }));
  } else if (new RegExp(`^${item.moodKey}-\\d+-(로우|미드|하이)$`).test(item.id)) {
    rows = slotPieces().map((p, i) => ({
      key: p.category,
      name: p.name,
      has: owned.some((o) => o.id.startsWith(`${item.moodKey}-${i}-`)),
      price: p.low < p.mid ? `${formatMan(p.low)}~${formatMan(p.mid)}` : formatMan(p.mid),
      href: `/mood/${item.moodKey}`,
    }));
  }

  return (
    <div className="animate-fade px-5 pb-14">
      <BackButton href="/space" />

      {/* ① 반했던 원본 무드샷 (풀폭) — 사진에서 담았으면 그 사진 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl">
        <div
          className="absolute inset-0"
          style={
            heroUrl
              ? { backgroundImage: `url(${heroUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: mood.gradient }
          }
        />
      </div>

      {/* ② 해설 재표시 (기준점 재제시) — 사진에서 담았으면 그 사진 해설, 조회 실패 시 무드 해설 */}
      {!(item.photo && shotLoading) && (
        <div className="mt-4 rounded-xl bg-paper-2 p-4">
          <div className="mb-1 text-[11px] text-ink-faint">네가 반했던 이유</div>
          {shot?.caption_item || shot?.caption_why ? (
            <>
              {shot.caption_item && <p className="text-[14px] font-semibold">{shot.caption_item}</p>}
              {shot.caption_why && (
                <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{shot.caption_why}</p>
              )}
            </>
          ) : (
            <p className="text-[14px] leading-relaxed">{mood.caption}</p>
          )}
        </div>
      )}

      {/* ③ 입는 법 (있을 때만 — 빈 줄 금지) */}
      {(shot ? shot.caption_how : mood.how) && (
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{shot ? shot.caption_how : mood.how}</p>
      )}

      {/* ④ 이 코디 구성(사진에서 담은 옷) / 추천 조합(더미 룩 옷) */}
      {rows.length > 0 && (
        <div className="mt-7">
          <div className="mb-2 text-[13px] font-semibold">{item.photo ? "이 코디 구성" : "추천 조합"}</div>
          <div className="flex flex-col gap-2">
            {rows.map((r) => {
              if (r.has) {
                return (
                  <div
                    key={r.key}
                    className="flex items-center justify-between rounded-xl border border-line bg-white p-3 text-[13px]"
                  >
                    <span className="font-medium">{r.name}</span>
                    <span className="text-accent">담은 것 ✓</span>
                  </div>
                );
              }
              const body = (
                <>
                  <span className="text-ink-soft">
                    더하면 완성 — <span className="font-medium text-ink">{r.name}</span>{" "}
                    <span className="font-latin tnum">{r.price}</span>
                  </span>
                  <span className="text-ink-faint">›</span>
                </>
              );
              const cls =
                "flex w-full items-center justify-between rounded-xl border border-line bg-white p-3 text-left text-[13px] transition hover:border-accent";
              return r.href ? (
                <Link key={r.key} href={r.href} className={cls}>
                  {body}
                </Link>
              ) : (
                <button key={r.key} type="button" onClick={() => r.url && openExternal(r.url)} className={cls}>
                  {body}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
