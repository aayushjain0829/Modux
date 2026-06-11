---
description: Use this skill when the user asks you to create, manage, or review a Pull Request on GitHub using the MCP GitHub Server.
---

# GitHub Pull Request Skill

When the user asks you to create a Pull Request:
1. Verify that the GitHub MCP server is active and you have access to tools like `github_create_pull_request`.
2. Confirm the exact branch you are on and the target branch for the PR (e.g., `staging` -> `main`).
3. Summarize the commits/changes visually for the user to confirm before creating the PR.
4. Execute the `github_create_pull_request` MCP tool with a descriptive title and a thorough markdown body explaining the changes, testing steps, and what the PR resolves.

### Required Parameters for `github_create_pull_request`:
- `owner`: The repository owner (e.g., `aayushjain0829`).
- `repo`: The repository name (e.g., `Modux`).
- `title`: A short, descriptive title of the PR.
- `body`: Detailed description of the PR. Include screenshots/walkthrough links if applicable.
- `head`: The branch where your changes are (e.g., `development`).
- `base`: The branch you want to merge into (e.g., `staging`).

### Example Workflow
1. The user says "Create a PR from staging to main".
2. You run a quick git log to see what changes were made.
3. You call `github_create_pull_request` with the appropriate repository and branch information.
4. Provide the user with the resulting Pull Request URL so they can click and merge it.
