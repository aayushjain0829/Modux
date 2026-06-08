import { test, expect } from '@playwright/test';

async function checkOverflow(page) {
  const overflows = await page.evaluate(() => {
    const isScrollable = (el) => {
      const style = window.getComputedStyle(el);
      return style.overflowX === 'auto' || style.overflowX === 'scroll';
    };

    const isVisible = (el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
    }

    const overflowingElements = [];
    document.querySelectorAll('*').forEach((el) => {
      if (el.tagName === 'HTML' || el.tagName === 'BODY' || el.tagName === 'STYLE' || el.tagName === 'SCRIPT' || el.tagName === 'SVG' || el.tagName === 'PATH') return;
      if (isScrollable(el)) return;
      if (!isVisible(el)) return;
      
      // If parent is scrollable horizontally, we might legitimately exceed clientWidth of the parent, but we are checking the element itself.
      // An element overflows horizontally if its scrollWidth > clientWidth.
      if (el.scrollWidth > el.clientWidth + 1) {
        const id = el.id ? `#${el.id}` : '';
        const classes = el.className && typeof el.className === 'string' ? `.${el.className.split(' ').join('.')}` : '';
        overflowingElements.push(`<${el.tagName.toLowerCase()}${id}${classes}> (scrollWidth: ${el.scrollWidth}, clientWidth: ${el.clientWidth})`);
      }
    });
    return overflowingElements;
  });

  return overflows;
}

test.describe('Responsive Overflow Tests', () => {
  test('Portal View should not overflow', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000); // Wait for animations
    const overflows = await checkOverflow(page);
    expect(overflows, `Found overflowing elements: \n${overflows.join('\n')}`).toEqual([]);
  });

  test('Lobby View should not overflow', async ({ page }) => {
    await page.goto('/bingo/TEST01');
    await page.waitForTimeout(1000); 
    const overflows = await checkOverflow(page);
    expect(overflows, `Found overflowing elements: \n${overflows.join('\n')}`).toEqual([]);
  });
});
