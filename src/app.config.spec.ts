import * as dotenv from 'dotenv';

jest.mock('dotenv');

describe('AppConfig', () => {
  beforeEach(() => {
    process.env.MONGO_URL = 'mongodb://localhost:27017/testdb';
    process.env.PORT = '4000';
    dotenv.config();
    jest.resetModules(); // Reset modules to clear cached AppConfig
  });

  afterEach(() => {
    delete process.env.MONGO_URL;
    delete process.env.PORT;
  });

  it('should load MONGO_URL from environment variables', () => {
    const { AppConfig } = require('./app.config'); // Require after setting env
    expect(AppConfig.mongoUrl).toBe('mongodb://localhost:27017/testdb');
  });

  it('should load PORT from environment variables', () => {
    const { AppConfig } = require('./app.config');
    expect(AppConfig.port).toBe('4000');
  });

  it('should default to port 3000 if PORT is not set', () => {
    delete process.env.PORT;
    const { AppConfig } = require('./app.config');
    expect(AppConfig.port).toBe(3000);
  });
});

