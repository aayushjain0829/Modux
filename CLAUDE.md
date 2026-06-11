# CLAUDE.md — AI Rules for Modux

## Orientation

Before making any changes, read these documents:
- [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) — How the codebase works, conventions, invariants, and anti-patterns
- [DECISIONS.md](./DECISIONS.md) — Why architectural choices were made

For game-specific architecture rules:
- [Backend rules](./apps/README.md) — How to add/modify backend games
- [Frontend rules](./frontend/README.md) — How to add/modify frontend games
- [Testing guide](./tests/README.md) — How to write and run tests

## Always-On Rules

1. **Follow project conventions.** Naming, file structure, and patterns are documented in `PROJECT_CONTEXT.md`. Match what's already there.
2. **Keep changes minimal and focused.** One concern per commit. Don't refactor unrelated code alongside a feature.
3. **Add or update tests.** Every `feat:` and `fix:` change must include corresponding test updates. Backend tests go in `tests/test_*.py`; frontend tests go co-located as `*.test.jsx`.
4. **If the change introduces a new architectural decision**, propose an update to `DECISIONS.md` using the ADR template.
5. **If the change affects future understanding of the project** (new conventions, changed invariants, new modules), propose an update to `PROJECT_CONTEXT.md`.

## Commit Convention

Follow [conventional commits](./.agents/skills/commit.md):
```
<type>(<scope>): <description>
```
- **Types:** `feat`, `fix`, `refactor`, `docs`, `chore`
- **Scopes:** `bingo`, `cross-clue`, `spectator`, `ui`, or omit for platform-wide changes

## Branching

Follow [GitFlow](./.agents/skills/branching.md):
- Work on `development` (or a feature branch off it)
- Never commit directly to `main` or `staging`
- Merge path: `development` → `staging` (CI) → `main` (deploy)

## Post-Change Review

After completing a `feat:`, `fix:`, or `refactor:` change, run through the [context maintenance checklist](./.agents/skills/context-maintenance.md):
1. What changed?
2. Which files are now important?
3. Did any convention change?
4. Did we learn a recurring bug pattern?
5. Should `PROJECT_CONTEXT.md` or `DECISIONS.md` be updated?

Skip this for `docs:`, `chore:`, and `style:` changes.
