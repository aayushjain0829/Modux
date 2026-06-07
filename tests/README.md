# Modux Testing Guide

This document outlines the testing infrastructure and workflows for Modux. We enforce automated testing across both the backend (Python) and frontend (React).

## 1. Backend Testing (`pytest`)

The backend tests are located in this `tests/` directory. Our philosophy focuses on testing the standalone Game Managers (`BingoGameManager`, `CrossClueGameManager`), which run complex state-machine logic entirely free of FastAPI/WebSocket dependencies.

### Existing Test Suites:
- **`test_bingo.py`**: Verifies dynamic grid generation, board validation, and complex line-completion calculations (horizontal, vertical, diagonal) for auto-win conditions.
- **`test_cross_clue.py`**: Tests mathematically robust perfect-derangement algorithms (ensuring fair Giver/Guesser assignments) and end-to-end turn cycles.
- **`test_websocket.py`**: A dedicated suite for testing the underlying connection handlers.

### Running Backend Tests Locally

```bash
# Activate your virtual environment
source ../venv/bin/activate

# Run tests from the root directory
cd ..
PYTHONPATH=. pytest tests/
```

### Writing New Backend Tests

1. Create a file in `tests/` named `test_<feature>.py`.
2. Ensure you initialize the state properly (mocking standard players if necessary).
3. Do not test WebSocket code here. Use pure `GameManager` functions (e.g. `submit_board`, `draw_card`, `join_game`).

## 2. Frontend Testing (`vitest`)

The frontend tests are co-located with their respective components inside the `frontend/src/` directory. The frontend is tested using `vitest` alongside `@testing-library/react`. We simulate browser events and React lifecycle without needing an actual headless browser.

### Existing Test Suites:
- **`frontend/src/components/layout/ModuxLayout.test.jsx`**: Tests the visual layout, verifying player statuses (`Ready`, `Not Ready`) render correctly, and that mobile hamburger menu interactions trigger CSS classes properly.
- **`frontend/src/hooks/useGameSocket.test.js`**: Mocks the native WebSocket connection, verifying that the frontend connects to the backend correctly, broadcasts `join_game`, and parses incoming game states accurately.

### Running Frontend Tests Locally

```bash
cd ../frontend
npm run test
# OR
npx vitest run
```

### Writing New Frontend Tests

1. Create a `*.test.jsx` or `*.test.js` file directly next to the component you're testing.
2. Use `@testing-library/react` to render elements and query the virtual DOM.
3. Use `vi.mock()` for anything depending on external resources, such as WebSockets (`useGameSocket`) or browser navigation.

## 3. CI/CD Pipeline

We have automated CI/CD integrated via GitHub Actions in `.github/workflows/test.yml`. 

**Triggers**: The pipeline automatically runs on every `push` or `pull_request` to the `staging` and `main` branches.
**Failing Tests**: If a test fails, the Pull Request or Commit will show a red 'X'. You must fix local tests before the branch can be merged.

To add new steps to the pipeline (like end-to-end testing with Playwright or Cypress in the future), modify the `test.yml` file.
