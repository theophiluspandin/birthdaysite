// Generates the 3 built-in royalty-free tracks (original compositions; the
// "Happy Birthday" melody itself is public domain) as WAV files in public/music.
// Then convert to MP3 with ffmpeg (see README). Run: `npm run music`
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'music');
const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const freq = (n) => {
  const m = n.match(/^([A-G]#?)(\d)$/);
  return 440 * Math.pow(2, (NOTE[m[1]] + (Number(m[2]) + 1) * 12 - 69) / 12);
};

function render(seconds, events) {
  const buf = new Float32Array(Math.ceil(seconds * SR));
  for (const e of events) {
    const f = freq(e.n);
    const start = Math.floor(e.t * SR);
    const len = Math.floor(e.d * SR);
    for (let i = 0; i < len && start + i < buf.length; i++) {
      const t = i / SR;
      let env;
      if (e.inst === 'pluck') env = Math.exp(-t * 5);
      else if (e.inst === 'pad') env = Math.min(1, t / 0.4) * Math.min(1, (len - i) / (SR * 0.4));
      else env = Math.min(1, t / 0.005) * Math.exp(-t * 2.2); // piano-ish
      let s;
      if (e.inst === 'pluck') {
        s = Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(4 * Math.PI * f * t) + 0.3 * Math.sin(6 * Math.PI * f * t) + 0.15 * Math.sin(10 * Math.PI * f * t);
      } else if (e.inst === 'pad') {
        s = Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(2 * Math.PI * f * 2.003 * t);
      } else {
        s = Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 3) + 0.15 * Math.sin(6 * Math.PI * f * t) * Math.exp(-t * 5);
      }
      buf[start + i] += s * env * (e.v ?? 0.2);
    }
  }
  // simple echo for space
  const d = Math.floor(0.28 * SR);
  for (let i = d; i < buf.length; i++) buf[i] += buf[i - d] * 0.25;
  let peak = 0;
  for (const x of buf) peak = Math.max(peak, Math.abs(x));
  const g = 0.85 / peak;
  const fade = SR * 3;
  for (let i = 0; i < buf.length; i++) {
    buf[i] *= g * Math.min(1, i / (SR * 0.5)) * Math.min(1, (buf.length - i) / fade);
  }
  return buf;
}

function wav(path, buf) {
  const data = Buffer.alloc(buf.length * 2);
  buf.forEach((x, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([h, data]));
}

// ---------- Track 1: Acoustic Happy Birthday (waltz, 3/4) ----------
function track1() {
  const beat = 0.5;
  const mel = [
    ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
    ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
    ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
    ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3],
  ];
  const chords = [['C3', 'E4', 'G4'], ['G2', 'D4', 'G4'], ['G2', 'D4', 'F4'], ['C3', 'E4', 'G4'], ['C3', 'E4', 'G4'], ['F2', 'C4', 'A4'], ['C3', 'G4', 'E4'], ['G2', 'D4', 'B3'], ['C3', 'E4', 'G4']];
  const ev = [];
  let t = 1;
  for (let rep = 0; rep < 3; rep++) {
    const start = t;
    for (const [n, b] of mel) {
      ev.push({ n, t, d: b * beat + 0.6, inst: rep === 1 ? 'pluck' : 'piano', v: 0.22 });
      t += b * beat;
    }
    // arpeggiated waltz accompaniment
    const bars = Math.round((t - start) / (3 * beat));
    for (let b = 0; b < bars; b++) {
      const c = chords[Math.min(chords.length - 1, Math.floor((b / bars) * chords.length))];
      const bt = start + b * 3 * beat;
      ev.push({ n: c[0], t: bt, d: 1.4, inst: 'piano', v: 0.16 });
      ev.push({ n: c[1], t: bt + beat, d: 0.8, inst: 'pluck', v: 0.07 });
      ev.push({ n: c[2], t: bt + 2 * beat, d: 0.8, inst: 'pluck', v: 0.07 });
    }
    t += beat * 2;
  }
  return render(t + 3, ev);
}

// ---------- Track 2: Okinawa Island Breeze (Ryukyu scale, sanshin-like pluck) ----------
function track2() {
  const ry = ['C4', 'E4', 'F4', 'G4', 'B4', 'C5', 'E5', 'F5', 'G5'];
  const phrase = [5, 4, 3, 1, 2, 3, 5, 3, 4, 3, 2, 1, 0, 1, 3, 2, 3, 5, 6, 5, 4, 5, 3, 2, 1, 2, 3, 1, 0, 0, 1, 3];
  const rhythm = [1, .5, .5, 1, 1, .5, .5, 1, 1, .5, .5, 1, 2];
  const beat = 0.42;
  const ev = [];
  let t = 0.8;
  for (let rep = 0; rep < 4; rep++) {
    let ri = 0;
    for (const idx of phrase) {
      const d = rhythm[ri++ % rhythm.length] * beat;
      ev.push({ n: ry[(idx + (rep === 2 ? 1 : 0)) % ry.length], t, d: 1.1, inst: 'pluck', v: 0.2 });
      t += d;
    }
  }
  for (let bt = 0.8; bt < t; bt += beat * 2) {
    ev.push({ n: (Math.floor(bt / (beat * 8)) % 2) ? 'F2' : 'C3', t: bt, d: 0.8, inst: 'pluck', v: 0.12 });
    ev.push({ n: 'G3', t: bt + beat, d: 0.5, inst: 'pluck', v: 0.05 });
  }
  for (let pt = 0.8; pt < t; pt += beat * 16) ev.push({ n: 'C4', t: pt, d: beat * 16, inst: 'pad', v: 0.05 }, { n: 'G4', t: pt, d: beat * 16, inst: 'pad', v: 0.04 });
  return render(t + 3, ev);
}

// ---------- Track 3: Taipei Night City Pop (maj7 piano) ----------
function track3() {
  const prog = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['G3', 'B3', 'D4', 'F4']];
  const bass = ['F2', 'E2', 'D2', 'G2'];
  const mel = [['A4', 'C5', 'E5', 'D5'], ['B4', 'D5', 'G5', 'E5'], ['A4', 'C5', 'F5', 'E5'], ['D5', 'B4', 'G4', 'A4']];
  const beat = 0.5;
  const ev = [];
  let t = 0.6;
  for (let rep = 0; rep < 6; rep++) {
    prog.forEach((ch, i) => {
      ev.push({ n: bass[i], t, d: 2, inst: 'piano', v: 0.18 });
      ch.forEach((n, k) => ev.push({ n, t: t + k * 0.03, d: 1.8, inst: 'piano', v: 0.08 }));
      ch.forEach((n, k) => ev.push({ n, t: t + 2.5 * beat + k * 0.03, d: 1, inst: 'piano', v: 0.06 }));
      if (rep > 0) {
        mel[i].forEach((n, k) => ev.push({ n, t: t + k * beat * (k === 3 ? 1.5 : 1), d: 1.2, inst: rep % 2 ? 'piano' : 'pluck', v: 0.14 }));
      }
      ev.push({ n: ch[0].replace(/\d/, '4'), t, d: beat * 4, inst: 'pad', v: 0.035 });
      t += beat * 4;
    });
  }
  return render(t + 3, ev);
}

wav(join(OUT, 'track1.wav'), track1());
wav(join(OUT, 'track2.wav'), track2());
wav(join(OUT, 'track3.wav'), track3());
console.log('Generated WAV files in', OUT);
