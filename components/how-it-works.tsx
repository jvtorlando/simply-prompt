import { ClipboardCopy, LayoutGrid, MessageSquareText } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"

const STEPS = [
  {
    icon: LayoutGrid,
    title: "Escolha uma tarefa",
    text: "Treino, estudos, carreira, inglês ou produtividade. Cada modelo sabe o que precisa perguntar.",
  },
  {
    icon: MessageSquareText,
    title: "Responda perguntas rápidas",
    text: "Objetivo, rotina, nível e limitações. Só o necessário, sem nome, e-mail ou telefone.",
  },
  {
    icon: ClipboardCopy,
    title: "Copie e use na sua IA favorita",
    text: "Cole o prompt no Claude, ChatGPT, Gemini ou em outra IA de conversa e receba uma resposta sob medida.",
  },
]

const ASSISTANTS = ["Claude", "ChatGPT", "Gemini", "Copilot", "outras IAs"]

export function HowItWorks() {
  return (
    <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="border-t border-border/70 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="como-funciona-titulo"
          eyebrow="Como funciona"
          title="Três passos entre a ideia e um bom prompt."
          description="Prompts genéricos geram respostas genéricas. O Simply Prompt coleta o contexto que faz diferença e organiza tudo em instruções claras."
        />

        <ol className="mt-12 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-brand-blue-soft text-brand-blue">
                  <step.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-muted-foreground" aria-hidden="true">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-dashed border-border px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-sm font-medium">Funciona com:</p>
          <ul className="flex flex-wrap gap-2" aria-label="Assistentes compatíveis">
            {ASSISTANTS.map((name) => (
              <li key={name} className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
