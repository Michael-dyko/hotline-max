import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sr = 22050;
const outDir = join(dirname(fileURLToPath(import.meta.url)), "../public/assets/audio");
mkdirSync(outDir, { recursive: true });

function clamp(value) {
  return Math.max(-1, Math.min(1, value));
}

function render(seconds, sample) {
  const n = Math.floor(sr * seconds);
  const data = new Int16Array(n);
  for (let i = 0; i < n; i += 1) {
    data[i] = (clamp(sample(i / sr, i, n)) * 32767) | 0;
  }
  return data;
}

function wav(samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sr, 24);
  buffer.writeUInt32LE(sr * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i += 1) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }
  return buffer;
}

function env(t, attack, release, duration) {
  if (t < attack) {
    return t / attack;
  }
  const rest = duration - t;
  if (rest < release) {
    return Math.max(0, rest / release);
  }
  return 1;
}

function noise() {
  return Math.random() * 2 - 1;
}

const files = {
  "pistol.wav": render(0.12, (t, i, n) => {
    const e = env(t, 0.002, 0.08, n / sr);
    return (Math.sin(2 * Math.PI * 220 * t) * 0.2 + noise() * 0.55) * e;
  }),
  "shotgun.wav": render(0.22, (t, i, n) => {
    const e = env(t, 0.001, 0.18, n / sr);
    return (noise() * 0.7 + Math.sin(2 * Math.PI * 80 * t) * 0.25) * e;
  }),
  "reload.wav": render(0.18, (t, i, n) => {
    const click = t < 0.04 ? noise() * (1 - t / 0.04) : 0;
    const slide = t > 0.07 ? Math.sin(2 * Math.PI * 140 * t) * env(t - 0.07, 0.01, 0.08, 0.11) * 0.25 : 0;
    return click * 0.4 + slide;
  }),
  "hit-wall.wav": render(0.08, (t, i, n) => noise() * env(t, 0.001, 0.07, n / sr) * 0.35),
  "hit-enemy.wav": render(0.1, (t, i, n) => {
    const e = env(t, 0.001, 0.08, n / sr);
    return (Math.sin(2 * Math.PI * 180 * t) * 0.3 + noise() * 0.25) * e;
  }),
  "melee.wav": render(0.1, (t, i, n) => {
    const e = env(t, 0.002, 0.08, n / sr);
    return (Math.sin(2 * Math.PI * 90 * t) * 0.45 + noise() * 0.15) * e;
  }),
  "death.wav": render(0.28, (t, i, n) => {
    const freq = 220 - t * 280;
    return Math.sin(2 * Math.PI * freq * t) * env(t, 0.01, 0.2, n / sr) * 0.4;
  }),
  "hurt.wav": render(0.14, (t, i, n) => {
    const e = env(t, 0.001, 0.12, n / sr);
    return (Math.sin(2 * Math.PI * 140 * t) * 0.35 + noise() * 0.2) * e;
  }),
  "pickup.wav": render(0.16, (t, i, n) => {
    const freq = 420 + t * 380;
    return Math.sin(2 * Math.PI * freq * t) * env(t, 0.005, 0.1, n / sr) * 0.28;
  }),
  "ui-click.wav": render(0.06, (t, i, n) => Math.sin(2 * Math.PI * 760 * t) * env(t, 0.001, 0.05, n / sr) * 0.22),
  "music-menu.wav": render(4, (t) => {
    const a = Math.sin(2 * Math.PI * 110 * t) * 0.12;
    const b = Math.sin(2 * Math.PI * 164.8 * t) * 0.08;
    const c = Math.sin(2 * Math.PI * 220 * t) * 0.04;
    return (a + b + c) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 0.25 * t));
  }),
  "music-game.wav": render(4, (t) => {
    const a = Math.sin(2 * Math.PI * 98 * t) * 0.11;
    const b = Math.sin(2 * Math.PI * 146.8 * t) * 0.07;
    const pulse = 0.65 + 0.35 * Math.sin(2 * Math.PI * 1.5 * t);
    return (a + b) * pulse;
  }),
};

for (const [name, samples] of Object.entries(files)) {
  writeFileSync(join(outDir, name), wav(samples));
}

console.log(`Wrote ${Object.keys(files).length} wav files to ${outDir}`);
