"use client"

import type { ReactNode } from "react"
import { CircleAlert } from "lucide-react"

import { LensChoice } from "@/components/lens-choice"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

type SelectFieldProps = {
  id: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  options: { value: string; label: string }[]
  placeholder?: string
  /** Rótulo da opção que limpa o campo (para campos opcionais). */
  clearLabel?: string
  invalid?: boolean
  describedById?: string
  required?: boolean
}

const NONE = "__none__"

/** Seletor no padrão do app: gatilho em vidro e lista em vidro, com teclado e leitor de tela. */
export function SelectField({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Selecione…",
  clearLabel,
  invalid,
  describedById,
  required,
}: SelectFieldProps) {
  const items = [
    ...(clearLabel ? [{ value: NONE, label: clearLabel }] : []),
    ...options,
  ]
  return (
    <Select
      items={items}
      value={value === "" ? (clearLabel ? NONE : null) : value}
      onValueChange={(next) => onChange(!next || next === NONE ? "" : next)}
    >
      <SelectTrigger
        id={id}
        onBlur={onBlur}
        aria-invalid={invalid || undefined}
        aria-describedby={describedById}
        aria-required={required || undefined}
        className={cn(
          controlClass,
          "glass w-full justify-between border-input py-0 text-base md:text-sm",
          value === "" && !clearLabel ? "text-muted-foreground" : "text-foreground",
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false} sideOffset={8} className="glass-pop rounded-2xl p-1.5 ring-0">
        {items.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            className="min-h-10 rounded-xl py-2 pr-9 pl-3 text-[15px] focus:bg-foreground/[0.06] focus:text-foreground data-selected:font-medium"
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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

/** Grupo de escolha com lente de vidro: usável por teclado (setas) e toque. */
export function ChoiceGroup({ id, name, legend, value, onChange, options, error }: ChoiceGroupProps) {
  const errorId = `${id}-error`
  return (
    <fieldset aria-describedby={error ? errorId : undefined} className="flex min-w-0 flex-col gap-2">
      <legend className="mb-2 flex items-center gap-2 text-sm leading-snug font-medium">
        {legend}
        <RequiredMark />
      </legend>
      <LensChoice
        name={name}
        value={value}
        onChange={onChange}
        options={options}
        firstId={id}
        invalid={!!error}
      />
      <FieldError id={errorId} message={error} />
    </fieldset>
  )
}
