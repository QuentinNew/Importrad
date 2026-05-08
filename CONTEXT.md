# Importrad — Domain Context

## Purpose

A mobile-first flashcard web app for English↔French vocabulary learning. Users import saved Google Translate CSV files and study words using spaced repetition, with optional AI-powered follow-up prompts per card.

---

## Glossary

### Card
A single vocabulary pair: one English word/phrase and its French translation. Cards are created by importing a CSV and never duplicated (same source + target, case-insensitive = duplicate, silently skipped).

### Pool
The flat, unordered collection of all Cards belonging to a User. There are no Decks or Tags — all Cards are studied together.

### Review
A study event where the User sees one side of a Card and grades their recall using four levels: **Again / Hard / Good / Easy**.

### Review Direction
Whether a Review shows the English side (prompting for French) or the French side (prompting for English). Configurable per User, defaults to EN→FR. Both directions can be mixed.

### Algorithm
The logic that takes a Card's history to focus difficult. Not defined yet.

### Difficult Card
A Card identified by the system as needing extra review under the scheduling algorithm. Classification is automatic — no manual flagging. Used for progress tracking and surfacing struggling words.
### Import
A bulk operation that parses a CSV file and creates Cards from it. Each row is `<lang1>,<lang2>,<word_in_lang1>,<word_in_lang2>`. The importer normalises `Détecter la langue` to `Anglais`, swaps columns when direction is `Français,Anglais`, rejects rows with unknown language values (HTTP 400), and silently skips duplicates. Returns `{ imported, skipped }`.

### AI Prompt
A curated, fixed-choice action available on any Card during or after Review. Examples: "Show example sentence", "Show synonyms", "Memory tip". Implemented as calls to an external AI provider (provider TBD). The interface is abstracted so the provider can be swapped without changing card or review logic.

### User
An authenticated person identified by Google OAuth. Each User owns their own Pool and preference. No email/password auth.

### User Preference
Per-user settings stored separately from identity. Currently holds Review Direction. Defaults are applied on first login.

---

## Frontend Architecture

### Folder structure

```
frontend/src/app/
├── features/          ← one folder per domain feature (cards, review, …)
│   └── cards/         ← flat files: component, dialog, service, model
└── core/              ← created when auth lands (interceptors, guards)
└── shared/            ← created when a second feature needs reuse
```

- File naming follows Angular 19 defaults: no `.component.` suffix (`cards.ts`, not `cards.component.ts`).
- `core/` and `shared/` are not created until there is real content to put in them.

---

## Backend Architecture

### PrismaModule
A global NestJS module (`@Global()`) that provides `PrismaService` — the singleton wrapper around `PrismaClient`. Imported once at the app root; available in all feature modules without re-importing.

### CardModule
The NestJS feature module that owns all Card-related API behavior. Contains:
- `CardController` — HTTP boundary (`POST /cards`, `GET /cards/:id`)
- `CardService` — business logic
- `CardRepository` — all Prisma calls for Cards; injected into `CardService` and mocked in unit tests

### DTO layer
- `CreateCardDto` — validated request body for card creation (`userId`, `english`, `french`); uses `class-validator`
- `CardResponseDto` — stable API response shape for a Card; decoupled from the Prisma model

---

## Boundaries

- Language scope: **English ↔ French only**.
- CSV format: Google Translate export — rows of the form `Anglais,Français,<english>,<french>`.
- No social features, no shared decks, no collaborative study.
