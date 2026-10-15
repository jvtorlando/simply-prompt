"use client"

import { FieldShell, SelectField, controlClass, describedBy } from "@/components/form-controls"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { PromptTemplate, TemplateValues, ValidationErrors } from "@/types/prompt"

export const templateFieldId = (templateId: string, fieldId: string) => `tpl-${templateId}-${fieldId}`

type TemplateFormProps = {
  template: PromptTemplate
  values: TemplateValues
  errors: ValidationErrors
  onChange: (fieldId: string, value: string) => void
  onBlur: (fieldId: string) => void
}

/** Formulário gerado a partir da configuração de um modelo guiado. */
export function TemplateForm({ template, values, errors, onChange, onBlur }: TemplateFormProps) {
  return (
    <div className="grid gap-5">
      {template.fields.map((field) => {
        const id = templateFieldId(template.id, field.id)
        const error = errors[field.id]
        const value = values[field.id] ?? ""
        const shared = {
          id,
          name: field.id,
          autoComplete: "off",
          value,
          onBlur: () => onBlur(field.id),
          "aria-invalid": error ? true : undefined,
          "aria-required": field.required || undefined,
          "aria-describedby": describedBy(id, field.hint, error),
          placeholder: field.placeholder && !field.placeholder.endsWith("…") ? `${field.placeholder}…` : field.placeholder,
        }
        return (
          <FieldShell key={field.id} id={id} label={field.label} required={field.required} hint={field.hint} error={error}>
            {field.kind === "select" ? (
              <SelectField
                id={id}
                value={value}
                onChange={(v) => onChange(field.id, v)}
                onBlur={() => onBlur(field.id)}
                options={field.options ?? []}
                invalid={!!error}
                describedById={shared["aria-describedby"]}
                required={field.required}
              />
            ) : field.kind === "textarea" ? (
              <Textarea
                {...shared}
                onChange={(e) => onChange(field.id, e.target.value)}
                className="min-h-24 rounded-xl bg-card px-3"
              />
            ) : (
              <Input
                {...shared}
                type={field.kind === "date" ? "date" : "text"}
                onChange={(e) => onChange(field.id, e.target.value)}
                className={controlClass}
              />
            )}
          </FieldShell>
        )
      })}
    </div>
  )
}
