import { MotionConfig } from 'motion/react'
import Header from './sections/Header.jsx'
import Hero from './sections/Hero.jsx'
import Problem from './sections/Problem.jsx'
import Approach from './sections/Approach.jsx'
import Features from './sections/Features.jsx'
import HowItWorks from './sections/HowItWorks.jsx'
import Audience from './sections/Audience.jsx'
import FAQ from './sections/FAQ.jsx'
import FinalCTA from './sections/FinalCTA.jsx'
import Footer from './sections/Footer.jsx'
import './App.css'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" />
      <Header />
      <main id="main">
        <Hero />
        <Problem />
        <Approach />
        <Features />
        <HowItWorks />
        <Audience />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </MotionConfig>
  )
}
