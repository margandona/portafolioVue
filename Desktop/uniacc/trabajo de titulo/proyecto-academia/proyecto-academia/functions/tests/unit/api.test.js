const request = require('supertest');
const app = require('../../app');

describe('API Health Check', () => {
  test('GET /health should return success', async () => {
    const res = await request(app)
      .get('/health')
      .expect(200);

    expect(res.body).toEqual({
      status: 'success',
      message: 'API funcionando correctamente',
      timestamp: expect.any(String)
    });
  });
});

// Note: Full integration tests require proper Firebase mocking
// These are basic smoke tests to verify app structure
describe('API Structure Tests', () => {
  test('should respond to unknown routes with 404', async () => {
    await request(app)
      .get('/nonexistent')
      .expect(404);
  });

  test('should have CORS headers', async () => {
    const res = await request(app)
      .get('/health');

    expect(res.headers).toHaveProperty('access-control-allow-origin');
  });
});
