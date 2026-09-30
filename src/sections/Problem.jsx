import Icon from '../components/Icon.jsx'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal.jsx'

const challenges = [
  {
    icon: 'chat',
    title: 'Feedback scattered across conversations',
    text: 'Comments arrive in email threads, chat messages and call notes, and someone has to piece them together.',
  },
  {
    icon: 'user',
    title: 'Unclear ownership and deadlines',
    text: 'When tasks live in several places, it’s easy to lose track of who is doing what, and by when.',
  },
  {
    icon: 'refresh',
    title: 'Approvals that need repeated follow-ups',
    text: 'Getting a clear yes often means another reminder, another thread and another version to check.',
  },
]

export default function Problem() {
  return (
    <section id="problem" className="section" aria-labelledby="problem-title">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">The challenge</p>
          <h2 id="problem-title" className="section-title">
            Every project has enough moving parts.
          </h2>
          <p className="section-lead">
            When updates live in chats, files sit in different folders and feedback arrives by email, keeping everyone
            aligned takes extra work.
          </p>
        </Reveal>

        <RevealGroup as="ul" className="challenges">
          {challenges.map((c, i) => (
            <RevealItem as="li" key={c.title} className="card challenge">
              <span className="challenge__num" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="icon-tile icon-tile--muted">
                <Icon name={c.icon} size={22} />
              </span>
              <h3 className="card__title">{c.title}</h3>
              <p className="card__text">{c.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
