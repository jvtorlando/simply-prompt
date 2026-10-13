import { SectionHeading } from "@/components/section-heading"

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
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="como-funciona-titulo"
          number="01"
          label="Como funciona"
          title="Do zero ao prompt em três passos."
        />

        <ol className="mt-10 lg:pl-48">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-border py-7 sm:grid-cols-[6rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-8"
            >
              <span
                aria-hidden="true"
                className="font-mono text-4xl leading-none font-medium tracking-tighter text-brand-rust sm:text-6xl"
              >
                {i + 1}
              </span>
              <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{step.title}</h3>
              <p className="col-start-2 mt-2 max-w-sm text-[15px] leading-relaxed text-muted-foreground sm:col-start-auto sm:mt-0">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
