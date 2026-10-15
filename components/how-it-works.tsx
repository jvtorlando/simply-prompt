import { Reveal } from "@/components/reveal"

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

/** Faixa compacta logo abaixo do hero: o caminho inteiro em três passos, sem competir com o catálogo. */
export function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="como-funciona-titulo" className="sr-only">
          Como funciona
        </h2>
        <ol className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="border-t border-foreground pt-4">
              <Reveal delay={i * 0.08}>
                <span aria-hidden="true" className="text-4xl leading-none font-semibold tracking-tighter text-brand-rust tabular-nums">
                  {i + 1}
                </span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted-foreground">{step.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
