"use client";

import { ALL_MOOD_KEYS, MOODS } from "@/lib/moods";
import { computeTaste } from "@/lib/taste";
import { useMoodStore } from "@/lib/store";

/**
 * 컨셉 C — 무드 지도 (constellation).
 * 8개 무드 축을 원형으로 깔고, 저장 분포의 가중 중심에 '나'를 찍는다.
 * "너는 여기쯤 있어." 텍스트 대신 좌표로 취향을 보여주는 시각적 훅.
 * 원칙 7: 결핍이 아니라 위치. 저장 전엔 중앙에서 "채워질 자리"로 안내.
 */
const SIZE = 300;
const C = SIZE / 2;
const R = 96; // 무드 점 반경
const LABEL_R = R + 18;

export default function MoodMap() {
  const { affinity } = useMoodStore();

  const weights = Object.values(affinity);
  const maxW = Math.max(1, ...weights);
  const totalW = weights.reduce((s, w) => s + w, 0);

  const pts = ALL_MOOD_KEYS.map((key, i) => {
    const a = -Math.PI / 2 + (i / ALL_MOOD_KEYS.length) * Math.PI * 2;
    return {
      key,
      name: MOODS[key]?.name ?? key,
      w: affinity[key] ?? 0,
      x: C + R * Math.cos(a),
      y: C + R * Math.sin(a),
      lx: C + LABEL_R * Math.cos(a),
      ly: C + LABEL_R * Math.sin(a),
      anchor: (Math.cos(a) > 0.25
        ? "start"
        : Math.cos(a) < -0.25
          ? "end"
          : "middle") as "start" | "end" | "middle",
    };
  });

  // 가중 중심 = 나의 좌표
  let me = { x: C, y: C };
  if (totalW > 0) {
    let sx = 0;
    let sy = 0;
    for (const p of pts) {
      sx += (p.w / totalW) * (p.x - C);
      sy += (p.w / totalW) * (p.y - C);
    }
    me = { x: C + sx, y: C + sy };
  }

  const rarity = totalW > 0 ? computeTaste(affinity).rarityPct : null;

  return (
    <div>
      <div className="mb-2 text-[12px] text-ink-faint">무드 지도</div>
      <div className="rounded-xl border border-line bg-paper-2 p-2">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full">
          {/* 가이드 원 */}
          <circle cx={C} cy={C} r={R} fill="none" stroke="#E6E6E8" strokeWidth={1} />
          <circle cx={C} cy={C} r={R / 2} fill="none" stroke="#EFEFF1" strokeWidth={1} />

          {/* 나 → 무드 연결선 (가중치 비례 농도) */}
          {totalW > 0 &&
            pts
              .filter((p) => p.w > 0)
              .map((p) => (
                <line
                  key={`l-${p.key}`}
                  x1={me.x}
                  y1={me.y}
                  x2={p.x}
                  y2={p.y}
                  stroke="#0E0E10"
                  strokeWidth={1}
                  strokeOpacity={0.12 + 0.4 * (p.w / maxW)}
                />
              ))}

          {/* 무드 점 + 라벨 */}
          {pts.map((p) => (
            <g key={p.key}>
              <circle
                cx={p.x}
                cy={p.y}
                r={p.w > 0 ? 3.5 : 2.5}
                fill={p.w > 0 ? "#0E0E10" : "#C7C7CB"}
              />
              <text
                x={p.lx}
                y={p.ly + 3}
                textAnchor={p.anchor}
                fontSize={9}
                fill={p.w > 0 ? "#6A6A6E" : "#A0A0A4"}
              >
                {p.name}
              </text>
            </g>
          ))}

          {/* 나의 좌표 */}
          <circle cx={me.x} cy={me.y} r={7} fill="#0E0E10" opacity={totalW > 0 ? 1 : 0.25} />
          <circle cx={me.x} cy={me.y} r={12} fill="none" stroke="#0E0E10" strokeWidth={1} opacity={totalW > 0 ? 0.35 : 0.12} />
          {totalW > 0 && (
            <text x={me.x} y={me.y - 15} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0E0E10">
              나
            </text>
          )}
        </svg>
      </div>
      <div className="mt-2 text-center text-[12px] text-ink-soft">
        {rarity !== null ? (
          <>
            이 좌표 근처, 전체의{" "}
            <span className="font-latin font-semibold text-ink">{rarity}%</span>
          </>
        ) : (
          "저장하면 여기 내 좌표가 찍힌다"
        )}
      </div>
    </div>
  );
}
