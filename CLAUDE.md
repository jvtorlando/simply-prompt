# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Simply Prompt: a single-page Next.js landing site (pt-BR) that asks the user questions and assembles a detailed, personalized prompt to paste into Claude/ChatGPT/Gemini. The flagship flow is **Personal IA** (fitness); the rest is a catalog of guided templates (Estudos, Carreira, Produtividade, Línguas). Deployed on Vercel.

Hard constraints the product is built around:
- **No backend, no network, no AI calls.** All parsing, text correction and prompt generation run in the browser with plain rules. No analytics, cookies or trackers.
- All UI copy, code comments and generated prompts are in **Brazilian Portuguese**. Keep new copy and comments in pt-BR.
- Generated fitness prompts must keep the safety framing (no diagnosis, no medication/hormones/extreme diets, no promised results).
- The localStorage draft (`simply-prompt:fitness-draft:v1`) may only store the fields in `PERSISTED_FITNESS_FIELDS` (`lib/fitness-options.ts`); age, measurements, sex, sleep, injuries and notes are never persisted.

## Commands

```bash
npm run dev         # next dev on http://localhost:3000
npm run lint        # eslint (flat config, eslint-config-next core-web-vitals + typescript)
npm run typecheck   # tsc --noEmit
npm run build       # production build
```

There is no test suite. Run lint, typecheck and build before considering a change done.

Stack: Next.js 16.4 (App Router, `cacheComponents: true`, `partialPrefetching: true`, Turbopack with `@tailwindcss/turbopack`), React 19.3, Tailwind 4, shadcn/ui `base-nova` style on **Base UI** (`@base-ui/react`, not Radix), framer-motion, lucide-react. `cn` comes from the `cn` package (`lib/utils.ts` re-exports it). Path alias `@/*` → repo root.

## Architecture

The page (`app/page.tsx`) is mostly Server Components; the interactive part is a single client island, `components/prompt-studio.tsx`, which owns all form state and wires the catalog to the builder:

- `prompt-catalog.tsx` renders `PROMPT_CATEGORIES` as glass folders; selecting an item sets the `BuilderSelection` (`{kind:"fitness"}` with a pre-selected goal, or `{kind:"template", templateId}`), scrolls to `#criar` and focuses the builder heading.
- `prompt-builder.tsx` shows two tabs per selection: **"Personalizar no site"** (structured form → `fitness-form.tsx` / `template-form.tsx`) and **"Contar com minhas palavras"** (free-text story mode → `story-panels.tsx`). Output goes to `prompt-output.tsx` (copy with clipboard fallbacks, `aria-live` feedback).
- The localStorage draft is read via `useSyncExternalStore` with a `null` server snapshot to avoid hydration mismatches, and only written after the first user interaction.

All prompt logic lives in pure functions under `lib/` (no React), with `lib/prompt-builders.ts` as the barrel the UI imports from:

- **Templates are data.** Each guided template is a `PromptTemplate` object in `lib/prompt-templates.ts` (role, objective, fields, method, rules, outputFormat, checks, clarify). One generic form and one generator (`buildTemplatePromptDetailed`, `buildTemplateStoryPrompt` in `prompt-builders.ts`) serve all of them, emitting a fixed 8-section skeleton plus `SHARED_TEMPLATE_RULES`. `{idioma}` placeholders are substituted with the chosen language. To add a template: add the object to `PROMPT_TEMPLATES` and a catalog item in `PROMPT_CATEGORIES` (`lib/prompt-catalog.ts`). Types are in `types/prompt.ts`.
- **Personal IA form**: `lib/fitness-prompt.ts` (validation, `normalizeFitness`, `analyzeFitness` cross-checks that produce attention points/questions, `buildFitnessPromptDetailed`). Options/labels and the empty form are in `lib/fitness-options.ts`. Up to `MAX_GOALS` (3) goals, ordered by priority.
- **Personal IA story mode**: `lib/story-fitness.ts` parses free text (≤ `STORY_INPUT_LIMIT` 3000 chars) into a `StoryProfile` by regex/rules, reports what is missing (`storyMissing`), asks only for that, and builds a project-instructions prompt capped at `STORY_PROMPT_LIMIT` (6000). Unrecognized sentences are kept in `unmatched` and passed through to the prompt rather than dropped.
- `lib/fitness-routine.ts` holds `ROUTINE_STEPS` (calendar/PDF/weekly-monthly feedback instructions) shared by both fitness modes.
- `lib/text-intelligence.ts` is the offline pt-BR corrector: lexicon-based accent restoration, abbreviation expansion and typo fixing via edit distance, with a `KNOWN` allowlist of correct words that must never be "fixed". Every change is returned as a `TextAdjustment` so the UI can show it. Template fields marked `raw: true` (pasted job posts, résumés, foreign-language text) bypass correction. Also provides number/height parsing and `detectHealthSignals`.

## Conventions

- Only components that need state or browser APIs get `"use client"`; keep static sections as Server Components.
- `components/ui/glass-folder-cards.tsx` is a third-party component kept as delivered (only labels translated). Its React Compiler lint rules are disabled for that file only in `eslint.config.mjs`; don't refactor its internals to satisfy lint.
- Native `<select>` is used deliberately in forms (mobile + screen reader UX).
- Layout must work from 360 px to 1440 px with no horizontal overflow and remain keyboard-accessible.
- The footer year uses `"use cache"` + `cacheLife("days")` for Cache Components compatibility.
- Commit messages follow Conventional Commits in English (`feat: ...`), even though the code and copy are pt-BR.
