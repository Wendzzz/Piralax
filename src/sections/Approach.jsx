import { useEffect, useId, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import Icon from '../components/Icon.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { Avatar, Status } from '../components/ui.jsx'
import { EASE } from '../lib/motion.js'

const SHARE = 0
const REVIEW = 1
const APPROVE = 2

// How long the autoplay stays on each step before moving on (ms).
// The first step moves on quickly, so the demo is visibly running straight away.
const HOLD = 3200
const FIRST_HOLD = 1000
const holdFor = (step) => (step === SHARE ? FIRST_HOLD : HOLD)

const steps = [
  {
    label: 'Share your work',
    text: 'Add a new version to the task. Everyone sees the latest file.',
    description: 'Ana K. shares Version 04 of the pricing page wireframe on the Harbor & Pine website redesign.',
  },
  {
    label: 'Review together',
    text: 'Clients pin comments right where they belong.',
    description: 'Dana P., the client, pins a comment to the Pro plan: “Can the Pro plan stand out a little more?”',
  },
  {
    label: 'Approve and move on',
    text: 'Resolve feedback and approve. The board updates for everyone.',
    description:
      'The Pro plan is emphasised, Dana’s comment is resolved, and she approves Version 04. The task moves to Approved.',
  },
]

const show = (visible) => (visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 })
const fade = { duration: 0.35, ease: EASE }

// Plays the steps once on first view. Choosing a step plays forward from it:
// "Share your work" replays the whole sequence, a later step continues from there.
// With reduced motion there is no autoplay: the finished state shows and a click only selects.
function useWorkflow(ref) {
  const inView = useInView(ref, { once: true, amount: 0.2 })
  const reduced = useReducedMotion()
  const [step, setStep] = useState(SHARE)
  const [manual, setManual] = useState(false)
  // Bumped on every choice, so the timer restarts even when the same step is chosen again.
  const [run, setRun] = useState(0)

  const autoplaying = inView && !reduced && step < APPROVE

  useEffect(() => {
    if (!autoplaying) return
    const timer = setTimeout(() => setStep((s) => s + 1), holdFor(step))
    return () => clearTimeout(timer)
  }, [autoplaying, step, run])

  const choose = (next) => {
    setManual(true)
    setStep(next)
    setRun((r) => r + 1)
  }

  return { step: reduced && !manual ? APPROVE : step, choose, manual }
}

// The pricing page Ana is designing, drawn as a wireframe. No prices are shown.
function Wireframe({ step }) {
  const emphasised = step === APPROVE
  const plans = ['Starter', 'Pro', 'Business']
  return (
    <div className="wf">
      <div className="wf__nav">
        <span className="wf__logo" />
        <span className="wf__links">
          <i />
          <i />
          <i />
        </span>
        <span className="wf__cta" />
      </div>
      <p className="wf__title">Plans for every team</p>
      <span className="wf__sub" />
      <div className="wf__plans">
        {plans.map((plan) => {
          const pro = plan === 'Pro'
          return (
            <div key={plan} className={`wf__plan ${pro ? 'is-pro' : ''} ${pro && emphasised ? 'is-emphasised' : ''}`}>
              {pro && (
                <motion.span className="wf__badge" initial={false} animate={{ opacity: emphasised ? 1 : 0 }} transition={fade}>
                  Most popular
                </motion.span>
              )}
              <p className="wf__plan-name">{plan}</p>
              <span className="wf__price" />
              <span className="wf__line" />
              <span className="wf__line wf__line--short" />
              <span className="wf__line" />
              <span className="wf__button" />
              {pro && (
                <motion.span
                  className={`wf__pin ${emphasised ? 'is-resolved' : ''}`}
                  initial={false}
                  animate={step >= REVIEW ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                  transition={fade}
                >
                  {emphasised ? <Icon name="check" size={12} strokeWidth={2.8} /> : '1'}
                </motion.span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TaskView({ step }) {
  const approved = step === APPROVE

  return (
    <div className="dash__window ap" aria-hidden="true">
      <div className="dash__chrome">
        <span className="dash__dots">
          <i />
          <i />
          <i />
        </span>
        <span className="dash__crumb">
          <span className="ap__crumb-lead">
            Studio Kite <span>/</span>{' '}
          </span>
          Harbor &amp; Pine <span>/</span> <b>Website redesign</b>
        </span>
      </div>

      <div className="ap__head">
        <div className="ap__heading">
          <p className="dash__eyebrow">Task · Website redesign</p>
          <p className="ap__title">Pricing page wireframe</p>
        </div>
        <span className="ap__status">
          <Status kind={approved ? 'approved' : 'review'} />
        </span>
        <div className="dash__team ap__team">
          <Avatar initials="AK" tone="amber" />
          <Avatar initials="MR" tone="indigo" />
          <Avatar initials="JL" tone="teal" />
          <Avatar initials="DP" tone="rose" />
        </div>
      </div>

      <div className="ap__body">
        <div className="ap__canvas">
          <div className="ap__file">
            <span className="ap__file-name">
              <Icon name="file" size={16} />
              Pricing-page.fig
            </span>
            <span className="ap__version">
              Version 04
              <Icon name="chevronDown" size={14} />
            </span>
          </div>
          <Wireframe step={step} />
        </div>

        {/* Every activity item is always laid out; later ones fade in, so the panel never resizes. */}
        <div className="ap__activity">
          <p className="dash__panel-title">
            <Icon name="chat" size={16} />
            Activity
          </p>
          <ul className="ap__feed">
            <li className="ap__event">
              <Avatar initials="AK" tone="amber" size="sm" />
              <p>
                <b>Ana K.</b> shared Version 04
              </p>
            </li>

            <motion.li className="comment ap__comment" initial={false} animate={show(step >= REVIEW)} transition={fade}>
              <Avatar initials="DP" tone="rose" size="sm" />
              <div className="ap__comment-body">
                <p className="comment__who">
                  Dana P. <small>Client</small>
                  <span className={`ap__pin-ref ${approved ? 'is-resolved' : ''}`}>1</span>
                </p>
                <p className="comment__text">Can the Pro plan stand out a little more?</p>
                <span className="ap__action">
                  <motion.span
                    className="ap__resolve"
                    initial={false}
                    animate={{ opacity: approved ? 0 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    Resolve feedback
                  </motion.span>
                  <motion.span
                    className="ap__resolved"
                    initial={false}
                    animate={{ opacity: approved ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon name="check" size={14} strokeWidth={2.4} />
                    Resolved
                  </motion.span>
                </span>
              </div>
            </motion.li>

            <motion.li className="ap__event" initial={false} animate={show(approved)} transition={fade}>
              <Avatar initials="DP" tone="rose" size="sm" />
              <p>
                <b>Dana P.</b> approved Version 04
              </p>
            </motion.li>
          </ul>

          <span className={`ap__approve ${approved ? 'is-approved' : ''}`}>
            {approved ? (
              <>
                <Icon name="check" size={16} strokeWidth={2.4} />
                Version approved
              </>
            ) : (
              'Approve version'
            )}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function Approach() {
  const stageRef = useRef(null)
  const { step, choose, manual } = useWorkflow(stageRef)
  const tabsRef = useRef([])
  const id = useId()
  const tabId = (i) => `${id}-tab-${i}`
  const panelId = `${id}-panel`

  // Arrow keys move between steps, as in a tab list.
  const onKeyDown = (event) => {
    const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }
    let next
    if (event.key in keys) next = (step + keys[event.key] + steps.length) % steps.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = steps.length - 1
    else return
    event.preventDefault()
    choose(next)
    tabsRef.current[next]?.focus()
  }

  return (
    <section id="approach" className="section approach" aria-labelledby="approach-title">
      <div className="container approach__grid">
        <Reveal className="approach__copy">
          <p className="eyebrow">The Piralax approach</p>
          <h2 id="approach-title" className="section-title">
            Every update. Right where it belongs.
          </h2>
          <p className="section-lead">Bring tasks, files, feedback and approvals into one shared project.</p>

          <div className="flow" role="tablist" aria-label="How a review works in Piralax" onKeyDown={onKeyDown}>
            {steps.map((s, i) => {
              const active = i === step
              return (
                <button
                  key={s.label}
                  ref={(el) => (tabsRef.current[i] = el)}
                  id={tabId(i)}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={panelId}
                  tabIndex={active ? 0 : -1}
                  className={`flow__step ${active ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}
                  onClick={() => choose(i)}
                >
                  <span className="flow__num">{i < step ? <Icon name="check" size={16} strokeWidth={2.6} /> : i + 1}</span>
                  <span className="flow__text">
                    <span className="flow__label">{s.label}</span>
                    <span className="flow__desc">{s.text}</span>
                  </span>
                  <Icon name="chevronRight" size={18} className="flow__arrow" />
                </button>
              )
            })}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="approach__stage">
          <div ref={stageRef}>
            <figure
              id={panelId}
              role="tabpanel"
              tabIndex={0}
              aria-labelledby={tabId(step)}
              className="approach__figure"
            >
              <p className="sr-only">{steps[step].description}</p>
              {/* Silent during the first autoplay; announced once the visitor starts choosing steps. */}
              <p className="sr-only" aria-live="polite">
                {manual ? steps[step].description : ''}
              </p>
              <figcaption className="dash__caption">
                <span className="dash__label">
                  <Icon name="info" size={14} />
                  Illustrative interface
                </span>
              </figcaption>
              <TaskView step={step} />
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
