"use client"

import type { ChangeEvent, ReactNode } from "react"
import { Info } from "lucide-react"

import { ChoiceGroup, FieldError, FieldShell, NativeSelect, RequiredMark, controlClass, describedBy } from "@/components/form-controls"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ACTIVITY_OPTIONS,
  DAYS_OPTIONS,
  DURATION_OPTIONS,
  EQUIPMENT_OPTIONS,
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  LOCATION_OPTIONS,
  SEX_OPTIONS,
  SLEEP_OPTIONS,
} from "@/lib/fitness-options"
import { cn } from "@/lib/utils"
import type { FitnessField, FitnessFormData, ValidationErrors } from "@/types/prompt"

/** Id do elemento que recebe foco quando o campo tem erro. */
export const fitnessFieldId = (field: FitnessField) => `fit-${field}`

type FitnessFormProps = {
  data: FitnessFormData
  errors: ValidationErrors<FitnessField>
  onChange: <K extends FitnessField>(field: K, value: FitnessFormData[K]) => void
  onBlur: (field: FitnessField) => void
}

function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 border-t border-border pt-6 first:border-t-0 first:pt-0">
      <div>
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  )
}

export function FitnessForm({ data, errors, onChange, onBlur }: FitnessFormProps) {
  const text = (field: "sports" | "preferredExercises" | "dislikedExercises" | "scheduleConstraints" | "deadline" | "otherEquipment") => ({
    id: fitnessFieldId(field),
    value: data[field],
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field, e.target.value),
  })

  const numeric = (field: "age" | "height" | "weight", hint: string) => ({
    id: fitnessFieldId(field),
    value: data[field],
    inputMode: "decimal" as const,
    autoComplete: "off",
    onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(field, e.target.value),
    onBlur: () => onBlur(field),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-required": true,
    "aria-describedby": describedBy(fitnessFieldId(field), hint, errors[field]),
    className: controlClass,
  })

  const toggleEquipment = (value: string, checked: boolean) => {
    const next = checked ? [...data.equipment, value] : data.equipment.filter((v) => v !== value)
    onChange("equipment", next)
  }

  return (
    <div className="flex flex-col gap-8">
      <Group title="Objetivo">
        <ChoiceGroup
          id={fitnessFieldId("goal")}
          name="goal"
          legend="Objetivo principal"
          value={data.goal}
          onChange={(v) => onChange("goal", v as FitnessFormData["goal"])}
          options={GOAL_OPTIONS}
          error={errors.goal}
          columns="grid-cols-1 sm:grid-cols-2"
        />
      </Group>

      <Group title="Sobre você" description="Usado apenas para ajustar volume e intensidade. Não pedimos nome, e-mail ou telefone.">
        <div className="grid gap-4 sm:grid-cols-3">
          <FieldShell id={fitnessFieldId("age")} label="Idade" required hint="Em anos" error={errors.age}>
            <Input {...numeric("age", "Em anos")} placeholder="Ex.: 28" />
          </FieldShell>
          <FieldShell id={fitnessFieldId("height")} label="Altura" required hint="Em centímetros" error={errors.height}>
            <Input {...numeric("height", "Em centímetros")} placeholder="Ex.: 172" />
          </FieldShell>
          <FieldShell id={fitnessFieldId("weight")} label="Peso" required hint="Em quilogramas" error={errors.weight}>
            <Input {...numeric("weight", "Em quilogramas")} placeholder="Ex.: 74,5" />
          </FieldShell>
        </div>
        <ChoiceGroup
          id={fitnessFieldId("level")}
          name="level"
          legend="Nível de experiência"
          value={data.level}
          onChange={(v) => onChange("level", v as FitnessFormData["level"])}
          options={LEVEL_OPTIONS}
          error={errors.level}
          columns="grid-cols-1 min-[400px]:grid-cols-3"
        />
        <FieldShell id={fitnessFieldId("sex")} label="Sexo">
          <NativeSelect
            id={fitnessFieldId("sex")}
            value={data.sex}
            onChange={(v) => onChange("sex", v as FitnessFormData["sex"])}
            options={SEX_OPTIONS}
            placeholder="Não informado"
          />
        </FieldShell>
      </Group>

      <Group title="Disponibilidade">
        <ChoiceGroup
          id={fitnessFieldId("daysPerWeek")}
          name="daysPerWeek"
          legend="Quantos dias por semana pode treinar"
          value={data.daysPerWeek}
          onChange={(v) => onChange("daysPerWeek", v)}
          options={DAYS_OPTIONS}
          error={errors.daysPerWeek}
          columns="grid-cols-3 sm:grid-cols-5"
        />
        <ChoiceGroup
          id={fitnessFieldId("sessionMinutes")}
          name="sessionMinutes"
          legend="Tempo disponível por treino"
          value={data.sessionMinutes}
          onChange={(v) => onChange("sessionMinutes", v)}
          options={DURATION_OPTIONS}
          error={errors.sessionMinutes}
          columns="grid-cols-3 sm:grid-cols-5"
        />
        <FieldShell
          id={fitnessFieldId("scheduleConstraints")}
          label="Restrições de horário"
        >
          <Input {...text("scheduleConstraints")} className={controlClass} placeholder="Ex.: só depois das 19h; sábado livre" />
        </FieldShell>
      </Group>

      <Group title="Local e equipamentos">
        <FieldShell id={fitnessFieldId("location")} label="Local de treino" required error={errors.location}>
          <NativeSelect
            id={fitnessFieldId("location")}
            value={data.location}
            onChange={(v) => onChange("location", v as FitnessFormData["location"])}
            onBlur={() => onBlur("location")}
            options={LOCATION_OPTIONS}
            invalid={!!errors.location}
            describedById={describedBy(fitnessFieldId("location"), undefined, errors.location)}
            required
          />
        </FieldShell>

        <fieldset
          aria-describedby={errors.equipment ? `${fitnessFieldId("equipment")}-error` : undefined}
          className="flex min-w-0 flex-col gap-2"
        >
          <legend className="mb-2 flex items-center gap-2 text-sm leading-snug font-medium">
            Equipamentos disponíveis
            <RequiredMark />
          </legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EQUIPMENT_OPTIONS.map((option, i) => {
              const checked = data.equipment.includes(option.value)
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-input bg-card px-3 py-2 text-sm transition-colors hover:border-foreground/30",
                    "has-checked:border-brand-blue has-checked:bg-brand-blue-soft has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
                  )}
                >
                  <input
                    id={i === 0 ? fitnessFieldId("equipment") : undefined}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleEquipment(option.value, e.target.checked)}
                    className="size-4 shrink-0 accent-[var(--brand-blue)]"
                  />
                  {option.label}
                </label>
              )
            })}
          </div>
          <FieldError id={`${fitnessFieldId("equipment")}-error`} message={errors.equipment} />
        </fieldset>
        <FieldShell id={fitnessFieldId("otherEquipment")} label="Outros equipamentos">
          <Input {...text("otherEquipment")} className={controlClass} placeholder="Ex.: step, caixa de salto, TRX" />
        </FieldShell>
      </Group>

      <Group title="Detalhes opcionais" description="Quanto mais contexto, mais específico o plano. Pule o que não quiser responder.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldShell id={fitnessFieldId("sports")} label="Esportes praticados">
            <Input {...text("sports")} className={controlClass} placeholder="Ex.: futebol aos domingos" />
          </FieldShell>
          <FieldShell id={fitnessFieldId("deadline")} label="Prazo ou evento específico">
            <Input {...text("deadline")} className={controlClass} placeholder="Ex.: corrida de 10 km em março" />
          </FieldShell>
          <FieldShell id={fitnessFieldId("preferredExercises")} label="Exercícios preferidos">
            <Input {...text("preferredExercises")} className={controlClass} placeholder="Ex.: agachamento, remada" />
          </FieldShell>
          <FieldShell id={fitnessFieldId("dislikedExercises")} label="Exercícios que não gosta">
            <Input {...text("dislikedExercises")} className={controlClass} placeholder="Ex.: burpee, esteira" />
          </FieldShell>
          <FieldShell id={fitnessFieldId("sleep")} label="Qualidade atual do sono">
            <NativeSelect
              id={fitnessFieldId("sleep")}
              value={data.sleep}
              onChange={(v) => onChange("sleep", v as FitnessFormData["sleep"])}
              options={SLEEP_OPTIONS}
              placeholder="Não informado"
            />
          </FieldShell>
          <FieldShell id={fitnessFieldId("dailyActivity")} label="Nível de atividade diária">
            <NativeSelect
              id={fitnessFieldId("dailyActivity")}
              value={data.dailyActivity}
              onChange={(v) => onChange("dailyActivity", v as FitnessFormData["dailyActivity"])}
              options={ACTIVITY_OPTIONS}
              placeholder="Não informado"
            />
          </FieldShell>
        </div>
        <FieldShell
          id={fitnessFieldId("injuries")}
          label="Lesões, dores ou limitações"
          hint="Não é salvo neste navegador. Se houver dor ou condição clínica, procure avaliação profissional."
        >
          <Textarea
            id={fitnessFieldId("injuries")}
            value={data.injuries}
            onChange={(e) => onChange("injuries", e.target.value)}
            aria-describedby={`${fitnessFieldId("injuries")}-hint`}
            className="min-h-20 rounded-xl bg-card px-3"
            placeholder="Ex.: dor no joelho direito ao agachar fundo"
          />
        </FieldShell>
        <FieldShell id={fitnessFieldId("notes")} label="Observações adicionais" hint="Não é salvo neste navegador.">
          <Textarea
            id={fitnessFieldId("notes")}
            value={data.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            aria-describedby={`${fitnessFieldId("notes")}-hint`}
            className="min-h-20 rounded-xl bg-card px-3"
            placeholder="Algo mais que a IA deveria saber?"
          />
        </FieldShell>
      </Group>

      <p className="flex items-start gap-2 rounded-2xl bg-brand-coral-soft px-4 py-3 text-sm leading-relaxed text-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-brand-rust" aria-hidden="true" />
        Este recurso ajuda a organizar informações e criar instruções para uma IA. Ele não substitui avaliação médica ou
        acompanhamento profissional.
      </p>
    </div>
  )
}
