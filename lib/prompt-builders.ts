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
import type {
  FitnessField,
  FitnessFormData,
  FitnessGoal,
  PromptTemplate,
  TemplateValues,
  ValidationErrors,
} from "@/types/prompt"

// ---- utilidades ------------------------------------------------------------

const clean = (value: string) => value.trim().replace(/\s+\n/g, "\n")

/** Converte "2026-12-01" em "01/12/2026". Outros formatos voltam como vieram. */
export function formatDate(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value.trim()
}

/** Aceita vírgula ou ponto como separador decimal. */
export function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".")
  if (!normalized) return null
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

const bulletList = (items: string[]) => items.map((item) => `- ${item}`).join("\n")
const numberedList = (items: string[]) => items.map((item, i) => `${i + 1}. ${item}`).join("\n")

// ---- validação do Personal IA ----------------------------------------------

/** Campos obrigatórios, na ordem em que aparecem no formulário. */
export const REQUIRED_FITNESS_FIELDS: FitnessField[] = [
  "goal",
  "age",
  "height",
  "weight",
  "level",
  "daysPerWeek",
  "sessionMinutes",
  "location",
  "equipment",
]

function checkRange(value: string, min: number, max: number, unit: string, label: string): string | undefined {
  if (!value.trim()) return `Informe ${label}.`
  const n = parseNumber(value)
  if (n === null) return `Use apenas números em ${label}${unit ? ` (${unit})` : ""}.`
  if (n < min || n > max) return `Confira ${label}: esperamos um valor entre ${min} e ${max}${unit ? ` ${unit}` : ""}.`
  return undefined
}

/**
 * Valida o formulário do Personal IA. Os limites são largos de propósito:
 * servem para pegar erros de digitação, não para excluir corpos incomuns.
 */
export function validateFitness(data: FitnessFormData): ValidationErrors<FitnessField> {
  const errors: ValidationErrors<FitnessField> = {}
  if (!data.goal) errors.goal = "Escolha um objetivo principal."
  const age = checkRange(data.age, 10, 110, "anos", "sua idade")
  if (age) errors.age = age
  const height = checkRange(data.height, 100, 250, "cm", "sua altura")
  if (height) errors.height = height
  const weight = checkRange(data.weight, 25, 350, "kg", "seu peso")
  if (weight) errors.weight = weight
  if (!data.level) errors.level = "Escolha seu nível de experiência."
  if (!data.daysPerWeek) errors.daysPerWeek = "Escolha quantos dias por semana pode treinar."
  if (!data.sessionMinutes) errors.sessionMinutes = "Escolha quanto tempo tem por treino."
  if (!data.location) errors.location = "Escolha onde vai treinar."
  if (data.equipment.length === 0 && !data.otherEquipment.trim())
    errors.equipment = "Marque pelo menos um equipamento ou descreva o que tem disponível."
  return errors
}

// ---- prompt do Personal IA -------------------------------------------------

const GOAL_FOCUS: Record<FitnessGoal, string[]> = {
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

/** Monta o prompt completo do Personal IA. Função pura: mesmos dados, mesmo texto. */
export function buildFitnessPrompt(data: FitnessFormData): string {
  const goal = data.goal ? labelOf(GOAL_OPTIONS, data.goal) : "Não informado"
  const age = parseNumber(data.age)
  const equipment = [
    ...data.equipment.map((e) => labelOf(EQUIPMENT_OPTIONS, e)),
    ...(data.otherEquipment.trim() ? [data.otherEquipment.trim()] : []),
  ]

  const optional = (label: string, value: string) => (value.trim() ? `- ${label}: ${clean(value)}` : null)
  const context = [
    `- Idade: ${data.age.trim()} anos`,
    `- Altura: ${data.height.trim()} cm`,
    `- Peso: ${data.weight.trim()} kg`,
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

  const minorNote =
    age !== null && age < 18
      ? "\n- Sou menor de idade: adapte o plano com cautela, priorize técnica e recomende a supervisão de um profissional e de um responsável."
      : ""
  const injuryNote = data.injuries.trim()
    ? "\n- Como informei dores, lesões ou limitações, não prescreva exercícios que possam agravá-las. Recomende avaliação de médico ou fisioterapeuta antes de incluir movimentos que envolvam a região afetada e ofereça alternativas seguras."
    : ""

  return `# Personal IA — plano de treino personalizado

## 1. Seu papel
Atue como um profissional de educação física experiente, com conhecimento em treinamento de força, condicionamento e periodização. Seu papel é me ajudar a organizar um plano de treino seguro, claro e realista. Você não substitui médico, fisioterapeuta, nutricionista ou profissional de educação física presencial e deve deixar isso claro quando for relevante.

## 2. Meu contexto
${context.join("\n")}

## 3. Objetivo principal
${goal}
${data.deadline.trim() ? `\nPrazo ou evento específico: ${clean(data.deadline)}` : ""}
Foco para esse objetivo:
${bulletList(GOAL_FOCUS[data.goal || "saude"])}

## 4. Disponibilidade e estrutura
- Dias por semana: ${labelOf(DAYS_OPTIONS, data.daysPerWeek)}
- Tempo por treino: ${labelOf(DURATION_OPTIONS, data.sessionMinutes)} (incluindo aquecimento)
- Local de treino: ${labelOf(LOCATION_OPTIONS, data.location)}
- Equipamentos disponíveis: ${equipment.join(", ")}

## 5. Limitações e preferências
${limitations.length ? limitations.join("\n") : "- Não informei limitações nem preferências específicas."}

## 6. Regras para elaborar o plano
- Não invente informações que eu não forneci. Se precisar supor algo, diga qual é a suposição.
- Se faltar informação essencial, faça as perguntas antes de montar o plano.
- Adapte exercícios, volume e intensidade ao meu nível e somente aos equipamentos que listei.
- Respeite o número de dias e o tempo por treino; o treino precisa caber na minha rotina.
- Explique termos técnicos (RPE, RIR, cadência, falha, deload) de forma simples na primeira vez que aparecerem.
- Prefira exercícios que eu goste e evite os que eu não gosto, sempre que houver alternativa equivalente.${minorNote}${injuryNote}

## 7. Formato obrigatório da resposta
Organize a resposta nesta ordem, usando títulos e tabelas:
1. Resumo da estratégia (até 5 linhas, explicando o porquê das escolhas)
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
Antes de entregar o plano, verifique se alguma informação essencial está faltando ou parece contraditória. Se estiver, faça no máximo cinco perguntas objetivas e espere minhas respostas. Se tudo estiver claro, entregue o plano diretamente e termine perguntando o que eu gostaria de ajustar.`
}

/** Prompt universal: a IA entrevista o usuário antes de montar o plano. */
export const FITNESS_INTERVIEW_PROMPT = `# Personal IA — entrevista antes do plano de treino

## Seu papel
Atue como um assistente de planejamento de treino, com a postura de um profissional de educação física experiente. Você me ajuda a organizar um plano seguro e realista, mas não substitui médico, fisioterapeuta, nutricionista ou profissional de educação física presencial.

## Como conduzir
1. Comece explicando em até três frases como será a entrevista: algumas perguntas em blocos curtos, um resumo do meu perfil para eu confirmar e só então o plano.
2. Faça as perguntas em blocos pequenos (de duas a quatro perguntas por mensagem) e espere minhas respostas antes de seguir.
3. Não crie nenhum plano, treino ou exemplo de treino antes de receber as respostas e a minha confirmação.

## Blocos de perguntas
- Bloco 1 — Objetivo: objetivo principal (perder gordura, ganhar massa muscular, melhorar condicionamento, explosão e performance atlética ou saúde e rotina geral) e se há prazo ou evento específico.
- Bloco 2 — Perfil: idade, altura, peso, sexo (opcional, posso preferir não informar) e nível de experiência com treino.
- Bloco 3 — Disponibilidade: quantos dias por semana posso treinar, quanto tempo por treino e restrições de horário.
- Bloco 4 — Estrutura: local de treino e equipamentos disponíveis.
- Bloco 5 — Histórico e preferências: esportes que pratico, exercícios de que gosto e de que não gosto.
- Bloco 6 — Cuidados: lesões, dores, limitações ou condições de saúde relevantes, qualidade do sono e nível de atividade no dia a dia.

## Durante a entrevista
- Se uma resposta for vaga, peça um exemplo.
- Se detectar informações conflitantes (por exemplo, 6 dias de treino com apenas 30 minutos livres por semana), faça perguntas complementares antes de continuar.
- Não invente dados que eu não informei.
- Explique termos técnicos de forma simples.

## Antes do plano
Ao final, apresente um resumo do meu perfil em tópicos e pergunte: "Está correto? Quer ajustar algo?". Só gere o plano depois da minha confirmação.

## Formato obrigatório do plano
1. Resumo da estratégia
2. Divisão semanal
3. Aquecimento de cada treino
4. Uma tabela por treino com: Exercício | Séries | Repetições ou duração | Intensidade (RPE ou RIR) | Descanso | Orientações de execução
5. Cardio e mobilidade, quando aplicáveis
6. Alternativas para os exercícios principais
7. Progressão semanal e critérios objetivos para ajustar a carga
8. Semana de recuperação (deload), quando necessária
9. Sinais de alerta
10. Método de acompanhamento por quatro semanas

## Regras de segurança
- Não faça diagnóstico médico.
- Não recomende medicamentos, hormônios, esteroides ou práticas perigosas.
- Não recomende dietas extremas; para alimentação, dê apenas orientações gerais e recomende nutricionista.
- Adapte o treino ao meu nível e somente aos equipamentos que eu tiver.
- Se houver dor, lesão, condição clínica, gestação ou outro risco relevante, recomende avaliação profissional antes de prescrever atividades potencialmente inadequadas.
- Diferencie desconforto normal de treino de sinais que exigem interromper o exercício (dor no peito, falta de ar desproporcional, tontura, dor articular aguda).
- Não prometa resultados garantidos.

Comece agora pela explicação e pelo Bloco 1.`

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
  "Não invente informações que eu não forneci. Se precisar supor algo, deixe a suposição explícita.",
  "Se faltar informação essencial, faça até cinco perguntas antes de responder.",
  "Explique termos técnicos de forma simples.",
]

/** Monta o prompt de um modelo experimental a partir das respostas. */
export function buildTemplatePrompt(template: PromptTemplate, values: TemplateValues): string {
  const answers = template.fields
    .map((field) => {
      const raw = (values[field.id] ?? "").trim()
      if (!raw) return null
      const value = field.kind === "date" ? formatDate(raw) : clean(raw)
      return value.includes("\n") ? `- ${field.label}:\n${value}` : `- ${field.label}: ${value}`
    })
    .filter(Boolean)

  return `# ${template.title}

## Seu papel
Atue como ${template.role}.

## Tarefa
${template.task}

## Minhas informações
${answers.join("\n")}

## Regras
${bulletList([...template.rules, ...SHARED_TEMPLATE_RULES])}

## Formato da resposta
${numberedList(template.outputFormat)}

Ao final, pergunte se eu quero ajustar alguma parte.`
}

/** Versão "deixar a IA perguntar" de um modelo experimental. */
export function buildTemplateInterviewPrompt(template: PromptTemplate): string {
  const questions = template.fields.map((f) => `${f.label}${f.required ? "" : " (opcional)"}`)
  return `# ${template.title} — entrevista antes da resposta

## Seu papel
Atue como ${template.role}.

## Tarefa
${template.task}

## Como conduzir
1. Explique em até duas frases como será a conversa.
2. Faça as perguntas abaixo em blocos de duas ou três e espere minhas respostas.
3. Se alguma resposta for vaga ou contraditória, faça uma pergunta complementar.
4. Resuma o que entendeu e peça minha confirmação.
5. Só depois da confirmação, entregue a resposta completa.

## O que perguntar
${bulletList(questions)}

## Regras
${bulletList([...template.rules, ...SHARED_TEMPLATE_RULES])}

## Formato da resposta final
${numberedList(template.outputFormat)}

Comece agora pela explicação e pelas primeiras perguntas.`
}
