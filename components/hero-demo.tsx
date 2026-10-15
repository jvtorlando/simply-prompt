"use client"

import { useId, useState } from "react"

import { GOAL_OPTIONS } from "@/lib/fitness-options"
import { GOAL_FOCUS } from "@/lib/prompt-builders"
import { cn } from "@/lib/utils"
import type { FitnessGoal } from "@/types/prompt"

const DEMO_GOALS = GOAL_OPTIONS.filter((o) => o.value !== "saude")

const ANSWERS = [
  ["Rotina", "4 dias de 60 min"],
  ["Local", "Academia de condomínio"],
  ["Cuidado", "Joelho sensível"],
]

/** Exemplo ao vivo: trocar o objetivo reescreve o trecho do prompt, com as mesmas regras do gerador real. */
export function HeroDemo() {
  const [goal, setGoal] = useState<FitnessGoal>("ganhar-massa")
  const name = useId()
  const label = DEMO_GOALS.find((o) => o.value === goal)?.label ?? ""
  const [first, second] = GOAL_FOCUS[goal]

  return (
    <figure className="mx-auto w-full max-w-md" aria-label="Exemplo: o prompt muda conforme o objetivo">
      <fieldset>
        <legend className="text-sm font-medium">Escolha um objetivo e veja o prompt mudar</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_GOALS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex min-h-11 cursor-pointer items-center rounded-full border border-foreground/25 px-4 text-sm transition-colors select-none hover:border-foreground",
                "has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={goal === option.value}
                onChange={() => setGoal(option.value as FitnessGoal)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <dl className="mt-6 border-t border-foreground">
        {ANSWERS.map(([term, value]) => (
          <div key={term} className="flex items-baseline justify-between gap-4 border-b border-border py-2 text-sm">
            <dt className="text-muted-foreground">{term}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <div
        aria-live="polite"
        className="mt-4 min-h-[16.5rem] rounded-xl bg-foreground p-4 font-mono text-[12px] leading-relaxed break-words whitespace-pre-wrap text-background/85 sm:min-h-[14.5rem]"
      >
        <div key={goal} className="sp-swap">
          <p className="font-semibold text-background">## 3. Objetivo principal</p>
          <p>{label}</p>
          <p className="mt-2">Foco para esse objetivo:</p>
          <p>- {first}</p>
          <p>- {second}</p>
          <p className="mt-2 font-semibold text-background">## 9. Regras de segurança</p>
          <p>- Evite exercícios que agravem o joelho…</p>
        </div>
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">Trecho de um prompt de cerca de 4.500 caracteres.</figcaption>
    </figure>
  )
}
