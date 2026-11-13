const {
  validateUrl,
  prepareFetchOptions,
  calculatePayloadSize
} = require('../../src/utils/proxyUtils');

describe('Модульні тести (Unit Tests) - Proxy Utils', () => {

  // Модульний тест 1: Валідація цільової URL-адреси
  describe('Тест 1: validateUrl', () => {
    test('повинен повертати помилку, якщо URL порожній або відсутній', () => {
      expect(validateUrl('')).toEqual({
        isValid: false,
        error: 'Missing target request URL.'
      });
      expect(validateUrl(null)).toEqual({
        isValid: false,
        error: 'Missing target request URL.'
      });
    });

    test('повинен відхиляти протоколи, відмінні від http:// та https://', () => {
      expect(validateUrl('ftp://example.com')).toEqual({
        isValid: false,
        error: 'Invalid URL. Protocol must be http:// or https://'
      });
      expect(validateUrl('file:///C:/test.txt')).toEqual({
        isValid: false,
        error: 'Invalid URL. Protocol must be http:// or https://'
      });
      expect(validateUrl('example.com/api')).toEqual({
        isValid: false,
        error: 'Invalid URL. Protocol must be http:// or https://'
      });
    });

    test('повинен повертати isValid: true для коректних HTTP/HTTPS адрес', () => {
      expect(validateUrl('https://jsonplaceholder.typicode.com/posts')).toEqual({
        isValid: true
      });
      expect(validateUrl('http://localhost:8080/health')).toEqual({
        isValid: true
      });
    });
  });

  // Модульний тест 2: Формування та нормалізація параметрів fetch
  describe('Тест 2: prepareFetchOptions', () => {
    test('повинен за замовчуванням встановлювати метод GET та пусті заголовки', () => {
      const options = prepareFetchOptions();
      expect(options.method).toBe('GET');
      expect(options.headers).toEqual({});
      expect(options.body).toBeUndefined();
    });

    test('повинен нормалізувати назву методу до верхнього регістру', () => {
      const options = prepareFetchOptions('post');
      expect(options.method).toBe('POST');
    });

    test('не повинен передавати body для GET запитів', () => {
      const options = prepareFetchOptions('GET', {}, { test: 123 });
      expect(options.body).toBeUndefined();
    });

    test('повинен серіалізувати об’єкт у JSON рядок для POST та PUT методів', () => {
      const bodyData = { title: 'Test Post', value: 42 };
      const postOptions = prepareFetchOptions('POST', { 'Content-Type': 'application/json' }, bodyData);
      expect(postOptions.method).toBe('POST');
      expect(postOptions.body).toBe(JSON.stringify(bodyData));
      expect(postOptions.headers['Content-Type']).toBe('application/json');

      const putOptions = prepareFetchOptions('PUT', {}, 'plain text body');
      expect(putOptions.body).toBe('plain text body');
    });
  });

  // Модульний тест 3: Розрахунок розміру корисного навантаження (Payload Size)
  describe('Тест 3: calculatePayloadSize', () => {
    test('повинен повертати 0 для null або undefined', () => {
      expect(calculatePayloadSize(null)).toBe(0);
      expect(calculatePayloadSize(undefined)).toBe(0);
    });

    test('повинен коректно обчислювати розмір звичайного рядка', () => {
      expect(calculatePayloadSize('hello')).toBe(5);
    });

    test('повинен правильно рахувати байти для UTF-8 мультибайтних символів (кирилиця)', () => {
      // Рядок 'Тест' містить 4 символи, кожен по 2 байти в UTF-8 = 8 байт
      expect(calculatePayloadSize('Тест')).toBe(8);
    });

    test('повинен коректно серіалізувати та обраховувати розмір JSON об’єкта', () => {
      const obj = { id: 1, ok: true };
      const expectedBytes = Buffer.byteLength(JSON.stringify(obj), 'utf8');
      expect(calculatePayloadSize(obj)).toBe(expectedBytes);
    });
  });

});
