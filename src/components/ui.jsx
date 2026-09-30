const statusLabels = {
  progress: 'In progress',
  review: 'In review',
  changes: 'Needs changes',
  approved: 'Approved',
}

export function Status({ kind, children }) {
  return <span className={`status status--${kind}`}>{children ?? statusLabels[kind]}</span>
}

export function Avatar({ initials, tone = 'indigo', size }) {
  return (
    <span className={`avatar avatar--${tone} ${size ? `avatar--${size}` : ''}`} aria-hidden="true">
      {initials}
    </span>
  )
}
