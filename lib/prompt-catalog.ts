import type { PromptCategory } from "@/types/prompt"

export { PROMPT_TEMPLATES, getTemplate } from "@/lib/prompt-templates"

// ---- categorias do catálogo --------------------------------------------------

export const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "fitness",
    title: "Fitness",
    description: "O Personal IA monta um prompt de treino com seu objetivo, rotina, equipamentos e limitações.",
    art: "ember",
    seed: 7,
    featured: true,
    items: [
      { kind: "fitness", id: "fitness-gordura", title: "Perder gordura", meta: "Personal IA", goal: "perder-gordura" },
      { kind: "fitness", id: "fitness-massa", title: "Ganhar massa", meta: "Personal IA", goal: "ganhar-massa" },
      { kind: "fitness", id: "fitness-performance", title: "Performance e explosão", meta: "Personal IA", goal: "performance" },
      { kind: "fitness", id: "fitness-condicionamento", title: "Condicionamento", meta: "Personal IA", goal: "condicionamento" },
    ],
  },
  {
    id: "estudos",
    title: "Estudos",
    description: "Cronogramas, revisões e explicações no seu nível.",
    art: "glacier",
    seed: 4,
    items: [
      { kind: "template", id: "estudos-plano", title: "Plano de estudos", meta: "Prompt guiado", templateId: "plano-de-estudos" },
      { kind: "template", id: "estudos-revisao", title: "Revisão para prova", meta: "Prompt guiado", templateId: "revisao-para-prova" },
      { kind: "template", id: "estudos-explicador", title: "Explicador de matéria", meta: "Prompt guiado", templateId: "explicador-de-materia" },
    ],
  },
  {
    id: "carreira",
    title: "Carreira",
    description: "Currículo, entrevistas e perfil profissional sem inventar nada.",
    art: "dusk",
    seed: 12,
    items: [
      { kind: "template", id: "carreira-ats", title: "Currículo ATS", meta: "Prompt guiado", templateId: "curriculo-ats" },
      { kind: "template", id: "carreira-entrevista", title: "Entrevista tech", meta: "Prompt guiado", templateId: "entrevista-tech" },
      { kind: "template", id: "carreira-linkedin", title: "LinkedIn", meta: "Prompt guiado", templateId: "linkedin" },
    ],
  },
  {
    id: "produtividade",
    title: "Produtividade",
    description: "Semanas, tarefas e rotinas que cabem na vida real.",
    art: "verdant",
    seed: 5,
    items: [
      { kind: "template", id: "prod-semanal", title: "Planejamento semanal", meta: "Prompt guiado", templateId: "planejamento-semanal" },
      { kind: "template", id: "prod-tarefas", title: "Organização de tarefas", meta: "Prompt guiado", templateId: "organizacao-de-tarefas" },
      { kind: "template", id: "prod-rotina", title: "Rotina personalizada", meta: "Prompt guiado", templateId: "rotina-personalizada" },
    ],
  },
  {
    id: "ingles",
    title: "Inglês",
    description: "Professor, conversação e correção de escrita.",
    art: "aurora",
    seed: 3,
    items: [
      { kind: "template", id: "ingles-professor", title: "Professor particular", meta: "Prompt guiado", templateId: "professor-de-ingles" },
      { kind: "template", id: "ingles-conversa", title: "Conversação", meta: "Prompt guiado", templateId: "conversacao-ingles" },
      { kind: "template", id: "ingles-escrita", title: "Correção de escrita", meta: "Prompt guiado", templateId: "correcao-de-escrita" },
    ],
  },
]
