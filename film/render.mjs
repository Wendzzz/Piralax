// Renders the showreel frame by frame: seek(frame / FPS) → screenshot → ffmpeg (H.264).
// Usage:
//   node render.mjs --stills 1.8,7.3,16.8   write PNG stills to out/stills
//   node render.mjs                          render out/video.mp4 (silent, H.264, 30fps)
import { chromium } from 'playwright'
import ffmpegPath from 'ffmpeg-static'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, 'out')
const FPS = 30
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 })

// Fail loudly on any missing asset or script error.
const problems = []
page.on('requestfailed', (r) => problems.push(`missing asset: ${r.url()}`))
page.on('pageerror', (e) => problems.push(`script error: ${e.message}`))
page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`))

await page.goto(pathToFileURL(join(HERE, 'index.html')).href)
await page.evaluate(() => window.filmReady)

// Seek, then wait two animation frames so Chromium has painted before the screenshot.
// Without this, a large change between frames can be captured before it is drawn.
const seekAndPaint = (t) =>
  page.evaluate((tt) => {
    window.seek(tt)
    return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  }, t)

// Pre-flight checks: brand fonts loaded, no scrollbars, nothing clipped by the stage.
const check = await page.evaluate(() => {
  const weights = [400, 500, 600, 700, 800].filter((w) => !document.fonts.check(`${w} 40px "Plus Jakarta Sans"`))
  const scroll = document.documentElement.scrollWidth > 1920 || document.documentElement.scrollHeight > 1080
  return { missingWeights: weights, scroll }
})
if (check.missingWeights.length) problems.push(`fonts not loaded: ${check.missingWeights.join(', ')}`)
if (check.scroll) problems.push('page is larger than the 1920×1080 stage (scrollbars)')

const stillsArg = process.argv.indexOf('--stills')
if (stillsArg > -1) {
  mkdirSync(join(OUT, 'stills'), { recursive: true })
  for (const t of process.argv[stillsArg + 1].split(',').map(Number)) {
    await seekAndPaint(t)
    await page.screenshot({ path: join(OUT, 'stills', `t${t.toFixed(2)}.png`) })
  }
  console.log('stills written')
} else {
  const duration = await page.evaluate(() => window.DURATION)
  const frames = Math.round(duration * FPS)
  const ff = spawn(ffmpegPath, [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p',
    '-profile:v', 'high', '-movflags', '+faststart', '-r', String(FPS),
    join(OUT, 'video.mp4'),
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  const started = Date.now()
  for (let f = 0; f < frames; f++) {
    await seekAndPaint(f / FPS)
    const png = await page.screenshot({ type: 'png' })
    if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r))
    if (f % 75 === 0) console.log(`frame ${f}/${frames}  (${((Date.now() - started) / 1000).toFixed(0)}s)`)
  }
  ff.stdin.end()
  await new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`)))))
  console.log(`video written: ${frames} frames`)
}

await browser.close()
if (problems.length) {
  console.error('PROBLEMS:\n' + [...new Set(problems)].join('\n'))
  process.exit(1)
}
