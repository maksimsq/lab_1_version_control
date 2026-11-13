const request = require('supertest');
const app = require('../../server');

describe('Інтеграційні тести (Integration Tests) - Express Proxy API', () => {

  // Інтеграційний тест 1: Перевірка валідації та маршрутизації Express
  describe('Тест 1: Валідація вхідних даних маршруту POST /api/proxy', () => {
    test('повинен повертати 400 Bad Request, якщо параметр url відсутній', async () => {
      const response = await request(app)
        .post('/api/proxy')
        .send({ method: 'GET' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Missing target request URL.');
    });

    test('повинен повертати 400 Bad Request при неприпустимому протоколі', async () => {
      const response = await request(app)
        .post('/api/proxy')
        .send({ url: 'ftp://ftp.example.com/file.zip' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid URL. Protocol must be http:// or https://');
    });

    test('повинен повертати 200 OK при запиті до статичного кореневого маршруту GET /', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/html/);
    });
  });

  // Інтеграційний тест 2: Наскрізне проксіювання HTTP-запитів із моканням зовнішнього сервісу
  describe('Тест 2: Наскрізна взаємодія проксі з зовнішнім REST API', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    test('повинен успішно проксіювати запит, формувати заголовки та повертати статус, розмір і тривалість', async () => {
      const mockResponseData = { id: 101, title: 'Лабораторна робота 5', completed: true };

      // Мокаємо зовнішній fetch (імітуємо сторонній бекенд/API)
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: new Map([
          ['content-type', 'application/json; charset=utf-8'],
          ['x-powered-by', 'Jest-Mock-Service']
        ]),
        json: async () => mockResponseData,
        text: async () => JSON.stringify(mockResponseData)
      });

      const payload = {
        url: 'https://jsonplaceholder.typicode.com/todos/101',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { query: 'test' }
      };

      const response = await request(app)
        .post('/api/proxy')
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('statusText', 'OK');
      expect(response.body).toHaveProperty('body', mockResponseData);
      expect(response.body).toHaveProperty('duration');
      expect(typeof response.body.duration).toBe('number');
      expect(response.body).toHaveProperty('size');
      expect(response.body.size).toBeGreaterThan(0);

      // Перевіряємо, що fetch викликався з коректними параметрами
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        payload.url,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload.body)
        })
      );
    });

    test('повинен повертати статус 500, якщо зовнішній сервіс недоступний (мережева помилка)', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));

      const response = await request(app)
        .post('/api/proxy')
        .send({
          url: 'https://unreachable-external-service.org/data',
          method: 'GET'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Proxy request failed');
      expect(response.body).toHaveProperty('message', 'Connection refused');
      expect(response.body).toHaveProperty('duration');
      consoleSpy.mockRestore();
    });
  });

});
