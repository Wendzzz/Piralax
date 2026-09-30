// Masters the soundtrack to -14 LUFS (true peak below -1 dBTP), muxes it with the rendered
// H.264 video, then verifies the finished file.
// Input: out/video.mp4 (from render.mjs) and out/music.wav (from audio.mjs)
// Output: out/piralax-showreel.mp4
import ffmpegPath from 'ffmpeg-static'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out')
const TARGET_I = -14
const TARGET_TP = -1.5 // headroom so the AAC-encoded file stays below -1 dBTP
// The synthesised WAV has no channel layout, so it is declared explicitly around loudnorm.
const STEREO = 'aformat=channel_layouts=stereo'

// ffmpeg prints loudness analysis to stderr.
const ffmpeg = (args) => spawnSync(ffmpegPath, args, { encoding: 'utf8' }).stderr

// Pass 1: measure the raw mix.
const pass1 = ffmpeg(['-hide_banner', '-nostats', '-i', join(OUT, 'music.wav'), '-af', `${STEREO},loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=11:print_format=json`, '-f', 'null', '-'])
const m = JSON.parse(pass1.slice(pass1.lastIndexOf('{'), pass1.lastIndexOf('}') + 1))
console.log('measured:', { I: m.input_i, TP: m.input_tp, LRA: m.input_lra })

// Pass 2: normalise with the measured values to a 24-bit master, then encode AAC and mux with the video.
const ln = [
  `loudnorm=I=${TARGET_I}:TP=${TARGET_TP}:LRA=11`,
  `measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}`,
  `measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=summary`,
].join(':')
const master = join(OUT, 'music-master.wav')
const pass2 = ffmpeg(['-y', '-hide_banner', '-nostats', '-i', join(OUT, 'music.wav'), '-af', `${STEREO},${ln},aresample=48000,${STEREO}`, '-c:a', 'pcm_s24le', master])
console.log('loudnorm mode:', /Normalization Type:\s*(\w+)/.exec(pass2)?.[1])
const final = join(OUT, 'piralax-showreel.mp4')
ffmpeg([
  '-y', '-hide_banner', '-nostats', '-loglevel', 'error',
  '-i', join(OUT, 'video.mp4'), '-i', master,
  '-map', '0:v:0', '-map', '1:a:0',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000',
  '-t', '25', '-movflags', '+faststart',
  final,
])

// Verify the finished file.
const info = ffmpeg(['-hide_banner', '-i', final])
const videoLine = /Stream #0:\d.*Video: (.*)/.exec(info)?.[1] ?? ''
const audioLine = /Stream #0:\d.*Audio: (.*)/.exec(info)?.[1] ?? ''
const duration = /Duration: ([\d:.]+)/.exec(info)?.[1]
const counted = ffmpeg(['-hide_banner', '-i', final, '-map', '0:v', '-f', 'null', '-'])
const frames = parseInt([...counted.matchAll(/frame=\s*(\d+)/g)].pop()?.[1] ?? '0', 10)
// Unpainted frames come out black: sample every frame's corner and centre and reject any pure black.
const corners = spawnSync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-i', final, '-vf', 'crop=2:2:4:4,scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1e8 }).stdout
const centres = spawnSync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-i', final, '-vf', 'crop=2:2:959:539,scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1e8 }).stdout
const blackFrames = []
for (let i = 0; i < corners.length / 3; i++) {
  const black = (buf) => buf[i * 3] < 8 && buf[i * 3 + 1] < 8 && buf[i * 3 + 2] < 8
  if (black(corners) || black(centres)) blackFrames.push(i)
}
const meter = ffmpeg(['-hide_banner', '-nostats', '-i', final, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'])
const summary = meter.slice(meter.lastIndexOf('Summary:'))
const I = parseFloat(/I:\s*(-?[\d.]+) LUFS/.exec(summary)[1])
const TP = parseFloat(/True peak:\s*Peak:\s*(-?[\d.]+) dBFS/.exec(summary)[1])
console.log({ file: final, video: videoLine, audio: audioLine, duration, frames, blackFrames: blackFrames.length, loudness: `${I} LUFS integrated, true peak ${TP} dBTP` })
const ok = videoLine.startsWith('h264') && /1920x1080/.test(videoLine) && /\b30 fps/.test(videoLine) && frames === 750 && blackFrames.length === 0 && Math.abs(I - TARGET_I) <= 0.5 && TP < -1
if (!ok) {
  console.error('VERIFY FAILED')
  process.exit(1)
}
console.log('verified: H.264, 30fps, 750 frames, no unpainted frames, -14 LUFS, true peak below -1 dBTP')
