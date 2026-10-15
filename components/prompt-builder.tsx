"use client"

import { useMemo, useState, type ReactNode, type Ref } from "react"
import { History, ListChecks, MessagesSquare, PenLine } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

import { LensChoice } from "@/components/lens-choice"
import { FitnessForm, fitnessFieldId } from "@/components/fitness-form"
import { PromptOutput } from "@/components/prompt-output"
import { FitnessStoryPanel, TemplateStoryPanel } from "@/components/story-panels"
import { TemplateForm, templateFieldId } from "@/components/template-form"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  REQUIRED_FITNESS_FIELDS,
  buildFitnessPromptDetailed,
  buildTemplatePromptDetailed,
  validateFitness,
  validateTemplate,
} from "@/lib/prompt-builders"
import { PROMPT_CATEGORIES, getTemplate } from "@/lib/prompt-catalog"
import type {
  BuilderSelection,
  FitnessField,
  FitnessFormData,
  PromptTemplate,
  TemplateValues,
  ValidationErrors,
} from "@/types/prompt"

type Tab = "site" | "ia"

const TAB_ITEMS = [
  { value: "site", label: "Personalizar no site", icon: MessagesSquare },
  { value: "ia", label: "Contar com minhas palavras", icon: PenLine },
] as const

// ---- pedaços compartilhados --------------------------------------------------

function MissingFields({ count, onShow }: { count: number; onShow: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <ListChecks className="size-6 text-muted-foreground" aria-hidden="true" />
      <p>
        {count === 1 ? "Falta 1 campo obrigatório" : `Faltam ${count} campos obrigatórios`} para gerar o prompt.
        <br />
        Ele aparece aqui assim que tudo estiver preenchido.
      </p>
      <Button type="button" variant="outline" className="h-10 rounded-full px-4" onClick={onShow}>
        Mostrar o que falta
      </Button>
    </div>
  )
}

/** Foca o primeiro campo com erro, na ordem dada. */
function focusFirst(ids: string[]) {
  for (const id of ids) {
    const el = document.getElementById(id)
    if (el) {
      el.focus()
      el.scrollIntoView({ block: "center", behavior: "smooth" })
      return
    }
  }
}

function TwoColumns({ form, output }: { form: ReactNode; output: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
      <div className="min-w-0 lg:pr-4">{form}</div>
      <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">{output}</div>
    </div>
  )
}

// ---- Personal IA -------------------------------------------------------------

type DraftProps = {
  draftAvailable: boolean
  onRestoreDraft: () => void
  onDiscardDraft: () => void
}

function DraftNotice({ onRestoreDraft, onDiscardDraft }: Omit<DraftProps, "draftAvailable">) {
  return (
    <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-brand-blue/30 bg-brand-blue-soft px-4 py-3 text-sm sm:flex-row sm:items-center">
      <History className="hidden size-4 shrink-0 text-brand-blue sm:block" aria-hidden="true" />
      <p className="flex-1 leading-relaxed">
        Encontramos preferências de treino salvas neste navegador. Se começar a responder sem restaurar, elas serão
        substituídas.
      </p>
      <div className="flex gap-2">
        <Button type="button" size="sm" className="h-9 rounded-full px-3" onClick={onRestoreDraft}>
          Restaurar
        </Button>
        <Button type="button" size="sm" variant="ghost" className="h-9 rounded-full px-3" onClick={onDiscardDraft}>
          Descartar
        </Button>
      </div>
    </div>
  )
}

type FitnessPanelsProps = DraftProps & {
  tab: Tab
  data: FitnessFormData
  onChange: <K extends FitnessField>(field: K, value: FitnessFormData[K]) => void
  onReset: () => void
}

function FitnessPanels({ tab, data, onChange, onReset, draftAvailable, onRestoreDraft, onDiscardDraft }: FitnessPanelsProps) {
  const [touched, setTouched] = useState<Set<FitnessField>>(() => new Set())
  const [showAll, setShowAll] = useState(false)

  const allErrors = useMemo(() => validateFitness(data), [data])
  const missing = Object.keys(allErrors).length
  const visibleErrors: ValidationErrors<FitnessField> = showAll
    ? allErrors
    : Object.fromEntries(Object.entries(allErrors).filter(([k]) => touched.has(k as FitnessField)))
  const result = useMemo(() => (missing === 0 ? buildFitnessPromptDetailed(data) : null), [missing, data])

  const reset = () => {
    setTouched(new Set())
    setShowAll(false)
    onReset()
  }

  if (tab === "ia") return <FitnessStoryPanel />

  return (
    <TwoColumns
      form={
        <form noValidate onSubmit={(e) => e.preventDefault()} aria-label="Personal IA: suas respostas">
          {draftAvailable ? <DraftNotice onRestoreDraft={onRestoreDraft} onDiscardDraft={onDiscardDraft} /> : null}
          <FitnessForm
            data={data}
            errors={visibleErrors}
            onChange={onChange}
            onBlur={(field) => setTouched((t) => new Set(t).add(field))}
          />
        </form>
      }
      output={
        <PromptOutput
          id="fitness-output"
          title="Seu prompt do Personal IA"
          prompt={result?.prompt ?? null}
          adjustments={result?.adjustments}
          attention={result?.attention}
          empty={
            <MissingFields
              count={missing}
              onShow={() => {
                setShowAll(true)
                focusFirst(REQUIRED_FITNESS_FIELDS.filter((f) => allErrors[f]).map(fitnessFieldId))
              }}
            />
          }
          onClear={reset}
        />
      }
    />
  )
}

// ---- modelos guiados ---------------------------------------------------------

type TemplatePanelsProps = {
  tab: Tab
  template: PromptTemplate
  values: TemplateValues
  onChange: (fieldId: string, value: string) => void
  onReset: () => void
}

function TemplatePanels({ tab, template, values, onChange, onReset }: TemplatePanelsProps) {
  const [touched, setTouched] = useState<Set<string>>(() => new Set())
  const [showAll, setShowAll] = useState(false)

  const allErrors = validateTemplate(template, values)
  const missing = Object.keys(allErrors).length
  const visibleErrors = showAll
    ? allErrors
    : Object.fromEntries(Object.entries(allErrors).filter(([k]) => touched.has(k)))
  const result = missing === 0 ? buildTemplatePromptDetailed(template, values) : null

  if (tab === "ia") return <TemplateStoryPanel template={template} />

  return (
    <TwoColumns
      form={
        <form noValidate onSubmit={(e) => e.preventDefault()} aria-label={`${template.title}: suas respostas`}>
          <TemplateForm
            template={template}
            values={values}
            errors={visibleErrors}
            onChange={onChange}
            onBlur={(fieldId) => setTouched((t) => new Set(t).add(fieldId))}
          />
        </form>
      }
      output={
        <PromptOutput
          id={`${template.id}-output`}
          title={`Seu prompt: ${template.title}`}
          prompt={result?.prompt ?? null}
          adjustments={result?.adjustments}
          empty={
            <MissingFields
              count={missing}
              onShow={() => {
                setShowAll(true)
                focusFirst(template.fields.filter((f) => allErrors[f.id]).map((f) => templateFieldId(template.id, f.id)))
              }}
            />
          }
          onClear={() => {
            setTouched(new Set())
            setShowAll(false)
            onReset()
          }}
        />
      }
    />
  )
}

// ---- construtor ----------------------------------------------------------------

/** Escolha do que criar: categoria em barra de vidro e, nas categorias com vários modelos, os modelos logo abaixo. */
function ModelPicker({ value, onChange }: { value: BuilderSelection; onChange: (s: BuilderSelection) => void }) {
  const activeTemplate = value.kind === "template" ? getTemplate(value.templateId) : undefined
  const categoryId = activeTemplate?.categoryId ?? "fitness"
  const category = PROMPT_CATEGORIES.find((c) => c.id === categoryId) ?? PROMPT_CATEGORIES[0]
  const models = category.items.filter((item) => item.kind === "template")

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <LensChoice
        variant="segment"
        ariaLabel="Categoria do prompt"
        name="builder-category"
        value={categoryId}
        options={PROMPT_CATEGORIES.map((c) => ({ value: c.id, label: c.title }))}
        onChange={(id) => {
          const next = PROMPT_CATEGORIES.find((c) => c.id === id)
          const first = next?.items.find((item) => item.kind === "template")
          onChange(first && first.kind === "template" ? { kind: "template", templateId: first.templateId } : { kind: "fitness" })
        }}
      />
      {models.length > 0 ? (
        <LensChoice
          ariaLabel={`Modelos de ${category.title}`}
          name="builder-model"
          value={activeTemplate?.id ?? ""}
          options={models.map((item) => ({ value: item.kind === "template" ? item.templateId : item.id, label: item.title }))}
          onChange={(id) => onChange({ kind: "template", templateId: id })}
        />
      ) : null}
    </div>
  )
}

type PromptBuilderProps = DraftProps & {
  selection: BuilderSelection
  onSelectionChange: (selection: BuilderSelection) => void
  headingRef: Ref<HTMLHeadingElement>
  fitnessData: FitnessFormData
  onFitnessChange: FitnessPanelsProps["onChange"]
  onFitnessReset: () => void
  templateValues: Record<string, TemplateValues>
  onTemplateChange: (templateId: string, fieldId: string, value: string) => void
  onTemplateReset: (templateId: string) => void
}

export function PromptBuilder({
  selection,
  onSelectionChange,
  headingRef,
  fitnessData,
  onFitnessChange,
  onFitnessReset,
  templateValues,
  onTemplateChange,
  onTemplateReset,
  draftAvailable,
  onRestoreDraft,
  onDiscardDraft,
}: PromptBuilderProps) {
  const [tab, setTab] = useState<Tab>("site")
  const reduceMotion = useReducedMotion()
  const template = selection.kind === "template" ? getTemplate(selection.templateId) : undefined
  const isFitness = !template

  return (
    <section id="criar" aria-labelledby="criar-titulo" className="scroll-mt-16 border-y border-foreground py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div>
          <div className="max-w-2xl">
            <h2
              id="criar-titulo"
              ref={headingRef}
              tabIndex={-1}
              className="rounded-md text-4xl font-semibold tracking-[-0.035em] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-5xl lg:text-6xl"
            >
              {isFitness ? "Personal IA" : template.title}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-pretty text-muted-foreground">
              {isFitness
                ? "Gere um prompt de treino com seu objetivo, rotina, equipamentos e limitações, pronto para colar na sua IA."
                : template.description}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <ModelPicker value={selection} onChange={onSelectionChange} />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-10 gap-6">
          <TabsList variant="line" className="glass h-auto! w-full justify-start gap-0 rounded-full p-1 data-[variant=line]:rounded-full sm:w-fit">
            {TAB_ITEMS.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="relative h-auto min-h-11 min-w-0 flex-1 rounded-full border-0 px-3 py-2 text-center text-sm leading-tight font-medium whitespace-normal text-muted-foreground shadow-none after:hidden data-active:text-foreground sm:flex-none sm:px-4 sm:whitespace-nowrap"
              >
                {tab === item.value ? (
                  <motion.span
                    layoutId="builder-tab-lens"
                    aria-hidden="true"
                    className="lens absolute inset-0 rounded-full"
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="relative z-10 flex items-center gap-2">
                  <item.icon aria-hidden="true" className="hidden sm:block" />
                  {item.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={tab}>
            {isFitness ? (
              <FitnessPanels
                tab={tab}
                data={fitnessData}
                onChange={onFitnessChange}
                onReset={onFitnessReset}
                draftAvailable={draftAvailable}
                onRestoreDraft={onRestoreDraft}
                onDiscardDraft={onDiscardDraft}
              />
            ) : (
              <TemplatePanels
                key={template.id}
                tab={tab}
                template={template}
                values={templateValues[template.id] ?? {}}
                onChange={(fieldId, value) => onTemplateChange(template.id, fieldId, value)}
                onReset={() => onTemplateReset(template.id)}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}
