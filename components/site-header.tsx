import Image from "next/image"

import { MobileNav } from "@/components/mobile-nav"
import { buttonVariants } from "@/components/ui/button"
import NavHeader from "@/components/ui/nav-header"
import { cn } from "@/lib/utils"

export const NAV_LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#criar", label: "Criar prompt" },
] as const

export function BrandMark({ className }: { className?: string }) {
  return (
    <span translate="no" className={cn("inline-flex items-center gap-2 font-heading text-lg font-semibold tracking-tight", className)}>
      <Image src="/logo-sp.png" alt="" width={28} height={28} className="size-7" priority />
      Simply Prompt
    </span>
  )
}

export function SiteHeader() {
  return (
    <header className="glass-bar sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#inicio" className="rounded-md" aria-label="Simply Prompt, voltar ao início">
          <BrandMark />
        </a>

        <div className="hidden md:block">
          <NavHeader links={NAV_LINKS} />
        </div>

        <div className="flex items-center gap-2">
          <a href="#criar" className={cn(buttonVariants({ size: "lg" }), "btn-liquid hidden h-10 rounded-full px-4 sm:inline-flex")}>
            Criar meu prompt
          </a>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  )
}
