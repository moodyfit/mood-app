/**
 * 컨택트 시트 — 여러 이미지를 라벨 붙여 격자 1장으로. 태깅 검수 열람 비용 절감.
 * 사용: npx tsx scripts/contact.ts <out.jpg> <img1> <img2> ...
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const TILE_W = 300;
const TILE_H = 375; // 4:5 기준(다른 비율은 cover)
const COLS = 5;
const PAD = 6;

async function run() {
  const [out, ...imgs] = process.argv.slice(2);
  if (!out || imgs.length === 0) {
    console.error("사용: contact.ts <out.jpg> <img...>");
    process.exit(1);
  }
  const rows = Math.ceil(imgs.length / COLS);
  const W = COLS * TILE_W + (COLS + 1) * PAD;
  const H = rows * TILE_H + (rows + 1) * PAD;

  const composites: sharp.OverlayOptions[] = [];
  for (let i = 0; i < imgs.length; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const left = PAD + col * (TILE_W + PAD);
    const top = PAD + row * (TILE_H + PAD);
    const buf = await sharp(path.resolve(ROOT, imgs[i]))
      .resize(TILE_W, TILE_H, { fit: "cover", position: "top" })
      .jpeg()
      .toBuffer();
    composites.push({ input: buf, left, top });
    // 파일명 라벨(좌상단)
    const label = path.basename(imgs[i]).replace(/\.(png|jpg|jpeg)$/i, "");
    const svg = Buffer.from(
      `<svg width="${TILE_W}" height="22"><rect width="100%" height="100%" fill="black" opacity="0.55"/><text x="6" y="16" font-family="sans-serif" font-size="15" fill="white">${label}</text></svg>`
    );
    composites.push({ input: svg, left, top });
  }

  await sharp({ create: { width: W, height: H, channels: 3, background: "#e9e9e6" } })
    .composite(composites)
    .jpeg({ quality: 82 })
    .toFile(path.resolve(ROOT, out));
  console.log(`시트 생성: ${out} (${imgs.length}장, ${COLS}×${rows})`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
