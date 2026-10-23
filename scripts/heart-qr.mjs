// Heart-shaped QR code generator.
// Usage: npm run qr -- https://your-site.vercel.app
// Output: heart-qr.svg and heart-qr.html (open the .html in a browser to save as PNG / print).
import QRCode from 'qrcode';
import { writeFileSync } from 'node:fs';

const url = process.argv[2];
if (!url) {
  console.error('Usage: npm run qr -- https://your-site.vercel.app');
  process.exit(1);
}

const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
const n = qr.modules.size;
const cell = 10;
const W = 900;
const H = 900;
const qrPx = n * cell;
// Heart: center (W/2, CY), scale S px per unit. Lobes reach ~1.2 units up, tip 1 unit down.
const S = 330;
const CY = 430;
const ox = (W - qrPx) / 2;
const oy = CY - 40 - qrPx / 2; // QR sits in the wide upper-middle of the heart

// Heart shape test in normalized coords: (x^2 + y^2 - 1)^3 - x^2 y^3 <= 0
const inHeart = (px, py) => {
  const x = (px - W / 2) / S;
  const y = -(py - CY) / S;
  return Math.pow(x * x + y * y - 1, 3) - x * x * y * y * y <= 0;
};

let rand = 7;
const rnd = () => ((rand = (rand * 16807) % 2147483647) / 2147483647);

let deco = '';
for (let py = 0; py < H; py += cell) {
  for (let px = 0; px < W; px += cell) {
    const insideQrZone = px > ox - 3 * cell && px < ox + qrPx + 2 * cell && py > oy - 3 * cell && py < oy + qrPx + 2 * cell;
    if (!insideQrZone && inHeart(px + cell / 2, py + cell / 2) && rnd() > 0.5) {
      deco += `<rect x="${px + 1}" y="${py + 1}" width="${cell - 2}" height="${cell - 2}" rx="3" fill="#7da2ff"/>`;
    }
  }
}

let code = '';
for (let r = 0; r < n; r++) {
  for (let c = 0; c < n; c++) {
    if (qr.modules.get(r, c)) code += `<rect x="${ox + c * cell}" y="${oy + r * cell}" width="${cell}" height="${cell}" fill="#0a192f"/>`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0a192f"/>
  ${deco}
  <rect x="${ox - 2.5 * cell}" y="${oy - 2.5 * cell}" width="${qrPx + 5 * cell}" height="${qrPx + 5 * cell}" rx="24" fill="#ffffff"/>
  ${code}
  <text x="${W / 2}" y="${H - 20}" text-anchor="middle" fill="#e6f1ff" font-family="sans-serif" font-size="26">Happy Birthday ももちゃん 🤍</text>
</svg>`;

writeFileSync('heart-qr.svg', svg);
writeFileSync(
  'heart-qr.html',
  `<!doctype html><meta charset="utf-8"><title>Heart QR</title><body style="margin:0;background:#0a192f;display:grid;place-items:center;min-height:100vh">${svg}</body>`,
);
console.log('Created heart-qr.svg and heart-qr.html for', url);
