import { bulletList, clean, formatDate, numberedList } from "@/lib/prompt-utils"
import { normalizeFreeText, type TextAdjustment } from "@/lib/text-intelligence"
import type { PromptTemplate, TemplateValues, ValidationErrors } from "@/types/prompt"

export * from "@/lib/fitness-prompt"
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

export type TemplatePromptResult = { prompt: string; adjustments: TextAdjustment[] }

/**
 * Monta o prompt de um modelo guiado. Respostas digitadas passam pelo corretor de português;
 * textos colados (vaga, currículo, texto em inglês) entram exatamente como vieram.
 */
export function buildTemplatePromptDetailed(template: PromptTemplate, values: TemplateValues): TemplatePromptResult {
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

/** Versão "deixar a IA perguntar" de um modelo guiado. */
export function buildTemplateInterviewPrompt(template: PromptTemplate): string {
  const questions = template.fields.map((f) => `${f.label}${f.required ? "" : " (opcional)"}`)
  return `# ${template.title} — entrevista antes da resposta

## 1. Seu papel
Atue como ${template.role}.

## 2. Objetivo
${template.objective}

## 3. Como conduzir
1. Explique em até duas frases como será a conversa.
2. Faça as perguntas abaixo em blocos de duas ou três e espere minhas respostas antes de seguir.
3. Se uma resposta for vaga ou contraditória, faça uma pergunta complementar.
4. Resuma o que entendeu em tópicos e peça minha confirmação.
5. Só depois da confirmação, entregue a resposta completa.

## 4. O que perguntar
${bulletList([...questions, ...template.clarify])}

## 5. Como trabalhar na resposta final
${numberedList(template.method)}

## 6. Regras
${bulletList([...template.rules, ...SHARED_TEMPLATE_RULES])}

## 7. Formato da resposta final
${numberedList(template.outputFormat)}

## 8. Antes de responder, confira
${bulletList(template.checks)}

Comece agora pela explicação e pelas primeiras perguntas.`
}
