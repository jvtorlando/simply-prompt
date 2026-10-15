import { bulletList, clean, formatDate, numberedList } from "@/lib/prompt-utils"
import { STORY_PROMPT_LIMIT } from "@/lib/story-fitness"
import { normalizeFreeText, type TextAdjustment } from "@/lib/text-intelligence"
import type { PromptTemplate, TemplateValues, ValidationErrors } from "@/types/prompt"

export * from "@/lib/fitness-prompt"
export * from "@/lib/story-fitness"
export { formatDate } from "@/lib/prompt-utils"

// ---- modelos experimentais -------------------------------------------------

export function validateTemplate(template: PromptTemplate, values: TemplateValues): ValidationErrors {
  const errors: ValidationErrors = {}
  for (const field of template.fields) {
    if (field.required && !(values[field.id] ?? "").trim()) {
      errors[field.id] =
        field.kind === "select" ? `Escolha uma opção em "${field.label}".` : `Preencha "${field.label}".`
    }
  }
  return errors
}

const SHARED_TEMPLATE_RULES = [
  "Responda em português do Brasil, em linguagem clara e direta.",
  "Não invente informações que eu não forneci. Se precisar supor algo, deixe a suposição explícita.",
  "Se não tiver certeza de algo, diga isso em vez de afirmar com segurança.",
  "Minhas respostas foram digitadas por mim e podem ter erros de escrita ou abreviações: interprete pela intenção e pergunte se algo for ambíguo.",
  "Explique termos técnicos de forma simples na primeira vez que aparecerem.",
]

/** Textos longos ou com várias linhas entram entre aspas triplas, para a IA separar dado de instrução. */
function formatAnswer(label: string, kind: string, value: string): string {
  const text = kind === "date" ? formatDate(value) : clean(value)
  if (text.includes("\n") || text.length > 160) return `- ${label}:\n"""\n${text}\n"""`
  return `- ${label}: ${text}`
}

/** Troca {idioma} pelo idioma escolhido (ou por um termo genérico) em todos os textos do modelo. */
function withLanguage(template: PromptTemplate, language: string | undefined): PromptTemplate {
  const name = language ? language.toLowerCase() : "idioma estrangeiro"
  const fill = (text: string) => text.replaceAll("{idioma}", name)
  const fillAll = (items: string[]) => items.map(fill)
  return {
    ...template,
    role: fill(template.role),
    objective: fill(template.objective),
    method: fillAll(template.method),
    rules: fillAll(template.rules),
    outputFormat: fillAll(template.outputFormat),
    checks: fillAll(template.checks),
    clarify: fillAll(template.clarify),
  }
}

export type TemplatePromptResult = { prompt: string; adjustments: TextAdjustment[] }

/**
 * Monta o prompt de um modelo guiado. Respostas digitadas passam pelo corretor de português;
 * textos colados (vaga, currículo, texto em inglês) entram exatamente como vieram.
 */
export function buildTemplatePromptDetailed(source: PromptTemplate, values: TemplateValues): TemplatePromptResult {
  const template = withLanguage(source, values.idioma)
  const adjustments: TextAdjustment[] = []
  const answers = template.fields
    .map((field) => {
      const raw = (values[field.id] ?? "").trim()
      if (!raw) return null
      let value = raw
      if (!field.raw && (field.kind === "text" || field.kind === "textarea")) {
        const result = normalizeFreeText(raw)
        value = result.text
        for (const change of result.adjustments) {
          if (!adjustments.some((a) => a.from === change.from && a.to === change.to)) adjustments.push(change)
        }
      }
      return formatAnswer(field.label, field.kind, value)
    })
    .filter(Boolean)

  const prompt = `# ${template.title}

## 1. Seu papel
Atue como ${template.role}.

## 2. Objetivo
${template.objective}

## 3. Meu contexto
${answers.join("\n")}

## 4. Como trabalhar
${numberedList(template.method)}

## 5. Regras
${bulletList([...template.rules, ...SHARED_TEMPLATE_RULES])}

## 6. Formato da resposta
${numberedList(template.outputFormat)}

## 7. Antes de responder, confira
${bulletList(template.checks)}

## 8. Se faltar informação
Se algo essencial estiver faltando (por exemplo: ${template.clarify.join("; ")}), faça no máximo cinco perguntas objetivas antes de responder. Se tudo estiver claro, responda direto e termine perguntando o que devo ajustar.`

  return { prompt, adjustments }
}

export const buildTemplatePrompt = (template: PromptTemplate, values: TemplateValues): string =>
  buildTemplatePromptDetailed(template, values).prompt

// ---- modo "contar com minhas palavras" -------------------------------------------

const LANGUAGES: [string, RegExp][] = [
  ["inglês", /ingles|english/],
  ["espanhol", /espanhol|spanish/],
  ["francês", /frances|french/],
  ["italiano", /italiano/],
  ["alemão", /alemao|german/],
  ["japonês", /japones/],
  ["mandarim", /mandarim|chines/],
]

/**
 * Prompt pronto a partir de um texto livre. O texto vai inteiro para a seção de contexto;
 * respostas digitadas são corrigidas, mas modelos que recebem texto colado (vaga, currículo,
 * texto em outro idioma) mantêm o texto exatamente como veio.
 */
export function buildTemplateStoryPrompt(source: PromptTemplate, story: string): TemplatePromptResult {
  const plain = story.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  const language = LANGUAGES.find(([, r]) => r.test(plain))?.[0]
  const template = withLanguage(source, language)
  const keepAsIs = source.fields.some((f) => f.raw)
  const normalized = keepAsIs ? { text: clean(story), adjustments: [] } : normalizeFreeText(story)
  const essentials = source.fields.filter((f) => f.required).map((f) => f.label.toLowerCase())

  const prompt = `# ${template.title}

## 1. Seu papel
Atue como ${template.role}.

## 2. Objetivo
${template.objective}

## 3. Minha situação, nas minhas palavras
"""
${normalized.text}
"""

## 4. Como trabalhar
${numberedList(template.method)}

## 5. Regras
${bulletList([...template.rules, ...SHARED_TEMPLATE_RULES])}

## 6. Formato da resposta
${numberedList(template.outputFormat)}

## 7. Antes de responder, confira
${bulletList(template.checks)}

## 8. Se faltar informação
Use o que eu contei acima. Se faltar algo essencial (${[...essentials, ...template.clarify].join("; ")}), pergunte só isso, de forma curta, antes de responder.`

  return { prompt: prompt.slice(0, STORY_PROMPT_LIMIT), adjustments: normalized.adjustments }
}

/** Dicas do que vale contar no texto livre de um modelo. */
export const storyHints = (template: PromptTemplate) => template.fields.filter((f) => f.required).map((f) => f.label)
