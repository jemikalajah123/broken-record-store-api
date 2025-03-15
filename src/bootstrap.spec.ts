import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('./main', () => ({
  bootstrap: jest.fn(),
}));

describe('Bootstrap', () => {
  let app: any;
  let bootstrap: jest.Mock;

  beforeEach(async () => {
    process.env.PORT = '4000';

    app = {
      useGlobalPipes: jest.fn(),
      listen: jest.fn(),
    };

    (NestFactory.create as jest.Mock).mockResolvedValue(app);

    // Require the mocked bootstrap
    const main = require('./main');
    bootstrap = main.bootstrap;
  });

  afterEach(() => {
    delete process.env.PORT;
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('should start the application', async () => {
    await bootstrap(); // 🔹 Make sure this actually runs

    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(app, expect.any(Object));
    expect(SwaggerModule.setup).toHaveBeenCalledWith('swagger', app, expect.any(Object));
    expect(app.listen).toHaveBeenCalledWith(process.env.PORT);
  });
});
