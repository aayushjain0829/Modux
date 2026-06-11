---
description: Post-change context maintenance checklist. Run this after every meaningful feature, bug fix, or refactor to keep project context documents accurate.
---

# Context Maintenance Skill

## When to Trigger

Run this checklist after completing any `feat:`, `fix:`, or `refactor:` change.
**Skip** for `docs:`, `chore:`, and `style:` changes — these don't affect project understanding.

## The 5-Question Checklist

After your change is complete and tested, answer each question:

### 1. What changed?
Summarize the change in 1-2 sentences. What was the problem or feature? What did you do?

### 2. Which files are now important?
Did the change introduce new files, modules, or components that future contributors need to know about? If so, check if they should appear in the Directory Map section of `PROJECT_CONTEXT.md`.

### 3. Did any convention change?
Did the change establish a new pattern, naming convention, or architectural approach? If so, check if:
- The **Key Conventions** section of `PROJECT_CONTEXT.md` needs updating
- The **Invariants** or **Anti-Patterns** sections need updating
- A new entry in `DECISIONS.md` is warranted

### 4. Did we learn a recurring bug pattern?
Did the change fix a bug that could recur elsewhere? If so:
- Add it to the **Anti-Patterns** section of `PROJECT_CONTEXT.md`
- Consider whether a test helper or shared utility should be extracted

### 5. Should PROJECT_CONTEXT.md or DECISIONS.md be updated?
Based on questions 1-4, propose specific updates if needed. Use this format:

```
📝 Proposed update to PROJECT_CONTEXT.md:
- Section: [section name]
- Change: [what to add/modify/remove]
- Reason: [why this matters for future understanding]

📝 Proposed update to DECISIONS.md:
- New ADR-NNN: [title]
- Context: [why this decision came up]
- Decision: [what was chosen]
```

If no updates are needed, explicitly state: "No context updates needed — this change doesn't affect project conventions or architecture."

## DECISIONS.md Entry Template

When proposing a new ADR entry, use this template:

```markdown
## ADR-NNN — Title
**Date:** YYYY-MM-DD | **Status:** accepted
**Context:** Why did this come up?
**Decision:** What did we choose?
**Consequence:** What does this mean going forward?
```

## Guidelines

- **Keep it honest.** If nothing needs updating, say so. Don't propose changes for the sake of process.
- **Keep it lean.** PROJECT_CONTEXT.md should stay under ~150 lines. DECISIONS.md entries should be under ~10 lines each.
- **Don't duplicate README.md.** PROJECT_CONTEXT.md covers _how to work with the code_, not _what the project is_.
- **Date your ADRs.** Use the current date when proposing new decisions.
