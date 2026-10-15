import { cacheLife } from "next/cache"
import { FolderGit2 } from "lucide-react"

import { BrandMark } from "@/components/site-header"
import { SITE_CONFIG } from "@/lib/site-config"

/** O ano é calculado no servidor e revalidado diariamente. */
async function getCurrentYear() {
  "use cache"
  cacheLife("days")
  return new Date().getFullYear()
}

export async function SiteFooter() {
  const year = await getCurrentYear()

  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-3">
          <BrandMark />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Transforme algumas respostas em um prompt feito para você.
          </p>
          {SITE_CONFIG.githubUrl ? (
            <a
              href={SITE_CONFIG.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium hover:underline"
            >
              <FolderGit2 className="size-4" aria-hidden="true" />
              Código no GitHub
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Uso responsável</p>
          <p>
            Os prompts ajudam a organizar informações para uma IA. As respostas da IA podem conter erros e não substituem
            orientação médica, nutricional, jurídica ou de outro profissional qualificado.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          © {year} Simply Prompt. Nenhuma resposta é enviada para servidores.
        </p>
      </div>
    </footer>
  )
}
