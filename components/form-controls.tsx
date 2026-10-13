"use client"

import type { ReactNode } from "react"
import { ChevronDown, CircleAlert } from "lucide-react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

/** Classes compartilhadas por Input, Textarea e select nativo. */
export const controlClass = "h-11 rounded-xl bg-card px-3"

type FieldShellProps = {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  className?: string
  children: ReactNode
}

/** Label, dica e mensagem de erro em volta de um único controle. */
export function FieldShell({ id, label, required, hint, error, className, children }: FieldShellProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <Label htmlFor={id} className="leading-snug">
        {label}
        {required ? <RequiredMark /> : <span className="font-normal text-muted-foreground">(opcional)</span>}
      </Label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

export function RequiredMark() {
  return (
    <>
      <span aria-hidden="true" className="text-brand-rust">
        *
      </span>
      <span className="sr-only">(obrigatório)</span>
    </>
  )
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-destructive">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  )
}

/** `aria-describedby` para um controle com dica e/ou erro. */
export function describedBy(id: string, hint?: string, error?: string): string | undefined {
  const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean)
  return ids.length ? ids.join(" ") : undefined
}

type NativeSelectProps = {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: { value: string; label: string }[]
  placeholder?: string
  invalid?: boolean
  describedById?: string
  required?: boolean
}

/** Select nativo: melhor experiência em celulares e leitores de tela. */
export function NativeSelect({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Selecione",
  invalid,
  describedById,
  required,
}: NativeSelectProps) {
  return (
    <div className="relative min-w-0">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={describedById}
        aria-required={required || undefined}
        className={cn(
          controlClass,
          "w-full min-w-0 appearance-none border border-input pr-9 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm",
          !value && "text-muted-foreground",
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-foreground">
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

type ChoiceGroupProps = {
  /** Id do primeiro input, para receber foco quando houver erro. */
  id: string
  name: string
  legend: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  error?: string
  columns?: string
}

/** Grupo de rádio com aparência de botões, usável por teclado (setas) e toque. */
export function ChoiceGroup({ id, name, legend, value, onChange, options, error, columns }: ChoiceGroupProps) {
  const errorId = `${id}-error`
  return (
    <fieldset aria-describedby={error ? errorId : undefined} className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 flex items-center gap-2 text-sm leading-snug font-medium">
        {legend}
        <RequiredMark />
      </legend>
      <div className={cn("grid gap-2", columns ?? "grid-cols-2 sm:grid-cols-3")}>
        {options.map((o, i) => (
          <label
            key={o.value}
            className={cn(
              "relative flex min-h-11 cursor-pointer items-center rounded-xl border border-input bg-card px-3 py-2 text-sm transition-colors select-none hover:border-foreground/30",
              "has-checked:border-foreground has-checked:bg-foreground has-checked:text-background",
              "has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              error && !value && "border-destructive/60",
            )}
          >
            <input
              id={i === 0 ? id : undefined}
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              aria-invalid={(error && !value) || undefined}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
      <FieldError id={errorId} message={error} />
    </fieldset>
  )
}
