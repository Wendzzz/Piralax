import Icon from '../components/Icon.jsx'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal.jsx'

const audiences = [
  {
    icon: 'user',
    title: 'Freelancers',
    text: 'Piralax is being designed to give each client one clear place to see progress, leave feedback and approve work, without adding admin to your week.',
    uses: ['One workspace per client', 'Approvals without the email chase'],
  },
  {
    icon: 'users',
    title: 'Small creative teams',
    text: 'Your team could share ownership of tasks and deadlines, and keep files, versions and comments where everyone can find them.',
    uses: ['Clear owners and due dates', 'Latest versions in one place'],
  },
  {
    icon: 'building',
    title: 'Design agencies',
    text: 'Agencies could run several client projects side by side, with feedback and approvals tracked the same way from kickoff to sign-off.',
    uses: ['Multiple projects at once', 'A consistent review process'],
  },
]

export default function Audience() {
  return (
    <section id="audience" className="section section--tint" aria-labelledby="audience-title">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Who it’s for</p>
          <h2 id="audience-title" className="section-title">
            Built for people who create together.
          </h2>
          <p className="section-lead">
            Whether you work solo or with a studio, Piralax is designed to fit the way client work actually moves.
          </p>
        </Reveal>

        <RevealGroup as="ul" className="audience">
          {audiences.map((a) => (
            <RevealItem as="li" key={a.title} className="card persona">
              <span className="icon-tile icon-tile--lg">
                <Icon name={a.icon} size={24} />
              </span>
              <h3 className="card__title">{a.title}</h3>
              <p className="card__text">{a.text}</p>
              <ul className="persona__uses">
                {a.uses.map((u) => (
                  <li key={u}>
                    <Icon name="check" size={16} strokeWidth={2.2} />
                    {u}
                  </li>
                ))}
              </ul>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
