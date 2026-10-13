"use client"

import { useMemo, useState, type ReactNode, type Ref } from "react"
import { Bot, History, ListChecks, MessagesSquare } from "lucide-react"

import { FieldShell, controlClass } from "@/components/form-controls"
import { FitnessForm, fitnessFieldId } from "@/components/fitness-form"
import { PromptOutput } from "@/components/prompt-output"
import { TemplateForm, templateFieldId } from "@/components/template-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  FITNESS_INTERVIEW_PROMPT,
  REQUIRED_FITNESS_FIELDS,
  buildFitnessPrompt,
  buildTemplateInterviewPrompt,
  buildTemplatePrompt,
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

function withExtraContext(prompt: string, extra: string) {
  const text = extra.trim()
  if (!text) return prompt
  return `${prompt}\n\n## Contexto que já posso adiantar\n${text}\n\nConsidere esse contexto e não repita perguntas que ele já responde.`
}

function InterviewIntro() {
  return (
    <p className="text-sm leading-relaxed text-muted-foreground">
      Prefere conversar? Copie este prompt: a IA explica como vai funcionar, faz as perguntas em blocos curtos, confirma
      o seu perfil e só depois entrega o resultado.
    </p>
  )
}

function ExtraContextField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <FieldShell id={id} label="Quer adiantar algum contexto?" hint="Opcional. Será adicionado ao final do prompt.">
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={`${id}-hint`}
        className="min-h-24 rounded-xl bg-card px-3"
        placeholder="Ex.: treino há 2 anos, tenho 4 dias livres"
      />
    </FieldShell>
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
      <div className="min-w-0 rounded-3xl border border-border bg-background/60 p-5 sm:p-7">{form}</div>
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
  const [extra, setExtra] = useState("")

  const allErrors = useMemo(() => validateFitness(data), [data])
  const missing = Object.keys(allErrors).length
  const visibleErrors: ValidationErrors<FitnessField> = showAll
    ? allErrors
    : Object.fromEntries(Object.entries(allErrors).filter(([k]) => touched.has(k as FitnessField)))
  const prompt = missing === 0 ? buildFitnessPrompt(data) : null

  const reset = () => {
    setTouched(new Set())
    setShowAll(false)
    onReset()
  }

  if (tab === "ia") {
    return (
      <TwoColumns
        form={
          <div className="flex flex-col gap-5">
            <InterviewIntro />
            <ExtraContextField id="fit-interview-extra" value={extra} onChange={setExtra} />
          </div>
        }
        output={
          <PromptOutput
            id="fitness-interview-output"
            title="Prompt de entrevista"
            prompt={withExtraContext(FITNESS_INTERVIEW_PROMPT, extra)}
            empty={null}
            onClear={() => setExtra("")}
            clearDisabled={!extra}
          />
        }
      />
    )
  }

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
          prompt={prompt}
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

// ---- modelos experimentais ---------------------------------------------------

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
  const [extra, setExtra] = useState("")

  const allErrors = validateTemplate(template, values)
  const missing = Object.keys(allErrors).length
  const visibleErrors = showAll
    ? allErrors
    : Object.fromEntries(Object.entries(allErrors).filter(([k]) => touched.has(k)))
  const prompt = missing === 0 ? buildTemplatePrompt(template, values) : null

  if (tab === "ia") {
    return (
      <TwoColumns
        form={
          <div className="flex flex-col gap-5">
            <InterviewIntro />
            <ExtraContextField id={`tpl-${template.id}-extra`} value={extra} onChange={setExtra} />
          </div>
        }
        output={
          <PromptOutput
            id={`${template.id}-interview-output`}
            title="Prompt de entrevista"
            prompt={withExtraContext(buildTemplateInterviewPrompt(template), extra)}
            empty={null}
            onClear={() => setExtra("")}
            clearDisabled={!extra}
          />
        }
      />
    )
  }

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
          prompt={prompt}
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

const selectionKey = (s: BuilderSelection) => (s.kind === "fitness" ? "fitness" : `template:${s.templateId}`)

function ModelPicker({ value, onChange }: { value: BuilderSelection; onChange: (s: BuilderSelection) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:w-72">
      <label htmlFor="builder-model" className="text-sm font-medium">
        Modelo de prompt
      </label>
      <select
        id="builder-model"
        value={selectionKey(value)}
        onChange={(e) => {
          const v = e.target.value
          onChange(v === "fitness" ? { kind: "fitness" } : { kind: "template", templateId: v.slice("template:".length) })
        }}
        className={`${controlClass} w-full border border-input text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm`}
      >
        {PROMPT_CATEGORIES.map((category) =>
          category.id === "fitness" ? (
            <option key="fitness" value="fitness">
              Fitness — Personal IA
            </option>
          ) : (
            <optgroup key={category.id} label={`${category.title} (experimental)`}>
              {category.items.map((item) =>
                item.kind === "template" ? (
                  <option key={item.id} value={`template:${item.templateId}`}>
                    {item.title}
                  </option>
                ) : null,
              )}
            </optgroup>
          ),
        )}
      </select>
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
  const template = selection.kind === "template" ? getTemplate(selection.templateId) : undefined
  const isFitness = !template

  return (
    <section id="criar" aria-labelledby="criar-titulo" className="scroll-mt-16 border-t border-border/70 bg-card/40 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium tracking-[0.16em] text-brand-rust uppercase">Construtor de prompt</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2
                id="criar-titulo"
                ref={headingRef}
                tabIndex={-1}
                className="rounded-md text-3xl font-semibold tracking-[-0.03em] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:text-4xl"
              >
                {isFitness ? "Personal IA" : template.title}
              </h2>
              {isFitness ? (
                <Badge className="h-6 bg-brand-coral-soft px-2.5 text-brand-rust">Principal</Badge>
              ) : (
                <Badge variant="outline" className="h-6 px-2.5">
                  Experimental
                </Badge>
              )}
            </div>
            <p className="mt-4 text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              {isFitness
                ? "Gere um prompt de treino com seu objetivo, rotina, equipamentos e limitações, pronto para colar na sua IA."
                : template.description}
            </p>
          </div>
          <ModelPicker value={selection} onChange={onSelectionChange} />
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} className="mt-10 gap-6">
          <TabsList className="grid h-auto! w-full grid-cols-2 rounded-full bg-muted p-1 sm:inline-flex sm:w-fit">
            <TabsTrigger value="site" className="h-auto min-h-10 rounded-full px-3 py-1.5 text-[13px] leading-tight whitespace-normal sm:px-4 sm:text-sm sm:whitespace-nowrap">
              <MessagesSquare aria-hidden="true" className="hidden sm:block" />
              Personalizar no site
            </TabsTrigger>
            <TabsTrigger value="ia" className="h-auto min-h-10 rounded-full px-3 py-1.5 text-[13px] leading-tight whitespace-normal sm:px-4 sm:text-sm sm:whitespace-nowrap">
              <Bot aria-hidden="true" className="hidden sm:block" />
              Deixar a IA perguntar
            </TabsTrigger>
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
