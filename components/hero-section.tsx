import { ArrowRight } from "lucide-react"

import { HeroDemo } from "@/components/hero-demo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function HeroSection() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="dot-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <div className="relative mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)] items-end gap-14 px-4 pt-16 pb-24 sm:px-6 md:pt-24 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-16 lg:pb-32">
        <div>
          <h1 className="text-[2.75rem] leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-6xl lg:text-[5.25rem]">
            Seu próximo especialista começa com o prompt certo.
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
        <HeroDemo />
      </div>
    </section>
  )
}
