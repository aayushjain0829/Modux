# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-issues.spec.js >> Specific UI Issue Tests >> Portal page input placeholder is compact
- Location: e2e/ui-issues.spec.js:7:3

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: locator('.session-input').first()
Expected: "ROOM ID"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" with timeout 5000ms
  - waiting for locator('.session-input').first()

```

```yaml
- text: The server is configured with a public base URL of /Modux/ - did you mean to visit
- link "/Modux/portal/bingo":
  - /url: /Modux/portal/bingo
- text: instead?
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Specific UI Issue Tests', () => {
  4  |   // Use mobile viewport for these tests where issues were most prominent
  5  |   test.use({ viewport: { width: 375, height: 667 } });
  6  | 
  7  |   test('Portal page input placeholder is compact', async ({ page }) => {
  8  |     await page.goto('/portal/bingo');
  9  |     const input = page.locator('.session-input').first();
> 10 |     await expect(input).toHaveAttribute('placeholder', 'ROOM ID');
     |                         ^ Error: expect(locator).toHaveAttribute(expected) failed
  11 |   });
  12 | 
  13 |   test('Bingo Lobby has correct timer styling classes available', async ({ page }) => {
  14 |     await page.goto('/');
  15 |     // Check that .timer-grid class exists and has grid display
  16 |     const isGrid = await page.evaluate(() => {
  17 |       const div = document.createElement('div');
  18 |       div.className = 'timer-grid';
  19 |       document.body.appendChild(div);
  20 |       const style = window.getComputedStyle(div);
  21 |       const display = style.display;
  22 |       document.body.removeChild(div);
  23 |       return display === 'grid';
  24 |     });
  25 |     expect(isGrid).toBeTruthy();
  26 |   });
  27 | 
  28 |   test('Bingo Setup board has correct gap and cell styling', async ({ page }) => {
  29 |     // We can't easily jump to Setup stage without backend state, 
  30 |     // but if we simulate backend messages we could.
  31 |     // Alternatively, we just check the css variables.
  32 |     // Let's test that the CSS class for bingo-setup-cell has user-select: none
  33 |     await page.goto('/');
  34 |     // Check CSS using evaluate
  35 |     const hasUserSelectNone = await page.evaluate(() => {
  36 |       // Create a dummy element to check computed style
  37 |       const div = document.createElement('div');
  38 |       div.className = 'bingo-setup-cell';
  39 |       document.body.appendChild(div);
  40 |       const style = window.getComputedStyle(div);
  41 |       const userSelect = style.userSelect || style.webkitUserSelect;
  42 |       document.body.removeChild(div);
  43 |       return userSelect === 'none';
  44 |     });
  45 |     expect(hasUserSelectNone).toBeTruthy();
  46 |   });
  47 | 
  48 |   test('Bingo Active Cell prevents text selection', async ({ page }) => {
  49 |     await page.goto('/');
  50 |     const hasUserSelectNone = await page.evaluate(() => {
  51 |       const div = document.createElement('div');
  52 |       div.className = 'bingo-active-cell';
  53 |       document.body.appendChild(div);
  54 |       const style = window.getComputedStyle(div);
  55 |       const userSelect = style.userSelect || style.webkitUserSelect;
  56 |       document.body.removeChild(div);
  57 |       return userSelect === 'none';
  58 |     });
  59 |     expect(hasUserSelectNone).toBeTruthy();
  60 |   });
  61 | 
  62 |   test('Cross Clue Cell prevents text selection', async ({ page }) => {
  63 |     await page.goto('/');
  64 |     const hasUserSelectNone = await page.evaluate(() => {
  65 |       const div = document.createElement('div');
  66 |       div.className = 'cc-cell';
  67 |       document.body.appendChild(div);
  68 |       const style = window.getComputedStyle(div);
  69 |       const userSelect = style.userSelect || style.webkitUserSelect;
  70 |       document.body.removeChild(div);
  71 |       return userSelect === 'none';
  72 |     });
  73 |     expect(hasUserSelectNone).toBeTruthy();
  74 |   });
  75 | });
  76 | 
```