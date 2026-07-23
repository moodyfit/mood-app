/**
 * 트랙 B — 후처리 그레인 파이프라인 (모델 무관 감도 통일 장치).
 * ① 필름 그레인(luminance 기반, 강도 = 기존 힉스필드 컷 노이즈 레벨 샘플링해 매칭)
 * ② 하이라이트 롤오프(-5~10%) ③ 미세 채도 하향.
 * 성공 시 향후 전 배치의 표준 마지막 단계.
 *
 * 사용: npx tsx scripts/postprocess.ts <inDir> <outDir>
 */
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// 결정적 노이즈(재현) — xorshift
function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

/** 기존 힉스필드 커버의 중간톤 패치 휘도 표준편차를 샘플 → 그레인 시그마 매칭 */
async function sampleGrainSigma(): Promise<number> {
  try {
    const cover = path.join(ROOT, "public", "moods", "clean.webp");
    const patch = await sharp(cover)
      .greyscale()
      .extract({ left: 400, top: 700, width: 120, height: 120 })
      .raw()
      .toBuffer();
    let mean = 0;
    for (const v of patch) mean += v;
    mean /= patch.length;
    let varSum = 0;
    for (const v of patch) varSum += (v - mean) ** 2;
    const std = Math.sqrt(varSum / patch.length);
    // 실제 디테일 포함된 stddev이므로 절반만 그레인으로, 8~16 클램프
    return Math.max(8, Math.min(16, std * 0.5));
  } catch {
    return 12;
  }
}

async function grainBuffer(width: number, height: number, sigma: number, seed: number) {
  const rand = rng(seed);
  const n = width * height;
  const buf = Buffer.alloc(n);
  for (let i = 0; i < n; i++) {
    // 균일난수 3개 평균 → 대략 정규분포(필름 그레인 느낌)
    const g = (rand() + rand() + rand()) / 3 - 0.5; // -0.5~0.5
    buf[i] = Math.max(0, Math.min(255, 128 + g * 2 * sigma * 2));
  }
  return sharp(buf, { raw: { width, height, channels: 1 } }).png().toBuffer();
}

async function processOne(inPath: string, outPath: string, sigma: number) {
  const meta = await sharp(inPath).metadata();
  const w = meta.width!;
  const h = meta.height!;
  const seed = [...path.basename(inPath)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const grain = await grainBuffer(w, h, sigma, seed);

  await sharp(inPath)
    .modulate({ saturation: 0.92 }) // ③ 미세 채도 하향
    .linear(0.93, 6) // ② 하이라이트 살짝 눌러 롤오프 근사(대비 -7% + 블랙 리프트)
    .recomb([
      [1.04, 0, 0], // ④ 웜톤 시프트 +4% (R↑ / B↓)
      [0, 1.0, 0],
      [0, 0, 0.96],
    ])
    .gamma(1.02)
    .composite([{ input: grain, blend: "overlay" }]) // ① 휘도 그레인
    .jpeg({ quality: 90 })
    .toFile(outPath);
}

async function run() {
  const [inDir, outDir] = process.argv.slice(2);
  if (!inDir || !outDir) {
    console.error("사용: npx tsx scripts/postprocess.ts <inDir> <outDir>");
    process.exit(1);
  }
  const absIn = path.resolve(ROOT, inDir);
  const absOut = path.resolve(ROOT, outDir);
  await fs.mkdir(absOut, { recursive: true });
  const sigma = await sampleGrainSigma();
  console.log(`그레인 시그마(힉스필드 샘플 매칭) = ${sigma.toFixed(1)}`);

  const files = (await fs.readdir(absIn)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  for (const f of files) {
    const out = f.replace(/\.png$/i, ".jpg");
    await processOne(path.join(absIn, f), path.join(absOut, out), sigma);
    console.log(`  ✓ ${out}`);
  }
  console.log(`완료: ${files.length}장 → ${outDir}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
