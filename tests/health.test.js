const request = require('supertest');

describe('API smoke', () => {
  it('health responds when app loads', async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_access_secret_32_chars_minimum';
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_32_chars_minimum';
    jest.resetModules();
    const app = require('../app');
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
