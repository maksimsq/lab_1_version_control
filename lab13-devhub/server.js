const express = require('express');
const path = require('path');
const { validateUrl, prepareFetchOptions, calculatePayloadSize } = require('./src/utils/proxyUtils');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing for API requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// CORS-Proxy Endpoint for PostmanLite Client
app.post('/api/proxy', async (req, res) => {
  const { url, method, headers, body } = req.body || {};

  const validation = validateUrl(url);
  if (!validation.isValid) {
    return res.status(400).json({ error: validation.error });
  }

  const startTime = Date.now();

  try {
    const fetchOptions = prepareFetchOptions(method, headers, body);

    // Perform external fetch
    const response = await fetch(url, fetchOptions);
    const duration = Date.now() - startTime;

    // Collect response headers
    const responseHeaders = {};
    if (response.headers && typeof response.headers.forEach === 'function') {
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });
    }

    // Read body text or json safely
    let responseData = '';
    const contentType = (response.headers && typeof response.headers.get === 'function')
      ? (response.headers.get('content-type') || '')
      : '';

    if (contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = await response.text();
      }
    } else {
      responseData = typeof response.text === 'function' ? await response.text() : '';
    }

    // Estimate payload size in bytes
    const sizeBytes = calculatePayloadSize(responseData);

    res.json({
      status: response.status,
      statusText: response.statusText || 'OK',
      headers: responseHeaders,
      body: responseData,
      duration: duration,
      size: sizeBytes
    });

  } catch (error) {
    console.error(`CORS Proxy failed for ${url}:`, error.message);
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
      duration: Date.now() - startTime
    });
  }
});

// Fallback to index.html for SPA behavior
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 Developer Hub Proxy running on port ${PORT}`);
    console.log(`🏠 Local URL: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });
}

module.exports = app;
