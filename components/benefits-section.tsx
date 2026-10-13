import { ClipboardCheck, Crosshair, Laptop, Shuffle, UserRound } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"

const BENEFITS = [
  {
    icon: Crosshair,
    title: "Mais específico que um prompt genérico",
    text: "Cada modelo inclui papel, contexto, regras e formato de resposta. A IA recebe instruções completas em vez de um pedido vago.",
  },
  {
    icon: UserRound,
    title: "Adaptado à sua realidade",
    text: "Seu tempo, seus equipamentos, seu nível e suas limitações entram no texto. O resultado parte do que você tem, não de um cenário ideal.",
  },
  {
    icon: ClipboardCheck,
    title: "Pronto para copiar",
    text: "Um toque copia o prompt inteiro. Você também pode editar o texto antes de enviar.",
  },
  {
    icon: Shuffle,
    title: "Funciona em diferentes IAs",
    text: "O texto é escrito em linguagem comum, sem comandos exclusivos. Use no Claude, ChatGPT, Gemini ou outra IA de conversa.",
  },
  {
    icon: Laptop,
    title: "Dados processados localmente",
    text: "O prompt é montado no seu navegador. Não há servidor recebendo respostas, cadastro, cookies ou rastreadores.",
  },
]

export function BenefitsSection() {
  return (
    <section aria-labelledby="beneficios-titulo" className="border-t border-border/70 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="beneficios-titulo"
          eyebrow="Benefícios"
          title="Um ponto de partida melhor para a conversa com a IA."
          description="Um bom prompt aumenta a chance de uma resposta útil, mas não garante que ela esteja certa. Revise sempre o que a IA responder."
        />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="flex flex-col gap-3 bg-card p-6">
              <benefit.icon className="size-5 text-brand-rust" aria-hidden="true" />
              <h3 className="text-base font-semibold tracking-tight">{benefit.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{benefit.text}</p>
            </li>
          ))}
          <li className="flex flex-col justify-center gap-2 bg-foreground p-6 text-background">
            <p className="text-lg font-semibold tracking-tight">Pronto para testar?</p>
            <a href="#criar" className="w-fit rounded-md text-sm text-background/80 underline underline-offset-4 hover:text-background">
              Criar meu Personal IA
            </a>
          </li>
        </ul>
      </div>
    </section>
  )
}
