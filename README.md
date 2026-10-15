# Simply Prompt

**Transforme algumas respostas em um prompt feito para você.**

Simply Prompt é uma landing page com um catálogo de prompts interativos para tarefas do dia a dia. Em vez de mostrar textos genéricos, o site faz perguntas e monta um prompt detalhado e personalizado, pronto para copiar e usar no Claude, ChatGPT, Gemini ou outra IA.

O produto principal é o **Personal IA**, que gera um prompt de treino para perder gordura, ganhar massa muscular, melhorar o condicionamento, desenvolver explosão e performance atlética ou montar uma rotina geral de academia.

> **Aplicação:** https://p0-green.vercel.app

## Screenshot

> 📸 _Espaço reservado para o screenshot da página inicial (`public/screenshot.png`)._

## Funcionalidades

- **Personal IA completo**: formulário com 9 campos obrigatórios e 10 opcionais, validação amigável e prompt gerado na hora, com 10 seções (papel, contexto, objetivo, disponibilidade, limitações, regras, formato, progressão, segurança e perguntas de acompanhamento).
- **Duas formas de usar**: "Personalizar no site" (formulário) ou "Contar com minhas palavras" (texto livre de até 3.000 caracteres). No texto livre, o site lê a história no navegador, mostra o que entendeu, pede só o que faltou (dias, tempo, local, lesões, altura ambígua) e entrega um prompt pronto para as instruções de um Projeto no Claude ou no ChatGPT, com até 6.000 caracteres.
- **Sem IA no site, de propósito**: a leitura do texto livre é feita por regras, sem rede e sem API paga. Ela reconhece números (idade, altura, peso, metas e prazos), esportes, objetivos, grupos musculares, suplementos, dias, tempo, local e menções a dor ou lesão. O que não reconhece entra no prompt em "Outros detalhes que contei", para a IA do projeto interpretar. Testado com os dois textos de exemplo da especificação do Personal Trainer.
- **Catálogo em pastas de vidro**: Fitness, Estudos, Carreira, Produtividade e Inglês. Abrir uma pasta e escolher um arquivo leva ao construtor com o modelo já selecionado e o foco no título.
- **12 modelos guiados** (plano de estudos, revisão para prova, explicador de matéria, currículo ATS, entrevista tech, LinkedIn, planejamento semanal, organização de tarefas, rotina personalizada, professor de inglês, conversação e correção de escrita). Cada um segue o mesmo esqueleto (papel, objetivo, contexto, método, regras, formato, verificação e perguntas de esclarecimento), baseado em guias de prompting da Anthropic, OpenAI e Google e em métodos de cada área (prática de recuperação e revisão espaçada, STAR, roteiro de system design, palavras-chave de ATS, níveis do CEFR, intenções "se-então").
- **Vários objetivos no Personal IA**: escolha até 3, em ordem de prioridade; o prompt explica como conciliá-los.
- **Conversor de texto mais inteligente**: corrige acentos, abreviações ("vc", "pq"), erros de digitação e pontuação nos textos digitados, sem alterar termos técnicos, nomes ou textos colados, e mostra o que foi ajustado. Cruza as respostas para incluir pontos de atenção (objetivos que competem, rotina apertada, idade, lesões e condições citadas em texto livre). Tudo no navegador, sem rede.
- **Copiar prompt** com Clipboard API, alternativa para navegadores antigos e mensagem de erro com seleção automática do texto quando a cópia não é possível. Feedback anunciado via `aria-live`.
- Contador aproximado de caracteres, botão "Limpar respostas" e estado vazio explicando o que falta.
- Rascunho opcional do Personal IA salvo no navegador (somente preferências de treino), com opção de restaurar ou descartar.
- Visual em vidro líquido, com lente deslizante nas seleções e fundo ambiente neutro. Fonte do sistema da Apple (SF Pro) nos aparelhos Apple e Inter nos demais.
- Responsivo de 360 px a 1440 px, sem overflow horizontal, e acessível por teclado.

## Tecnologias

- [Next.js 16](https://nextjs.org/) com App Router e Cache Components
- React 19 e TypeScript
- Tailwind CSS 4
- [shadcn/ui](https://ui.shadcn.com/) (estilo `base-nova`, sobre Base UI)
- [lucide-react](https://lucide.dev/) para ícones

Sem backend, banco de dados, autenticação, APIs pagas, analytics, cookies ou rastreadores.

## Como instalar

Requer Node.js 20.9 ou superior e npm.

```bash
git clone https://github.com/<seu-usuario>/simply-prompt.git
cd simply-prompt
npm install
```

## Como executar

```bash
npm run dev
```

Abra http://localhost:3000.

## Verificações e build

```bash
npm run lint        # ESLint
npm run typecheck   # TypeScript sem emitir arquivos
npm run build       # build de produção
npm run start       # serve o build localmente
```

## Estrutura principal

```
app/
  layout.tsx            metadados, fontes e idioma pt-BR
  page.tsx              composição da landing page
  globals.css           tema (tokens de cor), fundo pontilhado e animações
  icon.svg              favicon
  opengraph-image.tsx   imagem Open Graph gerada no build
components/
  site-header.tsx       header e marca
  mobile-nav.tsx        menu mobile (Sheet)
  hero-section.tsx      hero com demonstração resposta → prompt
  how-it-works.tsx      três etapas
  prompt-studio.tsx     liga catálogo e construtor; rascunho no localStorage
  prompt-catalog.tsx    catálogo com as pastas de vidro
  prompt-builder.tsx    construtor com as abas
  fitness-form.tsx      formulário do Personal IA
  template-form.tsx     formulário genérico orientado por configuração
  form-controls.tsx     campo, select nativo, grupo de escolhas, erros
  prompt-output.tsx     visualização, cópia e limpeza do prompt
  benefits-section.tsx  benefícios
  faq-section.tsx       perguntas frequentes
  site-footer.tsx       rodapé com ano dinâmico
  ui/                   componentes reutilizáveis (shadcn/ui e glass-folder-cards)
lib/
  prompt-builders.ts    funções puras: validação e geração dos prompts
  prompt-catalog.ts     categorias e modelos experimentais (dados)
  fitness-options.ts    opções do formulário do Personal IA
  site-config.ts        URL do GitHub exibida no rodapé
  utils.ts              helper `cn`
types/
  prompt.ts             tipos do catálogo e dos formulários
```

## Decisões técnicas

- **`components/ui`**: mantém compatibilidade com o padrão do shadcn/ui (`components.json` aponta para `@/components/ui`) e facilita imports consistentes via alias `@/*`. O componente `glass-folder-cards.tsx` fica no mesmo diretório.
- **Server Components por padrão**: header, hero, seções estáticas e rodapé são renderizados no servidor. Somente o que tem estado ou usa APIs do navegador é Client Component (`prompt-studio`, formulários, saída do prompt, menu mobile e as pastas).
- **Geração separada da interface**: `buildFitnessPrompt`, `buildTemplatePrompt`, `buildTemplateInterviewPrompt`, `validateFitness` e `validateTemplate` são funções puras em `lib/prompt-builders.ts`, fáceis de testar.
- **Modelos experimentais por configuração**: cada modelo é um objeto em `lib/prompt-catalog.ts` (campos, papel, regras e formato). Um único formulário e um único gerador atendem todos.
- **Select nativo**: escolhido para melhor experiência no celular e em leitores de tela.
- **Rascunho sem erro de hidratação**: o `localStorage` é lido com `useSyncExternalStore` (no servidor o valor é `null`). Idade, medidas, sexo, sono, lesões e observações nunca são salvos.
- **Ano do rodapé**: calculado no servidor com `"use cache"` e `cacheLife("days")`, compatível com Cache Components.
- **Componente GlassFolder**: integrado como foi entregue, com `action="none"` (sem adicionar arquivos aleatórios). As únicas alterações foram a tradução dos rótulos de acessibilidade (`aria-label`) e do menu para pt-BR. Como ele lê refs durante o render e chama `setState` dentro de efeitos — padrões que as regras do React Compiler sinalizam, mas que funcionam corretamente —, essas regras foram desativadas no ESLint apenas para esse arquivo, em vez de reescrever a lógica interna.

## Privacidade e segurança

- Suas respostas são processadas somente no navegador e não são enviadas para a Simply Prompt nem para qualquer servidor.
- Não há analytics, cookies, rastreadores, cadastro ou coleta de nome, e-mail ou telefone.
- O Personal IA ajuda a organizar informações e criar instruções para uma IA. Ele **não substitui** avaliação médica ou acompanhamento de médico, fisioterapeuta, nutricionista ou profissional de educação física.
- Os prompts orientam a IA a não fazer diagnóstico, não recomendar medicamentos, hormônios, esteroides ou dietas extremas, e a não prometer resultados. Ainda assim, respostas de IA podem conter erros: revise sempre.

## Como contribuir

1. Faça um fork e crie uma branch: `git checkout -b feat/minha-melhoria`.
2. Para um novo modelo de prompt, adicione um objeto em `PROMPT_TEMPLATES` e um item na categoria correspondente em `PROMPT_CATEGORIES` (`lib/prompt-catalog.ts`).
3. Rode `npm run lint`, `npm run typecheck` e `npm run build` antes de abrir o pull request.
4. Descreva a mudança e, se alterar a interface, inclua screenshots em 390 px e 1440 px.
