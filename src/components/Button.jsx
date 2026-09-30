import Icon from './Icon.jsx'
import { WAITLIST_ID, goToWaitlist } from '../lib/waitlist.js'

export function WaitlistButton({ className = '', size, children = 'Join the waitlist', withArrow = false }) {
  return (
    <a
      className={`btn btn--primary ${size ? `btn--${size}` : ''} ${className}`}
      href={`#${WAITLIST_ID}`}
      onClick={goToWaitlist}
    >
      {children}
      {withArrow && <Icon name="arrowRight" size={18} className="btn__icon" />}
    </a>
  )
}
