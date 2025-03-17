import * as dotenv from 'dotenv';

jest.mock('dotenv');

describe('AppConfig', () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
    process.env.PORT = '4000';
    dotenv.config();
  });

  afterEach(() => {
    delete process.env.MONGO_URL;
    delete process.env.PORT;
  });

  it('should load MONGO_URL from environment variables', async () => {
    const { AppConfig } = await import('./app.config');
    expect(AppConfig.mongoUrl).toBe('mongodb://localhost:27017/testdb');
  });

  it('should load PORT from environment variables', async () => {
    const { AppConfig } = await import('./app.config');
    expect(AppConfig.port).toBe('4000');
  });

  it('should default to port 3000 if PORT is not set', async () => {
    delete process.env.PORT;
    const { AppConfig } = await import('./app.config');
    expect(AppConfig.port).toBe(3000);
  });
});
