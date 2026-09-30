import { motion } from 'motion/react'
import { WaitlistButton } from '../components/Button.jsx'
import DashboardPreview from '../components/DashboardPreview.jsx'
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

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__bg" aria-hidden="true">
        <span className="glow glow--a" />
        <span className="glow glow--b" />
        <span className="hero__grid" />
      </div>

      <motion.div className="container hero__copy" variants={sequence} initial="hidden" animate="show">
        <motion.p className="eyebrow" variants={rise}>
          <span className="eyebrow__dot" />A shared workspace for creative projects
        </motion.p>
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
