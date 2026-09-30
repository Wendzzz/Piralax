// Original soundtrack for the Piralax showreel, synthesised from scratch (no samples, no licensing).
// Restrained electronic rhythm at 120 BPM; every scene change lands on a beat.
// Writes out/music.wav (48 kHz, stereo, 32-bit float). Loudness is mastered later with ffmpeg.
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SR = 48000
const DUR = 25
const N = SR * DUR
const L = new Float32Array(N)
const R = new Float32Array(N)
const revIn = new Float32Array(N) // send bus for the reverb

const BEAT = 0.5 // 120 BPM
const mtof = (m) => 440 * 2 ** ((m - 69) / 12)
const TAU = Math.PI * 2

// Deterministic noise, so every render of the track is identical.
let seed = 0x5eed
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 2147483648 - 1
}

function add(i, l, r, send = 0) {
  if (i < 0 || i >= N) return
  L[i] += l
  R[i] += r
  revIn[i] += (l + r) * 0.5 * send
}

/* ---------------------------------------------------------- harmony */
// [start, end, notes (MIDI), bass root (MIDI)]
const chords = [
  [0.0, 3.5, [53, 57, 60, 64], 41], // Fmaj7 — intro
  [3.5, 7.0, [50, 53, 57, 60, 64], 38], // Dm9 — the problem
  [7.0, 9.5, [48, 52, 55, 59, 62], 36], // Cmaj9 — the reveal
  [9.5, 12.0, [45, 48, 52, 55, 59], 33], // Am9
  [12.0, 14.5, [53, 57, 60, 64, 67], 41], // Fmaj9 — review
  [14.5, 16.5, [55, 59, 62, 64], 43], // G6 — lift into approval
  [16.5, 18.5, [48, 55, 59, 64], 36], // Cmaj7 — approved
  [18.5, 20.25, [45, 52, 55, 60], 33], // Am7 — features
  [20.25, 22.0, [53, 57, 60, 64], 41], // Fmaj7
  [22.0, 25.0, [48, 52, 55, 59, 62], 36], // Cmaj9 — final hold
]

/* ---------------------------------------------------------- pad */
// Warm additive pad with slow attack/release; chords overlap to crossfade.
for (const [a, b, notes] of chords) {
  const final = a >= 22
  const att = a === 0 ? 1.4 : 0.5
  const rel = final ? 2.6 : 0.6
  const end = final ? DUR : b
  const i0 = Math.floor(a * SR)
  const i1 = Math.min(N, Math.floor((end + rel) * SR))
  notes.forEach((m, v) => {
    const f = mtof(m)
    const pan = (v / (notes.length - 1) - 0.5) * 0.6
    for (let i = i0; i < i1; i++) {
      const t = i / SR
      const lt = t - a
      let env = Math.min(1, lt / att)
      if (t > end) env *= Math.max(0, 1 - (t - end) / rel)
      if (final) env *= Math.max(0, Math.min(1, (DUR - 0.15 - t) / 2.4)) // fade into silence
      const det = 1 + 0.0018 * Math.sin(TAU * 0.13 * t + v)
      const ph = TAU * f * det * lt
      const s = (Math.sin(ph) + 0.32 * Math.sin(2 * ph + 0.3) + 0.12 * Math.sin(3 * ph + 1.1)) * env
      const trem = 0.9 + 0.1 * Math.sin(TAU * 0.25 * t + v * 0.7)
      const amp = 0.042 * trem
      add(i, s * amp * (1 - pan), s * amp * (1 + pan), 0.55)
    }
  })
}

/* ---------------------------------------------------------- drums & bass */
const GROOVE_START = 3.5
const GROOVE_END = 22.0
const chordAt = (t) => chords.find(([a, b]) => t >= a && t < b) ?? chords[chords.length - 1]

function kick(t0, level = 1) {
  const i0 = Math.floor(t0 * SR)
  let ph = 0
  for (let k = 0; k < SR * 0.4; k++) {
    const t = k / SR
    const f = 48 + 70 * Math.exp(-t / 0.03)
    ph += (TAU * f) / SR
    const env = Math.exp(-t / 0.13)
    const click = k < 60 ? noise() * 0.3 * (1 - k / 60) : 0
    const s = (Math.sin(ph) * env + click) * 0.55 * level
    add(i0 + k, s, s)
  }
}

let hpPrev = 0
let hpOut = 0
function hat(t0, level, pan) {
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < SR * 0.06; k++) {
    const n = noise()
    hpOut = 0.86 * (hpOut + n - hpPrev) // one-pole high-pass
    hpPrev = n
    const s = hpOut * Math.exp(-k / (SR * 0.012)) * level
    add(i0 + k, s * (1 - pan), s * (1 + pan), 0.05)
  }
}

function rim(t0, level) {
  const i0 = Math.floor(t0 * SR)
  let lp = 0
  for (let k = 0; k < SR * 0.15; k++) {
    const t = k / SR
    lp += 0.35 * (noise() - lp)
    const s = (lp * Math.exp(-t / 0.045) + Math.sin(TAU * 190 * t) * Math.exp(-t / 0.03) * 0.6) * level
    add(i0 + k, s, s, 0.3)
  }
}

function bass(t0, m, len) {
  const f = mtof(m)
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < SR * (len + 0.1); k++) {
    const t = k / SR
    const env = Math.min(1, t / 0.006) * Math.exp(-t / 0.42) * (t > len ? Math.max(0, 1 - (t - len) / 0.1) : 1)
    const s = (Math.sin(TAU * f * t) + 0.18 * Math.sin(TAU * 2 * f * t)) * env * 0.3
    add(i0 + k, s, s)
  }
}

for (let t = GROOVE_START; t < GROOVE_END - 0.01; t += BEAT) {
  const beatInBar = Math.round((t - GROOVE_START) / BEAT) % 4
  const [, , , root] = chordAt(t + 0.001)
  if (beatInBar === 0 || beatInBar === 2) kick(t, t < 7 ? 0.75 : 1)
  if (beatInBar === 0) bass(t, root, 0.4)
  if (beatInBar === 1) bass(t + BEAT / 2, root, 0.22) // syncopated push on the and-of-2
  if (beatInBar === 2) bass(t, root + 12, 0.18)
  if (t >= 7.5) hat(t + BEAT / 2, 0.16, 0.2) // offbeat hats once the product appears
  if (t >= 12 && t < 18.5) hat(t + BEAT / 4, 0.06, -0.3) // 16th ghost notes during the demo
  if (t >= 12 && (beatInBar === 1 || beatInBar === 3)) rim(t, 0.22)
}

/* ---------------------------------------------------------- pluck arpeggio */
function pluck(t0, m, level, pan) {
  const f = mtof(m)
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < SR * 0.5; k++) {
    const t = k / SR
    const env = Math.min(1, t / 0.003) * Math.exp(-t / 0.13)
    const s = (Math.sin(TAU * f * t) + 0.25 * Math.sin(TAU * 2 * f * t) * Math.exp(-t / 0.05)) * env * level
    add(i0 + k, s * (1 - pan), s * (1 + pan), 0.35)
  }
}
let step = 0
for (let t = 7.5; t < 18.5; t += BEAT / 2) {
  const notes = chordAt(t + 0.001)[2]
  const m = notes[(step * 2) % notes.length] + 12
  pluck(t, m, t < 8 ? 0.03 : 0.05, step % 2 ? 0.35 : -0.35)
  step++
}

/* ---------------------------------------------------------- transitions */
// Filtered-noise riser into the circular wipe, and a softer one into the features.
function riser(a, b, level) {
  let lp = 0
  for (let i = Math.floor(a * SR); i < Math.floor(b * SR); i++) {
    const k = (i / SR - a) / (b - a)
    lp += (0.02 + 0.3 * k * k) * (noise() - lp)
    const s = lp * k * k * level
    add(i, s, s, 0.4)
  }
}
riser(5.9, 7.0, 0.5)
riser(17.8, 18.5, 0.22)

// Soft sub impact as the light scene opens.
function impact(t0, level) {
  const i0 = Math.floor(t0 * SR)
  let ph = 0
  for (let k = 0; k < SR * 0.9; k++) {
    const t = k / SR
    ph += (TAU * (38 + 30 * Math.exp(-t / 0.08))) / SR
    const s = Math.sin(ph) * Math.exp(-t / 0.3) * level
    add(i0 + k, s, s, 0.2)
  }
}
impact(7.0, 0.35)
impact(22.0, 0.22)

/* ---------------------------------------------------------- interface sounds */
// Tiny ticks for cursor clicks, grab and release.
function tick(t0, f, level) {
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < SR * 0.05; k++) {
    const t = k / SR
    const s = Math.sin(TAU * f * t) * Math.exp(-t / 0.008) * level
    add(i0 + k, s, s, 0.1)
  }
}
tick(13.0, 2400, 0.12)
tick(13.72, 1900, 0.09)
tick(14.55, 1600, 0.09)
tick(16.5, 2400, 0.12)

// Confirmation tone when the project is approved: a soft two-note bell (E6 → B6).
function bell(t0, m, level) {
  const f = mtof(m)
  const i0 = Math.floor(t0 * SR)
  for (let k = 0; k < SR * 1.6; k++) {
    const t = k / SR
    const env = Math.min(1, t / 0.004) * Math.exp(-t / 0.45)
    const s = (Math.sin(TAU * f * t) + 0.28 * Math.sin(TAU * 2.01 * f * t) * Math.exp(-t / 0.2) + 0.08 * Math.sin(TAU * 3 * f * t) * Math.exp(-t / 0.1)) * env * level
    add(i0 + k, s, s, 0.6)
  }
}
bell(16.52, 88, 0.13)
bell(16.66, 95, 0.11)

/* ---------------------------------------------------------- reverb */
// Small Schroeder reverb: four combs into two all-passes, slightly different per side.
function reverb(input, delays, apDelays, fb) {
  const out = new Float32Array(N)
  for (const d of delays) {
    const buf = new Float32Array(d)
    let idx = 0
    let lp = 0
    for (let i = 0; i < N; i++) {
      const y = buf[idx]
      lp = 0.7 * y + 0.3 * lp // damping
      buf[idx] = input[i] + lp * fb
      out[i] += y * 0.25
      idx = (idx + 1) % d
    }
  }
  for (const d of apDelays) {
    const buf = new Float32Array(d)
    let idx = 0
    for (let i = 0; i < N; i++) {
      const b = buf[idx]
      const x = out[i]
      const y = -x + b
      buf[idx] = x + b * 0.5
      out[i] = y
      idx = (idx + 1) % d
    }
  }
  return out
}
const wetL = reverb(revIn, [1557, 1617, 1491, 1422], [225, 556], 0.8)
const wetR = reverb(revIn, [1580, 1640, 1514, 1445], [248, 579], 0.8)
for (let i = 0; i < N; i++) {
  L[i] += wetL[i] * 0.35
  R[i] += wetR[i] * 0.35
}

/* ---------------------------------------------------------- master */
// Short fade-in, then a gentle soft-clip as a safety stage (real loudness is set by ffmpeg).
for (let i = 0; i < N; i++) {
  const fi = Math.min(1, i / (SR * 0.02))
  L[i] = Math.tanh(L[i] * 1.2 * fi) / 1.2
  R[i] = Math.tanh(R[i] * 1.2 * fi) / 1.2
}

// 32-bit float WAV writer
function writeWav(path) {
  const dataBytes = N * 2 * 4
  const buf = Buffer.alloc(44 + dataBytes)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + dataBytes, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(3, 20) // IEEE float
  buf.writeUInt16LE(2, 22)
  buf.writeUInt32LE(SR, 24)
  buf.writeUInt32LE(SR * 2 * 4, 28)
  buf.writeUInt16LE(8, 32)
  buf.writeUInt16LE(32, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(dataBytes, 40)
  for (let i = 0; i < N; i++) {
    buf.writeFloatLE(L[i], 44 + i * 8)
    buf.writeFloatLE(R[i], 48 + i * 8)
  }
  writeFileSync(path, buf)
}
mkdirSync(join(HERE, 'out'), { recursive: true })
writeWav(join(HERE, 'out', 'music.wav'))
console.log('music.wav written')
