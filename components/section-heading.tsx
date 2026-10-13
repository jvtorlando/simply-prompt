import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  id: string
  eyebrow: string
  title: string
  description?: string
  className?: string
}

export function SectionHeading({ id, eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <p className="font-mono text-xs font-medium tracking-[0.16em] text-brand-rust uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </div>
  )
}
