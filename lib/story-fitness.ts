/*
 * Modo "Contar com minhas palavras" do Personal IA.
 *
 * O texto livre é lido por regras, no navegador, sem IA e sem rede. A leitura reconhece números
 * (idade, altura, peso, metas, prazos), esportes, objetivos, grupos musculares, suplementos,
 * dias, tempo, local e menções a dor ou lesão. O que ela não reconhece não é descartado:
 * as frases entram no prompt em "Outros detalhes que contei", para a IA do projeto interpretar.
 */

import { GOAL_OPTIONS, LOCATION_OPTIONS, labelOf } from "./fitness-options"
import { detectHealthSignals, normalizeFreeText, type TextAdjustment } from "./text-intelligence"
import type { FitnessGoal, TrainingLocation } from "../types/prompt"

export const STORY_INPUT_LIMIT = 3000
export const STORY_PROMPT_LIMIT = 6000

export type StoryProfile = {
  name?: string
  age?: number
  heightCm?: number
  /** Ex.: "tenho 94" — provavelmente 1,94 m, mas não presumimos. */
  heightGuessCm?: number
  weightKg?: number
  refWeightKg?: number
  refWhen?: string
  weightLossKg?: number
  weightLossExplained?: boolean
  occupation?: string
  sports: { name: string; years?: number; highLevel: boolean }[]
  stillPlays: boolean
  returning: boolean
  level?: "iniciante" | "intermediario" | "avancado"
  goals: FitnessGoal[]
  aesthetics: boolean
  keepAthleticism: boolean
  priorities: string[]
  targetWeightKg?: number
  targetMonths?: number
  longTerm: boolean
  fastMetabolismPerception: boolean
  frequentMeals: boolean
  supplements: string[]
  days?: number
  minutes?: number
  location?: TrainingLocation
  noInjuries: boolean
  injuryNotes: string[]
  routine: string[]
  unmatched: string[]
}

/** O que falta para o prompt sair completo. */
export type StoryMissing = "height" | "days" | "minutes" | "location" | "injuries"

/** Respostas rápidas para o que o texto não trouxe. */
export type StoryAnswers = {
  heightCm?: number
  days?: number
  minutes?: number
  location?: TrainingLocation
  injuries?: string
  noInjuries?: boolean
  /** Resposta à pergunta "a perda de peso teve explicação?". */
  lossExplained?: boolean
}

// ---- utilidades -----------------------------------------------------------------

const plain = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
const num = (s: string) => Number(s.replace(",", "."))
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const SPORTS: [string, RegExp][] = [
  ["basquete", /basquete|basket/],
  ["futebol", /futebol|futsal/],
  ["vôlei", /volei/],
  ["natação", /natacao/],
  ["corrida", /corrida|correr/],
  ["jiu-jitsu", /jiu.?jitsu/],
  ["muay thai", /muay ?thai/],
  ["boxe", /boxe/],
  ["tênis", /\btenis\b/],
  ["handebol", /handebol/],
  ["ciclismo", /ciclismo|pedal/],
  ["crossfit", /crossfit/],
  ["dança", /\bdanca/],
]

const PRIORITIES: [string, RegExp][] = [
  ["ombros (deltoide lateral e posterior)", /ombro/],
  ["V-shape (dorsais e deltoide lateral)", /v.?shape|v.?taper|costas largas|dorsa/],
  ["peitoral", /peito|peitoral/],
  ["braços", /braco|biceps|triceps/],
  ["pernas", /\bperna|coxa|quadriceps/],
  ["glúteos", /gluteo/],
  ["core e abdômen", /abdom|tanquinho|\bcore\b/],
  ["panturrilhas", /panturrilha/],
]

const SUPPLEMENTS: [string, RegExp][] = [
  ["creatina", /creatina/],
  ["whey", /whey/],
  ["cafeína", /cafeina/],
  ["pré-treino", /pre.?treino/],
  ["ômega-3", /omega/],
  ["multivitamínico", /multivitaminico/],
]

/** Todas as regras de leitura. Uma frase que bate em qualquer uma é considerada aproveitada. */
const RULES = {
  name: /meu nome (?:e|eh) ([a-z]+)/,
  age: /(?:tenho|com|idade de)\s*(\d{1,2})\s*anos\b(?!\s*(?:de|que|atras|praticando|jogando|treinando))/,
  heightM: /\b([12])[,.](\d{1,2})\s*(?:m\b|metros?)/,
  heightCm: /\b(1\d{2}|2[0-2]\d)\s*cm\b/,
  heightGuess: /\btenho\s*(\d{2})\b(?!\s*(?:anos|kg|quilos|%|meses|dias|vezes|min))/,
  weight: /(?:\bpeso|pesando|estou com|to com|tô com|atualmente com|no momento estou com)\s*(?:uns\s*|cerca de\s*)?(\d{2,3}(?:[,.]\d)?)\s*(?:kg|quilos?)/,
  refWeight: /(?:estava|tava|eu estava|eu tava|cheguei a)\s*(?:com\s*)?(?:uns\s*|cerca de\s*)?(\d{2,3})\s*(?:kg|quilos?)/g,
  refWhen: /ha\s*(?:uns\s*|cerca de\s*)?(\d{1,2}(?:\s*(?:a|ou)\s*\d{1,2})?)\s*(meses|semanas|anos)/,
  loss: /perdi\s*(?:uns\s*|cerca de\s*|quase\s*)?(\d{1,2})\s*(?:kg|quilos?)/,
  lossExplained: /parei de treinar|sem treinar com regularidade|comer de forma irregular|comendo (?:mal|menos|pouco)|alimentacao irregular|parei a dieta/,
  target: /(?:voltar|chegar|subir)\s*(?:a|para|pra|em|aos?|ate)?\s*(?:algo\s*)?(?:perto de\s*)?(?:uns\s*)?(\d{2,3})\s*(?:kg|quilos?)/,
  recoverAll: /quantidade de quilos|o que perdi|recuperar (?:o peso|os quilos)/,
  months: /em\s*(?:uns\s*|cerca de\s*|ate\s*)?(\d{1,2})\s*meses/,
  longTerm: /longo prazo|nao e (?:um )?objetivo curto|constancia|so uma referencia|apenas uma referencia/,
  perception: /perco (?:peso|quilos)[^.]*rapid|dificuldade (?:para|de|em) ganhar|ectomorfo|metabolismo (?:muito )?rapido/,
  frequentMeals: /(?:nao|sem) ficar (?:muito )?tempo sem (?:me )?alimentar|comer bastante|de 3 em 3 horas/,
  stillPlays: /ainda jogo|ainda treino|continuo jogando|jogo (?:as vezes|nos fins)/,
  highLevel: /alto rendimento|profissional|competi|federad/,
  pastTraining: /boa base de academia|ja treinei|treinava|estava treinando|tava treinando|bons ganhos|parei de treinar|sem treinar/,
  beginner: /iniciante|nunca treinei|comecando agora/,
  yearsTraining: /treino ha (\d{1,2}) anos/,
  goalMass: /ganhar (?:um pouco )?(?:mais )?(?:de )?(?:massa|musculo|peso)|hipertrofia|massa muscular/,
  goalFat: /quero (?:emagrecer|perder (?:gordura|peso|barriga))|secar|definir/,
  goalCond: /condicionamento|folego|resistencia/,
  goalPerf: /(?:melhorar|ganhar) (?:a )?(?:explosao|agilidade|impulsao|velocidade)|performance/,
  goalHealth: /saude|qualidade de vida/,
  aesthetics: /estetica|aparencia/,
  keepAthleticism: /sem perder (?:a )?(?:agilidade|explosao|velocidade)/,
  days: /(\d)\s*(?:x|vezes|dias)\s*(?:por|na|a)\s*semana/,
  minutes: /(\d{2,3})\s*min/,
  hours: /(\d(?:[,.]5)?)\s*h(?:ora)?s?\s*(?:por|de)\s*(?:treino|dia)/,
  locFull: /academia completa|academia grande/,
  locCondo: /academia (?:do|de) (?:condominio|predio)/,
  locHome: /em casa|treino em casa|treinar em casa/,
  locOutdoor: /ao ar livre|no parque|na praca/,
  locGym: /(?:treino|treinar|treinando|vou treinar|malho) (?:na|em) (?:uma )?academia/,
  noInjuries: /sem (?:lesoes|lesao|dores)|nenhuma (?:lesao|dor)|nao tenho (?:nenhuma )?(?:lesao|dor|lesoes|dores)/,
  occupation: /(?:sou|trabalho como)\s+(estudante de [a-z ]+?|[a-z]+ de [a-z ]+?)(?=[.,;]|$)/,
  routine: /faculdade|trabalho|estagio|turno|plantao/,
}

const PAIN = /\bdor|doendo|lesao|lesionad|fratura|cirurgia|tendinite|inflamac|hernia/

// ---- leitura ----------------------------------------------------------------------

export function parseStory(input: string): { profile: StoryProfile; text: string; adjustments: TextAdjustment[] } {
  const { text, adjustments } = normalizeFreeText(input.slice(0, STORY_INPUT_LIMIT))
  const t = plain(text)
  const profile: StoryProfile = {
    sports: [],
    stillPlays: false,
    returning: false,
    goals: [],
    aesthetics: false,
    keepAthleticism: false,
    priorities: [],
    longTerm: false,
    fastMetabolismPerception: false,
    frequentMeals: false,
    supplements: [],
    noInjuries: false,
    injuryNotes: [],
    routine: [],
    unmatched: [],
  }

  const name = RULES.name.exec(t)
  if (name && name.index !== undefined) {
    const start = name.index + name[0].length - name[1].length
    profile.name = cap(text.slice(start, start + name[1].length))
  }
  const age = RULES.age.exec(t)
  if (age) profile.age = Number(age[1])

  const hm = RULES.heightM.exec(t)
  const hcm = RULES.heightCm.exec(t)
  if (hm) profile.heightCm = Math.round(Number(`${hm[1]}.${hm[2].padEnd(2, "0")}`) * 100)
  else if (hcm) profile.heightCm = Number(hcm[1])
  else {
    const guess = RULES.heightGuess.exec(t)
    if (guess && Number(guess[1]) >= 40 && Number(guess[1]) <= 99) profile.heightGuessCm = 100 + Number(guess[1])
  }

  const weight = RULES.weight.exec(t)
  if (weight) profile.weightKg = num(weight[1])

  const refs = Array.from(t.matchAll(RULES.refWeight)).map((m) => Number(m[1]))
  if (refs.length) profile.refWeightKg = refs[refs.length - 1]
  const when = RULES.refWhen.exec(t)
  if (when) profile.refWhen = `há ${when[1]} ${when[2]}`.replace(/\s+/g, " ")

  const loss = RULES.loss.exec(t)
  if (loss) profile.weightLossKg = Number(loss[1])
  else if (profile.refWeightKg && profile.weightKg && profile.refWeightKg - profile.weightKg >= 2)
    profile.weightLossKg = Math.round(profile.refWeightKg - profile.weightKg)
  profile.weightLossExplained = RULES.lossExplained.test(t)

  const target = RULES.target.exec(t)
  if (target) profile.targetWeightKg = Number(target[1])
  else if (RULES.recoverAll.test(t) && profile.refWeightKg) profile.targetWeightKg = profile.refWeightKg
  const months = RULES.months.exec(t)
  if (months) profile.targetMonths = Number(months[1])
  profile.longTerm = RULES.longTerm.test(t)

  profile.fastMetabolismPerception = RULES.perception.test(t)
  profile.frequentMeals = RULES.frequentMeals.test(t)
  profile.supplements = SUPPLEMENTS.filter(([, r]) => r.test(t)).map(([label]) => label)

  // esportes: anos de prática ficam na mesma frase do esporte
  const sentences = text.split(/(?<=[.!?…])\s+|\n+/).map((s) => s.trim()).filter(Boolean)
  for (const [label, r] of SPORTS) {
    const sentence = sentences.find((s) => r.test(plain(s)))
    if (!sentence) continue
    const ps = plain(sentence)
    const years = /(?:por|ha|durante|fazem?)\s*(?:uns\s*|mais de\s*)?(\d{1,2})\s*anos/.exec(ps)
    profile.sports.push({ name: label, years: years ? Number(years[1]) : undefined, highLevel: RULES.highLevel.test(ps) })
  }
  profile.stillPlays = RULES.stillPlays.test(t)

  if (RULES.beginner.test(t)) profile.level = "iniciante"
  const yt = RULES.yearsTraining.exec(t)
  if (yt) profile.level = Number(yt[1]) >= 3 ? "avancado" : "intermediario"
  profile.returning = RULES.pastTraining.test(t) || profile.sports.some((s) => s.highLevel)
  if (!profile.level && profile.returning) profile.level = "intermediario"

  const goals: FitnessGoal[] = []
  if (RULES.goalMass.test(t)) goals.push("ganhar-massa")
  if (RULES.goalFat.test(t)) goals.push("perder-gordura")
  if (RULES.goalCond.test(t)) goals.push("condicionamento")
  if (RULES.goalPerf.test(t) && !RULES.keepAthleticism.test(t)) goals.push("performance")
  if (RULES.goalHealth.test(t)) goals.push("saude")
  profile.goals = goals
  profile.aesthetics = RULES.aesthetics.test(t)
  profile.keepAthleticism = RULES.keepAthleticism.test(t)
  profile.priorities = PRIORITIES.filter(([, r]) => r.test(t)).map(([label]) => label)

  const days = RULES.days.exec(t)
  if (days) profile.days = Number(days[1])
  const minutes = RULES.minutes.exec(t)
  const hours = RULES.hours.exec(t)
  if (minutes) profile.minutes = Number(minutes[1])
  else if (hours) profile.minutes = Math.round(num(hours[1]) * 60)

  if (RULES.locFull.test(t)) profile.location = "academia-completa"
  else if (RULES.locCondo.test(t)) profile.location = "academia-condominio"
  else if (RULES.locHome.test(t)) profile.location = "casa"
  else if (RULES.locOutdoor.test(t)) profile.location = "ar-livre"
  else if (RULES.locGym.test(t)) profile.location = "academia-completa"

  profile.noInjuries = RULES.noInjuries.test(t)
  profile.injuryNotes = sentences.filter((s) => PAIN.test(plain(s)) && !RULES.noInjuries.test(plain(s)))

  const occ = RULES.occupation.exec(t)
  if (occ && occ.index !== undefined) {
    const start = t.indexOf(occ[1], occ.index)
    profile.occupation = text.slice(start, start + occ[1].length).trim()
  }
  profile.routine = sentences.filter((s) => RULES.routine.test(plain(s)))

  // frases que nenhuma regra aproveitou
  const consumed = (s: string) => {
    const ps = plain(s)
    return (
      Object.values(RULES).some((r) => new RegExp(r.source).test(ps)) ||
      SPORTS.some(([, r]) => r.test(ps)) ||
      PRIORITIES.some(([, r]) => r.test(ps)) ||
      SUPPLEMENTS.some(([, r]) => r.test(ps)) ||
      PAIN.test(ps)
    )
  }
  profile.unmatched = sentences.filter((s) => !consumed(s) && s.replace(/[^A-Za-zÀ-ÿ]/g, "").length >= 20)

  return { profile, text, adjustments }
}

/** Itens obrigatórios que o texto não trouxe (e que as respostas rápidas ainda não cobriram). */
export function storyMissing(profile: StoryProfile, answers: StoryAnswers): StoryMissing[] {
  const missing: StoryMissing[] = []
  if (!profile.heightCm && !answers.heightCm && profile.heightGuessCm) missing.push("height")
  if (!profile.days && !answers.days) missing.push("days")
  if (!profile.minutes && !answers.minutes) missing.push("minutes")
  if (!profile.location && !answers.location) missing.push("location")
  if (!profile.noInjuries && profile.injuryNotes.length === 0 && !answers.noInjuries && !answers.injuries?.trim())
    missing.push("injuries")
  return missing
}

// ---- prompt ------------------------------------------------------------------------

const fmt = (n: number) => String(Math.round(n * 10) / 10).replace(".", ",")
const round5 = (n: number) => Math.round(n / 5) * 5
const bullets = (items: (string | null | undefined | false)[]) =>
  items.filter(Boolean).map((i) => `- ${i}`).join("\n")

function split(days: number): string {
  if (days <= 2) return "full body A/B"
  if (days === 3) return "full body A/B/C ou upper/lower/full"
  if (days === 4) return "upper/lower duas vezes"
  return "upper/lower/push/pull/legs, só se a recuperação estiver boa"
}

export type StoryPromptResult = { prompt: string; attention: string[]; trimmed: boolean }

/** Monta o prompt pronto para as instruções de um Projeto no Claude ou no ChatGPT (até 6.000 caracteres). */
/** A perda de peso relevante sem explicação no texto pede uma confirmação rápida (opcional). */
export const needsLossCheck = (profile: StoryProfile) =>
  !!profile.weightLossKg && profile.weightLossKg >= 4 && !profile.weightLossExplained

export function buildStoryFitnessPrompt(profile: StoryProfile, answers: StoryAnswers): StoryPromptResult {
  const p = { ...profile, weightLossExplained: profile.weightLossExplained || answers.lossExplained === true }
  const heightCm = p.heightCm ?? answers.heightCm
  const days = p.days ?? answers.days
  const minutes = p.minutes ?? answers.minutes
  const location = p.location ?? answers.location
  const goals = p.goals.length ? p.goals : (["saude"] as FitnessGoal[])
  const massGoal = goals.includes("ganhar-massa")
  const fatGoal = goals.includes("perder-gordura")
  const attention: string[] = []

  // objetivo em uma frase
  const goalText = [
    ...goals.map((g) => labelOf(GOAL_OPTIONS, g).toLowerCase()),
    p.aesthetics ? "melhorar a estética" : null,
  ]
    .filter(Boolean)
    .join(" e ")
  const opening = `Atue como meu personal trainer e coach de hábitos. Quero ${goalText}${p.keepAthleticism ? ", sem perder agilidade e explosão" : ""}${p.longTerm ? ", com constância: meu objetivo é de longo prazo, não um resultado rápido" : ""}. Seu papel é montar e ajustar uma rotina sustentável de treino, alimentação e recuperação. Você não substitui médico, nutricionista ou profissional de educação física presencial.`

  // quem sou eu
  const body = [
    p.age ? `${p.age} anos` : null,
    heightCm ? `${(heightCm / 100).toFixed(2).replace(".", ",")} m` : null,
    p.weightKg ? `${fmt(p.weightKg)} kg hoje` : null,
  ]
    .filter(Boolean)
    .join(", ")
  const who = bullets([
    [p.name, body, p.occupation ? cap(p.occupation) : null].filter(Boolean).join(". ") + ".",
    ...p.sports.map(
      (s) =>
        `${cap(s.name)}${s.years ? ` por ${s.years} anos` : ""}${s.highLevel ? ", em alto rendimento" : ""}${p.stillPlays ? ". Ainda pratico, com menos frequência" : ""}.`,
    ),
    p.returning ? "Tenho experiência de treino, mas estou voltando depois de uma pausa." : null,
    p.level === "iniciante" ? "Sou iniciante." : null,
    p.refWeightKg
      ? `${p.refWhen ? cap(p.refWhen) : "Antes"} eu estava com ~${p.refWeightKg} kg${p.weightLossExplained ? "; perdi peso ao parar de treinar com constância e comer de forma irregular" : ""}.`
      : null,
    p.fastMetabolismPerception
      ? "Percebo que perco peso rápido e tenho dificuldade para ganhar. Trate isso como minha percepção, não como diagnóstico: ajuste a alimentação pela tendência real do peso."
      : null,
    p.noInjuries || answers.noInjuries
      ? "Sem lesões ou dores atuais."
      : p.injuryNotes.length || answers.injuries
        ? `Dores ou limitações: ${[...p.injuryNotes, answers.injuries].filter(Boolean).join(" ")}`
        : null,
  ])

  // objetivos
  let pace: string | null = null
  if (p.targetWeightKg && p.weightKg && p.targetMonths) {
    const weekly = (p.targetWeightKg - p.weightKg) / (p.targetMonths * 4.33)
    const recovering = p.refWeightKg !== undefined && p.targetWeightKg <= p.refWeightKg
    const plausible = Math.abs(weekly) <= 0.5 || recovering
    pace = `Referência: chegar a ~${p.targetWeightKg} kg em cerca de ${p.targetMonths} meses (~${fmt(Math.abs(weekly))} kg por semana). ${plausible ? (recovering ? "É plausível, porque estou recuperando massa que já tive." : "É um ritmo plausível.") : "É ambicioso: trate como teto e mire 0,25 a 0,5 kg por semana."} É uma referência, não uma obrigação; o mais importante é constância.`
  } else if (p.targetWeightKg) {
    pace = `Referência de peso: ~${p.targetWeightKg} kg. É uma referência, não uma obrigação.`
  }
  const objectives = bullets([
    p.priorities.length
      ? `Prioridade visual: ${p.priorities.join(", ")}. Os demais grupos com volume de manutenção, para equilíbrio e prevenção de lesão, inclusive pernas.`
      : null,
    p.keepAthleticism ? "Mantenha agilidade e explosão com pliometria e trabalho de potência em baixo volume, sem fadiga." : null,
    pace,
  ])

  // rotina
  const routine = bullets([
    `${days} treinos por semana, até ${minutes} minutos, em ${labelOf(LOCATION_OPTIONS, location ?? "").toLowerCase()}.`,
    p.stillPlays && p.sports.length
      ? `O ${p.sports[0].name} conta na carga semanal: nada de perna pesada ou pliometria na véspera de jogo.`
      : null,
    p.routine.length ? "Adapte os treinos à minha rotina de estudos e trabalho; em semanas cheias, prefira versões curtas." : null,
  ])

  // treino
  const training = bullets([
    p.returning
      ? "Primeiras 2 semanas: cerca de 50% a 60% do volume, 2 a 3 repetições na reserva, sem perseguir cargas antigas. Depois suba o volume aos poucos."
      : "Comece com 1 a 2 semanas de volume moderado e técnica.",
    days ? `Divisão sugerida: ${split(days)}.` : null,
    massGoal || p.aesthetics
      ? `${p.priorities.length ? "Grupos prioritários com 12 a 18 séries por semana, 2 ou mais vezes por semana; os demais com 8 a 12." : "10 a 20 séries por grupo muscular por semana, cada grupo 2 ou mais vezes."} Maioria das séries entre 6 e 15 repetições, terminando a 0 a 3 da falha.`
      : null,
    "Use dupla progressão (primeiro repetições, depois carga). Descanso de 2 a 3 min nos compostos e 1 a 2 min nos isolados.",
    "Inclua mobilidade, core e trabalho unilateral. Semana leve (deload) a cada 4 a 8 semanas ou quando o desempenho cair.",
    "Em cada treino mostre duração, ordem, séries × repetições, descanso, RIR e o motivo das escolhas, marcado como PLANEJADO. Ofereça versão de 20 a 30 min para dias corridos.",
  ])

  // alimentação
  const food = p.weightKg
    ? bullets([
        `Proteína: ~${round5(p.weightKg * 1.6)} a ${round5(p.weightKg * 2.2)} g por dia (1,6 a 2,2 g/kg), em 4 a 5 refeições.`,
        massGoal
          ? "Energia: leve superávit. Se a média semanal do peso não subir em 2 semanas, aumente ~200 a 300 kcal por dia, de preferência com refeições práticas."
          : fatGoal
            ? "Energia: déficit moderado (perda de 0,5% a 1% do peso por semana), mantendo o treino de força."
            : "Energia: perto da manutenção.",
        "Ajuste a cada 2 a 3 semanas pela média semanal do peso, não por pesagens isoladas.",
        p.frequentMeals ? "Não me deixe passar longos períodos sem comer; sugira lanches práticos e portáteis." : null,
        p.supplements.length
          ? `Já usei ${p.supplements.join(" e ")} e funcionou para mim. ${p.supplements.includes("creatina") ? "Creatina monohidratada 3 a 5 g por dia tem boa evidência. " : ""}${p.supplements.includes("whey") ? "Whey é conveniência para bater a proteína, não obrigação. " : ""}Sem marcas, e com avaliação médica se houver doença renal.`
          : null,
      ])
    : bullets(["Proteína: 1,6 a 2,2 g por kg por dia, em 4 a 5 refeições. Peça meu peso para calcular."])

  // segurança
  const signals = detectHealthSignals(p.injuryNotes.join(" "), answers.injuries ?? "")
  if (signals.pregnancy) attention.push("Mencionei gestação: dê só orientações gerais e peça liberação do obstetra antes de qualquer treino.")
  if (signals.cardio) attention.push("Mencionei condição cardiovascular ou pressão alta: recomende liberação médica antes de começar.")
  if (signals.injuryAreas.length)
    attention.push(`Dor ou lesão em ${signals.injuryAreas.join(", ")}: evite sobrecarregar, ofereça alternativas e recomende avaliação de médico ou fisioterapeuta.`)
  if (p.weightLossKg && p.weightLossKg >= 4)
    attention.push(
      p.weightLossExplained
        ? `Perdi ~${p.weightLossKg} kg recentemente, explicado por parar de treinar e comer de forma irregular. Se a perda voltar sem explicação, recomende avaliação médica, sem alarmismo.`
        : `Perdi ~${p.weightLossKg} kg sem uma explicação clara: recomende avaliação médica, sem alarmismo.`,
    )
  if (p.age !== undefined && p.age < 18) attention.push("Sou menor de idade: progressão conservadora e supervisão de um adulto ou profissional.")

  const safety = bullets([
    ...attention,
    "Não invente dados nem diga que acessou fontes que não acessou. Dados de relógio são estimativas.",
    "Dor que piora, tontura, dor no peito ou falta de ar desproporcional: oriente procurar um profissional de saúde.",
    "Não diagnostique, não prometa efeitos hormonais e não recomende dietas extremas.",
  ])

  const log = bullets([
    "Quando eu relatar treino, peso, refeições ou sono, organize com data e separe PLANEJADO, REALIZADO (só se eu confirmar), ESTIMATIVA e NÃO CONFIRMADO.",
    "Ajuste o plano por padrões do meu feedback, não por uma sessão isolada.",
  ])

  const sections = (others: string[]) =>
    [
      opening,
      `## Quem sou eu\n${who}`,
      objectives ? `## Objetivos\n${objectives}` : null,
      `## Rotina\n${routine}`,
      `## Como montar meus treinos\n${training}`,
      `## Alimentação\n${food}`,
      `## Registro e ajustes\n${log}`,
      others.length ? `## Outros detalhes que contei\n${others.map((o) => `- ${o}`).join("\n")}` : null,
      `## Segurança\n${safety}`,
      "## Comunicação\nResponda em português do Brasil, de forma direta e prática. Pergunte só o que muda o plano.",
    ]
      .filter(Boolean)
      .join("\n\n")

  // respeita o limite de 6.000 caracteres tirando primeiro os detalhes extras
  let others = [...p.unmatched]
  let prompt = sections(others)
  let trimmed = false
  while (prompt.length > STORY_PROMPT_LIMIT && others.length) {
    others = others.slice(0, -1)
    trimmed = true
    prompt = sections(others)
  }
  return { prompt: prompt.slice(0, STORY_PROMPT_LIMIT), attention, trimmed }
}

// ---- resumo para a tela -----------------------------------------------------------------

/** O que a leitura entendeu, em pares rótulo/valor, para a pessoa conferir. */
export function summarizeProfile(p: StoryProfile): { label: string; value: string; confirm?: boolean }[] {
  const items: { label: string; value: string; confirm?: boolean }[] = []
  const add = (label: string, value: string | undefined | false, confirm?: boolean) => {
    if (value) items.push({ label, value, confirm })
  }
  add("Nome", p.name)
  add("Idade", p.age !== undefined ? `${p.age} anos` : undefined)
  add(
    "Altura",
    p.heightCm
      ? `${(p.heightCm / 100).toFixed(2).replace(".", ",")} m`
      : p.heightGuessCm
        ? `${(p.heightGuessCm / 100).toFixed(2).replace(".", ",")} m?`
        : undefined,
    !p.heightCm && !!p.heightGuessCm,
  )
  add("Peso hoje", p.weightKg !== undefined ? `${fmt(p.weightKg)} kg` : undefined)
  add("Peso antes", p.refWeightKg !== undefined ? `${p.refWeightKg} kg${p.refWhen ? ` (${p.refWhen})` : ""}` : undefined)
  add("Ocupação", p.occupation ? cap(p.occupation) : undefined)
  add(
    "Esporte",
    p.sports.length
      ? p.sports.map((s) => `${s.name}${s.years ? `, ${s.years} anos` : ""}${s.highLevel ? ", alto rendimento" : ""}`).join("; ")
      : undefined,
  )
  add("Experiência", p.level === "iniciante" ? "iniciante" : p.returning ? "voltando após uma pausa" : undefined)
  add(
    "Objetivos",
    [...p.goals.map((g) => labelOf(GOAL_OPTIONS, g).toLowerCase()), p.aesthetics ? "estética" : null, p.keepAthleticism ? "manter agilidade e explosão" : null]
      .filter(Boolean)
      .join(", ") || undefined,
  )
  add("Prioridades", p.priorities.length ? p.priorities.join(", ") : undefined)
  add("Meta", p.targetWeightKg ? `~${p.targetWeightKg} kg${p.targetMonths ? ` em ${p.targetMonths} meses` : ""}${p.longTerm ? " (referência)" : ""}` : undefined)
  add("Suplementos", p.supplements.length ? p.supplements.join(", ") : undefined)
  add("Alimentação", p.frequentMeals ? "precisa comer com frequência" : undefined)
  add("Percepção", p.fastMetabolismPerception ? "perde peso rápido (tratado como percepção)" : undefined)
  add("Dias", p.days ? `${p.days} por semana` : undefined)
  add("Tempo", p.minutes ? `${p.minutes} min` : undefined)
  add("Local", p.location ? labelOf(LOCATION_OPTIONS, p.location) : undefined)
  add("Lesões", p.noInjuries ? "nenhuma" : p.injuryNotes.length ? "citadas no texto" : undefined)
  return items
}
