import type {
  DailyActivity,
  ExperienceLevel,
  FitnessFormData,
  FitnessGoal,
  Sex,
  SleepQuality,
  TrainingLocation,
} from "@/types/prompt"

type Option<T extends string> = { value: T; label: string }

export const GOAL_OPTIONS: Option<FitnessGoal>[] = [
  { value: "perder-gordura", label: "Perder gordura" },
  { value: "ganhar-massa", label: "Ganhar massa muscular" },
  { value: "condicionamento", label: "Melhorar condicionamento" },
  { value: "performance", label: "Explosão e performance atlética" },
  { value: "saude", label: "Saúde e rotina geral" },
]

export const LEVEL_OPTIONS: Option<ExperienceLevel>[] = [
  { value: "iniciante", label: "Iniciante" },
  { value: "intermediario", label: "Intermediário" },
  { value: "avancado", label: "Avançado" },
]

export const DAYS_OPTIONS: Option<string>[] = ["2", "3", "4", "5", "6"].map((d) => ({
  value: d,
  label: `${d} dias`,
}))

export const DURATION_OPTIONS: Option<string>[] = ["30", "45", "60", "75", "90"].map((m) => ({
  value: m,
  label: `${m} min`,
}))

export const LOCATION_OPTIONS: Option<TrainingLocation>[] = [
  { value: "academia-completa", label: "Academia completa" },
  { value: "academia-condominio", label: "Academia de condomínio" },
  { value: "casa", label: "Em casa" },
  { value: "ar-livre", label: "Ao ar livre" },
  { value: "combinacao", label: "Combinação de locais" },
]

export const EQUIPMENT_OPTIONS: Option<string>[] = [
  { value: "halteres", label: "Halteres" },
  { value: "barra-anilhas", label: "Barra e anilhas" },
  { value: "maquinas", label: "Máquinas de musculação" },
  { value: "polias", label: "Polias e cabos" },
  { value: "banco", label: "Banco ajustável" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "elasticos", label: "Elásticos / mini bands" },
  { value: "barra-fixa", label: "Barra fixa" },
  { value: "cardio", label: "Esteira, bike ou elíptico" },
  { value: "corda", label: "Corda de pular" },
  { value: "peso-corporal", label: "Apenas peso corporal" },
]

export const SEX_OPTIONS: Option<Exclude<Sex, "">>[] = [
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
  { value: "nao-informar", label: "Prefiro não informar" },
]

export const SLEEP_OPTIONS: Option<Exclude<SleepQuality, "">>[] = [
  { value: "ruim", label: "Ruim (acordo cansado com frequência)" },
  { value: "regular", label: "Regular" },
  { value: "bom", label: "Bom" },
  { value: "otimo", label: "Ótimo" },
]

export const ACTIVITY_OPTIONS: Option<Exclude<DailyActivity, "">>[] = [
  { value: "sedentario", label: "Sedentário (passo a maior parte do dia sentado)" },
  { value: "leve", label: "Levemente ativo" },
  { value: "moderado", label: "Moderadamente ativo" },
  { value: "alto", label: "Muito ativo (trabalho físico ou muitos passos)" },
]

/** Rótulo legível de um valor, ou o próprio valor se não houver correspondência. */
export function labelOf<T extends string>(options: Option<T>[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

export const EMPTY_FITNESS_FORM: FitnessFormData = {
  goal: "",
  age: "",
  height: "",
  weight: "",
  level: "",
  daysPerWeek: "",
  sessionMinutes: "",
  location: "",
  equipment: [],
  otherEquipment: "",
  sex: "",
  sports: "",
  preferredExercises: "",
  dislikedExercises: "",
  scheduleConstraints: "",
  injuries: "",
  notes: "",
  deadline: "",
  sleep: "",
  dailyActivity: "",
}

/**
 * Campos que podem ser lembrados neste navegador. Medidas corporais, idade,
 * sexo, sono, lesões e observações ficam de fora de propósito.
 */
export const PERSISTED_FITNESS_FIELDS = [
  "goal",
  "level",
  "daysPerWeek",
  "sessionMinutes",
  "location",
  "equipment",
  "otherEquipment",
  "sports",
  "preferredExercises",
  "dislikedExercises",
  "scheduleConstraints",
  "deadline",
  "dailyActivity",
] as const satisfies readonly (keyof FitnessFormData)[]
