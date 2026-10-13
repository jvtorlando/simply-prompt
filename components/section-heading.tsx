import { cn } from "@/lib/utils"

type SectionHeadingProps = {
  id: string
  /** Número da seção, em mono: "01". */
  number: string
  label: string
  title: string
  description?: string
  className?: string
}

export function SectionHeading({ id, number, label, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("grid gap-5 border-t border-foreground pt-4 lg:grid-cols-[12rem_minmax(0,1fr)]", className)}>
      <p className="font-mono text-xs text-muted-foreground">
        <span className="text-brand-rust">{number}</span> / {label}
      </p>
      <div>
        <h2
          id={id}
          className="max-w-3xl text-4xl leading-[1.04] font-semibold tracking-[-0.04em] text-balance sm:text-5xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
