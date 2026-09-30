import Icon from '../components/Icon.jsx'
import { Reveal, RevealGroup, RevealItem } from '../components/Reveal.jsx'
import { Avatar, Status } from '../components/ui.jsx'

function OverviewPreview() {
  const rows = [
    { task: 'Homepage hero copy', owner: 'MR', tone: 'indigo', due: 'Oct 14', status: 'progress' },
    { task: 'Pricing page wireframe', owner: 'AK', tone: 'amber', due: 'Oct 12', status: 'review' },
    { task: 'About page imagery', owner: 'MR', tone: 'indigo', due: 'Oct 11', status: 'changes' },
    { task: 'Sitemap and navigation', owner: 'JL', tone: 'teal', due: 'Oct 6', status: 'approved' },
  ]
  return (
    <div className="mini mini--table" aria-hidden="true">
      <div className="mini-table__head">
        <span>Task</span>
        <span>Owner</span>
        <span>Due</span>
        <span>Status</span>
      </div>
      {rows.map((r) => (
        <div className="mini-table__row" key={r.task}>
          <span className="mini-table__task">{r.task}</span>
          <span>
            <Avatar initials={r.owner} tone={r.tone} size="sm" />
          </span>
          <span className="mini-table__due">{r.due}</span>
          <span>
            <Status kind={r.status} />
          </span>
        </div>
      ))}
    </div>
  )
}

function FeedbackPreview() {
  return (
    <div className="mini mini--canvas" aria-hidden="true">
      <div className="artboard">
        <div className="artboard__nav">
          <i />
          <i />
          <i />
        </div>
        <div className="artboard__hero">
          <span className="artboard__line artboard__line--lg" />
          <span className="artboard__line" />
          <span className="artboard__btn" />
        </div>
        <div className="artboard__cards">
          <span />
          <span />
          <span />
        </div>
        <span className="marker marker--1">1</span>
        <span className="marker marker--2">2</span>
      </div>
      <div className="bubble">
        <Avatar initials="DP" tone="rose" size="sm" />
        <div>
          <p className="bubble__who">
            Dana P. <small>Client</small>
          </p>
          <p className="bubble__text">Can this headline sit on one line on desktop?</p>
        </div>
      </div>
    </div>
  )
}

function ApprovalsPreview() {
  const items = [
    { name: 'Homepage design', kind: 'review', label: 'Ready for review' },
    { name: 'About page imagery', kind: 'changes', label: 'Needs changes' },
    { name: 'Sitemap and navigation', kind: 'approved', label: 'Approved' },
  ]
  return (
    <ul className="mini mini--list" aria-hidden="true">
      {items.map((i) => (
        <li key={i.name}>
          <span className={`dot dot--${i.kind}`} />
          <span className="mini__name">{i.name}</span>
          <Status kind={i.kind}>{i.label}</Status>
        </li>
      ))}
    </ul>
  )
}

function FilesPreview() {
  const files = [
    { name: 'Homepage.fig', meta: 'Updated today', version: 'v3', current: true },
    { name: 'Brand-guidelines.pdf', meta: 'Oct 2', version: 'v2' },
    { name: 'Photo-selects.zip', meta: 'Sep 28', version: 'v1' },
  ]
  return (
    <ul className="mini mini--list" aria-hidden="true">
      {files.map((f) => (
        <li key={f.name}>
          <span className="file-icon">
            <Icon name="file" size={16} />
          </span>
          <span className="mini__name">
            {f.name}
            <small>{f.meta}</small>
          </span>
          <span className={`chip ${f.current ? 'chip--accent' : ''}`}>{f.current ? `${f.version} · latest` : f.version}</span>
        </li>
      ))}
    </ul>
  )
}

function ProgressPreview() {
  const steps = [
    { label: 'Kickoff and brief', state: 'done' },
    { label: 'Wireframes approved', state: 'done' },
    { label: 'Visual design in review', state: 'current' },
    { label: 'Build and launch', state: 'next' },
  ]
  return (
    <div className="mini mini--timeline" aria-hidden="true">
      <ol className="timeline">
        {steps.map((s) => (
          <li key={s.label} className={`timeline__step is-${s.state}`}>
            <span className="timeline__mark">{s.state === 'done' && <Icon name="check" size={12} strokeWidth={2.5} />}</span>
            <span>{s.label}</span>
          </li>
        ))}
      </ol>
      <div className="next-up">
        <p className="next-up__label">
          <Icon name="signal" size={16} />
          Next step
        </p>
        <p className="next-up__text">Dana reviews the homepage design by Oct 12.</p>
      </div>
    </div>
  )
}

const features = [
  {
    key: 'overview',
    icon: 'layout',
    title: 'Project overview',
    text: 'See tasks, owners and deadlines at a glance.',
    preview: <OverviewPreview />,
  },
  {
    key: 'feedback',
    icon: 'pin',
    title: 'Feedback in context',
    text: 'Keep client comments attached to the work being reviewed.',
    preview: <FeedbackPreview />,
  },
  {
    key: 'approvals',
    icon: 'badgeCheck',
    title: 'Clear approvals',
    text: 'Track what is ready for review, needs changes or has been approved.',
    preview: <ApprovalsPreview />,
  },
  {
    key: 'files',
    icon: 'folder',
    title: 'Shared files',
    text: 'Keep project materials and their versions easy to find.',
    preview: <FilesPreview />,
  },
  {
    key: 'progress',
    icon: 'signal',
    title: 'Progress updates',
    text: 'Help teammates and clients understand the next step.',
    preview: <ProgressPreview />,
  },
]

export default function Features() {
  return (
    <section id="features" className="section section--tint" aria-labelledby="features-title">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow">Features</p>
          <h2 id="features-title" className="section-title">
            Everything a client project needs, in one place.
          </h2>
          <p className="section-lead">
            Piralax is being built around the moments that usually slow creative work down: handoffs, reviews and
            sign-off.
          </p>
        </Reveal>

        <RevealGroup className="bento">
          {features.map((f) => (
            <RevealItem as="article" key={f.key} className={`card feature feature--${f.key}`}>
              <div className="feature__preview">{f.preview}</div>
              <div className="feature__copy">
                <span className="icon-tile">
                  <Icon name={f.icon} size={20} />
                </span>
                <h3 className="card__title">{f.title}</h3>
                <p className="card__text">{f.text}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}
