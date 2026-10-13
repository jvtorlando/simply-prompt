import type { ArtPreset } from "@/components/ui/glass-folder-cards"

/** Identificadores das categorias exibidas no catálogo. */
export type CategoryId = "fitness" | "estudos" | "carreira" | "produtividade" | "ingles"

/** Opção de um campo de escolha. */
export type FieldOption = {
  value: string
  label: string
}

/** Campo de um formulário genérico orientado por configuração. */
export type TemplateField = {
  id: string
  label: string
  kind: "text" | "textarea" | "select" | "date"
  required?: boolean
  placeholder?: string
  hint?: string
  options?: FieldOption[]
}

/** Valores preenchidos em um formulário genérico, indexados pelo id do campo. */
export type TemplateValues = Record<string, string>

/** Modelo de prompt experimental, descrito apenas por dados. */
export type PromptTemplate = {
  id: string
  categoryId: CategoryId
  title: string
  description: string
  /** Papel que a IA deve assumir. */
  role: string
  /** O que a IA deve produzir. */
  task: string
  fields: TemplateField[]
  /** Regras específicas desse modelo. */
  rules: string[]
  /** Itens obrigatórios na resposta. */
  outputFormat: string[]
}

/**
 * Um item do catálogo. `kind: "fitness"` abre o Personal IA (com um objetivo
 * pré-selecionado); `kind: "template"` abre um modelo experimental.
 */
export type CatalogItem =
  | { kind: "fitness"; id: string; title: string; meta: string; goal: FitnessGoal }
  | { kind: "template"; id: string; title: string; meta: string; templateId: string }

export type PromptCategory = {
  id: CategoryId
  title: string
  description: string
  art: ArtPreset
  seed: number
  featured?: boolean
  items: CatalogItem[]
}

/** O que está aberto no construtor. */
export type BuilderSelection =
  | { kind: "fitness" }
  | { kind: "template"; templateId: string }

// ---- Personal IA -----------------------------------------------------------

export type FitnessGoal = "perder-gordura" | "ganhar-massa" | "condicionamento" | "performance" | "saude"
export type ExperienceLevel = "iniciante" | "intermediario" | "avancado"
export type TrainingLocation = "academia-completa" | "academia-condominio" | "casa" | "ar-livre" | "combinacao"
export type Sex = "" | "feminino" | "masculino" | "nao-informar"
export type SleepQuality = "" | "ruim" | "regular" | "bom" | "otimo"
export type DailyActivity = "" | "sedentario" | "leve" | "moderado" | "alto"

export type FitnessFormData = {
  goal: FitnessGoal | ""
  age: string
  height: string
  weight: string
  level: ExperienceLevel | ""
  daysPerWeek: string
  sessionMinutes: string
  location: TrainingLocation | ""
  equipment: string[]
  otherEquipment: string
  sex: Sex
  sports: string
  preferredExercises: string
  dislikedExercises: string
  scheduleConstraints: string
  injuries: string
  notes: string
  deadline: string
  sleep: SleepQuality
  dailyActivity: DailyActivity
}

export type FitnessField = keyof FitnessFormData

/** Mensagens de validação, uma por campo com problema. */
export type ValidationErrors<K extends string = string> = Partial<Record<K, string>>
