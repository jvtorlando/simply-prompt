# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
- Simply Prompt: Next.js 16 landing page (pt-BR) that builds personalized prompts entirely in the browser. No backend, network or AI calls; keep UI copy, comments and generated prompts in pt-BR.
- Before calling a change done: `npm run lint`, `npm run typecheck`, `npm run build` (there is no test suite).
- `components/prompt-studio.tsx` owns all form state and links the catalog (`prompt-catalog.tsx`) to the builder (`prompt-builder.tsx`).
- Prompt logic is pure functions in `lib/`, exported through `lib/prompt-builders.ts`. Templates are data in `lib/prompt-templates.ts`; a new one also needs an item in `PROMPT_CATEGORIES` (`lib/prompt-catalog.ts`).
- Keep the safety rules in fitness prompts, store only `PERSISTED_FITNESS_FIELDS` in localStorage, and don't refactor `components/ui/glass-folder-cards.tsx`.
