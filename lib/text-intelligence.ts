/*
 * Tratamento de texto livre digitado pelo usuário, feito 100% no navegador e sem rede.
 * Objetivo: o prompt sair com português limpo, mesmo quando a entrada tem erros, sem trocar
 * palavras que estão certas. Toda mudança é registrada para o usuário poder conferir.
 */

export type TextAdjustment = { from: string; to: string }
export type NormalizedText = { text: string; adjustments: TextAdjustment[] }

// ---- vocabulário --------------------------------------------------------------

/** Palavras do domínio (com acento). A partir delas deduzimos acentos faltando e erros de digitação. */
const LEXICON = `
você vocês não também então já são além após agora amanhã atenção condição informação situação função opção
avaliação alimentação preferência preferências experiência experiências período horário horários próximo próxima
último última útil difícil fácil possível rápido água saúde cansaço coração exercício exercícios musculação
ginástica condicionamento explosão potência resistência flexibilidade mobilidade alongamento aquecimento descanso
recuperação hipertrofia emagrecimento definição força séries repetições intervalo intensidade execução técnica
progressão semana semanas treino treinos academia condomínio esteira bicicleta elíptico halteres halter barra
anilhas kettlebell elástico elásticos polia polias máquina máquinas supino agachamento levantamento remada
puxada rosca tríceps bíceps ombro ombros peito costas abdômen abdominal lombar coluna joelho joelhos tornozelo
quadril punho cotovelo panturrilha glúteo glúteos posterior quadríceps perna pernas braço braços pescoço lesão
lesões dor dores tendinite bursite hérnia cirurgia fratura pressão diabetes hipertensão gravidez gestante asma
medicação remédio dieta proteína carboidrato calorias hidratação corrida caminhada natação futebol basquete
vôlei ciclismo funcional pilates crossfit iniciante intermediário avançado manhã tarde noite madrugada segunda
terça quarta quinta sexta sábado domingo trabalho faculdade escola estudo estudos prova provas concurso
vestibular matéria conteúdo dificuldade dificuldades revisão resumo cronograma currículo formação vaga empresa
entrevista projeto projetos tecnologia tecnologias desenvolvedor programação inglês gramática vocabulário
conversação escrita pronúncia redação português espanhol idioma idiomas viagem intercâmbio certificação língua
físico física físicos físicas médico médica clínico fisioterapeuta nutricionista profissional
disponível disponibilidade sedentário atividade rotina objetivo objetivos limitação limitações observação
observações queixa articulação músculo músculos massa gordura peso altura idade frequência duração
`
  .split(/\s+/)
  .filter(Boolean)

/** Palavras corretas que ficam perto do vocabulário e nunca devem ser trocadas. */
const KNOWN = new Set(
  `
treinar treinando treinei estudar estudando trabalhar trabalhando fazendo fazer tenho preciso quero gosto
melhorar aumentar diminuir perder ganhar manter começar começando academia posso poder consigo conseguir
cansada cansado cansaço sentindo sinto tempo horas minutos dias semanal diário diária muitas muitos pouco pouca
costumo costumava normalmente geralmente sempre nunca depois antes durante enquanto porque quando onde
casa condomínio parque rua praia piscina quadra pilates ombros joelhos costas pernas braços
`
    .split(/\s+/)
    .filter(Boolean),
)

/** Abreviações e grafias de chat que podem ser expandidas com segurança. */
const ABBREVIATIONS: Record<string, string> = {
  vc: "você",
  vcs: "vocês",
  pq: "porque",
  tb: "também",
  tbm: "também",
  td: "tudo",
  tds: "todos",
  hj: "hoje",
  qnd: "quando",
  qdo: "quando",
  dps: "depois",
  mt: "muito",
  mto: "muito",
  msm: "mesmo",
  nd: "nada",
  ngm: "ninguém",
  cmg: "comigo",
  fds: "fim de semana",
  naum: "não",
  nao: "não",
  n: "não",
  q: "que",
  faco: "faço",
  voce: "você",
  voces: "vocês",
  tambem: "também",
  entao: "então",
  ja: "já",
  sao: "são",
}

// ---- utilidades -----------------------------------------------------------------

const stripAccents = (word: string) => word.normalize("NFD").replace(/[̀-ͯ]/g, "")

/** Distância de edição com troca de letras vizinhas (agachamneto -> agachamento custa 1). */
export function editDistance(a: string, b: string): number {
  const rows = a.length + 1
  const cols = b.length + 1
  const d: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(0))
  for (let i = 0; i < rows; i++) d[i][0] = i
  for (let j = 0; j < cols; j++) d[0][j] = j
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[a.length][b.length]
}

const LEXICON_SET = new Set(LEXICON)
/** forma sem acento -> palavra certa (só quando a forma sem acento não é outra palavra válida). */
const DEACCENTED = new Map<string, string>()
for (const word of LEXICON) {
  const plain = stripAccents(word)
  if (plain !== word && !KNOWN.has(plain)) DEACCENTED.set(plain, word)
}

function matchCase(original: string, replacement: string): string {
  if (original.length > 1 && original === original.toUpperCase()) return replacement.toUpperCase()
  if (original[0] && original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function isKnown(lower: string): boolean {
  if (LEXICON_SET.has(lower) || KNOWN.has(lower)) return true
  const singular = lower.endsWith("es") ? lower.slice(0, -2) : lower.endsWith("s") ? lower.slice(0, -1) : lower
  return LEXICON_SET.has(singular) || KNOWN.has(singular)
}

/** Procura a palavra do vocabulário mais próxima, só quando há um único candidato claro. */
function fuzzyMatch(lower: string): string | null {
  if (lower.length < 6) return null
  const plural = lower.endsWith("s") && lower.length > 6
  const stem = plural ? lower.slice(0, -1) : lower
  const limit = stem.length >= 9 ? 2 : 1
  const plain = stripAccents(stem)

  let best: string | null = null
  let bestDistance = Infinity
  let tie = false
  for (const candidate of LEXICON) {
    if (Math.abs(candidate.length - stem.length) > limit) continue
    const candidatePlain = stripAccents(candidate)
    if (candidatePlain[0] !== plain[0]) continue
    // só a última letra muda: é flexão (cansado/cansada), não erro de digitação
    if (candidatePlain.length === plain.length && candidatePlain.slice(0, -1) === plain.slice(0, -1)) continue
    const distance = editDistance(plain, candidatePlain)
    if (distance === 0 || distance > limit) continue
    if (distance < bestDistance) {
      best = candidate
      bestDistance = distance
      tie = false
    } else if (distance === bestDistance && candidate !== best) {
      tie = true
    }
  }
  if (!best || tie) return null
  return plural ? `${best}s` : best
}

/** Corrige uma palavra isolada. Devolve `null` quando não há motivo para mexer. */
function fixWord(word: string, atSentenceStart: boolean): string | null {
  // nomes próprios, siglas, termos com número ou símbolo ficam como estão
  if (/\d/.test(word) || /[A-Z].*[A-Z]/.test(word.slice(1))) return null
  const startsUpper = word[0] !== word[0].toLowerCase()
  if (startsUpper && !atSentenceStart && word !== word.toUpperCase()) return null

  const lower = word.toLowerCase()
  const abbreviation = ABBREVIATIONS[lower]
  if (abbreviation) return matchCase(word, abbreviation)
  if (isKnown(lower)) return null

  const accent = DEACCENTED.get(lower) ?? (lower.endsWith("s") ? DEACCENTED.get(lower.slice(0, -1)) : undefined)
  if (accent) return matchCase(word, lower.endsWith("s") && !DEACCENTED.has(lower) ? `${accent}s` : accent)

  const fuzzy = fuzzyMatch(lower)
  return fuzzy ? matchCase(word, fuzzy) : null
}

// ---- normalização do texto -------------------------------------------------------

/** Limpa e corrige um texto livre sem alterar o sentido. */
export function normalizeFreeText(input: string): NormalizedText {
  const adjustments: TextAdjustment[] = []
  const note = (from: string, to: string) => {
    if (from !== to && !adjustments.some((a) => a.from === from && a.to === to)) adjustments.push({ from, to })
  }

  let text = input.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim()
  if (!text) return { text: "", adjustments }

  // gritaria: texto quase todo em maiúsculas vira texto normal
  const letters = text.replace(/[^A-Za-zÀ-ÿ]/g, "")
  if (letters.length > 8 && letters === letters.toUpperCase()) text = text.toLowerCase()

  // pontuação: espaço antes de vírgula/ponto, repetições e espaço depois
  text = text
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([!?.,])\1{1,}/g, (m) => (m.startsWith(".") && m.length === 3 ? "…" : m[0]))
    .replace(/([,;:])(?=[^\s\d])/g, "$1 ")
    .replace(/([!?])(?=[A-Za-zÀ-ÿ])/g, "$1 ")
    .replace(/(?<=[a-zà-ÿ])\.(?=[A-ZÀ-Ý])/g, ". ")

  // palavras repetidas em sequência: "o o joelho" -> "o joelho"
  text = text.replace(/\b([A-Za-zÀ-ÿ]{2,})\s+\1\b/gi, (match, word: string) => {
    note(match, word)
    return word
  })

  // palavra a palavra
  let atStart = true
  text = text.replace(/[A-Za-zÀ-ÿ]+|[.!?]\s+|\n/g, (token) => {
    if (/^[.!?]\s+$/.test(token) || token === "\n") {
      atStart = true
      return token
    }
    const fixed = fixWord(token, atStart)
    atStart = false
    if (fixed) {
      note(token, fixed)
      return fixed
    }
    return token
  })

  // maiúscula no começo das frases
  text = text.replace(/(^|[.!?]\s+|\n)([a-zà-ÿ])/g, (_, lead: string, letter: string) => lead + letter.toUpperCase())

  // frase completa termina com ponto; fragmentos curtos ("joelho direito") ficam como estão
  if (text.length > 40 && !/[.!?…:)]$/.test(text) && !text.includes("\n")) text += "."

  return { text, adjustments }
}

// ---- números ------------------------------------------------------------------------

/** Lê números digitados de forma livre: "81,5 kg", "28 anos", "1,75 m". */
export function parseLooseNumber(value: string): number | null {
  const cleaned = value.trim().replace(/[^\d.,-]/g, "").replace(",", ".")
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

/** Altura em centímetros. Aceita "1,75" (metros) e "175" (centímetros). */
export function parseHeightCm(value: string): number | null {
  const n = parseLooseNumber(value)
  if (n === null) return null
  return n > 0 && n < 3 ? Math.round(n * 100) : Math.round(n)
}

// ---- pontos de atenção ----------------------------------------------------------------

const matches = (text: string, pattern: RegExp) => pattern.test(stripAccents(text.toLowerCase()))

export type HealthSignals = {
  pregnancy: boolean
  cardio: boolean
  metabolic: boolean
  respiratory: boolean
  eatingDisorder: boolean
  injuryAreas: string[]
  pain: boolean
}

const INJURY_AREAS: [string, RegExp][] = [
  ["joelho", /joelh|menisc|ligament/],
  ["ombro", /ombro|manguito/],
  ["lombar/coluna", /lombar|coluna|hernia|protrus|escolios|ciatic/],
  ["tornozelo/pé", /tornozel|\bpe\b|fascite/],
  ["quadril", /quadril/],
  ["punho/cotovelo", /punho|cotovel|tendinite/],
  ["pescoço", /pescoc|cervical/],
]

/** Lê lesões, dores e condições citadas em texto livre, mesmo com erros de digitação. */
export function detectHealthSignals(...texts: string[]): HealthSignals {
  const joined = texts.join(" ")
  return {
    pregnancy: matches(joined, /gravid|gestan|gestac/),
    cardio: matches(joined, /cardi|coracao|infarto|arritmia|pressao alta|hipertens|marcapasso|avc/),
    metabolic: matches(joined, /diabet|glicemia|tireoide|colesterol/),
    respiratory: matches(joined, /\basma|bronquit|falta de ar|dpoc/),
    eatingDisorder: matches(joined, /anorex|bulimi|compulsao|transtorno alimentar/),
    injuryAreas: INJURY_AREAS.filter(([, pattern]) => matches(joined, pattern)).map(([area]) => area),
    pain: matches(joined, /\bdor|doendo|lesao|lesionad|fratura|cirurgia|tendinite|inflamac/),
  }
}
