const { test, expect } = require('@playwright/test');

test.describe('E2E Тести (End-to-End) - Developer Hub & PostmanLite UI', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // E2E Тест 1: Завантаження сторінки та ініціалізація заголовків
  test('1. Перевірка завантаження сторінки, заголовка та статусу сервісу', async ({ page }) => {
    await expect(page).toHaveTitle(/PostmanLite & DevHub/);
    await expect(page.locator('.logo-text h1')).toHaveText('PostmanLite & DevHub');
    await expect(page.locator('#header-status-text')).toHaveText('Proxy Server: Ready');
  });

  // E2E Тест 2: Навігація між основними розділами (вкладками)
  test('2. Навігація між вкладками панелі керування (API Tester, JWT & Utils, About, Docker)', async ({ page }) => {
    // Перехід на вкладку JWT & Utils
    await page.locator('#nav-btn-utils').click({ force: true });
    await expect(page.locator('#tab-utils')).toBeVisible();
    await expect(page.locator('#tab-tester')).not.toBeVisible();

    // Перехід на вкладку About & Lab
    await page.locator('#nav-btn-about').click({ force: true });
    await expect(page.locator('#tab-about')).toBeVisible();

    // Перехід на вкладку Docker & Hosting
    await page.locator('#nav-btn-deploy').click({ force: true });
    await expect(page.locator('#tab-deploy')).toBeVisible();

    // Повернення на головну вкладку API Tester
    await page.locator('#nav-btn-tester').click({ force: true });
    await expect(page.locator('#tab-tester')).toBeVisible();
  });

  // E2E Тест 3: Інтерактивна робота з конструктором запитів (Headers / Body)
  test('3. Інтерактивна взаємодія з Request Builder (перемикання підвкладок, додавання хедерів)', async ({ page }) => {
    // Перемикання на підвкладку Body
    await page.locator('#req-tab-btn-body').click({ force: true });
    await expect(page.locator('#req-tab-content-body')).toBeVisible();
    await page.fill('#req-body-content', '{"test": "playwright"}');
    await expect(page.locator('#req-body-content')).toHaveValue('{"test": "playwright"}');

    // Перемикання на підвкладку Headers
    await page.locator('#req-tab-btn-headers').click({ force: true });
    await expect(page.locator('#req-tab-content-headers')).toBeVisible();

    // Додавання нового поля заголовка
    const initialRowsCount = await page.locator('.header-row').count();
    await page.locator('button', { hasText: '+ Add Header' }).click({ force: true });
    await expect(page.locator('.header-row')).toHaveCount(initialRowsCount + 1);
  });

  // E2E Тест 4: Валідація обов’язкового поля цільової URL-адреси
  test('4. Валідація обов’язкового поля вводу цільового URL', async ({ page }) => {
    const urlInput = page.locator('#req-url');
    await urlInput.fill('');

    await page.locator('#btn-send-req').click({ force: true });

    // Перевіряємо браузерну валідацію HTML5
    const isInvalid = await urlInput.evaluate((el) => !el.checkValidity());
    expect(isInvalid).toBe(true);

    // Вводимо коректний URL
    await urlInput.fill('https://jsonplaceholder.typicode.com/posts/1');
    const isValid = await urlInput.evaluate((el) => el.checkValidity());
    expect(isValid).toBe(true);
  });

});
