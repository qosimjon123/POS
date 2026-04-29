# RestroPOS Agent Guide

RestroPOS is a Quasar/Vue POS front end. Keep the existing stack unless the user explicitly approves a change.

## Project Conventions

- Use Pinia setup stores. Keep stores focused on app state and orchestration.
- Move pure POS logic, fixtures, and reusable types into `src/modules/pos`.
- Keep scanner runtime code in `src/modules/scanner`; expose user flows through scoped intents in the scanner store.
- Use `src/api` for Frappe transport and typed services. Components should not call raw backend methods.
- Use `src/stores/theme.ts` for theme state and `src/stores/locale.ts` for locale state.
- Keep i18n keys synchronized between `ru-RU` and `tg-TJ`.
- Prefer typed config modules for storage keys and runtime defaults.

## Verification

For behavior changes, run lint and the smallest relevant tests. For broad refactors, also run the Quasar build.
