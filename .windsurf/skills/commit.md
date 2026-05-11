# Commit Message Skill

## Overview
Generates conventional commit messages following Modux repository patterns based on staged changes analysis.

## Usage
When you want to commit changes, ask me: "Generate a commit message" or "Create commit message"

I will:
1. Analyze your staged changes with `git diff --cached`
2. Determine appropriate commit type and scope
3. Generate a commit message following Modux patterns
4. Present the message for your review

## Commit Message Patterns

### Types:
- `feat:` - New features
- `fix:` - Bug fixes  
- `refactor:` - Code refactoring
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks

### Scopes:
- `(bingo)` - Bingo game changes
- `(cross-clue)` - Cross Clue game changes
- `(spectator)` - Spectator mode features
- `(ui)` - UI/UX improvements

### Format:
```
<type>[scope]: <concise description>

[Optional bullet points]
- Specific change 1
- Specific change 2
```

## Examples:
```
feat(bingo): implement dynamic grid sizing
- Add 3x3, 4x4, 5x5 grid options
- Update cell rendering for different sizes
- Fix responsive layout issues

fix(cross-clue): resolve WebSocket connection errors
- Fix message format (action vs type)
- Update player status synchronization
- Add proper error handling

docs: update README with Phase 4.1 features
- Document new spectator mode
- Update testing instructions
- Add component architecture details
```

## Analysis Process
I examine:
- **File paths** to determine scope
- **Diff content** to identify commit type
- **Added/removed functions** for detailed body
- **Code patterns** matching repository conventions

## Instructions
Just say "Generate commit message" when you have staged changes ready to commit.
