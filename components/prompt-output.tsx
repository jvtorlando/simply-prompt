"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check, Copy, RotateCcw, ShieldCheck, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type CopyStatus = "idle" | "copied" | "error"

/** Tenta a Clipboard API e, se não existir, o método antigo via textarea. */
async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // segue para o método alternativo
  }
  try {
    const area = document.createElement("textarea")
    area.value = text
    area.setAttribute("readonly", "")
    area.style.position = "fixed"
    area.style.opacity = "0"
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand("copy")
    area.remove()
    return ok
  } catch {
    return false
  }
}

const numberFormat = new Intl.NumberFormat("pt-BR")

type PromptOutputProps = {
  id: string
  title: string
  /** `null` mostra o estado vazio. */
  prompt: string | null
  empty: ReactNode
  onClear: () => void
  clearDisabled?: boolean
}

export function PromptOutput({ id, title, prompt, empty, onClear, clearDisabled }: PromptOutputProps) {
  const [status, setStatus] = useState<CopyStatus>("idle")
  const preRef = useRef<HTMLPreElement>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const handleCopy = async () => {
    if (!prompt) return
    const ok = await copyText(prompt)
    setStatus(ok ? "copied" : "error")
    window.clearTimeout(timer.current)
    if (ok) {
      timer.current = window.setTimeout(() => setStatus("idle"), 2500)
    } else if (preRef.current) {
      // deixa o texto selecionado para a cópia manual
      const range = document.createRange()
      range.selectNodeContents(preRef.current)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }

  const titleId = `${id}-title`

  return (
    <section aria-labelledby={titleId} className="glass flex min-w-0 flex-col rounded-3xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-foreground/10 px-5 py-4">
        <h3 id={titleId} className="text-base font-semibold tracking-tight">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {prompt ? `≈ ${numberFormat.format(prompt.length)} caracteres` : "Nenhum prompt ainda"}
        </span>
      </div>

      <div className="min-w-0 p-3 sm:p-4">
        {prompt ? (
          <pre
            ref={preRef}
            tabIndex={0}
            aria-label={`${title}: texto completo`}
            className="max-h-[26rem] overflow-auto overscroll-contain rounded-2xl bg-muted/70 p-4 font-mono text-[12.5px] leading-relaxed break-words whitespace-pre-wrap text-foreground lg:max-h-[max(14rem,calc(100dvh-22rem))]"
          >
            {prompt}
          </pre>
        ) : (
          <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            {empty}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-foreground/10 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            size="lg"
            onClick={handleCopy}
            disabled={!prompt}
            className={cn("btn-liquid h-12 flex-1 rounded-full text-base", status === "copied" && "bg-brand-blue hover:bg-brand-blue")}
          >
            {status === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {status === "copied" ? "Prompt copiado" : "Copiar prompt"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => {
              setStatus("idle")
              onClear()
            }}
            disabled={clearDisabled}
            className="glass h-12 rounded-full px-5 text-base"
          >
            <RotateCcw aria-hidden="true" />
            Limpar respostas
          </Button>
        </div>

        <p aria-live="polite" role="status" className="min-h-5 text-sm">
          {status === "copied" ? (
            <span className="text-brand-blue">Prompt copiado. Cole na sua IA favorita.</span>
          ) : status === "error" ? (
            <span className="flex items-start gap-1.5 text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Não foi possível copiar automaticamente. O texto foi selecionado: use Ctrl+C (ou toque e segure) para
              copiar.
            </span>
          ) : null}
        </p>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Suas respostas são processadas somente neste navegador e não são enviadas para a Simply Prompt.
        </p>
      </div>
    </section>
  )
}
