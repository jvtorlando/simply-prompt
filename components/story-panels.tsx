"use client"

import { useId, useMemo, useState, type ReactNode } from "react"
import { CircleHelp, ListChecks, PenLine } from "lucide-react"

import { FieldError } from "@/components/form-controls"
import { LensChoice } from "@/components/lens-choice"
import { PromptOutput } from "@/components/prompt-output"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DAYS_OPTIONS, DURATION_OPTIONS, LOCATION_OPTIONS } from "@/lib/fitness-options"
import {
  STORY_INPUT_LIMIT,
  STORY_PROMPT_LIMIT,
  buildStoryFitnessPrompt,
  buildTemplateStoryPrompt,
  needsLossCheck,
  parseStory,
  storyHints,
  storyMissing,
  summarizeProfile,
  type StoryAnswers,
  type StoryMissing,
} from "@/lib/prompt-builders"
import { parseHeightCm } from "@/lib/text-intelligence"
import { cn } from "@/lib/utils"
import type { PromptTemplate, TrainingLocation } from "@/types/prompt"

const numberFormat = new Intl.NumberFormat("pt-BR")

const PROJECT_TIP =
  "Cole nas instruções de um Projeto no Claude ou no ChatGPT: assim a IA lembra disso em todas as conversas."

// ---- peças ---------------------------------------------------------------------------

function StoryInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const atLimit = value.length >= STORY_INPUT_LIMIT
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          Sua história, objetivos e rotina
        </label>
        <span
          id={`${id}-count`}
          className={cn("text-xs tabular-nums", atLimit ? "text-destructive" : "text-muted-foreground")}
        >
          {numberFormat.format(value.length)} / {numberFormat.format(STORY_INPUT_LIMIT)}
        </span>
      </div>
      <Textarea
        id={id}
        value={value}
        maxLength={STORY_INPUT_LIMIT}
        onChange={(e) => onChange(e.target.value.slice(0, STORY_INPUT_LIMIT))}
        aria-describedby={`${id}-count${atLimit ? ` ${id}-limit` : ""}`}
        placeholder={placeholder}
        className="glass min-h-64 rounded-2xl border-0 px-4 py-3 text-base leading-relaxed md:text-[15px]"
      />
      <FieldError id={`${id}-limit`} message={atLimit ? "Limite de 3.000 caracteres. Resuma o que for menos importante." : undefined} />
    </div>
  )
}

function HowItReads({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
      <CircleHelp className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  )
}

function QuickField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      {children}
    </fieldset>
  )
}

function Empty({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {icon}
      <div>{children}</div>
    </div>
  )
}

function StoryLayout({ form, output }: { form: ReactNode; output: ReactNode }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8">
      <div className="flex min-w-0 flex-col gap-6 lg:pr-4">{form}</div>
      <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">{output}</div>
    </div>
  )
}

const MISSING_LABEL: Record<StoryMissing, string> = {
  height: "altura",
  days: "dias por semana",
  minutes: "tempo por treino",
  location: "local de treino",
  injuries: "lesões ou dores",
}

// ---- Personal IA ---------------------------------------------------------------------------

export function FitnessStoryPanel() {
  const uid = useId()
  const [story, setStory] = useState("")
  const [answers, setAnswers] = useState<StoryAnswers>({})
  const [heightText, setHeightText] = useState("")

  const { profile, adjustments } = useMemo(() => parseStory(story), [story])
  const hasStory = story.trim().length >= 20
  const missing = hasStory ? storyMissing(profile, answers) : []
  const understood = hasStory ? summarizeProfile(profile) : []
  const result = hasStory && missing.length === 0 ? buildStoryFitnessPrompt(profile, answers) : null
  const set = (patch: Partial<StoryAnswers>) => setAnswers((a) => ({ ...a, ...patch }))

  // o que perguntar: só o que o texto não trouxe
  const asks = hasStory ? storyMissing(profile, {}) : []

  return (
    <StoryLayout
      form={
        <>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Escreva do seu jeito: quem você é, histórico de treino e esporte, peso, objetivos, rotina e o que já funcionou
            para você. O prompt sai pronto para salvar nas instruções de um projeto.
          </p>

          <StoryInput
            id={`${uid}-story`}
            value={story}
            onChange={setStory}
            placeholder="Ex.: Tenho 28 anos, 1,75 m e 80 kg. Jogo futebol aos domingos e quero perder gordura sem perder força. Treino 3 vezes por semana, 45 min, na academia do prédio. Sem lesões…"
          />

          {understood.length > 0 ? (
            <section aria-label="O que entendemos do seu texto" className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">O que entendemos</h3>
              <dl className="flex flex-wrap gap-2">
                {understood.map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-baseline gap-1.5 rounded-full border px-3 py-1.5 text-sm",
                      item.confirm ? "border-brand-rust/40 bg-brand-coral-soft" : "border-foreground/10 bg-white/50",
                    )}
                  >
                    <dt className="text-muted-foreground">{item.label}:</dt>
                    <dd className="font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {asks.length > 0 || (hasStory && needsLossCheck(profile)) ? (
            <section aria-label="Complete o que faltou" className="flex flex-col gap-5 rounded-3xl border border-foreground/10 bg-white/40 p-5">
              <h3 className="text-sm font-medium">Complete o que o texto não trouxe</h3>

              {asks.includes("height") ? (
                <QuickField label={`Você escreveu algo como "tenho ${String(profile.heightGuessCm ?? "").slice(1)}". Qual é a sua altura?`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <LensChoice
                      name={`${uid}-height`}
                      value={answers.heightCm === profile.heightGuessCm ? "guess" : ""}
                      onChange={() => {
                        set({ heightCm: profile.heightGuessCm })
                        setHeightText("")
                      }}
                      options={[{ value: "guess", label: `${((profile.heightGuessCm ?? 0) / 100).toFixed(2).replace(".", ",")} m` }]}
                    />
                    <Input
                      aria-label="Outra altura"
                      value={heightText}
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="Outra: 1,80…"
                      onChange={(e) => {
                        setHeightText(e.target.value)
                        const cm = parseHeightCm(e.target.value)
                        set({ heightCm: cm && cm >= 100 && cm <= 250 ? cm : undefined })
                      }}
                      className="glass h-11 w-36 rounded-full px-4"
                    />
                  </div>
                </QuickField>
              ) : null}

              {asks.includes("days") ? (
                <QuickField label="Quantos dias por semana pode treinar?">
                  <LensChoice
                    name={`${uid}-days`}
                    value={answers.days ? String(answers.days) : ""}
                    onChange={(v) => set({ days: Number(v) })}
                    options={DAYS_OPTIONS}
                  />
                </QuickField>
              ) : null}

              {asks.includes("minutes") ? (
                <QuickField label="Quanto tempo por treino?">
                  <LensChoice
                    name={`${uid}-minutes`}
                    value={answers.minutes ? String(answers.minutes) : ""}
                    onChange={(v) => set({ minutes: Number(v) })}
                    options={DURATION_OPTIONS}
                  />
                </QuickField>
              ) : null}

              {asks.includes("location") ? (
                <QuickField label="Onde vai treinar?">
                  <LensChoice
                    name={`${uid}-location`}
                    value={answers.location ?? ""}
                    onChange={(v) => set({ location: v as TrainingLocation })}
                    options={LOCATION_OPTIONS}
                  />
                </QuickField>
              ) : null}

              {asks.includes("injuries") ? (
                <QuickField label="Tem alguma lesão, dor ou limitação?">
                  <LensChoice
                    name={`${uid}-injuries`}
                    value={answers.noInjuries ? "none" : answers.injuries !== undefined ? "some" : ""}
                    onChange={(v) => set(v === "none" ? { noInjuries: true, injuries: undefined } : { noInjuries: false, injuries: answers.injuries ?? "" })}
                    options={[
                      { value: "none", label: "Nenhuma" },
                      { value: "some", label: "Sim, tenho" },
                    ]}
                  />
                  {answers.injuries !== undefined && !answers.noInjuries ? (
                    <Input
                      aria-label="Descreva a lesão, dor ou limitação"
                      value={answers.injuries}
                      autoComplete="off"
                      placeholder="Ex.: dor no joelho direito ao agachar…"
                      onChange={(e) => set({ injuries: e.target.value })}
                      className="glass mt-2 h-11 rounded-xl px-3"
                    />
                  ) : null}
                </QuickField>
              ) : null}

              {hasStory && needsLossCheck(profile) ? (
                <QuickField label={`Você perdeu ~${profile.weightLossKg} kg. Teve um motivo claro, como parar de treinar ou comer menos? (opcional)`}>
                  <LensChoice
                    name={`${uid}-loss`}
                    value={answers.lossExplained === undefined ? "" : answers.lossExplained ? "yes" : "no"}
                    onChange={(v) => set({ lossExplained: v === "yes" })}
                    options={[
                      { value: "yes", label: "Sim, teve motivo" },
                      { value: "no", label: "Não sei explicar" },
                    ]}
                  />
                </QuickField>
              ) : null}
            </section>
          ) : null}

          <HowItReads>
            A leitura é feita por regras, aqui no seu navegador, não por uma IA. Ela reconhece números (idade, altura,
            peso, metas e prazos), esportes, objetivos, grupos musculares, suplementos, dias, tempo, local e menções a dor
            ou lesão. O que ela não reconhece vai para o prompt em &quot;Outros detalhes que contei&quot;, para a IA do seu
            projeto interpretar. Seu texto não é salvo nem enviado.
          </HowItReads>
        </>
      }
      output={
        <PromptOutput
          id={`${uid}-output`}
          title="Prompt do seu projeto"
          prompt={result?.prompt ?? null}
          limit={STORY_PROMPT_LIMIT}
          adjustments={adjustments}
          attention={result?.attention}
          tip={PROJECT_TIP}
          empty={
            !hasStory ? (
              <Empty icon={<PenLine className="size-6 text-muted-foreground" aria-hidden="true" />}>
                Conte sua história ao lado. O prompt aparece aqui, pronto para salvar.
              </Empty>
            ) : (
              <Empty icon={<ListChecks className="size-6 text-muted-foreground" aria-hidden="true" />}>
                Falta completar: {missing.map((m) => MISSING_LABEL[m]).join(", ")}.
              </Empty>
            )
          }
          onClear={() => {
            setStory("")
            setAnswers({})
            setHeightText("")
          }}
          clearDisabled={!story && Object.keys(answers).length === 0}
        />
      }
    />
  )
}

// ---- modelos guiados ---------------------------------------------------------------------

export function TemplateStoryPanel({ template }: { template: PromptTemplate }) {
  const uid = useId()
  const [story, setStory] = useState("")
  const hasStory = story.trim().length >= 20
  const result = hasStory ? buildTemplateStoryPrompt(template, story) : null
  const hints = storyHints(template)

  return (
    <StoryLayout
      form={
        <>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Escreva do seu jeito o que você precisa. O texto entra no prompt junto com as instruções do modelo, pronto para
            salvar nas instruções de um projeto.
          </p>
          <StoryInput
            id={`${uid}-story`}
            value={story}
            onChange={setStory}
            placeholder="Conte sua situação, o que você quer alcançar e o que já tentou…"
          />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Vale contar</p>
            <ul className="flex flex-wrap gap-2">
              {hints.map((hint) => (
                <li key={hint} className="rounded-full border border-foreground/10 bg-white/50 px-3 py-1.5 text-sm text-muted-foreground">
                  {hint}
                </li>
              ))}
            </ul>
          </div>
          <HowItReads>
            Nada é enviado: o texto vai para o prompt como você escreveu, com pequenas correções de português quando não
            for um texto colado. A IA do seu projeto interpreta e só pergunta o que faltar de essencial.
          </HowItReads>
        </>
      }
      output={
        <PromptOutput
          id={`${uid}-output`}
          title="Prompt do seu projeto"
          prompt={result?.prompt ?? null}
          limit={STORY_PROMPT_LIMIT}
          adjustments={result?.adjustments}
          tip={PROJECT_TIP}
          empty={
            <Empty icon={<PenLine className="size-6 text-muted-foreground" aria-hidden="true" />}>
              Conte sua situação ao lado. O prompt aparece aqui, pronto para salvar.
            </Empty>
          }
          onClear={() => setStory("")}
          clearDisabled={!story}
        />
      }
    />
  )
}
