import Icon from '../components/Icon.jsx'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal.jsx'

const steps = [
  {
    icon: 'layout',
    title: 'Set up',
    text: 'Create a workspace and add your project.',
    detail: 'Start with the brief, the tasks and the people involved.',
  },
  {
    icon: 'send',
    title: 'Share',
    text: 'Invite collaborators and share work for review.',
    detail: 'Teammates and clients would see the same files and the same plan.',
  },
  {
    icon: 'badgeCheck',
    title: 'Approve',
    text: 'Resolve feedback, track approvals and move forward.',
    detail: 'Each decision would stay attached to the work it’s about.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section" aria-labelledby="how-title">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className="section-title">
            From kickoff to approval, in three steps.
          </h2>
        </Reveal>

        <RevealGroup as="ol" className="steps">
          {steps.map((s, i) => (
            <RevealItem as="li" key={s.title} className="card step">
              <div className="step__top">
                <span className="step__num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="step__line" aria-hidden="true" />
                <span className="icon-tile">
                  <Icon name={s.icon} size={20} />
                </span>
              </div>
              <p className="step__label">
                <span className="sr-only">Step {i + 1}: </span>
                {s.title}
              </p>
              <h3 className="card__title">{s.text}</h3>
              <p className="card__text">{s.detail}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
