import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { WaitlistButton } from '../components/Button.jsx'
import DashboardPreview from '../components/DashboardPreview.jsx'
import { Avatar, Status } from '../components/ui.jsx'
import { EASE, ENTRANCE, RISE } from '../lib/motion.js'

// Headline, description and CTAs arrive in sequence on load.
const sequence = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const rise = {
  hidden: { opacity: 0, y: RISE },
  show: { opacity: 1, y: 0, transition: { duration: ENTRANCE, ease: EASE } },
}

/* ------------------------------------------------------------------
   The canvas: pieces of a real creative project around the headline
   ------------------------------------------------------------------ */
function Palette() {
  return (
    <div className="art-card art-palette">
      <div className="art-palette__swatches">
        {['#4f46e5', '#7c3aed', '#a5b4fc', '#111827'].map((c) => (
          <span key={c} style={{ background: c }} />
        ))}
      </div>
      <p className="art-title">Brand palette</p>
      <p className="art-sub">Harbor &amp; Pine</p>
    </div>
  )
}

function Artboard() {
  return (
    <div className="art-card art-board">
      <p className="art-board__head">
        <span className="art-title">Homepage</span>
        <span className="chip chip--accent">v04</span>
      </p>
      <div className="art-board__frame">
        <i className="art-board__nav" />
        <div className="art-board__hero">
          <i />
          <i />
          <b />
        </div>
        <div className="art-board__cards">
          <i />
          <i />
          <i />
        </div>
      </div>
      <span className="art-pin">2</span>
    </div>
  )
}

function TypeSpecimen() {
  return (
    <div className="art-card art-type">
      <p className="art-type__aa">Aa</p>
      <p className="art-title">Plus Jakarta Sans</p>
      <p className="art-sub">Display · 800</p>
    </div>
  )
}

function ApprovalCard() {
  return (
    <div className="art-card art-approval">
      <Avatar initials="DP" tone="rose" />
      <span>
        <span className="art-title">Brand guidelines</span>
        <Status kind="approved" />
      </span>
    </div>
  )
}

// Four quiet pieces, two each side of the headline. `d` is its depth for the pointer parallax.
const pieces = [
  { key: 'palette', side: 'left', top: '6%', edge: '2%', r: -5, d: 8, node: <Palette /> },
  { key: 'board', side: 'left', top: '52%', edge: '5%', r: 3, d: 14, node: <Artboard /> },
  { key: 'type', side: 'right', top: '8%', edge: '3%', r: 4, d: 10, node: <TypeSpecimen /> },
  { key: 'approval', side: 'right', top: '56%', edge: '4%', r: -2, d: 12, node: <ApprovalCard /> },
]

function Canvas() {
  return (
    <div className="canvas" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.div
          key={p.key}
          className="canvas__piece"
          style={{ top: p.top, [p.side]: p.edge, '--d': p.d }}
          initial={{ opacity: 0, y: 40, rotate: p.r * 2.5, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotate: p.r, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.9, delay: 0.35 + i * 0.08 }}
        >
          {/* Parallax and the idle float live on inner layers, so no two motions share a transform. */}
          <div className="canvas__parallax">
            <div className="canvas__float" style={{ animationDelay: `${-i * 1.3}s` }}>
              {p.node}
            </div>
          </div>
        </motion.div>
      ))}


      {/* Two collaborators, each drifting between the pieces on their side. */}
      <span className="cursor cursor--maya">
        <svg width="22" height="26" viewBox="0 0 34 40">
          <path d="M3 2 L3 32 L11 25 L17 38 L22 36 L16 23 L27 23 Z" />
        </svg>
        <span>Maya R.</span>
      </span>
      <span className="cursor cursor--dana">
        <svg width="22" height="26" viewBox="0 0 34 40">
          <path d="M3 2 L3 32 L11 25 L17 38 L22 36 L16 23 L27 23 Z" />
        </svg>
        <span>Dana P. · Client</span>
      </span>
    </div>
  )
}

// The visitor's own pointer becomes a live cursor tagged "You" while it is over the hero.
// Desktop (fine pointer) only; it follows the pointer directly, so there is no lag.
function LiveCursor({ stageRef }) {
  const ref = useRef(null)

  useEffect(() => {
    const stage = stageRef.current
    const cursor = ref.current
    if (!stage || !cursor || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    stage.classList.add('has-live-cursor')
    const move = (e) => {
      const r = stage.getBoundingClientRect()
      cursor.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`
      cursor.classList.add('is-visible')
      cursor.classList.toggle('is-over-action', Boolean(e.target.closest('a, button')))
    }
    const leave = () => cursor.classList.remove('is-visible')
    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerleave', leave)
    return () => {
      stage.classList.remove('has-live-cursor')
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerleave', leave)
    }
  }, [stageRef])

  return (
    <span className="you-cursor" ref={ref} aria-hidden="true">
      <svg width="22" height="26" viewBox="0 0 34 40">
        <path d="M3 2 L3 32 L11 25 L17 38 L22 36 L16 23 L27 23 Z" />
      </svg>
      <span>You</span>
    </span>
  )
}

export default function Hero() {
  const stageRef = useRef(null)
  const reduced = useReducedMotion()

  // Gentle pointer parallax on the canvas: fine pointers only, off with reduced motion.
  useEffect(() => {
    const stage = stageRef.current
    if (reduced || !stage || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const onMove = (e) => {
      const r = stage.getBoundingClientRect()
      stage.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3))
      stage.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3))
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduced])

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <span className="glow glow--a" />
        <span className="glow glow--b" />
      </div>

      <div className="container hero__stage" ref={stageRef}>
        <Canvas />
        <LiveCursor stageRef={stageRef} />

        <motion.div className="hero__copy" variants={sequence} initial="hidden" animate="show">
          <motion.h1 id="hero-title" className="hero__title" variants={rise}>
            Keep projects moving. <span className="hero__accent">Make feedback clearer.</span>
          </motion.h1>
          <motion.p className="hero__lead" variants={rise}>
            Bring tasks, files and client approvals together, so your team spends less time chasing updates and more
            time creating.
          </motion.p>
          <motion.div className="hero__ctas" variants={rise}>
            <WaitlistButton size="lg" withArrow />
            <a className="btn btn--secondary btn--lg" href="#how-it-works">
              See how it works
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Arrives as its own section: a springy slide up with a small overshoot. */}
      <motion.div
        className="container hero__preview"
        initial={{ opacity: 0, y: 96 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{
          y: { type: 'spring', bounce: 0.35, duration: 0.9 },
          opacity: { duration: 0.4, ease: EASE },
        }}
      >
        <DashboardPreview />
      </motion.div>
    </section>
  )
}
