import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  id: string
  title: string
  description?: string
  size?: "md" | "lg"
  className?: string
}

/** Título de seção: uma linha firme no topo e o título, sem etiquetas decorativas. */
export function SectionHeading({ id, title, description, size = "lg", className }: SectionHeadingProps) {
  return (
    <div className={cn("border-t border-foreground pt-5", className)}>
      <h2
        id={id}
        className={cn(
          "max-w-3xl leading-[1.04] font-semibold tracking-[-0.035em] text-balance",
          size === "lg" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-md text-base leading-relaxed text-pretty text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

/** Duas colunas assimétricas: título fixo à esquerda, conteúdo à direita. */
export const splitLayout = "grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
export const splitHeadingSticky = "lg:sticky lg:top-24 lg:self-start"
