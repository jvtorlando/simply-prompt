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
  labelOf,
} from "@/lib/fitness-options"
import { ROUTINE_STEPS } from "@/lib/fitness-routine"
import { bulletList, numberedList } from "@/lib/prompt-utils"
import {
  detectHealthSignals,
  normalizeFreeText,
  parseHeightCm,
  parseLooseNumber,
  type TextAdjustment,
} from "@/lib/text-intelligence"
import type { FitnessField, FitnessFormData, FitnessGoal, ValidationErrors } from "@/types/prompt"

// ---- validação ---------------------------------------------------------------

/** Campos obrigatórios, na ordem em que aparecem no formulário. */
export const REQUIRED_FITNESS_FIELDS: FitnessField[] = [
  "goals",
  "age",
  "height",
  "weight",
  "level",
  "daysPerWeek",
  "sessionMinutes",
  "location",
  "equipment",
]

export const MAX_GOALS = 3

function checkRange(n: number | null, raw: string, min: number, max: number, unit: string, label: string): string | undefined {
  if (!raw.trim()) return `Informe ${label}.`
  if (n === null) return `Use apenas números em ${label} (${unit}).`
  if (n < min || n > max) return `Confira ${label}: esperamos um valor entre ${min} e ${max} ${unit}.`
  return undefined
}

/**
 * Valida o formulário do Personal IA. Os limites são largos de propósito:
 * servem para pegar erros de digitação, não para excluir corpos incomuns.
 * Aceita "81,5 kg", "28 anos" e altura em metros ("1,75") ou centímetros ("175").
 */
export function validateFitness(data: FitnessFormData): ValidationErrors<FitnessField> {
  const errors: ValidationErrors<FitnessField> = {}
  if (data.goals.length === 0) errors.goals = "Escolha pelo menos um objetivo."
  else if (data.goals.length > MAX_GOALS) errors.goals = `Escolha até ${MAX_GOALS} objetivos para o plano ficar focado.`
  const age = checkRange(parseLooseNumber(data.age), data.age, 10, 110, "anos", "sua idade")
  if (age) errors.age = age
  const height = checkRange(parseHeightCm(data.height), data.height, 100, 250, "cm", "sua altura")
  if (height) errors.height = height
  const weight = checkRange(parseLooseNumber(data.weight), data.weight, 25, 350, "kg", "seu peso")
  if (weight) errors.weight = weight
  if (!data.level) errors.level = "Escolha seu nível de experiência."
  if (!data.daysPerWeek) errors.daysPerWeek = "Escolha quantos dias por semana pode treinar."
  if (!data.sessionMinutes) errors.sessionMinutes = "Escolha quanto tempo tem por treino."
  if (!data.location) errors.location = "Escolha onde vai treinar."
  if (data.equipment.length === 0 && !data.otherEquipment.trim())
    errors.equipment = "Marque pelo menos um equipamento ou descreva o que tem disponível."
  return errors
}

// ---- foco por objetivo -------------------------------------------------------------

export const GOAL_FOCUS: Record<FitnessGoal, string[]> = {
  "perder-gordura": [
    "Priorize treino de força para preservar massa muscular durante a perda de gordura.",
    "Inclua cardio de forma progressiva e sugira formas de aumentar a atividade diária (passos, deslocamentos).",
    "Se falar de alimentação, limite-se a orientações gerais e seguras; nada de dietas extremas, jejuns prolongados ou cortes radicais. Recomende nutricionista para um plano alimentar.",
  ],
  "ganhar-massa": [
    "Priorize sobrecarga progressiva e volume semanal adequado por grupo muscular, ajustado ao nível de experiência.",
    "Explique como distribuir os grupos musculares na semana para permitir recuperação.",
    "Se falar de alimentação, limite-se a orientações gerais (proteína suficiente, constância, sono). Recomende nutricionista para um plano alimentar.",
  ],
  condicionamento: [
    "Construa primeiro a base aeróbica e depois inclua intervalados de forma gradual.",
    "Combine o trabalho cardiovascular com força geral para sustentar a evolução.",
    "Use a percepção de esforço (RPE) e, se fizer sentido, a escala de conversa para controlar a intensidade.",
  ],
  performance: [
    "Inclua força máxima, potência, pliometria e sprints, em ordem segura dentro de cada sessão (trabalho explosivo antes do cansaço).",
    "Dose o volume de saltos e sprints de acordo com o nível e progrida com cautela.",
    "Considere o calendário dos esportes praticados para não acumular fadiga antes de jogos ou provas.",
  ],
  saude: [
    "Equilibre força, cardio e mobilidade, com foco em constância e prazer no treino.",
    "Priorize padrões de movimento básicos (agachar, empurrar, puxar, levantar do chão, carregar).",
    "Prefira um plano simples e sustentável a um plano complexo e difícil de manter.",
  ],
}

// ---- leitura inteligente do formulário -----------------------------------------------

const FREE_TEXT_FIELDS = [
  "sports",
  "preferredExercises",
  "dislikedExercises",
  "scheduleConstraints",
  "injuries",
  "notes",
  "deadline",
  "otherEquipment",
] as const satisfies readonly FitnessField[]

/** Corrige os textos livres e devolve também o que foi ajustado, para o usuário conferir. */
export function normalizeFitness(data: FitnessFormData): { data: FitnessFormData; adjustments: TextAdjustment[] } {
  const next: FitnessFormData = { ...data }
  const adjustments: TextAdjustment[] = []
  for (const field of FREE_TEXT_FIELDS) {
    const result = normalizeFreeText(data[field])
    next[field] = result.text
    for (const change of result.adjustments) {
      if (!adjustments.some((a) => a.from === change.from && a.to === change.to)) adjustments.push(change)
    }
  }
  return { data: next, adjustments }
}

const joinList = (items: string[]) =>
  items.length <= 1 ? (items[0] ?? "") : `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`

/**
 * Cruza as respostas e aponta o que pede cuidado: objetivos que competem, rotina apertada,
 * idade, IMC extremo, sono, e lesões ou condições citadas em texto livre.
 * Cada ponto vira uma instrução direta para a IA.
 */
export function analyzeFitness(data: FitnessFormData): { attention: string[]; questions: string[] } {
  const attention: string[] = []
  const questions: string[] = []
  const goals = data.goals
  const days = Number(data.daysPerWeek)
  const minutes = Number(data.sessionMinutes)
  const age = parseLooseNumber(data.age)
  const heightCm = parseHeightCm(data.height)
  const weight = parseLooseNumber(data.weight)

  if (goals.length > 1) {
    attention.push(
      `Tenho ${goals.length} objetivos. Priorize o primeiro da lista, distribua o volume para contemplar os outros sem comprometer a recuperação e diga como eles se encaixam no plano.`,
    )
  }
  if (goals.includes("perder-gordura") && goals.includes("ganhar-massa")) {
    attention.push(
      "Perder gordura e ganhar massa ao mesmo tempo (recomposição corporal) é possível, principalmente para quem está começando ou voltando a treinar, mas o progresso costuma ser mais lento nos dois. Explique essa expectativa com honestidade e não use dietas extremas.",
    )
  }
  if (goals.includes("performance") && goals.includes("perder-gordura")) {
    attention.push("Evite déficit calórico agressivo nas fases de treino explosivo: a performance e a recuperação dependem de energia suficiente.")
  }
  if (days >= 5 && minutes <= 30) {
    attention.push(`Treino ${days} dias por semana com sessões de ${minutes} minutos: prefira sessões curtas, densas e com poucos exercícios por dia.`)
  }
  if (days >= 6 && data.level === "iniciante") {
    attention.push("Sou iniciante e quero treinar 6 dias: inclua dias bem leves e explique como aumentar a frequência com segurança.")
  }
  if (data.location === "casa" && data.equipment.some((e) => ["maquinas", "polias", "barra-anilhas"].includes(e))) {
    questions.push("Informei treinar em casa e também máquinas, polias ou barra: confirme onde esses equipamentos estão antes de montar o plano")
  }
  if (age !== null && age < 18) {
    attention.push("Sou menor de idade: priorize técnica e progressão conservadora, evite cargas máximas e recomende a supervisão de um profissional e de um responsável.")
  }
  if (age !== null && age >= 60) {
    attention.push("Tenho 60 anos ou mais: priorize força, equilíbrio e mobilidade, com progressão conservadora, e recomende avaliação médica antes de começar.")
  }
  if (heightCm && weight) {
    const bmi = weight / Math.pow(heightCm / 100, 2)
    if (bmi < 17.5) {
      attention.push("Pelos dados informados, meu peso está muito baixo para a minha altura: não proponha déficit calórico nem foco em emagrecer e recomende avaliação profissional antes do plano.")
    } else if (bmi >= 35) {
      attention.push("Pelos dados informados, meu peso está bem acima do esperado para a minha altura: prefira exercícios de baixo impacto, progressão gradual e recomende avaliação médica antes de intensificar.")
    }
  }
  if (data.sleep === "ruim") {
    attention.push("Durmo mal: comece com volume e intensidade moderados, evite sessões muito desgastantes e inclua orientações simples de recuperação.")
  }

  const signals = detectHealthSignals(data.injuries, data.notes)
  if (signals.pregnancy) {
    attention.push("Mencionei gestação: não prescreva um programa completo. Dê apenas orientações gerais e peça liberação do obstetra e acompanhamento de um profissional especializado antes de qualquer treino.")
  }
  if (signals.cardio) {
    attention.push("Mencionei uma condição cardiovascular ou pressão alta: recomende liberação médica antes de começar e evite intensidade alta sem supervisão.")
  }
  if (signals.metabolic) {
    attention.push("Mencionei diabetes, tireoide ou colesterol: recomende acompanhamento médico e não faça orientações sobre medicação ou jejum.")
  }
  if (signals.respiratory) {
    attention.push("Mencionei uma condição respiratória: comece com intensidade baixa, ensine a reconhecer sinais de alerta e recomende avaliação médica.")
  }
  if (signals.eatingDisorder) {
    attention.push("Mencionei transtorno alimentar: não use foco em peso, déficit calórico ou estética e recomende acompanhamento profissional.")
  }
  if (signals.injuryAreas.length > 0) {
    attention.push(
      `Citei dor ou lesão em: ${joinList(signals.injuryAreas)}. Evite sobrecarregar essas regiões, ofereça alternativas seguras e recomende avaliação de médico ou fisioterapeuta antes de incluir exercícios que as envolvam.`,
    )
  } else if (signals.pain) {
    attention.push("Citei dor ou lesão: não prescreva exercícios que possam agravá-la, ofereça alternativas e recomende avaliação profissional antes de seguir.")
  }

  return { attention, questions }
}

// ---- prompt ------------------------------------------------------------------------------

export type FitnessPromptResult = {
  prompt: string
  /** Correções automáticas feitas nos textos livres. */
  adjustments: TextAdjustment[]
  /** Pontos de atenção que entraram no prompt. */
  attention: string[]
}

const formatKg = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",")

/** Monta o prompt completo do Personal IA. Função pura: mesmos dados, mesmo texto. */
export function buildFitnessPromptDetailed(input: FitnessFormData): FitnessPromptResult {
  const { data, adjustments } = normalizeFitness(input)
  const { attention, questions } = analyzeFitness(data)

  const age = parseLooseNumber(data.age)
  const heightCm = parseHeightCm(data.height)
  const weight = parseLooseNumber(data.weight)
  const goals = data.goals.map((g) => labelOf(GOAL_OPTIONS, g))
  const equipment = [
    ...data.equipment.map((e) => labelOf(EQUIPMENT_OPTIONS, e)),
    ...(data.otherEquipment ? [data.otherEquipment] : []),
  ]

  const optional = (label: string, value: string) => (value ? `- ${label}: ${value}` : null)
  const context = [
    `- Idade: ${age !== null ? Math.round(age) : data.age.trim()} anos`,
    `- Altura: ${heightCm ?? data.height.trim()} cm`,
    `- Peso: ${weight !== null ? formatKg(weight) : data.weight.trim()} kg`,
    `- Nível de experiência: ${labelOf(LEVEL_OPTIONS, data.level)}`,
    data.sex ? `- Sexo: ${labelOf(SEX_OPTIONS, data.sex)}` : null,
    data.dailyActivity ? `- Atividade diária fora do treino: ${labelOf(ACTIVITY_OPTIONS, data.dailyActivity)}` : null,
    data.sleep ? `- Qualidade do sono: ${labelOf(SLEEP_OPTIONS, data.sleep)}` : null,
    optional("Esportes que pratico", data.sports),
  ].filter(Boolean)

  const limitations = [
    optional("Lesões, dores ou limitações", data.injuries),
    optional("Exercícios de que gosto", data.preferredExercises),
    optional("Exercícios de que não gosto", data.dislikedExercises),
    optional("Restrições de horário", data.scheduleConstraints),
    optional("Observações", data.notes),
  ].filter(Boolean)

  const multi = data.goals.length > 1
  const focus = Array.from(new Set(data.goals.flatMap((g: FitnessGoal) => GOAL_FOCUS[g]))).slice(0, multi ? 6 : 3)
  const goalBlock = multi ? `Objetivos, em ordem de prioridade:\n${numberedList(goals)}` : goals[0]

  const followUps = [
    "Antes de entregar o plano, verifique se alguma informação essencial está faltando ou parece contraditória.",
    questions.length ? `Em especial: ${questions.join("; ")}.` : null,
    "Se estiver, faça no máximo cinco perguntas objetivas e espere minhas respostas. Se tudo estiver claro, entregue o plano diretamente e termine perguntando o que eu gostaria de ajustar.",
  ]
    .filter(Boolean)
    .join(" ")

  const prompt = `# Personal IA — plano de treino personalizado

## 1. Seu papel
Atue como um profissional de educação física experiente, com conhecimento em treinamento de força, condicionamento e periodização. Seu papel é me ajudar a organizar um plano de treino seguro, claro e realista. Você não substitui médico, fisioterapeuta, nutricionista ou profissional de educação física presencial e deve deixar isso claro quando for relevante.

## 2. Meu contexto
${context.join("\n")}

## 3. Objetivo principal
${goalBlock}
${data.deadline ? `\nPrazo ou evento específico: ${data.deadline}` : ""}
Foco para ${multi ? "esses objetivos" : "esse objetivo"}:
${bulletList(focus)}

## 4. Disponibilidade e estrutura
- Dias por semana: ${labelOf(DAYS_OPTIONS, data.daysPerWeek)}
- Tempo por treino: ${labelOf(DURATION_OPTIONS, data.sessionMinutes)} (incluindo aquecimento)
- Local de treino: ${labelOf(LOCATION_OPTIONS, data.location)}
- Equipamentos disponíveis: ${equipment.join(", ")}

## 5. Limitações e preferências
${limitations.length ? limitations.join("\n") : "- Não informei limitações nem preferências específicas."}
${attention.length ? `\nPontos de atenção para o meu caso:\n${bulletList(attention)}` : ""}

## 6. Regras para elaborar o plano
- Não invente informações que eu não forneci. Se precisar supor algo, diga qual é a suposição.
- Os textos livres acima foram digitados por mim e podem ter erros de escrita ou abreviações. Interprete pela intenção e, se algo for ambíguo, pergunte antes de supor.
- Se faltar informação essencial, faça as perguntas antes de montar o plano.
- Adapte exercícios, volume e intensidade ao meu nível e somente aos equipamentos que listei.
- Respeite o número de dias e o tempo por treino; o treino precisa caber na minha rotina.
- Explique termos técnicos (RPE, RIR, cadência, falha, deload) de forma simples na primeira vez que aparecerem.
- Prefira exercícios que eu goste e evite os que eu não gosto, sempre que houver alternativa equivalente.

## 7. Formato obrigatório da resposta
Organize a resposta nesta ordem, usando títulos e tabelas:
1. Resumo da estratégia (até 5 linhas, explicando o porquê das escolhas${multi ? " e como os objetivos se combinam" : ""})
2. Divisão semanal (qual treino em qual dia e dias de descanso)
3. Aquecimento de cada treino
4. Uma tabela por treino com as colunas: Exercício | Séries | Repetições ou duração | Intensidade (RPE ou RIR) | Descanso | Orientações de execução
5. Cardio, quando aplicável (tipo, duração e intensidade)
6. Mobilidade, quando aplicável
7. Alternativas para cada exercício principal (caso o equipamento esteja ocupado ou haja desconforto)
8. Progressão semanal
9. Semana de recuperação (deload), quando necessária, e como identificá-la
10. Sinais de alerta
11. Método de acompanhamento por quatro semanas
12. Versão do plano em PDF, pronta para baixar

## 8. Critérios para progressão
- Defina critérios objetivos para aumentar carga, repetições ou volume (por exemplo: completar todas as séries no topo da faixa de repetições com o RIR alvo).
- Diga quando manter a carga e quando reduzir (técnica piorando, RPE acima do previsto, dor articular, recuperação ruim).
- Proponha um registro simples para cada sessão: carga, repetições, RPE e observações.
- No acompanhamento de quatro semanas, indique o que medir a cada semana e como ajustar o plano a partir disso.

## 9. Regras de segurança
- Não faça diagnóstico médico.
- Não recomende medicamentos, hormônios, esteroides, suplementos de risco ou qualquer prática perigosa.
- Não recomende dietas extremas, jejuns prolongados ou métodos de perda de peso rápida.
- Se houver dor, lesão, condição clínica, gestação ou outro risco relevante, recomende avaliação profissional antes de prescrever atividades potencialmente inadequadas.
- Diferencie o desconforto normal do treino (fadiga muscular, ardência, dor muscular tardia leve) de sinais que exigem interromper o exercício e procurar ajuda (dor no peito, falta de ar desproporcional, tontura, desmaio, dor articular aguda ou que piora, formigamento).
- Não prometa resultados garantidos nem prazos exatos para mudanças no corpo.

## 10. Perguntas de acompanhamento
${followUps}

Agenda, PDF e acompanhamento:
${bulletList([...ROUTINE_STEPS])}`

  return { prompt, adjustments, attention }
}

export const buildFitnessPrompt = (data: FitnessFormData): string => buildFitnessPromptDetailed(data).prompt
