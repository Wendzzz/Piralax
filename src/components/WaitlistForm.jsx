import { useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Icon from './Icon.jsx'
import { WAITLIST_EMAIL_ID } from '../lib/waitlist.js'
import { EASE } from '../lib/motion.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(value) {
  const email = value.trim()
  if (!email) return 'Enter your email address.'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address, like name@studio.com.'
  return ''
}

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitted, setSubmitted] = useState('')
  const [refocus, setRefocus] = useState(false)
  const inputRef = useRef(null)
  // The success message takes focus when it appears, so keyboard and screen reader users land on it.
  const focusOnMount = useCallback((node) => node?.focus({ preventScroll: true }), [])

  const errorId = `${WAITLIST_EMAIL_ID}-error`
  const noteId = `${WAITLIST_EMAIL_ID}-note`

  function handleSubmit(event) {
    event.preventDefault()
    const message = validate(email)
    setTouched(true)
    setError(message)
    if (message) {
      inputRef.current?.focus()
      return
    }
    // No signup backend is connected: nothing is stored or sent.
    setSubmitted(email.trim())
  }

  function handleChange(event) {
    setEmail(event.target.value)
    if (touched) setError(validate(event.target.value))
  }

  // Validate on leaving the field once something is typed, not while typing the first time.
  function handleBlur() {
    if (!email) return
    setTouched(true)
    setError(validate(email))
  }

  function reset() {
    setSubmitted('')
    setEmail('')
    setError('')
    setTouched(false)
    setRefocus(true)
  }

  return (
    <div className="waitlist">
      <AnimatePresence mode="wait" initial={false}>
        {submitted ? (
          <motion.div
            key="success"
            className="waitlist__success"
            role="status"
            tabIndex={-1}
            ref={focusOnMount}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <span className="waitlist__success-icon">
              <Icon name="check" size={22} strokeWidth={2.2} />
            </span>
            <div>
              <p className="waitlist__success-title">Thanks — that address looks good.</p>
              <p className="waitlist__success-text">
                This is a demo, so <b>{submitted}</b> was not saved or sent anywhere. In the live version, it would be
                added to the Piralax waitlist.
              </p>
              <button type="button" className="btn btn--ghost-dark btn--sm" onClick={reset}>
                Try another address
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            className="waitlist__form"
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <label className="waitlist__label" htmlFor={WAITLIST_EMAIL_ID}>
              Email address
            </label>
            <div className="waitlist__row">
              <div className={`waitlist__field ${error ? 'has-error' : ''}`}>
                <Icon name="mail" size={20} className="waitlist__field-icon" />
                <input
                  ref={inputRef}
                  autoFocus={refocus}
                  id={WAITLIST_EMAIL_ID}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@studio.com"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby={error ? `${errorId} ${noteId}` : noteId}
                />
              </div>
              <button type="submit" className="btn btn--primary btn--lg waitlist__submit">
                Join the waitlist
              </button>
            </div>
            <p id={errorId} className="waitlist__error" aria-live="polite">
              {error && (
                <>
                  <Icon name="alert" size={16} />
                  {error}
                </>
              )}
            </p>
            <p id={noteId} className="waitlist__note">
              <Icon name="info" size={16} />
              <span>
                <b>Demo form:</b> no signup service is connected yet, so submissions aren’t saved or sent.
              </span>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
      <p className="waitlist__privacy">
        <Icon name="lock" size={16} />
        We’ll only use your email for Piralax launch and early-access updates. We won’t share it.
      </p>
    </div>
  )
}
