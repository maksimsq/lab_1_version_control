const { test, expect } = require('@playwright/test');

test.describe('Screenshot Тести (Visual Regression) - Developer Hub', () => {

  // Скріншот-тест 1: Перевірка візуального стану хедера додатка
  test('1. Візуальна перевірка хедера та панелі статусу', async ({ page }) => {
    await page.goto('/');
    const headerElement = page.locator('.app-header');
    await expect(headerElement).toBeVisible();
    expect(await headerElement.screenshot()).toMatchSnapshot('devhub-header.png', {
      maxDiffPixelRatio: 0.05
    });
  });

  // Скріншот-тест 2: Перевірка візуального стану картки Request Builder
  test('2. Візуальна перевірка картки Request Builder', async ({ page }) => {
    await page.goto('/');
    const reqCardElement = page.locator('.req-card');
    await expect(reqCardElement).toBeVisible();
    expect(await reqCardElement.screenshot({ caret: 'hide' })).toMatchSnapshot('devhub-req-card.png', {
      maxDiffPixelRatio: 0.05
    });
  });

});
