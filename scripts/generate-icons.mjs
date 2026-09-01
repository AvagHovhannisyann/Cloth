/**
 * Generates the PWA icon set from an inline SVG mark (a minimal hanger on
 * bone). Run once: `node scripts/generate-icons.mjs`. Output is committed.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const BG = "#f4f1ea";
const INK = "#211e1a";

function markSvg(scale = 1) {
  // scale < 1 shrinks the mark toward the centre (maskable safe zone).
  const s = scale;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BG}"/>
  <g transform="translate(256 266) scale(${s}) translate(-256 -266)"
     stroke="${INK}" stroke-width="20" fill="none"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M256 168 L256 148 A30 30 0 1 1 286 118"/>
    <path d="M256 168 L100 306 Q88 318 104 322 L408 322 Q424 318 412 306 Z"/>
  </g>
</svg>`;
}

const OUT = new URL("../public/icons/", import.meta.url).pathname;
await mkdir(OUT, { recursive: true });

const jobs = [
  { file: "icon-192.png", size: 192, svg: markSvg(1) },
  { file: "icon-512.png", size: 512, svg: markSvg(1) },
  { file: "maskable-512.png", size: 512, svg: markSvg(0.72) },
  { file: "apple-touch-icon.png", size: 180, svg: markSvg(1) },
];

for (const job of jobs) {
  await sharp(Buffer.from(job.svg)).resize(job.size, job.size).png().toFile(OUT + job.file);
  console.log("wrote", job.file);
}
