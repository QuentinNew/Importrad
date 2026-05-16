# ADR 0002 — Import Anchor and Failed/Skipped Split

**Status:** Accepted

## Context

Google Translate exports are append-only: when a user saves new words, they download the same file with new rows prepended at the top. Re-uploading the full file would redundantly re-process every previously imported row on each import.

Additionally, the existing `skipped` count conflated two different non-import reasons into one number, making it impossible to tell whether a row was ignored because it already existed in the DB or because it was simply not attempted.

## Decisions

### 1 — Import Anchor

After each import, store the first row of the uploaded CSV as the **Import Anchor** for that user (`anchorEnglish` + `anchorFrench` on the `User` model, both nullable). On the next import, processing stops as soon as the anchor row is encountered — rows from that point onwards are not attempted.

- The anchor is updated unconditionally at the end of every import (even if 0 cards were imported).
- If the anchor row is not found in the new file (completely different file), all rows are processed normally and the anchor is updated to the new file's first row.
- The anchor is stored as two nullable columns on `User` rather than a separate table — one anchor per user, no history needed.

### 2 — Failed vs Skipped

`ImportResult` is redefined as:

```ts
{
  imported: number,
  failed: { english: string, french: string }[],  // rows that already exist in DB
  skipped: number                                  // rows not attempted due to anchor cutoff
}
```

- **failed**: rows where a duplicate was found in the database. The full pair is returned so the caller can display which words were not imported.
- **skipped**: rows that were never attempted because they fall at or after the anchor row.

## Alternatives Considered

- **Separate `ImportAnchor` table**: rejected — one row per user, no history required; columns on `User` are simpler.
- **Keeping `skipped` for both cases**: rejected — the two reasons are meaningfully different and the frontend needs to distinguish them.
