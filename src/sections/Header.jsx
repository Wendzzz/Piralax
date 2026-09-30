import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Logo from '../components/Logo.jsx'
import Icon from '../components/Icon.jsx'
import { WaitlistButton } from '../components/Button.jsx'
import { goToWaitlist } from '../lib/waitlist.js'
import { EASE } from '../lib/motion.js'
import { navLinks } from '../lib/nav.js'

const DESKTOP_QUERY = '(min-width: 960px)'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu on Escape, and when the layout grows to desktop.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    const media = window.matchMedia(DESKTOP_QUERY)
    const onMedia = (e) => e.matches && setOpen(false)
    document.addEventListener('keydown', onKey)
    media.addEventListener('change', onMedia)
    return () => {
      document.removeEventListener('keydown', onKey)
      media.removeEventListener('change', onMedia)
    }
  }, [open])

  const closeMenu = () => setOpen(false)

  return (
    <header className={`header ${scrolled || open ? 'is-scrolled' : ''}`}>
      <div className="container header__inner">
        <Logo />

        <nav className="header__nav" aria-label="Main">
          <ul>
            {navLinks.map((link) => (
              <li key={link.href}>
                <a className="nav-link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__actions">
          <WaitlistButton size="sm" className="header__cta" />
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls={open ? 'mobile-menu' : undefined}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? 'close' : 'menu'}
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 45 }}
                transition={{ duration: 0.15 }}
              >
                <Icon name={open ? 'close' : 'menu'} size={24} strokeWidth={2} />
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <ul className="container">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a className="mobile-menu__link" href={link.href} onClick={closeMenu}>
                    {link.label}
                    <Icon name="arrowRight" size={18} />
                  </a>
                </li>
              ))}
              <li>
                <a
                  className="btn btn--primary btn--block"
                  href="#waitlist"
                  onClick={(e) => {
                    closeMenu()
                    goToWaitlist(e)
                  }}
                >
                  Join the waitlist
                </a>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
