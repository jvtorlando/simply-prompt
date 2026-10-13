import { Sparkles } from "lucide-react"

import { MobileNav } from "@/components/mobile-nav"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const NAV_LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#criar", label: "Criar prompt" },
] as const

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="grid size-7 place-items-center rounded-lg bg-foreground text-background" aria-hidden="true">
        <Sparkles className="size-4" strokeWidth={2.2} />
      </span>
      Simply Prompt
    </span>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/65">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#inicio" className="rounded-md" aria-label="Simply Prompt, voltar ao início">
          <BrandMark />
        </a>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href="#criar" className={cn(buttonVariants({ size: "lg" }), "hidden h-10 rounded-full px-4 sm:inline-flex")}>
            Criar meu prompt
          </a>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  )
}
