import Logo from '../components/Logo.jsx'
import { navLinks } from '../lib/nav.js'

const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <Logo tone="light" />
          <p className="footer__tagline">One workspace. Clearer collaboration.</p>
        </div>
        <nav aria-label="Footer">
          <ul className="footer__nav">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a className="footer__link" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="container footer__base">
        <p>© {YEAR} Piralax. Currently in development.</p>
      </div>
    </footer>
  )
}
