# Modux Testing Guide

This document outlines the testing infrastructure and workflows for Modux. We enforce automated testing across both the backend (Python) and frontend (React).

## Backend Testing

The backend is tested using `pytest`. Our philosophy focuses on testing the standalone Game Managers (`BingoGameManager`, `CrossClueGameManager`), which run complex state-machine logic entirely free of FastAPI/WebSocket dependencies.

### Running Backend Tests Locally

```bash
# Activate your virtual environment
source venv/bin/activate

# Run tests from the root directory
PYTHONPATH=. pytest tests/
```

### Writing New Backend Tests

1. Create a file in `tests/` named `test_<feature>.py`.
2. Ensure you initialize the state properly (mocking standard players if necessary).
3. Do not test WebSocket code here. Use pure `GameManager` functions (e.g. `submit_board`, `draw_card`, `join_game`).

Example for testing a custom Bingo grid:
```python
def test_auto_win_custom_grid_size(manager, session_id):
    # Setup custom grid size in manager and assert the math calculations for winning lines.
    ...
```

## Frontend Testing

The frontend is tested using `vitest` alongside `@testing-library/react`. We simulate browser events and React lifecycle without needing an actual headless browser.

### Running Frontend Tests Locally

```bash
cd frontend
npm run test
# OR
npx vitest run
```

### Writing New Frontend Tests

1. Create a `*.test.jsx` or `*.test.js` file alongside the component you're testing.
2. Use `@testing-library/react` to render elements and query the virtual DOM.
3. Use `vi.mock()` for anything depending on external resources, such as WebSockets (`useGameSocket`) or browser navigation (`react-router-dom`).

Example:
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ModuxLayout from './ModuxLayout';

describe('ModuxLayout', () => {
  it('toggles mobile sidebar menu when button is clicked', () => {
    // Tests functionality on mocked browser environments...
  });
});
```

## CI/CD Pipeline

We have automated CI/CD integrated via GitHub Actions in `.github/workflows/test.yml`. 

**Triggers**: The pipeline automatically runs on every `push` or `pull_request` to the `staging` and `main` branches.
**Failing Tests**: If a test fails, the Pull Request or Commit will show a red 'X'. You must fix local tests before the branch can be merged.

To add new steps to the pipeline (like end-to-end testing with Playwright or Cypress in the future), modify the `test.yml` file.
