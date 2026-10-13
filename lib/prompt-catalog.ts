import type { PromptCategory, PromptTemplate, TemplateField } from "@/types/prompt"

// ---- campos reutilizados ---------------------------------------------------

const deadlineField: TemplateField = {
  id: "prazo",
  label: "Data ou prazo",
  kind: "date",
  hint: "Opcional. Deixe em branco se não houver data definida.",
}

const timePerDayField: TemplateField = {
  id: "tempo",
  label: "Tempo disponível por dia",
  kind: "select",
  required: true,
  options: [
    { value: "15 minutos", label: "15 minutos" },
    { value: "30 minutos", label: "30 minutos" },
    { value: "1 hora", label: "1 hora" },
    { value: "2 horas", label: "2 horas" },
    { value: "3 horas ou mais", label: "3 horas ou mais" },
  ],
}

const englishLevelField: TemplateField = {
  id: "nivel",
  label: "Nível de inglês",
  kind: "select",
  required: true,
  options: [
    { value: "Iniciante (A1–A2)", label: "Iniciante (A1–A2)" },
    { value: "Intermediário (B1–B2)", label: "Intermediário (B1–B2)" },
    { value: "Avançado (C1–C2)", label: "Avançado (C1–C2)" },
    { value: "Não sei meu nível", label: "Não sei meu nível" },
  ],
}

// ---- modelos experimentais -------------------------------------------------

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "plano-de-estudos",
    categoryId: "estudos",
    title: "Plano de estudos",
    description: "Um cronograma realista para o tempo que você tem, com revisões e prioridades.",
    role: "um planejador de estudos experiente, que monta cronogramas realistas e baseados em revisão espaçada e prática ativa",
    task: "Crie um plano de estudos personalizado para o objetivo descrito.",
    fields: [
      { id: "materia", label: "Matéria ou objetivo", kind: "text", required: true, placeholder: "Ex.: Cálculo I, ENEM, certificação AWS" },
      {
        id: "nivel",
        label: "Nível atual",
        kind: "select",
        required: true,
        options: [
          { value: "Começando do zero", label: "Começando do zero" },
          { value: "Sei o básico", label: "Sei o básico" },
          { value: "Intermediário", label: "Intermediário" },
          { value: "Avançado, preciso revisar", label: "Avançado, preciso revisar" },
        ],
      },
      deadlineField,
      timePerDayField,
      { id: "dias", label: "Dias disponíveis", kind: "text", required: true, placeholder: "Ex.: segunda a sexta, sábado de manhã" },
      { id: "dificuldades", label: "Principais dificuldades", kind: "textarea", required: true, placeholder: "Ex.: perco o foco, esqueço o conteúdo, não sei por onde começar" },
    ],
    rules: [
      "Distribua o conteúdo de acordo com o tempo real disponível, sem sobrecarregar a semana.",
      "Inclua revisões espaçadas e sessões de prática ativa (exercícios, questões, flashcards).",
      "Se houver prazo, priorize os tópicos de maior peso e reserve a última semana para revisão.",
    ],
    outputFormat: [
      "Diagnóstico rápido do ponto de partida",
      "Lista de tópicos em ordem de prioridade",
      "Cronograma semanal em tabela (dia, tópico, atividade, duração)",
      "Estratégia de revisão",
      "Como medir o progresso a cada semana",
      "Plano B para semanas com menos tempo",
    ],
  },
  {
    id: "revisao-para-prova",
    categoryId: "estudos",
    title: "Revisão para prova",
    description: "Uma revisão focada nos tópicos que mais pesam, com questões de treino.",
    role: "um tutor especialista em revisão para provas",
    task: "Monte uma revisão objetiva para a prova descrita, priorizando o que mais cai e o que eu domino menos.",
    fields: [
      { id: "prova", label: "Prova ou disciplina", kind: "text", required: true, placeholder: "Ex.: prova de Biologia do 2º ano" },
      { id: "conteudo", label: "Conteúdos que vão cair", kind: "textarea", required: true, placeholder: "Liste os tópicos ou cole a ementa" },
      { ...deadlineField, label: "Data da prova", required: true, hint: undefined },
      { id: "dificuldades", label: "Tópicos em que tenho mais dificuldade", kind: "textarea" },
    ],
    rules: [
      "Comece pelos tópicos de maior dificuldade e maior peso.",
      "Use perguntas de verificação antes de avançar para o próximo tópico.",
    ],
    outputFormat: [
      "Plano de revisão dia a dia até a prova",
      "Resumo esquemático de cada tópico",
      "Cinco questões de treino por tópico, com gabarito comentado",
      "Checklist final para a véspera",
    ],
  },
  {
    id: "explicador-de-materia",
    categoryId: "estudos",
    title: "Explicador de matéria",
    description: "Explicações no seu nível, com exemplos e perguntas para fixar.",
    role: "um professor paciente que explica conceitos difíceis com clareza e exemplos do cotidiano",
    task: "Explique o tema abaixo no meu nível e verifique se entendi.",
    fields: [
      { id: "tema", label: "Tema ou conceito", kind: "text", required: true, placeholder: "Ex.: derivadas, fotossíntese, recursão" },
      {
        id: "nivel",
        label: "Meu nível",
        kind: "select",
        required: true,
        options: [
          { value: "Ensino fundamental", label: "Ensino fundamental" },
          { value: "Ensino médio", label: "Ensino médio" },
          { value: "Graduação", label: "Graduação" },
          { value: "Profissional", label: "Profissional" },
        ],
      },
      { id: "duvida", label: "O que não ficou claro", kind: "textarea", placeholder: "Opcional. Descreva onde você trava." },
    ],
    rules: [
      "Use analogias simples antes da definição formal.",
      "Explique em partes curtas e pergunte se posso continuar.",
    ],
    outputFormat: [
      "Explicação em linguagem simples",
      "Um exemplo resolvido passo a passo",
      "Erros comuns sobre o tema",
      "Três perguntas para eu responder e verificar o entendimento",
    ],
  },
  {
    id: "curriculo-ats",
    categoryId: "carreira",
    title: "Currículo ATS",
    description: "Reescreve seu currículo para sistemas de triagem, sem inventar nada.",
    role: "um especialista em recrutamento e em currículos otimizados para sistemas ATS",
    task: "Reescreva meu currículo para a vaga desejada, otimizado para ATS, usando somente as informações que eu forneci.",
    fields: [
      { id: "vaga", label: "Vaga desejada", kind: "text", required: true, placeholder: "Ex.: Desenvolvedor Front-end Pleno" },
      { id: "experiencias", label: "Experiências profissionais", kind: "textarea", required: true, placeholder: "Empresa, cargo, período e principais entregas" },
      { id: "projetos", label: "Projetos", kind: "textarea", placeholder: "Opcional. Nome, objetivo, tecnologias e resultados" },
      { id: "tecnologias", label: "Tecnologias e competências", kind: "textarea", required: true },
      { id: "formacao", label: "Formação", kind: "textarea", required: true },
      { id: "idiomas", label: "Idiomas", kind: "text", required: true, placeholder: "Ex.: inglês intermediário, espanhol básico" },
    ],
    rules: [
      "Nunca invente experiências, cargos, datas, empresas, métricas ou certificações.",
      "Se um resultado não tiver número, não crie um número: sugira entre colchetes que eu complete, por exemplo [informar %].",
      "Use palavras-chave da vaga somente quando forem verdadeiras para o meu perfil.",
      "Use formatação simples, sem tabelas, colunas ou ícones, para facilitar a leitura por ATS.",
    ],
    outputFormat: [
      "Currículo completo em texto simples, com seções padrão",
      "Lista das palavras-chave usadas e onde aparecem",
      "Pontos que eu preciso completar ou confirmar",
      "Sugestões de melhoria que dependem de informações que eu ainda não dei",
    ],
  },
  {
    id: "entrevista-tech",
    categoryId: "carreira",
    title: "Entrevista tech",
    description: "Simulação de entrevista com feedback, no formato da sua vaga.",
    role: "um entrevistador técnico sênior e mentor de carreira",
    task: "Prepare-me para a entrevista descrita e conduza uma simulação realista com feedback.",
    fields: [
      { id: "vaga", label: "Tipo de vaga", kind: "text", required: true, placeholder: "Ex.: Back-end, Dados, Mobile" },
      {
        id: "senioridade",
        label: "Senioridade",
        kind: "select",
        required: true,
        options: [
          { value: "Estágio", label: "Estágio" },
          { value: "Júnior", label: "Júnior" },
          { value: "Pleno", label: "Pleno" },
          { value: "Sênior", label: "Sênior" },
        ],
      },
      { id: "tecnologias", label: "Tecnologias", kind: "text", required: true, placeholder: "Ex.: React, Node.js, SQL" },
      {
        id: "tipo",
        label: "Tipo de entrevista",
        kind: "select",
        required: true,
        options: [
          { value: "Comportamental", label: "Comportamental" },
          { value: "Técnica conceitual", label: "Técnica conceitual" },
          { value: "Live coding", label: "Live coding" },
          { value: "System design", label: "System design" },
          { value: "Não sei ainda", label: "Não sei ainda" },
        ],
      },
      { ...deadlineField, label: "Data da entrevista" },
      { id: "insegurancas", label: "Pontos de insegurança", kind: "textarea", required: true, placeholder: "Ex.: algoritmos, falar sobre salário, inglês" },
    ],
    rules: [
      "Faça uma pergunta por vez e espere minha resposta antes de continuar.",
      "Depois de cada resposta, dê feedback objetivo: o que foi bom, o que faltou e uma versão melhorada.",
      "Ajuste a dificuldade à senioridade informada.",
    ],
    outputFormat: [
      "Plano de preparação até a data da entrevista",
      "Lista dos temas mais prováveis",
      "Simulação interativa, uma pergunta por vez",
      "Resumo final com pontos fortes e o que treinar",
    ],
  },
  {
    id: "linkedin",
    categoryId: "carreira",
    title: "LinkedIn",
    description: "Título, sobre e experiências do perfil reescritos para a sua área.",
    role: "um especialista em marca pessoal e perfis de LinkedIn para tecnologia e negócios",
    task: "Reescreva as seções do meu perfil do LinkedIn para atrair recrutadores da minha área.",
    fields: [
      { id: "area", label: "Área e cargo que busca", kind: "text", required: true },
      { id: "perfil", label: "Texto atual do perfil", kind: "textarea", required: true, placeholder: "Cole título, sobre e experiências" },
      { id: "diferenciais", label: "Diferenciais que quer destacar", kind: "textarea" },
    ],
    rules: [
      "Não invente conquistas, números ou cargos.",
      "Use tom profissional e humano, sem clichês como \"apaixonado por desafios\".",
    ],
    outputFormat: [
      "Três opções de título (headline)",
      "Seção Sobre reescrita",
      "Experiências reescritas com foco em resultados",
      "Sugestões de competências para adicionar",
    ],
  },
  {
    id: "planejamento-semanal",
    categoryId: "produtividade",
    title: "Planejamento semanal",
    description: "Uma semana possível, com prioridades e folgas reais.",
    role: "um coach de produtividade pragmático",
    task: "Monte meu planejamento da semana a partir das prioridades e compromissos abaixo.",
    fields: [
      { id: "prioridades", label: "Prioridades da semana", kind: "textarea", required: true },
      { id: "compromissos", label: "Compromissos fixos", kind: "textarea", required: true, placeholder: "Ex.: aula seg/qua 19h, reunião sexta 10h" },
      { id: "energia", label: "Horários em que rendo mais", kind: "text", placeholder: "Opcional. Ex.: manhã" },
    ],
    rules: [
      "Deixe margens entre blocos e pelo menos um período livre por dia.",
      "Coloque tarefas de foco profundo nos horários de maior energia.",
    ],
    outputFormat: ["Três prioridades principais", "Agenda dia a dia em tabela", "O que pode ser adiado ou delegado", "Revisão de fim de semana em cinco perguntas"],
  },
  {
    id: "organizacao-de-tarefas",
    categoryId: "produtividade",
    title: "Organização de tarefas",
    description: "Transforma uma lista bagunçada em próximos passos claros.",
    role: "um organizador de tarefas que usa critérios de urgência, impacto e esforço",
    task: "Organize minha lista de tarefas e diga por onde começar.",
    fields: [
      { id: "tarefas", label: "Lista de tarefas", kind: "textarea", required: true, placeholder: "Uma tarefa por linha" },
      { id: "prazos", label: "Prazos importantes", kind: "textarea" },
      { id: "contexto", label: "Contexto", kind: "text", placeholder: "Opcional. Ex.: trabalho, faculdade, casa" },
    ],
    rules: ["Quebre tarefas grandes em próximos passos de até 30 minutos.", "Explique rapidamente o critério de cada prioridade."],
    outputFormat: ["Tarefas agrupadas por prioridade", "Próximo passo concreto de cada tarefa", "Ordem sugerida para hoje", "Tarefas que podem ser eliminadas"],
  },
  {
    id: "rotina-personalizada",
    categoryId: "produtividade",
    title: "Rotina personalizada",
    description: "Uma rotina diária sustentável para o seu horário.",
    role: "um especialista em hábitos e rotinas sustentáveis",
    task: "Crie uma rotina diária realista para mim.",
    fields: [
      { id: "objetivo", label: "Objetivo da rotina", kind: "text", required: true, placeholder: "Ex.: estudar mais, dormir melhor" },
      { id: "horarios", label: "Horário de acordar e dormir", kind: "text", required: true },
      { id: "obrigacoes", label: "Obrigações fixas do dia", kind: "textarea", required: true },
      { id: "habitos", label: "Hábitos que quer incluir", kind: "textarea" },
    ],
    rules: ["Introduza no máximo dois hábitos novos por vez.", "Inclua pausas e uma versão mínima da rotina para dias difíceis."],
    outputFormat: ["Rotina em blocos de horário", "Versão mínima para dias difíceis", "Como acompanhar por duas semanas"],
  },
  {
    id: "professor-de-ingles",
    categoryId: "ingles",
    title: "Professor particular",
    description: "Aulas no seu nível, no tema que você gosta, no tempo que você tem.",
    role: "um professor particular de inglês, paciente e didático",
    task: "Seja meu professor de inglês e monte aulas curtas e práticas para mim.",
    fields: [
      englishLevelField,
      { id: "objetivo", label: "Objetivo", kind: "text", required: true, placeholder: "Ex.: entrevistas, viagens, trabalho" },
      { id: "tema", label: "Tema de interesse", kind: "text", required: true, placeholder: "Ex.: tecnologia, futebol, séries" },
      timePerDayField,
      {
        id: "foco",
        label: "Preferência",
        kind: "select",
        required: true,
        options: [
          { value: "Conversação", label: "Conversação" },
          { value: "Escrita", label: "Escrita" },
          { value: "Gramática", label: "Gramática" },
          { value: "Vocabulário", label: "Vocabulário" },
        ],
      },
    ],
    rules: [
      "Fale comigo em inglês no meu nível e use português só para explicar erros.",
      "Corrija meus erros de forma gentil, mostrando a forma correta e o motivo.",
      "Termine cada aula com uma pequena tarefa.",
    ],
    outputFormat: ["Plano de aulas para quatro semanas", "Primeira aula completa", "Vocabulário do tema com exemplos", "Tarefa para a próxima aula"],
  },
  {
    id: "conversacao-ingles",
    categoryId: "ingles",
    title: "Conversação",
    description: "Prática de conversa com correções no fim de cada rodada.",
    role: "um parceiro de conversação em inglês",
    task: "Converse comigo em inglês sobre o tema escolhido e me ajude a falar com mais naturalidade.",
    fields: [
      englishLevelField,
      { id: "tema", label: "Tema da conversa", kind: "text", required: true, placeholder: "Ex.: entrevista de emprego, viagem a Londres" },
      { id: "dificuldade", label: "O que mais trava na hora de falar", kind: "textarea" },
    ],
    rules: [
      "Faça uma pergunta por vez, em inglês, e espere minha resposta.",
      "A cada três respostas, liste meus erros e mostre versões mais naturais.",
    ],
    outputFormat: ["Abertura da conversa", "Perguntas uma por vez", "Correções a cada três respostas", "Expressões úteis do tema"],
  },
  {
    id: "correcao-de-escrita",
    categoryId: "ingles",
    title: "Correção de escrita",
    description: "Correção comentada de um texto seu em inglês.",
    role: "um revisor de textos em inglês e professor de escrita",
    task: "Corrija meu texto em inglês e explique as correções.",
    fields: [
      englishLevelField,
      { id: "texto", label: "Texto em inglês", kind: "textarea", required: true },
      { id: "tipo", label: "Tipo de texto", kind: "text", placeholder: "Opcional. Ex.: e-mail formal, redação" },
    ],
    rules: ["Preserve minhas ideias; corrija linguagem, não o conteúdo.", "Explique cada correção em português de forma breve."],
    outputFormat: ["Texto corrigido", "Tabela com erro, correção e explicação", "Três padrões de erro para eu praticar"],
  },
]

export function getTemplate(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find((t) => t.id === id)
}

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
      { kind: "template", id: "estudos-plano", title: "Plano de estudos", meta: "Experimental", templateId: "plano-de-estudos" },
      { kind: "template", id: "estudos-revisao", title: "Revisão para prova", meta: "Experimental", templateId: "revisao-para-prova" },
      { kind: "template", id: "estudos-explicador", title: "Explicador de matéria", meta: "Experimental", templateId: "explicador-de-materia" },
    ],
  },
  {
    id: "carreira",
    title: "Carreira",
    description: "Currículo, entrevistas e perfil profissional sem inventar nada.",
    art: "dusk",
    seed: 12,
    items: [
      { kind: "template", id: "carreira-ats", title: "Currículo ATS", meta: "Experimental", templateId: "curriculo-ats" },
      { kind: "template", id: "carreira-entrevista", title: "Entrevista tech", meta: "Experimental", templateId: "entrevista-tech" },
      { kind: "template", id: "carreira-linkedin", title: "LinkedIn", meta: "Experimental", templateId: "linkedin" },
    ],
  },
  {
    id: "produtividade",
    title: "Produtividade",
    description: "Semanas, tarefas e rotinas que cabem na vida real.",
    art: "verdant",
    seed: 5,
    items: [
      { kind: "template", id: "prod-semanal", title: "Planejamento semanal", meta: "Experimental", templateId: "planejamento-semanal" },
      { kind: "template", id: "prod-tarefas", title: "Organização de tarefas", meta: "Experimental", templateId: "organizacao-de-tarefas" },
      { kind: "template", id: "prod-rotina", title: "Rotina personalizada", meta: "Experimental", templateId: "rotina-personalizada" },
    ],
  },
  {
    id: "ingles",
    title: "Inglês",
    description: "Professor, conversação e correção de escrita.",
    art: "aurora",
    seed: 3,
    items: [
      { kind: "template", id: "ingles-professor", title: "Professor particular", meta: "Experimental", templateId: "professor-de-ingles" },
      { kind: "template", id: "ingles-conversa", title: "Conversação", meta: "Experimental", templateId: "conversacao-ingles" },
      { kind: "template", id: "ingles-escrita", title: "Correção de escrita", meta: "Experimental", templateId: "correcao-de-escrita" },
    ],
  },
]
