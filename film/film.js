/* Piralax showreel — every animated property is computed from time t (seconds) in seek(t).
   No CSS transitions or animations run: the renderer calls seek(frame / 30) for each frame. */

const DURATION = 25
const W = 1920
const H = 1080

/* ------------------------------------------------------------------ helpers */
const $ = (id) => document.getElementById(id)
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a, b, k) => a + (b - a) * k

const ease = {
  linear: (x) => x,
  out: (x) => 1 - (1 - x) ** 3,
  outQuint: (x) => 1 - (1 - x) ** 5,
  in: (x) => x ** 3,
  inOut: (x) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2),
  // Gentle overshoot for springy entrances.
  back: (x) => {
    const c1 = 1.5
    const c3 = c1 + 1
    return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2
  },
}

// Progress of a segment starting at `start` lasting `dur`, eased.
const P = (t, start, dur, e = 'out') => ease[e](clamp((t - start) / dur))

// A 0→1→0 pulse, used for presses and number pops.
const bump = (t, start, dur) => Math.sin(Math.PI * clamp((t - start) / dur))

// Explicit keyframe table: [[time, value, easeIntoThisKey], ...]
function kf(t, table) {
  if (t <= table[0][0]) return table[0][1]
  for (let i = 1; i < table.length; i++) {
    const [t1, v1, e = 'inOut'] = table[i]
    const [t0, v0] = table[i - 1]
    if (t <= t1) return lerp(v0, v1, ease[e]((t - t0) / (t1 - t0)))
  }
  return table[table.length - 1][1]
}

// Cubic bezier point for cursor paths.
function bez(p0, p1, p2, p3, k) {
  const u = 1 - k
  return [
    u ** 3 * p0[0] + 3 * u * u * k * p1[0] + 3 * u * k * k * p2[0] + k ** 3 * p3[0],
    u ** 3 * p0[1] + 3 * u * u * k * p1[1] + 3 * u * k * k * p2[1] + k ** 3 * p3[1],
  ]
}

// Seeded random numbers, so every render is identical.
function mulberry32(seed) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(20260930)

// Apply opacity and transform. x/y are offsets from the element's own left/top.
function put(el, { o = 1, x = 0, y = 0, s = 1, sx, sy, r = 0 } = {}) {
  el.style.opacity = o.toFixed(4)
  el.style.visibility = o <= 0.001 ? 'hidden' : 'visible'
  el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(${(sx ?? s).toFixed(4)}, ${(sy ?? s).toFixed(4)})`
}

function el(tag, cls, html, style) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (html) e.innerHTML = html
  if (style) Object.assign(e.style, style)
  return e
}

const icons = {
  chat: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z"/><path d="M9 11h6M9 14h3.5"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  folder: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5h3.6l2 2.2h7.4A2.5 2.5 0 0 1 21 9.7v7.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-10Z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  layout: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9h17M9.5 9v11"/>',
  pin: '<path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
  signal: '<path d="M4 18.5 9.5 13l3.5 3.5 7-7.5M15 9h5v5"/>',
}
const svg = (name, size = 24, sw = 2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</svg>`

/* ------------------------------------------------------------------ build */
// Dark grid lines
const gridV = []
const gridH = []
for (let i = 1; i <= 11; i++) {
  const g = el('div', 'gl gl--v', '', { left: `${i * 160}px` })
  $('gridDark').appendChild(g)
  gridV.push(g)
}
for (let j = 1; j <= 7; j++) {
  const g = el('div', 'gl gl--h', '', { top: `${j * 135}px` })
  $('gridDark').appendChild(g)
  gridH.push(g)
}

// Scattered "before Piralax" snippets, placed with seeded jitter.
const chipData = [
  ['chat', 'Team chat', '“Can we tweak the header again?”', 1230, 150],
  ['mail', 'Email', 'Re: Re: Homepage feedback (v3)', 1330, 300],
  ['folder', 'Shared drive', 'Homepage_FINAL_v2.pdf', 1250, 450],
  ['clock', 'Meeting notes', 'Who owns the About page?', 1340, 600],
  ['chat', 'Direct message', 'Any update on approvals?', 1240, 750],
  ['mail', 'Email', 'Fwd: pricing notes', 1370, 900],
]
const chips = chipData.map(([ic, label, text, x, y]) => {
  const c = el('div', 'chip-d abs', `<span class="ic">${svg(ic, 26)}</span><span><small>${label}</small><b>${text}</b></span>`)
  $('chips').appendChild(c)
  return {
    node: c,
    x: x + (rng() - 0.5) * 60,
    y: y + (rng() - 0.5) * 30,
    r: (rng() - 0.5) * 8,
    phase: rng() * Math.PI * 2,
  }
})

// Board cards. Slots are computed from column and position.
const COL_X = [278 + 14, 568 + 14, 858 + 14]
const slotY = (i) => 300 + i * 138
const cardData = {
  A: { title: 'Pricing page wireframe', av: 'AK', tone: 't-amber', due: 'Oct 12' },
  B: { title: 'Homepage hero copy', av: 'MR', tone: 't-indigo', due: 'Oct 14' },
  C: { title: 'Services page layout', av: 'JL', tone: 't-teal', due: 'Oct 16' },
  D: { title: 'About page imagery', av: 'MR', tone: 't-indigo', chip: ['changes', 'Needs changes'] },
  E: { title: 'Sitemap and navigation', av: 'JL', tone: 't-teal', chip: ['ok', 'Approved'] },
  F: { title: 'Visual moodboard', av: 'AK', tone: 't-amber', chip: ['ok', 'Approved'] },
}
const cards = {}
for (const [id, d] of Object.entries(cardData)) {
  let meta = `<span class="av av--sm ${d.tone}">${d.av}</span>`
  if (d.due) meta += `<span class="due" id="due${id}">${svg('clock', 18)}</span><span id="dueT${id}">${d.due}</span>`
  if (d.chip) meta += `<span class="chip chip--${d.chip[0]}">${d.chip[1]}</span>`
  if (id === 'A') meta += '<span id="aRev" class="chip chip--review">In review</span><span id="aOk" class="chip chip--ok">Approved</span>'
  const c = el('div', 'card abs', `<p>${d.title}</p><div class="meta">${meta}</div>${id === 'A' ? '<span id="aRing" class="ring"></span>' : ''}`)
  if (id === 'A') c.style.zIndex = 5
  $('cards').appendChild(c)
  cards[id] = c
}

// Spark burst around the approve button, seeded.
const sparks = Array.from({ length: 14 }, (_, i) => {
  const s = el('div', 'spark abs', '', {
    background: ['#6366f1', '#34d399', '#a5b4fc', '#4f46e5'][i % 4],
  })
  $('sparks').appendChild(s)
  const a = (i / 14) * Math.PI * 2 + (rng() - 0.5) * 0.4
  return { node: s, dx: Math.cos(a), dy: Math.sin(a), d: 70 + rng() * 60, size: 0.7 + rng() * 0.6 }
})

// Feature cards
const featData = [
  {
    n: '01',
    title: 'See what needs your attention.',
    sub: 'Owners, deadlines and status for every task, at a glance.',
    visual: `
      <div class="mini" style="left: 36px; top: 40px; width: 448px; height: 300px">
        ${[
          ['Pricing wireframe', 'AK', 't-amber', 'review', 'In review'],
          ['Homepage copy', 'MR', 't-indigo', 'progress', 'Due Oct 14'],
          ['About imagery', 'MR', 't-indigo', 'changes', 'Changes'],
          ['Sitemap', 'JL', 't-teal', 'ok', 'Approved'],
        ]
          .map(
            ([t, a, tone, k, lbl], r) =>
              `<div class="row f1row" style="top: ${14 + r * 68}px${r === 3 ? '; border-bottom: 0' : ''}"><span class="av av--sm ${tone}">${a}</span>${t}<span class="chip chip--${k} f1chip">${lbl}</span></div>`,
          )
          .join('')}
      </div>`,
  },
  {
    n: '02',
    title: 'Keep feedback beside the work.',
    sub: 'Clients pin comments right on the design they’re reviewing.',
    visual: `
      <div class="mini" style="left: 50px; top: 36px; width: 420px; height: 240px; padding: 22px">
        <div style="display:flex; gap: 8px"><i style="width:40px;height:8px;border-radius:9px;background:#a5b4fc;display:block"></i><i style="width:24px;height:8px;border-radius:9px;background:#e5e7eb;display:block"></i><i style="width:24px;height:8px;border-radius:9px;background:#e5e7eb;display:block"></i></div>
        <div style="margin-top:20px;height:118px;border-radius:12px;background:#eef2ff;padding:20px">
          <i style="display:block;width:78%;height:16px;border-radius:9px;background:#a5b4fc"></i>
          <i style="display:block;margin-top:12px;width:52%;height:10px;border-radius:9px;background:#e0e7ff"></i>
          <i style="display:block;margin-top:16px;width:92px;height:26px;border-radius:99px;background:#4f46e5"></i>
        </div>
      </div>
      <div id="f2pin" class="abs" style="left: 398px; top: 70px; width: 38px; height: 38px; border-radius: 50%; background: #4f46e5; color: #fff; display: grid; place-items: center; font-size: 18px; font-weight: 800; box-shadow: 0 0 0 4px #fff, 0 8px 18px -6px rgba(79,70,229,.6)">1</div>
      <div id="f2bubble" class="abs" style="left: 150px; top: 216px; width: 330px; padding: 16px 18px; border-radius: 6px 18px 18px 18px; background: #fff; border: 1px solid #e0e7ff; box-shadow: 0 12px 28px -12px rgba(17,24,39,.25)">
        <p style="font-size:17px;font-weight:800">Dana P. <span style="font-weight:500;color:#6b7280">Client</span></p>
        <p style="margin-top:4px;font-size:20px;color:#4b5563;line-height:1.35">Can this headline sit on one line?</p>
      </div>`,
  },
  {
    n: '03',
    title: 'Make the next step clear.',
    sub: 'Review requests, resolved feedback and approvals in one history.',
    visual: `
      ${['Review requested', 'Feedback resolved', 'Version 04 approved']
        .map(
          (t, i) =>
            `<div class="tl" style="top: ${40 + i * 58}px"><span class="dot" style="position:relative"><span class="f3fill abs" style="inset:-2.5px;border-radius:50%;background:#4f46e5;display:grid;place-items:center">${svg('check', 16, 3)}</span></span>${t}</div>`,
        )
        .join('')}
      <div id="f3next" class="abs" style="left: 40px; top: 232px; width: 440px; padding: 18px 20px; border-radius: 16px; background: #eef2ff; border: 1px solid #e0e7ff">
        <p style="font-size:16px;font-weight:800;letter-spacing:.08em;color:#3730a3;display:flex;align-items:center;gap:8px">${svg('signal', 18)} NEXT STEP</p>
        <p style="margin-top:8px;font-size:21px;font-weight:700">Launch prep with Jonah · Oct 23</p>
      </div>`,
  },
]
const feats = featData.map((f, k) => {
  const c = el(
    'div',
    'fcard abs',
    `<div class="fv">${f.visual}</div>
     <div class="fc"><p class="fnum">${f.n}</p><h3>${f.title}</h3><p class="fs">${f.sub}</p></div>
     <span class="focus"></span>`,
    { left: `${150 + k * 550}px`, top: '250px' },
  )
  $('features').appendChild(c)
  return c
})
const f1rows = [...document.querySelectorAll('.f1row')]
const f1chips = [...document.querySelectorAll('.f1chip')]
const f3fills = [...document.querySelectorAll('.f3fill')]

// Centre the two logo lockups on their measured widths.
function centreLockup(markId, wordId, markSize, gap) {
  const w = markSize + gap + $(wordId).offsetWidth
  const left = (W - w) / 2
  $(markId).style.left = `${left}px`
  $(wordId).style.left = `${left + markSize + gap}px`
}

/* ------------------------------------------------------------------ seek */
function inOut(t, a, b, rise = 30) {
  const pin = P(t, a, 0.55, 'outQuint')
  const pout = P(t, b, 0.3, 'in')
  return { o: pin * (1 - pout), y: rise * (1 - pin) - 24 * pout }
}

// Card A's position in window coordinates.
function cardAX(t) {
  return kf(t, [[13.9, COL_X[0]], [14.55, COL_X[1], 'inOut'], [16.6, COL_X[1]], [17.25, COL_X[2], 'inOut']])
}

function seek(t) {
  /* ---------- dark: intro ---------- */
  gridV.forEach((g, i) => put(g, { sy: P(t, 0.05 + i * 0.035, 0.6), s: 1 }))
  gridH.forEach((g, j) => put(g, { sx: P(t, 0.15 + j * 0.04, 0.6), s: 1 }))
  put($('darkGlow'), { o: kf(t, [[0, 0], [0.9, 1, 'out']]), x: Math.sin(t * 0.45) * 40, y: Math.cos(t * 0.35) * 24 })
  put($('darkGlow2'), { o: kf(t, [[1.0, 0], [2.0, 1, 'out']]), x: Math.cos(t * 0.4) * 36 })

  const markIn = P(t, 0.5, 0.6, 'back')
  const lockOut = P(t, 3.0, 0.45, 'in')
  put($('lockup'), { o: 1 - lockOut, s: kf(t, [[1.8, 1], [3.0, 1.02, 'inOut']]) - 0.06 * lockOut, y: -20 * lockOut })
  put($('mark'), { o: P(t, 0.5, 0.3), s: 0.5 + 0.5 * markIn, r: -8 * (1 - markIn) })
  $('markPath').style.strokeDashoffset = (1 - P(t, 0.85, 0.55, 'inOut')).toFixed(4)
  put($('markDot'), { o: P(t, 1.25, 0.2), s: 0.2 + 0.8 * P(t, 1.25, 0.25, 'back') })
  $('markDot').style.transformOrigin = '11px 21px'
  ;[...$('word').children].forEach((s, i) => {
    const p = P(t, 0.95 + i * 0.05, 0.5)
    put(s, { o: p, y: 60 * (1 - p) })
  })
  const tag = P(t, 1.55, 0.55)
  put($('tagline'), { o: tag, y: 20 * (1 - tag) })

  /* ---------- dark: problem ---------- */
  ;['pl1', 'pl2', 'pl3'].forEach((id, k) => {
    const pin = P(t, 3.5 + k * 0.55, 0.55, 'outQuint')
    const pout = P(t, 5.75 + k * 0.06, 0.45, 'in')
    const inner = $(id).firstElementChild
    put($(id), { o: t < 3.4 || pout >= 1 ? 0 : 1 })
    put(inner, { y: 104 * (1 - pin) - 104 * pout })
  })
  chips.forEach((c, i) => {
    const start = 3.7 + i * 0.22
    const pin = P(t, start, 0.5, 'back')
    const conv = P(t, 5.85 + i * 0.03, 0.55, 'in')
    const w = c.node.offsetWidth
    const h = c.node.offsetHeight
    const drift = Math.sin(t * 1.1 + c.phase) * 7
    const x = lerp(c.x, W / 2 - w / 2, conv)
    const y = lerp(c.y + drift, H / 2 - h / 2, conv)
    const o = P(t, start, 0.3) * (1 - clamp((conv - 0.55) / 0.45))
    put(c.node, { o, x, y, s: (0.85 + 0.15 * pin) * (1 - 0.7 * conv), r: c.r * (1 - conv) })
  })
  // The card appears only once every snippet has arrived at the centre.
  const coreIn = P(t, 6.52, 0.45, 'back')
  const coreOut = P(t, 7.3, 0.4, 'in')
  put($('coreCard'), { o: P(t, 6.52, 0.12) * (1 - coreOut), s: (0.2 + 0.8 * coreIn) * (1 + 0.15 * coreOut) })
  put($('dark'), { o: t < 7.7 ? 1 : 0 })

  /* ---------- light layer (revealed by a circular wipe) ---------- */
  const radius = kf(t, [[7.0, 0], [7.65, 1250, 'inOut']])
  // A radial mask rather than clip-path: Chromium stops painting the layers beneath a
  // clip-path circle once it is wider than the screen, leaving the corners unpainted.
  const mask = radius >= 1110 ? 'none' : `radial-gradient(circle ${radius.toFixed(1)}px at 960px 540px, #000 calc(100% - 1px), transparent 100%)`
  $('light').style.maskImage = mask
  $('light').style.webkitMaskImage = mask
  $('light').style.visibility = radius <= 0 ? 'hidden' : 'visible'
  put($('lightGlowA'), { o: 1, x: Math.sin(t * 0.3) * 50, y: Math.cos(t * 0.25) * 30 })
  put($('lightGlowB'), { o: kf(t, [[18, 1], [21.8, 0.4]]), x: Math.cos(t * 0.28) * 40 })

  const chapters = [['ch1', 7.75, 11.75], ['ch2', 12.05, 16.6], ['ch3', 16.75, 18.3], ['ch4', 18.65, 21.45]]
  chapters.forEach(([id, a, b]) => put($(id), inOut(t, a, b, 14)))
  const heads = [['h1', 7.8, 11.7], ['h2', 12.05, 16.55], ['h3', 16.75, 18.3], ['h4', 18.6, 21.45]]
  heads.forEach(([id, a, b]) => put($(id), inOut(t, a, b)))
  const illus = P(t, 8.2, 0.45) * (1 - P(t, 21.45, 0.3, 'in'))
  put($('illus'), { o: illus })

  /* ---------- dashboard window ---------- */
  const winIn = P(t, 8.0, 0.65, 'outQuint')
  const winOut = P(t, 18.3, 0.6, 'in')
  const push = kf(t, [[8.65, 1], [11.9, 1.015, 'inOut'], [12.3, 1, 'inOut']])
  put($('win'), { o: winIn * (1 - winOut), y: 80 * (1 - winIn) - 60 * winOut, s: (0.95 + 0.05 * winIn) * push * (1 - 0.06 * winOut) })
  put($('wChrome'), { o: P(t, 8.35, 0.3) })
  ;['sT1', 'sI0', 'sI1', 'sI2', 'sI3', 'sT2', 'sI4', 'sI5'].forEach((id, i) => {
    const p = P(t, 8.5 + i * 0.05, 0.45)
    put($(id), { o: p, x: -24 * (1 - p) })
  })
  const mh = P(t, 8.55, 0.45)
  put($('mHead'), { o: mh, y: 16 * (1 - mh) })
  ;['av0', 'av1', 'av2', 'av3'].forEach((id, i) => {
    const p = P(t, 9.7 + i * 0.06, 0.25, 'back')
    put($(id), { o: P(t, 9.7 + i * 0.06, 0.15), s: 0.6 + 0.4 * p })
  })
  const pr = P(t, 8.75, 0.45)
  put($('prog'), { o: pr, y: 12 * (1 - pr) })
  put($('barFill'), { sx: kf(t, [[9.7, 0], [10.3, 2 / 6, 'out'], [16.6, 2 / 6], [17.1, 3 / 6, 'out']]), sy: 1 })
  $('progN').textContent = t < 16.85 ? '2' : '3'
  put($('progN'), { s: 1 + 0.3 * bump(t, 16.85, 0.25) })
  $('progN').style.display = 'inline-block'

  ;[0, 1, 2].forEach((k) => {
    const p = P(t, 8.8 + k * 0.1, 0.5)
    put($(`col${k}`), { o: p, y: 30 * (1 - p) })
    put($(`cl${k}`), { o: p, y: 30 * (1 - p) })
  })
  const counts = [t < 14.25 ? 3 : 2, t < 14.3 ? 1 : t < 16.9 ? 2 : 1, t < 16.95 ? 2 : 3]
  const countPops = [14.25, [14.3, 16.9], 16.95]
  counts.forEach((n, k) => {
    const node = $(`cn${k}`)
    node.textContent = String(n)
    const pops = [].concat(countPops[k])
    const pop = Math.max(...pops.map((pt) => bump(t, pt, 0.25)))
    put(node, { s: 1 + 0.3 * pop })
  })

  // Card positions (window coordinates) from explicit keyframes.
  const drop = (i) => P(t, 9.1 + i * 0.08, 0.45, 'back')
  const dropO = (i) => P(t, 9.1 + i * 0.08, 0.25)
  const lift = P(t, 13.72, 0.18) * (1 - P(t, 14.55, 0.2))
  const pos = {
    A: [cardAX(t), slotY(0)],
    B: [COL_X[0], kf(t, [[14.0, slotY(1)], [14.45, slotY(0)]])],
    C: [COL_X[0], kf(t, [[14.05, slotY(2)], [14.5, slotY(1)]])],
    D: [COL_X[1], kf(t, [[13.95, slotY(0)], [14.4, slotY(1)], [16.7, slotY(1)], [17.15, slotY(0)]])],
    E: [COL_X[2], kf(t, [[16.65, slotY(0)], [17.1, slotY(1)]])],
    F: [COL_X[2], kf(t, [[16.7, slotY(1)], [17.15, slotY(2)]])],
  }
  Object.keys(pos).forEach((id, i) => {
    const [x, y] = pos[id]
    const d = drop(i)
    put(cards[id], { o: dropO(i), x, y: y - 18 * (1 - d), s: id === 'A' ? 1 + 0.04 * lift : 1 })
  })
  cards.A.style.boxShadow = `0 ${2 + 22 * lift}px ${4 + 40 * lift}px -${8 * lift}px rgba(49, 46, 129, ${0.08 + 0.3 * lift})`
  put($('aRing'), { o: P(t, 13.0, 0.2) * (1 - P(t, 17.6, 0.4, 'in')) })
  const rev = P(t, 14.4, 0.2) * (1 - P(t, 16.6, 0.2, 'in'))
  put($('aRev'), { o: rev, s: 0.9 + 0.1 * P(t, 14.4, 0.2, 'back') })
  put($('aOk'), { o: P(t, 16.6, 0.2), s: 0.9 + 0.1 * P(t, 16.6, 0.2, 'back') })
  put($('dueA'), { o: 1 - P(t, 14.4, 0.2) })
  put($('dueTA'), { o: 1 - P(t, 14.4, 0.2) })

  // Feedback panel
  const pt = P(t, 9.0, 0.4)
  put($('pTitle'), { o: pt, y: 12 * (1 - pt) })
  const oldIn = P(t, 9.3, 0.45)
  const shift = P(t, 13.25, 0.45, 'inOut')
  put($('cOld'), { o: oldIn, y: 12 * (1 - oldIn) + 190 * shift })
  const cn = P(t, 13.25, 0.45, 'outQuint')
  put($('cNew'), { o: P(t, 13.25, 0.25), y: 12 * (1 - cn), s: 0.98 + 0.02 * cn })
  const pf = P(t, 9.5, 0.4)
  put($('pFile'), { o: pf, y: 10 * (1 - pf) })
  const bIn = P(t, 9.6, 0.45)
  const press = 1 - 0.03 * bump(t, 16.5, 0.25)
  const done = P(t, 16.55, 0.25)
  put($('btnGo'), { o: bIn * (1 - done), y: 12 * (1 - bIn), s: press })
  put($('btnHover'), { o: P(t, 15.95, 0.15) * (1 - done), s: press })
  put($('btnDone'), { o: done, s: press })

  sparks.forEach((sp) => {
    const q = P(t, 16.55, 0.6, 'out')
    const on = t >= 16.55 && q < 1
    const cx = 1188 + 172 - 5
    const cy = 666 + 30 - 5
    sp.node.style.left = `${cx}px`
    sp.node.style.top = `${cy}px`
    put(sp.node, { o: on ? 1 - q : 0, x: sp.dx * sp.d * q * 1.6, y: sp.dy * sp.d * q, s: sp.size * (1 - 0.5 * q) })
  })
  const toastIn = P(t, 16.75, 0.45, 'outQuint')
  put($('toast'), { o: toastIn, y: 24 * (1 - toastIn) })

  /* ---------- cursors (stage coordinates) ---------- */
  const winX = 180
  const winY = 250
  const tipA = (tt) => [winX + cardAX(tt) + 166, winY + slotY(0) + 38]
  let ana
  if (t < 13.0) {
    ana = bez([1560, 1160], [1400, 900], [820, 760], tipA(13.0), P(t, 12.2, 0.8, 'inOut'))
  } else if (t < 14.8) {
    ana = tipA(t)
  } else {
    const k = P(t, 14.8, 0.55, 'in')
    const end = tipA(14.8)
    ana = [lerp(end[0], 640, k), lerp(end[1], 1160, k)]
  }
  const grab = P(t, 13.72, 0.15) * (1 - P(t, 14.55, 0.15))
  put($('curAna'), {
    o: P(t, 12.2, 0.25) * (1 - P(t, 15.05, 0.3)),
    x: ana[0],
    y: ana[1],
    s: 1 - 0.15 * bump(t, 13.0, 0.3) - 0.1 * grab,
  })

  const btnTip = [winX + 1188 + 318, winY + 666 + 34]
  let dana
  if (t < 17.4) dana = bez([2000, 780], [1850, 760], [1700, 980], btnTip, P(t, 14.9, 0.9, 'inOut'))
  else {
    const k = P(t, 17.4, 0.6, 'in')
    dana = [lerp(btnTip[0], 2020, k), lerp(btnTip[1], 1020, k)]
  }
  put($('curDana'), { o: P(t, 14.9, 0.2) * (1 - P(t, 17.7, 0.3)), x: dana[0], y: dana[1], s: 1 - 0.15 * bump(t, 16.5, 0.3) })

  /* ---------- features ---------- */
  const focusWin = [[19.3, 19.95], [20.0, 20.65], [20.7, 21.35]]
  const focus = focusWin.map(([a, b]) => P(t, a, 0.2) * (1 - P(t, b, 0.2, 'in')))
  const anyFocus = Math.max(...focus)
  feats.forEach((c, k) => {
    const fin = P(t, 18.55 + k * 0.1, 0.6, 'outQuint')
    const fout = P(t, 21.45 + k * 0.06, 0.45, 'in')
    const dim = anyFocus * (1 - focus[k])
    put(c, { o: fin * (1 - fout) * (1 - 0.22 * dim), y: 90 * (1 - fin) - 40 * fout - 10 * focus[k] })
    put(c.querySelector('.focus'), { o: focus[k] })
  })
  f1rows.forEach((r, i) => {
    const p = P(t, 18.9 + i * 0.1, 0.3)
    put(r, { o: p, x: -16 * (1 - p) })
  })
  f1chips.forEach((c, i) => {
    put(c, { o: P(t, 19.45 + i * 0.08, 0.15), s: 0.7 + 0.3 * P(t, 19.45 + i * 0.08, 0.2, 'back') })
  })
  put($('f2pin'), { o: P(t, 20.1, 0.12), s: 0.4 + 0.6 * P(t, 20.1, 0.2, 'back') })
  const bub = P(t, 20.25, 0.3)
  put($('f2bubble'), { o: bub, y: 12 * (1 - bub) })
  f3fills.forEach((f, i) => put(f, { o: P(t, 20.75 + i * 0.15, 0.12), s: 0.5 + 0.5 * P(t, 20.75 + i * 0.15, 0.2, 'back') }))
  const nx = P(t, 21.15, 0.3)
  put($('f3next'), { o: nx, y: 12 * (1 - nx) })

  /* ---------- final lockup ---------- */
  put($('fGlow'), { o: P(t, 21.9, 0.7), s: 1 + 0.03 * Math.sin(Math.max(0, t - 22) * 0.9) })
  const fm = P(t, 22.0, 0.6, 'back')
  put($('fMark'), { o: P(t, 22.0, 0.25), s: 0.5 + 0.5 * fm, r: -8 * (1 - fm) })
  ;[...$('fWord').children].forEach((s, i) => {
    const p = P(t, 22.15 + i * 0.045, 0.5)
    put(s, { o: p, y: 50 * (1 - p) })
  })
  const fl = P(t, 22.7, 0.55)
  put($('fLine'), { o: fl, y: 20 * (1 - fl) })
  const fc = P(t, 23.0, 0.5, 'back')
  put($('fCta'), { o: P(t, 23.0, 0.25), s: 0.9 + 0.1 * fc })
}

/* ------------------------------------------------------------------ boot */
window.DURATION = DURATION
window.seek = seek
window.filmReady = document.fonts.ready.then(() => {
  centreLockup('mark', 'word', 136, 28)
  centreLockup('fMark', 'fWord', 150, 28)
  seek(0)
  return true
})

// Scrub by hand when opened directly: add ?t=12.5 to the URL.
const tParam = new URLSearchParams(location.search).get('t')
if (tParam !== null) window.filmReady.then(() => seek(parseFloat(tParam)))
