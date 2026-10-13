import type { CSSProperties } from "react"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ANSWERS = [
  ["Objetivo", "Ganhar massa muscular"],
  ["Rotina", "4 dias · 60 min"],
  ["Local", "Academia de condomínio"],
  ["Cuidado", "Joelho sensível"],
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
    <figure className="mx-auto w-full max-w-md" aria-label="Exemplo: respostas curtas viram um prompt detalhado">
      <p className="font-mono text-xs text-muted-foreground">você responde</p>
      <dl className="mt-2 border-t border-foreground">
        {ANSWERS.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 border-b border-border py-2 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <figcaption className="mt-6 flex items-baseline justify-between font-mono text-xs text-muted-foreground">
        <span>você recebe</span>
        <span>~4.500 caracteres</span>
      </figcaption>
      <div className="mt-2 rounded-xl bg-foreground p-4 font-mono text-[12px] leading-relaxed text-background/85">
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
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-end gap-14 px-4 pt-16 pb-24 sm:px-6 md:pt-24 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16 lg:pb-32">
        <div>
          <p className="font-mono text-xs text-muted-foreground">
            Transforme algumas respostas em um prompt feito para você.
          </p>
          <h1 className="mt-6 text-[2.75rem] leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-7xl">
            Seu próximo especialista começa com o <span className="text-brand-rust">prompt certo.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-pretty text-muted-foreground">
            Responda algumas perguntas e receba um prompt personalizado para criar seu Personal IA, tutor, mentor de
            carreira ou planejador.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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
          <p className="mt-6 text-sm text-muted-foreground">
            Gratuito, sem cadastro. Suas respostas ficam no seu navegador.
          </p>
        </div>
        <PromptDemo />
      </div>
    </section>
  )
}
