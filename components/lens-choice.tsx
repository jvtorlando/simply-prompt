"use client"

import { useId, type ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

export type LensOption = { value: string; label: ReactNode }

type LensChoiceProps = {
  name: string
  value: string
  onChange: (value: string) => void
  options: readonly LensOption[]
  /** `segment`: barra de vidro com uma lente que desliza. `chips`: opções soltas que quebram de linha. */
  variant?: "segment" | "chips"
  /** Id do primeiro input, para receber foco quando houver erro. */
  firstId?: string
  invalid?: boolean
  ariaLabel?: string
  className?: string
}

/**
 * Grupo de rádios acessível (setas, Tab, leitor de tela) em que a opção escolhida
 * ganha uma lente de vidro que desliza até ela.
 */
export function LensChoice({
  name,
  value,
  onChange,
  options,
  variant = "chips",
  firstId,
  invalid,
  ariaLabel,
  className,
}: LensChoiceProps) {
  const group = useId()
  const reduce = useReducedMotion()
  const segment = variant === "segment"

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        segment ? "glass flex w-full max-w-full overflow-x-auto rounded-full p-1 sm:w-fit" : "flex flex-wrap gap-2",
        className,
      )}
    >
      {options.map((option, i) => {
        const selected = value === option.value
        return (
          <label
            key={option.value}
            className={cn(
              "relative flex min-h-11 cursor-pointer items-center justify-center text-sm font-medium transition-colors duration-200 select-none",
              "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              segment
                ? "shrink-0 rounded-full px-4"
                : cn(
                    "rounded-full border px-4",
                    selected ? "border-transparent" : "border-foreground/15 bg-white/40 hover:border-foreground/40",
                    invalid && !value && "border-destructive/60",
                  ),
              selected ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <input
              id={i === 0 ? firstId : undefined}
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              aria-invalid={(invalid && !value) || undefined}
              className="sr-only"
            />
            {selected ? (
              <motion.span
                layoutId={`lens-${group}`}
                aria-hidden="true"
                className="lens absolute inset-0 rounded-full"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10 text-center">{option.label}</span>
          </label>
        )
      })}
    </div>
  )
}

type LensMultiProps = {
  name: string
  values: string[]
  onChange: (values: string[]) => void
  options: readonly LensOption[]
  firstId?: string
  /** Máximo de opções marcadas; as demais ficam indisponíveis ao atingir. */
  max?: number
  invalid?: boolean
  className?: string
}

/**
 * Seleção múltipla com lente de vidro. A ordem da escolha importa: cada opção marcada
 * mostra sua posição (1, 2, 3) quando há mais de uma.
 */
export function LensMulti({ name, values, onChange, options, firstId, max, invalid, className }: LensMultiProps) {
  const reduce = useReducedMotion()
  const full = max !== undefined && values.length >= max

  return (
    <div role="group" className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option, i) => {
        const index = values.indexOf(option.value)
        const selected = index !== -1
        const blocked = full && !selected
        return (
          <label
            key={option.value}
            className={cn(
              "relative flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors duration-200 select-none",
              "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              selected ? "border-transparent text-foreground" : "border-foreground/15 bg-white/40 text-muted-foreground",
              blocked ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-foreground/40 hover:text-foreground",
              invalid && values.length === 0 && "border-destructive/60",
            )}
          >
            <input
              id={i === 0 ? firstId : undefined}
              type="checkbox"
              name={name}
              value={option.value}
              checked={selected}
              disabled={blocked}
              onChange={(e) =>
                onChange(e.target.checked ? [...values, option.value] : values.filter((v) => v !== option.value))
              }
              aria-invalid={(invalid && values.length === 0) || undefined}
              className="sr-only"
            />
            {selected ? (
              <motion.span
                aria-hidden="true"
                className="lens absolute inset-0 rounded-full"
                initial={reduce ? false : { opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-2">
              {selected && values.length > 1 ? (
                <span
                  aria-hidden="true"
                  className="grid size-5 place-items-center rounded-full bg-brand-rust text-[11px] font-semibold text-white tabular-nums"
                >
                  {index + 1}
                </span>
              ) : null}
              {option.label}
              {selected && values.length > 1 ? <span className="sr-only">(prioridade {index + 1})</span> : null}
            </span>
          </label>
        )
      })}
    </div>
  )
}
