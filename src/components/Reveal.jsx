import { motion } from 'motion/react'
import { fadeUp, inViewOnce, stagger } from '../lib/motion.js'

// Reveals once when it enters the viewport.
export function Reveal({ as = 'div', delay = 0, className, children, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={inViewOnce}
      custom={delay}
      {...rest}
    >
      {children}
    </Tag>
  )
}

// A group whose RevealItem children enter one after another (100ms apart).
export function RevealGroup({ as = 'div', className, children, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag className={className} variants={stagger} initial="hidden" whileInView="show" viewport={inViewOnce} {...rest}>
      {children}
    </Tag>
  )
}

export function RevealItem({ as = 'div', className, children, ...rest }) {
  const Tag = motion[as]
  return (
    <Tag className={className} variants={fadeUp} {...rest}>
      {children}
    </Tag>
  )
}
