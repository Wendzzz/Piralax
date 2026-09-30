// Shared motion values. Entrances 400–600ms, interactions 150–250ms (in CSS).
export const EASE = [0.22, 1, 0.36, 1]
export const ENTRANCE = 0.5
export const RISE = 20
export const STAGGER = 0.1
// Scroll reveals slide up further than the hero's load-in, so the motion reads as a slide.
export const SLIDE = 40
export const SLIDE_DURATION = 0.6

export const fadeUp = {
  hidden: { opacity: 0, y: SLIDE },
  // Only set a delay when one is passed: a delay here would override a parent group's stagger.
  show: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: SLIDE_DURATION, ease: EASE, ...(delay ? { delay } : {}) },
  }),
}

export const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER } },
}

export const inViewOnce = { once: true, amount: 0.15 }
