"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Dumbbell, FlaskConical } from "lucide-react"

import { SectionHeading } from "@/components/section-heading"
import { Badge } from "@/components/ui/badge"
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

  return (
    <li
      aria-labelledby={titleId}
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border bg-card",
        featured
          ? "border-foreground/15 shadow-[0_30px_60px_-36px_rgba(28,26,23,0.45)] md:col-span-2 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
          : "border-border",
      )}
    >
      <div
        ref={ref}
        className={cn(
          "dot-grid flex min-w-0 justify-center px-4 pt-12 pb-3",
          featured ? "bg-brand-coral-soft/60 md:items-center md:py-8" : "bg-muted/40",
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
          width={width}
          appearDelay={index * 120}
          onFileSelect={(_, i) => onSelect(category.items[i])}
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id={titleId} className="text-xl font-semibold tracking-tight">
            {category.title}
          </h3>
          {featured ? (
            <Badge className="h-6 gap-1 bg-foreground px-2.5 text-background">
              <Dumbbell aria-hidden="true" />
              Personal IA
            </Badge>
          ) : (
            <Badge variant="outline" className="h-6 gap-1 px-2.5">
              <FlaskConical aria-hidden="true" />
              Experimental
            </Badge>
          )}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{category.description}</p>
        <ul className="mt-auto flex flex-col gap-2" aria-label={`Prompts de ${category.title}`}>
          {category.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="group flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-2 text-left text-sm font-medium transition-colors hover:border-foreground/30 hover:bg-muted/60"
              >
                {item.title}
                <ArrowRight
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
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
    <section id="catalogo" aria-labelledby="catalogo-titulo" className="border-t border-border/70 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          id="catalogo-titulo"
          eyebrow="Catálogo"
          title="Uma pasta para cada parte da sua rotina."
          description="Toque em uma pasta para abri-la e escolha um prompt, ou use a lista de cada categoria. O Personal IA está completo; as demais categorias são modelos experimentais, já utilizáveis."
        />
        <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROMPT_CATEGORIES.map((category, i) => (
            <CategoryCard key={category.id} category={category} index={i} onSelect={onSelect} />
          ))}
        </ul>
      </div>
    </section>
  )
}
