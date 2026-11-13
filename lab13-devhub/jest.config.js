/** @type {import('jest').Config} */
const config = {
  verbose: true,
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js'
  ]
};

module.exports = config;
