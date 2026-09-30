export const WAITLIST_ID = 'waitlist'
export const WAITLIST_EMAIL_ID = 'waitlist-email'

// Every "Join the waitlist" button scrolls to the form and focuses the email field.
export function goToWaitlist(event) {
  const section = document.getElementById(WAITLIST_ID)
  if (!section) return
  event?.preventDefault()

  // After a demo signup the field is replaced by the success message, which takes focus instead.
  const field = document.getElementById(WAITLIST_EMAIL_ID) ?? section.querySelector('[tabindex="-1"]')

  // Focus first: focusing during a smooth scroll can cancel it in some browsers.
  field?.focus({ preventScroll: true })
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  section.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${WAITLIST_ID}`)
}
