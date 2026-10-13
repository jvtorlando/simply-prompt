import { SectionHeading } from "@/components/section-heading"

const BENEFITS = [
  {
    title: "Específico",
    text: "Cada modelo entrega papel, contexto, regras e formato de resposta. A IA não precisa adivinhar.",
  },
  {
    title: "Do seu tamanho",
    text: "Tempo, equipamento, nível e limitações entram no texto. O plano parte do que você tem.",
  },
  {
    title: "Pronto para colar",
    text: "Um toque copia tudo. Edite o que quiser antes de enviar.",
  },
  {
    title: "Em qualquer IA",
    text: "Texto comum, sem comando exclusivo. Claude, ChatGPT, Gemini e outras.",
  },
  {
    title: "Só no navegador",
    text: "O prompt é montado aqui, sem servidor, cadastro, cookies ou rastreadores.",
  },
]

export function BenefitsSection() {
  return (
    <section aria-labelledby="beneficios-titulo" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="beneficios-titulo"
          number="04"
          label="Por que usar"
          title="Um prompt melhor não garante uma resposta certa. Mas melhora o ponto de partida."
        />
        <dl className="mt-10 lg:pl-48">
          {BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="grid gap-1 border-b border-border py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:gap-8"
            >
              <dt className="font-semibold tracking-tight">{benefit.title}</dt>
              <dd className="text-[15px] leading-relaxed text-muted-foreground">{benefit.text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-sm text-muted-foreground lg:pl-48">Revise sempre o que a IA responder.</p>
      </div>
    </section>
  )
}
