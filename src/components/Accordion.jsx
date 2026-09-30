import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import Icon from './Icon.jsx'
import { EASE } from '../lib/motion.js'

function AccordionItem({ question, open, onToggle, children }) {
  const id = useId()
  const buttonId = `${id}-button`
  const panelId = `${id}-panel`

  return (
    <div className={`accordion__item ${open ? 'is-open' : ''}`}>
      <h3 className="accordion__heading">
        <button
          id={buttonId}
          type="button"
          className="accordion__trigger"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onClick={onToggle}
        >
          <span>{question}</span>
          <span className="accordion__icon">
            <Icon name="plus" size={18} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            className="accordion__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="accordion__content">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// One answer open at a time: opening a question closes the one that was open.
export default function Accordion({ items }) {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <div className="accordion">
      {items.map((item, i) => (
        <AccordionItem
          key={item.question}
          question={item.question}
          open={openIndex === i}
          onToggle={() => setOpenIndex((current) => (current === i ? null : i))}
        >
          {item.answer}
        </AccordionItem>
      ))}
    </div>
  )
}
