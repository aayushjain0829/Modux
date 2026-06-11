---
description: Enforces the Environment Branching (GitFlow) strategy for the Modux repository.
---

# Git Branching Strategy & Workflow

When assisting with code management, branch creation, or deployment strategies in this repository, strictly adhere to the following **Environment Branching** model.

## Branch Topology

1. **`development` (Active Engineering)**
   - All feature branches, bug fixes, and manual testing occur here.
   - You should primarily perform your coding tasks, architectural changes, and local test runs on this branch.
   - *Rule:* Never push directly to `main` from `development`.

2. **`staging` (Automated Quality Assurance)**
   - This branch is dedicated to running automated CI/CD checks (e.g. `pytest`, `vitest`).
   - When a feature is complete on `development`, it is merged into `staging`.
   - *Rule:* If tests fail on `staging`, do not hotfix on `staging`. Instead, switch back to `development`, fix the code, test manually, and merge to `staging` again.

3. **`main` (Production Deployment)**
   - The sacred, bug-free branch.
   - Code is ONLY merged into `main` from `staging` after all automated tests pass successfully.
   - Merging into `main` automatically triggers production deployments (Render for the backend, GitHub Pages for the frontend).
   - *Rule:* Never commit directly to `main`. It is protected by strict Branch Protection rules.

## Workflow Execution

If the user asks you to implement a feature and "deploy it":
1. Write the code on `development` (or a feature branch off `development`).
2. Verify tests pass locally.
3. Once the user approves the feature on `development`, advise them to merge it directly into `staging` (no PR needed).
4. Inform them that they must wait for the GitHub Actions to pass on `staging` before opening a Pull Request from `staging` to `main`.
5. Once merged to `main`, the deployment pipelines will take over.
