import type { CSSProperties } from "react"
import { ArrowDown, ArrowRight, Dumbbell, LockKeyhole } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ANSWERS = [
  { label: "Objetivo", value: "Ganhar massa muscular" },
  { label: "Rotina", value: "4 dias · 60 min" },
  { label: "Local", value: "Academia de condomínio" },
  { label: "Cuidado", value: "Joelho sensível" },
]

const PROMPT_LINES = [
  { text: "## 1. Seu papel", strong: true },
  { text: "Atue como um profissional de educação física…" },
  { text: "## 4. Disponibilidade e estrutura", strong: true },
  { text: "- 4 dias por semana, 60 min por treino" },
  { text: "- Halteres, polias, banco ajustável" },
  { text: "## 9. Regras de segurança", strong: true },
  { text: "- Evite exercícios que agravem o joelho…" },
]

function PromptDemo() {
  return (
    <figure
      className="relative mx-auto w-full max-w-md rounded-3xl border border-border bg-card/80 p-4 shadow-[0_30px_60px_-30px_rgba(28,26,23,0.35)] backdrop-blur-sm sm:p-5"
      aria-label="Exemplo: respostas curtas viram um prompt detalhado"
    >
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Dumbbell className="size-3.5 text-brand-rust" aria-hidden="true" />
        Suas respostas
      </div>
      <ul className="mt-3 flex flex-wrap gap-2">
        {ANSWERS.map((a) => (
          <li key={a.label} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs">
            <span className="text-muted-foreground">{a.label}: </span>
            <span className="font-medium">{a.value}</span>
          </li>
        ))}
      </ul>

      <div className="my-3 flex items-center gap-3 text-muted-foreground" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <ArrowDown className="size-4" />
        <span className="h-px flex-1 bg-border" />
      </div>

      <figcaption className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>Prompt gerado</span>
        <span className="font-mono text-[11px]">~4.500 caracteres</span>
      </figcaption>
      <div className="mt-2 rounded-2xl bg-foreground p-4 font-mono text-[12px] leading-relaxed text-background/85">
        {PROMPT_LINES.map((line, i) => (
          <p
            key={line.text}
            className={cn("sp-reveal truncate", line.strong && "mt-1.5 font-semibold text-background first:mt-0")}
            style={{ "--i": i } as CSSProperties}
          >
            {line.text}
          </p>
        ))}
        <span className="sp-caret mt-1 inline-block h-3.5 w-1.5 translate-y-0.5 bg-brand-coral" aria-hidden="true" />
      </div>
    </figure>
  )
}

export function HeroSection() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-4 pt-14 pb-20 sm:px-6 md:pt-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16 lg:pt-24 lg:pb-28">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-brand-coral" aria-hidden="true" />
            Transforme algumas respostas em um prompt feito para você.
          </p>
          <h1 className="mt-6 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
            Seu próximo especialista começa com o prompt certo.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
            Responda algumas perguntas e receba um prompt personalizado para criar seu Personal IA, tutor, mentor de
            carreira ou planejador.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#criar" className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-6 text-base")}>
              Criar meu Personal IA
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </a>
            <a
              href="#catalogo"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 rounded-full px-6 text-base")}
            >
              Explorar prompts
            </a>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <LockKeyhole className="size-4 shrink-0" aria-hidden="true" />
            Gratuito, sem cadastro. Suas respostas ficam no seu navegador.
          </p>
        </div>
        <PromptDemo />
      </div>
    </section>
  )
}
