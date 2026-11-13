/**
 * Модуль допоміжних утиліт для CORS Proxy сервера
 */

/**
 * Валідує цільову URL-адресу для проксі-запитів.
 * @param {string} url - Цільовий URL.
 * @returns {{ isValid: boolean, error?: string }}
 */
function validateUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { isValid: false, error: 'Missing target request URL.' };
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { isValid: false, error: 'Invalid URL. Protocol must be http:// or https://' };
  }
  try {
    new URL(url);
    return { isValid: true };
  } catch (err) {
    return { isValid: false, error: 'Malformed URL structure.' };
  }
}

/**
 * Формує та нормалізує параметри для запиту fetch.
 * @param {string} [method='GET'] - HTTP метод.
 * @param {Object} [headers={}] - Заголовки запиту.
 * @param {*} [body=null] - Тіло запиту.
 * @returns {Object} fetchOptions
 */
function prepareFetchOptions(method = 'GET', headers = {}, body = null) {
  const normalizedMethod = (method || 'GET').toUpperCase();
  const fetchOptions = {
    method: normalizedMethod,
    headers: headers || {}
  };

  const bodyAllowedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (body !== null && body !== undefined && bodyAllowedMethods.includes(normalizedMethod)) {
    fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : String(body);
  }

  return fetchOptions;
}

/**
 * Розраховує розмір корисного навантаження (payload size) у байтах у кодуванні UTF-8.
 * @param {*} data - Дані відповіді або тіла.
 * @returns {number} Розмір у байтах.
 */
function calculatePayloadSize(data) {
  if (data === null || data === undefined) {
    return 0;
  }
  const str = typeof data === 'object' ? JSON.stringify(data) : String(data);
  return Buffer.byteLength(str, 'utf8');
}

module.exports = {
  validateUrl,
  prepareFetchOptions,
  calculatePayloadSize
};
