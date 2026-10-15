"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

type RevealProps = {
  children: ReactNode
  /** Atraso em segundos, para escalonar itens de um mesmo grupo. */
  delay?: number
  /** Distância vertical inicial, em px. */
  y?: number
  /** Revela ao carregar, em vez de ao entrar na tela. */
  immediate?: boolean
  className?: string
}

/** Entrada com mola: sobe, desfoca menos e aparece. Sem movimento quando o sistema pede para reduzir. */
export function Reveal({ children, delay = 0, y = 22, immediate, className }: RevealProps) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>

  const hidden = { opacity: 0, y, filter: "blur(6px)" }
  const shown = { opacity: 1, y: 0, filter: "blur(0px)" }
  const transition = { type: "spring", stiffness: 90, damping: 20, mass: 0.9, delay } as const

  return (
    <motion.div
      className={className}
      initial={hidden}
      {...(immediate
        ? { animate: shown }
        : { whileInView: shown, viewport: { once: true, margin: "0px 0px -10% 0px" } })}
      transition={transition}
    >
      {children}
    </motion.div>
  )
}
