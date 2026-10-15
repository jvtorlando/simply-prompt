"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"

import { Reveal } from "@/components/reveal"
import { SectionHeading } from "@/components/section-heading"
import GlassFolder, { type FolderFile } from "@/components/ui/glass-folder-cards"
import { PROMPT_CATEGORIES } from "@/lib/prompt-catalog"
import { cn } from "@/lib/utils"
import type { CatalogItem, PromptCategory } from "@/types/prompt"

const MAX_FOLDER = 340
const MIN_FOLDER = 220
/** Folga para os arquivos abertos em leque não passarem da borda do cartão. */
const FAN_ROOM = 80

/** Largura da pasta acompanhando a largura do cartão, sem overflow horizontal. */
function useFolderWidth(max: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(280)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const available = el.clientWidth - FAN_ROOM
      setWidth(Math.round(Math.max(MIN_FOLDER, Math.min(max, available))))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [max])

  return { ref, width }
}

type CategoryCardProps = {
  category: PromptCategory
  index: number
  onSelect: (item: CatalogItem) => void
}

function CategoryCard({ category, index, onSelect }: CategoryCardProps) {
  const featured = !!category.featured
  const { ref, width } = useFolderWidth(featured ? MAX_FOLDER : 300)
  const files: FolderFile[] = category.items.map((item) => ({ name: item.title, meta: item.meta }))
  const titleId = `categoria-${category.id}`

  // O leque abre ao passar o mouse. No toque e no teclado continua abrindo por clique/Enter.
  const [open, setOpen] = useState(false)
  const hovering = useRef(false)
  const escaping = useRef(false)

  const handleOpenChange = (next: boolean) => {
    // Com o mouse em cima o leque já está aberto: o clique não deve fechá-lo. Esc fecha sempre.
    if (!next && hovering.current && !escaping.current) return
    setOpen(next)
  }

  return (
    <li
      aria-labelledby={titleId}
      className={cn(
        "flex min-w-0 flex-col",
        featured
          ? "glass overflow-hidden rounded-[2rem] md:col-span-2 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:col-span-3"
          : "border-t border-foreground pt-4",
      )}
    >
      <div
        ref={ref}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return
          hovering.current = true
          setOpen(true)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return
          hovering.current = false
          setOpen(false)
        }}
        onKeyDownCapture={(e) => {
          if (e.key === "Escape") escaping.current = true
        }}
        onKeyUp={() => {
          escaping.current = false
        }}
        className={cn(
          "dot-grid flex min-w-0 justify-center px-4 pt-12 pb-3",
          featured && "md:items-center md:py-10",
        )}
      >
        <GlassFolder
          label={category.title}
          meta={`${category.items.length} prompts`}
          tone={featured ? "dark" : "light"}
          art={category.art}
          seed={category.seed}
          files={files}
          action="none"
          open={open}
          onOpenChange={handleOpenChange}
          width={width}
          appearDelay={index * 120}
          onFileSelect={(_, i) => onSelect(category.items[i])}
        />
      </div>

      <div className={cn("flex flex-1 flex-col gap-4", featured ? "p-6 sm:p-10" : "pt-2")}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3
            id={titleId}
            className={cn("font-semibold tracking-tight", featured ? "text-4xl tracking-[-0.035em]" : "text-xl")}
          >
            {category.title}
          </h3>
          {featured ? <span className="text-sm text-muted-foreground">Personal IA</span> : null}
        </div>
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">{category.description}</p>
        <ul className="mt-auto" aria-label={`Prompts de ${category.title}`}>
          {category.items.map((item) => (
            <li key={item.id} className="border-b border-foreground/15 first:border-t">
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="group flex min-h-11 w-full items-center justify-between gap-3 py-2 text-left text-sm font-medium transition-colors hover:text-brand-rust"
              >
                {item.title}
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand-rust"
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export function PromptCatalog({ onSelect }: { onSelect: (item: CatalogItem) => void }) {
  return (
    <section id="catalogo" aria-labelledby="catalogo-titulo" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
        <SectionHeading
            id="catalogo-titulo"
            size="md"
            title="Escolha o que criar."
            description="Abra uma pasta, escolha um prompt e responda algumas perguntas. Ele já sai pronto para copiar."
          />
        </Reveal>
        <ul className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {PROMPT_CATEGORIES.map((category, i) => (
            <CategoryCard key={category.id} category={category} index={i} onSelect={onSelect} />
          ))}
        </ul>
      </div>
    </section>
  )
}
