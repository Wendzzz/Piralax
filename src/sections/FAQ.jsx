import Accordion from '../components/Accordion.jsx'
import { Reveal } from '../components/Reveal.jsx'
import { WAITLIST_ID, goToWaitlist } from '../lib/waitlist.js'

const faqs = [
  {
    question: 'Who is Piralax designed for?',
    answer: (
      <p>
        Piralax is being designed for freelancers, small creative teams and design agencies who manage client work —
        anyone who needs tasks, files, feedback and approvals to live in one place instead of across several tools.
      </p>
    ),
  },
  {
    question: 'How would clients review work?',
    answer: (
      <p>
        The plan is for clients to open shared work from an invitation, leave comments directly on the files they’re
        reviewing, and mark each item as approved or needing changes. Their feedback would stay attached to the work,
        rather than arriving in separate emails.
      </p>
    ),
  },
  {
    question: 'Can I manage multiple projects?',
    answer: (
      <p>
        That’s the intention. Each project is planned to have its own tasks, files, feedback and approvals, so you
        could keep several client projects moving side by side.
      </p>
    ),
  },
  {
    question: 'When will Piralax launch?',
    answer: (
      <p>
        We haven’t set a launch date yet. It will be announced to waitlist subscribers first, along with any
        early-access opportunities.
      </p>
    ),
  },
  {
    question: 'How can I hear about pricing?',
    answer: (
      <p>
        Pricing hasn’t been finalised. It will be announced to waitlist subscribers —{' '}
        <a className="text-link" href={`#${WAITLIST_ID}`} onClick={goToWaitlist}>
          join the waitlist
        </a>{' '}
        to hear about it first.
      </p>
    ),
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="section" aria-labelledby="faq-title">
      <div className="container faq">
        <Reveal className="section-head faq__head">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title" className="section-title">
            Questions, answered.
          </h2>
          <p className="section-lead">
            Piralax is still in development. Here’s what we’re building towards, and how to follow along.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="faq__list">
          <Accordion items={faqs} />
        </Reveal>
      </div>
    </section>
  )
}
