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
A study event where the User sees one side of a Card and grades their recall using four levels: **Again / Hard / Good / Easy** (SM-2 graded input). Each Review produces a new SRS schedule for the Card.

### Review Direction
Whether a Review shows the English side (prompting for French) or the French side (prompting for English). Configurable per User, defaults to EN→FR. Both directions can be mixed.

### SRS Schedule
The computed next-review date and ease factor for a Card, maintained by the SM-2 algorithm. A Card whose ease factor drops below 2.0 is considered **Difficult**.

### Difficult Card
A Card whose SM-2 ease factor is below 2.0. Classification is automatic — no manual flagging. Used for progress tracking and surfacing struggling words.

### AI Prompt
A curated, fixed-choice action available on any Card during or after Review. Examples: "Show example sentence", "Show synonyms", "Memory tip". Implemented as calls to an external AI provider (provider TBD). The interface is abstracted so the provider can be swapped without changing card or review logic.

### User
An authenticated person identified by Google OAuth. Each User owns their own Pool, Reviews, and SRS Schedules. No email/password auth.

---

## Boundaries

- Language scope: **English ↔ French only**.
- CSV format: Google Translate export — rows of the form `Anglais,Français,<english>,<french>`.
- No social features, no shared decks, no collaborative study.
