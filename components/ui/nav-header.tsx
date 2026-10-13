"use client"

import { useRef, useState, type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

type CursorPosition = { left: number; width: number; height: number; opacity: number }

export type NavHeaderLink = { href: string; label: string }

/** Navegação em pílula com um cursor que desliza até o item sob o mouse ou o foco. */
function NavHeader({ links, label = "Principal" }: { links: readonly NavHeaderLink[]; label?: string }) {
  const [position, setPosition] = useState<CursorPosition>({ left: 0, width: 0, height: 0, opacity: 0 })
  const hide = () => setPosition((current) => ({ ...current, opacity: 0 }))

  return (
    <nav aria-label={label}>
      <ul
        className="relative mx-auto flex w-fit rounded-full border border-foreground/80 bg-background p-1"
        onMouseLeave={hide}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) hide()
        }}
      >
        {links.map((link) => (
          <Tab key={link.href} href={link.href} setPosition={setPosition}>
            {link.label}
          </Tab>
        ))}
        <Cursor position={position} />
      </ul>
    </nav>
  )
}

type TabProps = {
  href: string
  children: ReactNode
  setPosition: (position: CursorPosition) => void
}

function Tab({ href, children, setPosition }: TabProps) {
  const ref = useRef<HTMLLIElement>(null)

  const moveCursor = () => {
    const el = ref.current
    if (!el) return
    setPosition({ left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight, opacity: 1 })
  }

  return (
    <li ref={ref} onMouseEnter={moveCursor} onFocus={moveCursor} className="relative z-10 text-white mix-blend-difference">
      <a
        href={href}
        className="block rounded-full px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
      </a>
    </li>
  )
}

function Cursor({ position }: { position: CursorPosition }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.li
      aria-hidden="true"
      initial={false}
      animate={position}
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
      className="absolute top-1 z-0 rounded-full bg-foreground"
    />
  )
}

export default NavHeader
