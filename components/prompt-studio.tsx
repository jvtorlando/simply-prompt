"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

import { PromptBuilder } from "@/components/prompt-builder"
import { PromptCatalog } from "@/components/prompt-catalog"
import { EMPTY_FITNESS_FORM, PERSISTED_FITNESS_FIELDS } from "@/lib/fitness-options"
import type { BuilderSelection, CatalogItem, FitnessField, FitnessFormData, TemplateValues } from "@/types/prompt"

const DRAFT_KEY = "simply-prompt:fitness-draft:v1"

function readRawDraft(): string | null {
  try {
    return window.localStorage.getItem(DRAFT_KEY)
  } catch {
    return null
  }
}

function subscribeStorage(onChange: () => void) {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

/** Interpreta o rascunho salvo, mantendo só os campos permitidos e com o tipo certo. */
function parseDraft(raw: string | null): Partial<FitnessFormData> {
  try {
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object") return {}
    const source = parsed as Record<string, unknown>
    const draft: Record<string, unknown> = {}
    for (const field of PERSISTED_FITNESS_FIELDS) {
      const value = source[field]
      const expected = EMPTY_FITNESS_FORM[field]
      if (Array.isArray(expected) ? Array.isArray(value) && value.every((v) => typeof v === "string") : typeof value === "string") {
        draft[field] = value
      }
    }
    return draft as Partial<FitnessFormData>
  } catch {
    return {}
  }
}

function writeDraft(data: FitnessFormData) {
  try {
    const draft = Object.fromEntries(PERSISTED_FITNESS_FIELDS.map((field) => [field, data[field]]))
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // armazenamento indisponível (modo privado, cota cheia): segue sem salvar
  }
}

function clearDraft() {
  try {
    window.localStorage.removeItem(DRAFT_KEY)
  } catch {
    // nada a fazer
  }
}

/**
 * Liga o catálogo ao construtor: escolher um arquivo numa pasta atualiza o
 * construtor, rola até ele e move o foco para o título.
 */
export function PromptStudio() {
  const [selection, setSelection] = useState<BuilderSelection>({ kind: "fitness" })
  const [fitness, setFitness] = useState<FitnessFormData>(EMPTY_FITNESS_FORM)
  const [templates, setTemplates] = useState<Record<string, TemplateValues>>({})
  const headingRef = useRef<HTMLHeadingElement>(null)
  // o rascunho só é lido no cliente; no servidor (e na hidratação) ele é null
  const storedDraft = useSyncExternalStore(subscribeStorage, readRawDraft, () => null)
  const [dirty, setDirty] = useState(false)
  const draft = dirty ? {} : parseDraft(storedDraft)
  const hasDraft = Object.keys(draft).length > 0

  // salva só depois de alguma interação, para não sobrescrever um rascunho anterior
  useEffect(() => {
    if (dirty) writeDraft(fitness)
  }, [dirty, fitness])

  const edit = (update: (current: FitnessFormData) => FitnessFormData) => {
    setFitness(update)
    setDirty(true)
  }

  const goToBuilder = useCallback(() => {
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      document.getElementById("criar")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
      headingRef.current?.focus({ preventScroll: true })
    })
  }, [])

  const handleCatalogSelect = (item: CatalogItem) => {
    if (item.kind === "fitness") {
      setSelection({ kind: "fitness" })
      edit((current) => ({ ...current, goal: item.goal }))
    } else {
      setSelection({ kind: "template", templateId: item.templateId })
    }
    goToBuilder()
  }

  const handleFitnessChange = <K extends FitnessField>(field: K, value: FitnessFormData[K]) =>
    edit((current) => ({ ...current, [field]: value }))

  return (
    <>
      <PromptCatalog onSelect={handleCatalogSelect} />
      <PromptBuilder
        selection={selection}
        onSelectionChange={setSelection}
        headingRef={headingRef}
        fitnessData={fitness}
        onFitnessChange={handleFitnessChange}
        onFitnessReset={() => {
          clearDraft()
          setFitness(EMPTY_FITNESS_FORM)
          setDirty(false)
        }}
        draftAvailable={hasDraft}
        onRestoreDraft={() => edit((current) => ({ ...current, ...draft }))}
        onDiscardDraft={() => {
          clearDraft()
          setDirty(true)
        }}
        templateValues={templates}
        onTemplateChange={(templateId, fieldId, value) =>
          setTemplates((current) => ({ ...current, [templateId]: { ...current[templateId], [fieldId]: value } }))
        }
        onTemplateReset={(templateId) =>
          setTemplates((current) => {
            const next = { ...current }
            delete next[templateId]
            return next
          })
        }
      />
    </>
  )
}
