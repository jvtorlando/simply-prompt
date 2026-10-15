import { Reveal } from "@/components/reveal"
import { SectionHeading, splitHeadingSticky, splitLayout } from "@/components/section-heading"

const STEPS = [
  {
    title: "Escolha uma tarefa",
    text: "Treino, estudos, carreira, inglês ou produtividade. Cada modelo já sabe o que perguntar.",
  },
  {
    title: "Responda o essencial",
    text: "Objetivo, rotina, nível, limitações. Sem nome, e-mail ou telefone.",
  },
  {
    title: "Copie e cole na sua IA",
    text: "Funciona no Claude, ChatGPT, Gemini e em outras IAs de conversa.",
  },
]

export function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="py-20 sm:py-28">
      <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${splitLayout}`}>
        <Reveal className={splitHeadingSticky}>
          <SectionHeading id="como-funciona-titulo" size="md" title="Do zero ao prompt em três passos." />
        </Reveal>

        <ol>
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t border-foreground/15 py-7 first:border-t-0 first:pt-0">
              <Reveal delay={i * 0.08} className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-4">
                <span
                  aria-hidden="true"
                  className="font-heading text-5xl leading-none font-semibold tracking-tighter text-brand-rust tabular-nums"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 max-w-md text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
