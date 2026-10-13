"use client"

import { useState } from "react"
import { Menu } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type NavLink = { href: string; label: string }

export function MobileNav({ links }: { links: readonly NavLink[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="outline" size="icon-lg" className="size-10 rounded-full md:hidden" aria-label="Abrir menu" />}
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(20rem,85vw)] bg-background">
        <SheetHeader className="border-b border-border px-5 pt-5">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Navegue pelas seções da página.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Menu móvel" className="px-3">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-muted"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto p-5">
          <a
            href="#criar"
            onClick={() => setOpen(false)}
            className={cn(buttonVariants({ size: "lg" }), "h-12 w-full rounded-full text-base")}
          >
            Criar meu prompt
          </a>
        </div>
      </SheetContent>
    </Sheet>
  )
}
