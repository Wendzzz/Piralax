import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from 'motion/react'
import Icon from './Icon.jsx'
import { Avatar, Status } from './ui.jsx'
import { EASE } from '../lib/motion.js'

// The illustrative workflow: a comment appears → the task moves to review → it is approved.
// Each entry is how long that step stays on screen before the next one.
const STEP_HOLD = [1800, 2800, 2800, 3600]
const FINAL_STEP = STEP_HOLD.length - 1
// The very first step starts almost as soon as the preview is on screen.
const FIRST_HOLD = 700

const people = {
  MR: { name: 'Maya R.', tone: 'indigo' },
  JL: { name: 'Jonah L.', tone: 'teal' },
  AK: { name: 'Ana K.', tone: 'amber' },
  DP: { name: 'Dana P.', tone: 'rose' },
}

const staticTasks = {
  progress: [
    { id: 'hero-copy', title: 'Homepage hero copy', owner: 'MR', due: 'Oct 14' },
    { id: 'services', title: 'Services page layout', owner: 'JL', due: 'Oct 16', extra: true },
  ],
  review: [{ id: 'about', title: 'About page imagery', owner: 'MR', due: 'Oct 11', status: 'changes' }],
  approved: [
    { id: 'sitemap', title: 'Sitemap and navigation', owner: 'JL', due: 'Done', status: 'approved' },
    { id: 'moodboard', title: 'Visual direction moodboard', owner: 'AK', due: 'Done', status: 'approved', extra: true },
  ],
}

const columns = [
  { key: 'progress', label: 'In progress' },
  { key: 'review', label: 'In review' },
  { key: 'approved', label: 'Approved' },
]

const projects = ['Website redesign', 'Brand refresh', 'Spring campaign', 'Launch deck']

function useWorkflowStep(active, reduced) {
  const [step, setStep] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    if (reduced || !active) return
    const timer = setTimeout(() => {
      if (step === FINAL_STEP) {
        setStep(0)
        setCycle((c) => c + 1)
      } else {
        setStep(step + 1)
      }
    }, step === 0 && cycle === 0 ? FIRST_HOLD : STEP_HOLD[step])
    return () => clearTimeout(timer)
  }, [step, cycle, active, reduced])

  // Without motion, show the finished state rather than a loop.
  return reduced ? { step: FINAL_STEP, cycle: 0 } : { step, cycle }
}

function TaskCard({ task, layoutId, highlight }) {
  const owner = people[task.owner]
  return (
    <motion.li
      layout
      layoutId={layoutId}
      className={`task ${task.extra ? 'task--extra' : ''} ${highlight ? 'task--highlight' : ''}`}
      transition={{ layout: { duration: 0.6, ease: EASE } }}
    >
      <p className="task__title">{task.title}</p>
      <div className="task__meta">
        <Avatar initials={task.owner} tone={owner.tone} size="sm" />
        <span className="task__due">
          <Icon name="clock" size={13} />
          {task.due}
        </span>
        {task.status && (
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={task.status}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="task__status"
            >
              <Status kind={task.status} />
            </motion.span>
          </AnimatePresence>
        )}
      </div>
    </motion.li>
  )
}

export default function DashboardPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { amount: 0.2 })
  const reduced = useReducedMotion()
  const { step, cycle } = useWorkflowStep(inView, reduced)

  const pricing = {
    id: 'pricing',
    title: 'Pricing page wireframe',
    owner: 'AK',
    due: 'Oct 12',
    status: step === 3 ? 'approved' : step === 2 ? 'review' : undefined,
  }
  const pricingColumn = step >= 2 ? 'review' : 'progress'
  const approvedCount = step === 3 ? 3 : 2

  return (
    <figure className="dash" ref={ref}>
      <figcaption className="dash__caption">
        <span className="dash__label">
          <Icon name="info" size={14} />
          Illustrative interface
        </span>
        <span className="sr-only">
          An example Piralax project for a website redesign: a board of tasks with owners and due dates, client
          comments, and approval statuses. In the example, a teammate comments that the pricing wireframe is ready,
          the task moves to review, and the client approves it.
        </span>
      </figcaption>

      <div className="dash__window" aria-hidden="true">
        <div className="dash__chrome">
          <span className="dash__dots">
            <i />
            <i />
            <i />
          </span>
          <span className="dash__crumb">
            Studio Kite <span>/</span> Harbor &amp; Pine <span>/</span> <b>Website redesign</b>
          </span>
        </div>

        <div className="dash__body">
          <aside className="dash__side">
            <p className="dash__side-title">Projects</p>
            <ul className="dash__projects">
              {projects.map((p, i) => (
                <li key={p} className={i === 0 ? 'is-active' : ''}>
                  <span className="dash__dot" />
                  {p}
                </li>
              ))}
            </ul>
            <p className="dash__side-title">Upcoming</p>
            <ul className="dash__upcoming">
              <li>
                <span>Client review</span>
                <small>Oct 12</small>
              </li>
              <li>
                <span>Content handoff</span>
                <small>Oct 16</small>
              </li>
              <li>
                <span>Launch prep</span>
                <small>Oct 23</small>
              </li>
            </ul>
          </aside>

          <div className="dash__main">
            <div className="dash__head">
              <div>
                <p className="dash__eyebrow">Client · Harbor &amp; Pine</p>
                <p className="dash__title">Website redesign</p>
              </div>
              <div className="dash__team">
                <Avatar initials="MR" tone="indigo" />
                <Avatar initials="JL" tone="teal" />
                <Avatar initials="AK" tone="amber" />
                <Avatar initials="DP" tone="rose" />
              </div>
            </div>

            <div className="dash__progress">
              <div className="dash__progress-row">
                <span>Approvals</span>
                <span>
                  <b>{approvedCount}</b> of 6 approved
                </span>
              </div>
              <div className="dash__bar">
                <motion.span
                  initial={false}
                  animate={{ scaleX: approvedCount / 6 }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </div>
            </div>

            <LayoutGroup>
              <div className="board">
                {columns.map((col) => {
                  const tasks = staticTasks[col.key]
                  const count = tasks.length + (pricingColumn === col.key ? 1 : 0)
                  return (
                    <div className="board__col" key={col.key}>
                      <p className="board__label">
                        {col.label} <span>{count}</span>
                      </p>
                      <ul className="board__list">
                        {pricingColumn === col.key && (
                          <TaskCard task={pricing} layoutId={`pricing-${cycle}`} highlight={step >= 1} />
                        )}
                        {tasks.map((t) => (
                          <TaskCard key={t.id} task={t} />
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </LayoutGroup>
          </div>

          <div className="dash__panel">
            <p className="dash__panel-title">
              <Icon name="chat" size={16} />
              Feedback
            </p>
            <ul className="comments">
              <AnimatePresence initial={false}>
                {step >= 1 && (
                  <motion.li
                    key={`new-${cycle}`}
                    className="comment comment--new"
                    initial={{ opacity: 0, y: -12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <Avatar initials="AK" tone="amber" size="sm" />
                    <div>
                      <p className="comment__who">
                        Ana K. <small>just now</small>
                      </p>
                      <p className="comment__text">Updated the pricing wireframe with your notes. Ready for review.</p>
                      <p className="comment__on">on Pricing page wireframe</p>
                    </div>
                  </motion.li>
                )}
              </AnimatePresence>
              <motion.li layout className="comment">
                <Avatar initials="DP" tone="rose" size="sm" />
                <div>
                  <p className="comment__who">
                    Dana P. <small>Client · 2h</small>
                  </p>
                  <p className="comment__text">Love the palette. Could the About photos feel a little warmer?</p>
                  <p className="comment__on">on About page imagery</p>
                </div>
              </motion.li>
            </ul>

            <p className="dash__panel-title">
              <Icon name="badgeCheck" size={16} />
              Approvals
            </p>
            <ul className="approvals">
              <li>
                <span>Homepage design</span>
                <Status kind="approved" />
              </li>
              <li>
                <span>About page imagery</span>
                <Status kind="changes" />
              </li>
              <li>
                <span>Pricing wireframe</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={pricing.status ?? 'draft'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: EASE }}
                  >
                    {pricing.status ? <Status kind={pricing.status} /> : <Status kind="progress">Not sent</Status>}
                  </motion.span>
                </AnimatePresence>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </figure>
  )
}
