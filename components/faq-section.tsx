import { SectionHeading } from "@/components/section-heading"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const FAQ = [
  {
    q: "O Simply Prompt usa inteligência artificial?",
    a: "Não diretamente. O site monta o texto do prompt a partir das suas respostas, com regras fixas, sem chamar nenhuma IA. Quem gera o plano é a IA em que você colar o prompt.",
  },
  {
    q: "Meus dados são enviados para algum servidor?",
    a: "Não. As respostas são processadas somente no seu navegador. Para não perder o rascunho do Personal IA, guardamos neste navegador apenas preferências de treino (objetivo, rotina, local e equipamentos). Idade, medidas, sono, lesões e observações não são salvas. O botão \"Limpar respostas\" apaga o rascunho.",
  },
  {
    q: "Posso usar o prompt no ChatGPT ou Claude?",
    a: "Sim. O prompt é texto comum e funciona no Claude, ChatGPT, Gemini e em outras IAs de conversa. Os resultados podem variar entre elas.",
  },
  {
    q: "O Personal IA substitui um profissional?",
    a: "Não. Ele ajuda a organizar informações e a pedir um plano mais adequado, mas não substitui médico, fisioterapeuta, nutricionista ou profissional de educação física. Se houver dor, lesão, condição clínica ou gestação, procure avaliação profissional antes de começar.",
  },
  {
    q: "Preciso pagar?",
    a: "Não. O Simply Prompt é gratuito e não exige cadastro. O uso da IA escolhida segue as regras e planos dela.",
  },
  {
    q: "Posso editar o prompt depois?",
    a: "Sim. Depois de colar, edite o que quiser antes de enviar. Você também pode voltar ao formulário, mudar as respostas e copiar uma nova versão.",
  },
]

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-titulo" className="border-t border-border/70 py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading id="faq-titulo" eyebrow="Perguntas frequentes" title="O que você talvez queira saber." />
        <Accordion className="rounded-3xl border border-border bg-card px-5 sm:px-6">
          {FAQ.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="border-border">
              <AccordionTrigger className="py-5 text-base font-medium hover:no-underline">{item.q}</AccordionTrigger>
              <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
