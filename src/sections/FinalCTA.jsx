import { Reveal } from '../components/Reveal.jsx'
import WaitlistForm from '../components/WaitlistForm.jsx'
import { WAITLIST_ID } from '../lib/waitlist.js'

export default function FinalCTA() {
  return (
    <section id={WAITLIST_ID} className="cta" aria-labelledby="cta-title">
      <div className="cta__bg" aria-hidden="true">
        <span className="glow glow--c" />
        <span className="glow glow--d" />
      </div>
      <div className="container cta__inner">
        <Reveal className="cta__copy">
          <p className="eyebrow eyebrow--dark">Early access</p>
          <h2 id="cta-title" className="cta__title">
            Bring your next project into focus.
          </h2>
          <p className="cta__lead">Join the Piralax waitlist for launch updates and early-access announcements.</p>
        </Reveal>
        <Reveal delay={0.1} className="cta__form">
          <WaitlistForm />
        </Reveal>
      </div>
    </section>
  )
}
