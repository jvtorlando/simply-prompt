"use client"

import { useRef, useState, type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

type CursorPosition = { left: number; width: number; height: number; opacity: number }

export type NavHeaderLink = { href: string; label: string }

/** Navegação em pílula de vidro com um cursor que desliza até o item sob o mouse ou o foco. */
function NavHeader({ links, label = "Principal" }: { links: readonly NavHeaderLink[]; label?: string }) {
  const [position, setPosition] = useState<CursorPosition>({ left: 0, width: 0, height: 0, opacity: 0 })
  const [active, setActive] = useState<number | null>(null)
  const hide = () => {
    setActive(null)
    setPosition((current) => ({ ...current, opacity: 0 }))
  }

  return (
    <nav aria-label={label}>
      <ul
        className="glass relative mx-auto flex w-fit rounded-full p-1"
        onMouseLeave={hide}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) hide()
        }}
      >
        {links.map((link, index) => (
          <Tab
            key={link.href}
            href={link.href}
            highlighted={active === index}
            onActivate={(next) => {
              setActive(index)
              setPosition(next)
            }}
          >
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
  highlighted: boolean
  onActivate: (position: CursorPosition) => void
}

function Tab({ href, children, highlighted, onActivate }: TabProps) {
  const ref = useRef<HTMLLIElement>(null)

  const moveCursor = () => {
    const el = ref.current
    if (!el) return
    onActivate({ left: el.offsetLeft, width: el.offsetWidth, height: el.offsetHeight, opacity: 1 })
  }

  return (
    <li ref={ref} onMouseEnter={moveCursor} onFocus={moveCursor} className="relative z-10">
      <a
        href={href}
        className={cn(
          "block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
          highlighted ? "text-background" : "text-foreground",
        )}
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
      transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30 }}
      className="absolute top-1 z-0 rounded-full bg-foreground shadow-[0_6px_16px_-6px_rgb(0_0_0/0.5)]"
    />
  )
}

export default NavHeader
